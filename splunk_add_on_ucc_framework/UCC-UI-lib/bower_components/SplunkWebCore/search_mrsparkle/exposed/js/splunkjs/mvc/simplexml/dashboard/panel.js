define(function(require) {
    var _ = require('underscore');
    var BasePanel = require('./basepanel');
    var DashboardPanelEditor = require('./paneleditor');
    var ConvertPanelDialog = require('../dialog/convertpanel');

    var InlinePanelEditor = DashboardPanelEditor.extend({
        className: 'inline-panel-editor',
        initialize: function(options) {
            DashboardPanelEditor.prototype.initialize.call(this, _.extend({
                popdownLabel: _('Inline Panel').t()
            }, options));
        },
        getActions: function() {
            return [
                { className: 'rename-panel', label: _("Rename").t() },
                { className: this.canConvert() ? 'convert-panel' : 'disabled', label: _("Convert to Prebuilt Panel").t(), tooltip: this.convertTooltip },
                { className: 'delete-panel', label: _("Delete").t() }
            ];            
        }
    });

    var DashboardPanel = BasePanel.extend({
        renderFromDOM: function() {
            var $panel = this.$panel();
            var originalId = this.$el.data('original-id');
            if (originalId) {
                this.settings.set('originalId', originalId);
            }
            var titleEl = $panel.children('.panel-title');
            if (titleEl.length) {
                this.settings.set('title', titleEl.text().trim(), { tokens: true });
            }
            var fieldsetEl = $panel.children('.fieldset');
            if (fieldsetEl.length) {
                this.fieldset.setElement(fieldsetEl);
            }
            this.fieldset.render();
            if (titleEl.length) {
                this.fieldset.$el.insertAfter(titleEl);
            } else {
                this.fieldset.$el.prependTo($panel);
            }
            this.resetLayout();
            return this;
        },
        createPanelEditor: function() {
            this.removePanelEditor();
            var hasChildWithBaseSearch = this.hasChildWithBaseSearch();
            return new InlinePanelEditor({
                canConvert: !hasChildWithBaseSearch,
                convertTooltip: hasChildWithBaseSearch ? _('Unable to convert to prebuilt panel due to dependency on base search.').t() : null
            });
        },
        convertPanel: function(e) {
            e.preventDefault();
            var convertDialog = new ConvertPanelDialog({ id: 'modal_convert_to_ref', panel: this });
            convertDialog.render().appendTo(document.body);
            convertDialog.show();

            this.listenToOnce(convertDialog, 'panelCreated', function(panelModel) {
                this.convertPanelTo('panelref').then(function(newPanel){
                    newPanel.model.panel.setFromSplunkD(panelModel.toSplunkD());
                    newPanel.$el.trigger('structureChange');
                });
            });
        },
        addChild: function(child) {
            if (child && child.settings) {
                child.settings.set('editable', true);
            }
            BasePanel.prototype.addChild.apply(this, arguments);
        }
    });

    return DashboardPanel;

});