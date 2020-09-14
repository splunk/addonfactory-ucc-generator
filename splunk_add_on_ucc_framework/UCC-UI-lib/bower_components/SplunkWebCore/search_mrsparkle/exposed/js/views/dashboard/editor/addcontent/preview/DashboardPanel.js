define(
    [
        'module',
        'jquery',
        'underscore',
        'backbone',
        'views/Base',
        'views/dashboard/editor/addcontent/preview/BasePreview',
        'views/dashboard/editor/addcontent/preview/content/PanelContent'
    ],
    function(module,
             $,
             _,
             Backbone,
             BaseView,
             BasePreview,
             PanelContent) {

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
                    type: 'new:element-panel',
                    payload: this.model.parsedPanel
                };
            },
            _getTitle: function() {
                return _("Preview").t();
            },
            _getPreview: function() {
                return new PanelContent({
                    model: this.model,
                    collection: this.collection,
                    deferreds: this.deferreds
                });
            }
        });
    });