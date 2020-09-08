define(function(require, exports, module) {
    var _ = require('underscore');
    var $ = require('jquery');
    var mvc = require('../../mvc');
    var BaseView = require('../../basesplunkview');
    var FieldsetView = require('../../simpleform/fieldsetview');
    var DashboardController = require('../controller');
    var DashboardElement = require('../element/base');
    var DashboardInput = require('../../simpleform/input/base');
    var TitleEditor = require('./titleeditor');
    var TextDialog = require('views/shared/dialogs/TextDialog');
    var sprintf = require('splunk.util').sprintf;
    var DashboardFactory = require('../factory');
    var TokenDependenciesMixin = require('./tokendeps');
    var PostProcessSearch = require('../../postprocessmanager');
    
    var BasePanel = BaseView.extend(_.extend({}, TokenDependenciesMixin, {
        className: "dashboard-cell",
        _uniqueIdPrefix: 'panel',
        configure: function() {
            this.options.settingsOptions = _.extend({
                retainUnmatchedTokens: true
            }, this.options.settingsOptions || {});
            BaseView.prototype.configure.apply(this, arguments);
        },
        initialize: function() {
            this.configure();
            this.model || (this.model = {});
            this.listenTo(DashboardController.getStateModel(), 'change:edit ready', this.onEditStateChange);
            this.listenTo(this.settings, 'change:title', this.updatePanelTitle);
            this.fieldset = this.createFieldset();
            this.setupTokenDependencies();
        },
        isEditMode: function() {
            if (DashboardController.isReady()) {
                return DashboardController.getStateModel().get('edit') && this.settings.get('editable') !== false;
            } else {
                return false;
            }
        },
        childrenVisible: function() {
            return _.any(this.getChildElements(), function(child) { return !child.$el.is('.hidden'); }) || 
                this.fieldset.childrenVisible();
        },
        layoutElements: function() {
            if (this.getChildElementIDs().length > 0 && !this.childrenVisible()) {
                this.hide();
            } else if (this.tokenDependenciesMet()) {
                this.show();
            } else {
                this.hide();
            }
            
            var $panel = this.$panel();
            var editMode = this.isEditMode();
            _($panel.children('.panel-element-row.grouped')).each(function(panelRow) {
                var selector = '.dashboard-element' + (editMode ? '' : ':not(.hidden)');
                var elements = $(panelRow).children(selector);
                if (elements.length > 0) {
                    elements.css({ width: String(100 / elements.length) + '%' });
                }
            });
        },
        resetGroupLayout: function() {
            // Find all panel-rows with more than 1 element in order to re-layout them on visibility changes
            _(this.$panel().children('.panel-element-row'))
                .chain()
                .map($)
                .invoke('removeClass', 'grouped')
                .filter(function($el) {
                    return $el.children('.dashboard-element').length > 1;
                })
                .invoke('addClass', 'grouped');
        },
        resetLayout: function() {
            this.onEditStateChange();
            this.resetGroupLayout();
        },
        addChild: function(component) {
            if (component instanceof DashboardElement) {
                this.addElement(component);
            } else if (component instanceof DashboardInput) {
                this.addInput(component);
            } else {
                throw new Error('Cannot add unknown component as child of panel');
            }
        },
        addElement: function(element) {
            var ct = this.$panel();
            var destRow;
            if (element.getVisualizationType() == 'visualizations:singlevalue') {
                destRow = ct.children('.panel-element-row:last');
                if (!destRow.length) {
                    destRow = $('<div class="panel-element-row" />').appendTo(ct);
                } else if (destRow.children('.single') === 0) {
                    destRow = $('<div class="panel-element-row" />').appendTo(ct);
                }
            } else {
                destRow = $('<div class="panel-element-row" />').appendTo(ct);
            }
            element.render().$el.addClass('dashboard-element').appendTo(destRow);
            this.$el.trigger('cellContentChange');
        },
        setEditable: function(editable) {
            this.fieldset.settings.set('editable', editable);
            _(this.getChildElements()).each(function(child){
                child.settings.set('editable', editable);
            });
        },
        addInput: function(input) {
            this.fieldset.addChild(input);
        },
        getChildElementIDs: function() {
            return _(this.$el.find('.dashboard-element')).map(function(el) {
                return $(el).attr('id');
            });
        },
        getChildElements: function() {
            return _(this.getChildElementIDs()).chain()
                .map(_.bind(mvc.Components.get, mvc.Components))
                .filter(_.identity)
                .value();
        },
        getAllChildren: function(){
            return Array.prototype.concat.call(
                this.fieldset.getChildElements(), 
                this.getChildElements()
            );
        },
        removeChildren: function() {
            _(this.getChildElements()).invoke('remove');
        },
        onEditStateChange: function() {
            if (this.isEditMode()) {
                this.enterEditMode();
            } else {
                this.leaveEditMode();
            }
        },
        enterEditMode: function() {
            var titleEditor = this.createTitleEditor();
            if (titleEditor) {
                titleEditor.render().$el.prependTo(this.createPanelTitle());
            }
            var panelEditor = this._panelEditor = this.createPanelEditor();
            if (panelEditor) {
                panelEditor.render().$el.prependTo(this.$panel());
            }
            this.createDragHandle();
        },
        leaveEditMode: function() {
            this.removeDragHandle();
            this.removePanelEditor();
            this.removeTitleEditor();
            this.updatePanelTitle();
        },
        createFieldset: function(options) {
            options || (options = {});
            return new FieldsetView(options);
        },
        removeFieldset: function() {
            this.fieldset.remove();
            this.fieldset = null;
        },
        createTitleEditor: function() {
            this.removeTitleEditor();
            this._titleEditor = new TitleEditor({
                model: this.settings,
                attribute: 'title'
            });
            this.listenTo(this.settings, 'change:title', this.triggerStructureChange);
            return this._titleEditor;
        },
        removeTitleEditor: function() {
            if (this._titleEditor) {
                this.stopListening(this.settings, 'change:title', this.triggerStructureChange);
                this._titleEditor.remove();
                this._titleEditor = null;
            }
        },
        createPanelEditor: function() {
            // Sub-classes are responsible for creating the panel editor component
        },
        removePanelEditor: function() {
            if (this._panelEditor) {
                this.stopListening(this._panelEditor);
                this._panelEditor.remove();
                this._panelEditor = null;
            }
        },
        createPanelTitle: function(text) {
            var $panel = this.$panel();
            var $title = $panel.children('.panel-title');
            if (!$title.length) {
                $title = $('<h2 class="panel-title" />').prependTo($panel);
            }
            if (text) {
                $title.text(_(text).t()).removeClass('empty');
                $panel.addClass('with-title');
            } else {
                $title.empty().addClass('empty');
                $panel.removeClass('with-title');
            }
            return $title;
        },
        updatePanelTitle: function() {
            if (!this._titleEditor) {
                var title = this.settings.get('title');
                if (title != null) {
                    title = title.trim();
                }
                this.createPanelTitle(title);
            }
        },
        removePanelTitle: function() {
            this.removeTitleEditor();
            var $panel = this.$el.children('.dashboard-panel');
            $panel.children('.panel-title').remove();
        },
        createDragHandle: function() {
            if (!this._dragHandle) {
                this._dragHandle = $('<div class="drag-handle"><a href="#" class="delete-panel">' +
                    '<i class="icon-x"></i></a><div class="handle-inner"></div></div>');
            }
            this._dragHandle.prependTo(this.$panel());
        },
        removeDragHandle: function() {
            if (this._dragHandle) {
                this._dragHandle.remove();
                this._dragHandle = null;
            }
        },
        hide: function() {
            if (!this.$el.is('.hidden')) {
                this.$el.addClass('hidden').trigger('panelVisibilityChanged');
            }
        },
        show: function() {
            if (this.$el.is('.hidden')) {
                this.$el.removeClass('hidden').trigger('panelVisibilityChanged');
            }
        },
        events: {
            'itemRemoved': 'removeIfEmpty',
            'elementVisibilityChanged': 'layoutElements',
            'click a.delete-panel:not(.disabled)': 'showDeleteDialog',
            'click a.rename-panel:not(.disabled)': 'focusTitleEditor',
            'click a.convert-panel:not(.disabled)': 'convertPanel'
        },
        $panel: function() {
            return this.$el.children('.dashboard-panel');
        },
        render: function() {
            this.$el.attr('id', this.id);
            var $panel = this.$panel();
            if (!$panel.length) {
                $panel = $('<div class="dashboard-panel"></div>').appendTo(this.$el);
            }
            this.fieldset.render().$el.appendTo($panel);
            var title = $.trim(this.settings.get('title'));
            if (title) {
                this.createPanelTitle(title);
            }
            this.resetLayout();
            return this;
        },
        focusTitleEditor: function() {
            if (this._titleEditor) {
                this._titleEditor.focus();
            }
        },
        convertPanel: function() {
            
        },
        onPanelConverted: function() {
            // Force re-render of panel edit controls
            this.leaveEditMode();
            this.onEditStateChange();
        },
        convertPanelTo: function(type) {
            var panelConverted = $.Deferred();
            var self = this;
            var children = this.getAllChildren();
            var settings = this.settings.toJSON();
            var factorySettings = { type: type, settings: settings, children: [] };
            var newPanelCreated = DashboardFactory.getDefault().materialize(factorySettings, null, { loadPanels: false });
            
            newPanelCreated.then(function(panel){
                panel.render().$el.insertBefore(self.$el);
                self.$el.detach();
                _(children).each(function(child) {
                    DashboardFactory.addChildToContainer(child, panel);
                });
                self.remove();
                panel.onPanelConverted();
                panelConverted.resolve(panel);
            });
            
            return panelConverted.promise();
        },
        showDeleteDialog: function(e) {
            e.preventDefault();
            var dialog = new TextDialog({
                id: "modal_delete"
            });
            dialog.settings.set({
                primaryButtonLabel: _("Delete").t(),
                cancelButtonLabel: _("Cancel").t(),
                titleLabel: _("Delete").t()
            });
            this.listenToOnce(dialog, 'click:primaryButton', this.deletePanel);
            var title = $.trim(this.settings.get('title'));
            var titleText = title ? sprintf('<em>%s</em>', _.escape(title)) : _.escape(_('this panel').t());
            dialog.setText(sprintf(_("Are you sure you want to delete %s?").t(), titleText));
            dialog.render().$el.appendTo(document.body);
            dialog.show();
        },
        deletePanel: function() {
            var $parent = this.$el.parent();
            this.remove();
            _.defer(function() {
                $(window).trigger('resize');
                $parent.trigger('structureChange');
            });
        },
        triggerStructureChange: function() {
            if (this.isEditMode()) {
                this.$el.trigger('structureChange');
            }
        },
        serializeStructure: function(options) {
            options || (options = {});
            return {
                inputs: this.fieldset ? this.fieldset.serializeStructure(options) : [],
                elements: this.getChildElementIDs(),
                title: this.settings.get('title', { tokens: options.tokens !== false }),
                tokenDependencies: this.settings.get('tokenDependencies', { tokens: true }),
                id: this.settings.get('originalId')
            };
        },
        hasChildWithBaseSearch: function() {
            var hasPostProcess = function(cmp) {
                var manager = mvc.Components.get(cmp.settings.get('managerid'));
                return manager instanceof PostProcessSearch;
            };
            return _(this.getChildElements()).any(hasPostProcess) ||
                this.fieldset && _(this.getChildElements()).any(hasPostProcess);
        },
        isEmpty: function() {
            return this.getChildElementIDs().length === 0 && this.fieldset.isEmpty();
        },
        removeIfEmpty: function() {
            if (this.isEmpty()) {
                this.remove();
            }
        },
        remove: function() {
            this.removeTitleEditor();
            this.removeFieldset();
            this.removeChildren();
            this.stopListeningToTokenDependencyChange();
            BaseView.prototype.remove.apply(this, arguments);
        }
    }));

    return BasePanel;
});