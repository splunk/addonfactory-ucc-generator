define(function(require, exports, module) {
    var _ = require('underscore');
    var mvc = require('../../mvc');
    var BasePanel = require('./basepanel');
    var DashboardParser = require('../parser');
    var DashboardFactory = require('../factory');

    var PreviewPanel = BasePanel.extend({
        initialize: function(options){
            BasePanel.prototype.initialize.apply(this, arguments);
            this._managerIds = []; 
            if (options && options.preview) {
                this.showPreview(options.preview);
            } else if (options && options.previewXML) {
                this.previewXML(options.previewXML);
            }
        },
        previewXML: function(xml) {
            return this.showPreview(DashboardParser.getDefault().parsePanel(xml));
        },
        showPreview: function(parserResult) {
            this.settings.set('title', '');
            this.fieldset.removeChildren();
            this.removeChildren();
            var that = this;
            return DashboardFactory.getDefault().materializeExisting(this, parserResult, { idPrefix: _.uniqueId('preview') + '_' })
                .done(function(root, managers) {
                    that._managerIds = _.union(that._managerIds, _(managers).pluck('id'));
                });
        },
        addChild: function(child) {
            if (child && child.settings) {
                // Disable editing for children in panel preview
                child.settings.set('editable', false);
            }
            BasePanel.prototype.addChild.apply(this, arguments);
        },
        isEditMode: function() {
            // Preview is never in edit mode
            return false;
        },
        triggerStructureChange: function() {
            // Don't propagate structure changes in a panel preview
        },
        render: function() {
            this.$el.addClass('preview-panel');
            return BasePanel.prototype.render.apply(this, arguments);
        },
        disposeSearches: function(){
            _(this._managerIds).each(function(managerid){
                var manager = mvc.Components.get(managerid);
                if (manager) {
                    manager.dispose();
                }
            });
            this._managerIds = [];
        },
        remove: function() {     
            this.disposeSearches();
            return BasePanel.prototype.remove.apply(this, arguments);
        }
    });

    return PreviewPanel;
});
