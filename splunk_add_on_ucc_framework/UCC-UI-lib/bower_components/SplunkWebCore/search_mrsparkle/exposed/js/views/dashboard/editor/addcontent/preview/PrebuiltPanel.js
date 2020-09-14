define(
    [
        'module',
        'jquery',
        'underscore',
        'backbone',
        'views/Base',
        'views/dashboard/editor/addcontent/preview/BasePreview',
        'views/dashboard/editor/addcontent/preview/content/PrebuiltPanelContent'
    ],
    function(module,
             $,
             _,
             Backbone,
             BaseView,
             BasePreview,
             PrebuiltPanelContent) {


        return BasePreview.extend({
            moduleId: module.id,
            className: 'panel_content_preview content-preview',
            initialize: function(options) {
                BasePreview.prototype.initialize.apply(this, arguments);
                this.model = _.extend({}, this.model);
                this.collection = _.extend({}, this.collection);
                this.deferreds = options.deferreds;
            },
            render: function() {
                BasePreview.prototype.render.apply(this, arguments);
                this.$('.preview-body').addClass('dashboard-row');
                return this;
            },
            _getPayload: function() {

                return {
                    type: 'new:element-refpanel',
                    payload: {
                        "type": "panelref",
                        "settings": {
                            "ref": this.model.panel.entry.get('name'),
                            "app": this.model.panel.entry.content.get('eai:appName')
                        },
                        "children": []
                    }
                };
            },
            _getTitle: function() {
                return _("Preview").t();
            },
            _getPreview: function() {
                return new PrebuiltPanelContent({
                    model: this.model,
                    collection: this.collection,
                    deferreds: this.deferreds
                });
            }
        });
    });