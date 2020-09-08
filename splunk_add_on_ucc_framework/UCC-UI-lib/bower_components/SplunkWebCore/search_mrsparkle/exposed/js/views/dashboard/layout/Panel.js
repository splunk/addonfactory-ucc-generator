define(
    [
        'module',
        'jquery',
        'underscore',
        'views/dashboard/Base',
        'splunkjs/mvc',
        'views/dashboard/form/Fieldset',
        'views/dashboard/editor/TitleEditor',
        'views/dashboard/editor/PanelEditor',
        'views/dashboard/element/DashboardElement',
        'views/dashboard/element/Html',
        'views/dashboard/form/Input',
        'views/shared/dialogs/TextDialog',
        'views/dashboard/editor/dialogs/ConvertPanel',
        'splunkjs/mvc/postprocessmanager',
        'splunkjs/mvc/simplexml/dashboard/tokendeps',
        'splunk.util'
    ],
    function(module,
             $,
             _,
             BaseDashboardView,
             mvc,
             FieldsetView,
             TitleEditor,
             PanelEditor,
             DashboardElement,
             HtmlElement,
             DashboardInput,
             TextDialog,
             ConvertPanelDialog,
             PostProcessSearch,
             TokenDependenciesMixin,
             SplunkUtil) {

        var sprintf = SplunkUtil.sprintf;

        return BaseDashboardView.extend(_.extend({}, TokenDependenciesMixin, {
            moduleId: module.id,
            className: 'dashboard-cell',
            _uniqueIdPrefix: 'panel',
            initialize: function() {
                this.options.settingsOptions = _.extend({retainUnmatchedTokens: true}, this.options.settingsOptions);
                BaseDashboardView.prototype.initialize.apply(this, arguments);
                this.setupTokenDependencies();
                this.listenTo(this.settings, 'change:title', this._onTitleChange);
                this.listenTo(this.model.state, 'change:mode', this._onModeChange);
            },
            render: function() {
                this.$el.attr('id', this.id);
                // create panel div as master container
                this.$panel = this.createOrFind('dashboard-panel');
                // always render fieldset.
                this._renderFieldSet();
                this._onModeChange();
            },
            remove: function() {
                this._resetComponents();
                this.stopListeningToTokenDependencyChange();
                BaseDashboardView.prototype.remove.apply(this, arguments);
            },
            _onModeChange: function() {
                // clear all children
                this._unbindEventHandler();
                this._resetComponents();
                switch (this.model.state.get('mode')) {
                    case 'view':
                        this._renderTitle();
                        break;
                    case 'edit':
                        this._renderPanelEditor();
                        this._renderTitleEditor();
                        this._renderDragHandle();
                        this._bindEventHandler();
                        break;
                }
                return this;
            },
            _onTitleChange: function() {
                !this.isEditMode() && this._renderTitle();
            },
            _resetComponents: function() {
                if (this.$dragHandle) {
                    this.$dragHandle.remove();
                    this.$dragHandle = null;
                }
                if (this.children.titleEditor) {
                    this.children.titleEditor.remove();
                    this.children.titleEditor = null;
                }
                if (this.children.panelEditor) {
                    this.children.panelEditor.remove();
                    this.children.panelEditor = null;
                }
            },
            _renderFieldSet: function(options) {
                options = _.extend({
                    model: _.extend({}, this.model, options),
                    id: this.id + '-fieldset'
                });
                this.children.fieldset = new FieldsetView(options);
                this.listenTo(this.children.fieldset, 'all', this.trigger);
                this.children.fieldset.render().$el.prependTo(this.$panel);
            },
            _renderTitle: function() {
                var title = $.trim(this.settings.get('title'));
                var h2 = this.createOrFind('panel-title', this.$panel, 'h2');
                if (title) {
                    h2.text(_(title).t()).removeClass('empty');
                    this.$panel.addClass('with-title');
                } else {
                    h2.empty().addClass('empty');
                    this.$panel.removeClass('with-title');
                }
            },
            _renderDragHandle: function() {
                this.$dragHandle = $('<div class="drag-handle"><a href="#" class="delete-panel">' +
                    '<i class="icon-x"></i></a><div class="handle-inner"></div></div>');
                this.$dragHandle.prependTo(this.$panel);
                this.$dragHandle.find('a.delete-panel:not(.disabled)').off('click').on('click', function(e) {
                    e.preventDefault();
                    this._handleEditEvent('delete');
                }.bind(this));
            },
            _renderPanelEditor: function() {
                var canConvert = !this._hasChildWithBaseSearch();
                var tooltip = canConvert ? null : _('Unable to convert to prebuilt panel due to dependency on base search.').t();
                this.children.panelEditor = new PanelEditor({
                    model: this.settings,
                    icon: 'icon-gear',
                    label: _("Inline Panel").t(),
                    actions: [
                        {name: 'rename', className: 'rename-panel', label: _("Rename").t()},
                        {
                            name: 'convert',
                            className: canConvert ? 'convert-panel' : 'disabled',
                            label: _("Convert to Prebuilt Panel").t(),
                            tooltip: tooltip
                        },
                        {name: 'delete', className: 'delete-panel', label: _("Delete").t()}
                    ]
                });
                this.children.panelEditor.render().$el.prependTo(this.$panel);
            },
            _bindEventHandler: function() {
                this.children.panelEditor && this.listenTo(this.children.panelEditor, 'all', this._handleEditEvent);
                this.children.titleEditor && this.listenTo(this.children.titleEditor, 'change:title', this._handleSettingChange);
                this.listenTo(this.settings, 'change', this._handleSettingChange);

            },
            _unbindEventHandler: function() {
                this.children.panelEditor && (this.stopListening(this.children.panelEditor));
                this.children.titleEditor && (this.stopListening(this.children.titleEditor));
                this.settings && (this.stopListening(this.settings, 'change'));
            },
            _handleSettingChange: function() {
                this.model.controller.trigger('edit:panel', {
                    panelId: this.id,
                    panelSettings: this.settings
                });
            },
            _handleEditEvent: function(event) {
                // panel editor event, delegate to controller
                switch (event) {
                    case 'rename':
                        this.children.titleEditor && (this.children.titleEditor.focus());
                        break;
                    case 'convert':
                        this._convertToPrebuiltPanel();
                        break;
                    case 'delete':
                        this._deletePanel();
                        break;
                }
            },
            _hasChildWithBaseSearch: function() {
                var hasPostProcess = function(cmp) {
                    var manager = mvc.Components.get(cmp.settings.get('managerid'));
                    return manager instanceof PostProcessSearch;
                };
                return _(this.getElements()).any(hasPostProcess) ||
                    this.children.fieldset && _(this.children.fieldset.getInputs()).any(hasPostProcess);
            },
            _renderTitleEditor: function() {
                this.children.titleEditor = new TitleEditor({
                    model: this.settings,
                    attribute: 'title',
                    placeholder: _('No title').t()
                });
                var h2 = this.createOrFind('panel-title', this.$panel, 'h2');
                h2.empty();
                this.children.titleEditor.render().$el.appendTo(h2);
            },
            //
            addChild: function(component) {
                if (component instanceof DashboardElement || component instanceof HtmlElement) {
                    this._addElement(component);
                } else if (component instanceof DashboardInput) {
                    this._addInput(component);
                } else {
                    throw new Error('Cannot add unknown component as child of panel');
                }
            },
            getElements: function() {
                return this.getChildElements('.dashboard-element');
            },
            isEmpty: function() {
                return this.getElements().length === 0;
            },
            _addElement: function(element) {
                this.$panel = this.$panel || this.createOrFind('dashboard-panel');
                var destRow;
                if (element.getVisualizationType() == 'single') {
                    destRow = this.$panel.children('.panel-element-row:last');
                    if (!destRow.length) {
                        destRow = $('<div class="panel-element-row" />').appendTo(this.$panel);
                    } else if (destRow.children('.single').length === 0) {
                        destRow = $('<div class="panel-element-row" />').appendTo(this.$panel);
                    }
                } else {
                    destRow = $('<div class="panel-element-row" />').appendTo(this.$panel);
                }
                element.render().$el.appendTo(destRow);
                this.$el.trigger('structureChanged');
            },
            _addInput: function(input) {
                this.children.fieldset.addChild(input);
            },
            _convertToPrebuiltPanel: function() {
                var convertDialog = new ConvertPanelDialog({
                    id: 'modal_convert_to_ref',
                    model: this.model,
                    panelComponent: this
                });
                convertDialog.render().appendTo(document.body);
                convertDialog.show();
            },
            _deletePanel: function() {
                var dialog = new TextDialog({
                    id: "modal_delete"
                });
                dialog.settings.set({
                    primaryButtonLabel: _("Delete").t(),
                    cancelButtonLabel: _("Cancel").t(),
                    titleLabel: _("Delete").t()
                });
                this.listenToOnce(dialog, 'click:primaryButton', function() {
                    this.model.controller.trigger('edit:delete-panel', {
                        panelId: this.id,
                        panel: this
                    });
                }.bind(this));
                var title = $.trim(this.settings.get('title'));
                var titleText = title ? sprintf('<em>%s</em>', _.escape(title)) : _.escape(_('this panel').t());
                dialog.setText(sprintf(_("Are you sure you want to delete %s?").t(), titleText));
                dialog.render().$el.appendTo(document.body);
                dialog.show();
            },
            captureStructure: function(options) {
                options || (options = {});
                var omitHidden = options.omitHidden ? function(el) { return $(el).is(':visible'); } : function() { return true; };
                var inputs = [];
                if (options.omitFormInputs !== true) {
                    inputs = _(this.$el.find('.input')).chain()
                        .filter(omitHidden)
                        .map(function(input) {
                            return {
                                type: 'input',
                                id: $(input).attr('id')
                            };
                        }).value();
                }
                var elements = _(this.$el.find('.dashboard-element')).chain()
                    .filter(omitHidden)
                    .map(function(element) {
                        return {
                            type: 'element',
                            id: $(element).attr('id')
                        };
                    }).value();
                return {id: this.id, type: 'panel',children: _.union(inputs, elements)};
            }
        }));
    }
);
