define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base',
    'views/shared/databind/HtmlFormDialog'
], function($, _, Backbone, module, Base, HtmlFormDialog) {

    return Base.extend({
        moduleId: module.id,
        className: 'mod-alert-options',
        /**
         * @param {Object} options {
         *     model: {
         *         alert: <models.search.Alert>,
         *         alertAction: <models.services.admin.AlertAction>,
         *         alertActionUI: <models.services.data.ui.ModAlert>,
         *         application: <models.Application>
         *     }
         * }
         */
        initialize: function(options) {
            Base.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model.alertAction, 'change:isExpanded', this.render);
        },
        render: function() {
            if (this.children.htmlDialog) {
                this.children.htmlDialog.remove();
                this.children.htmlDialog = null;
            }

            if (this.model.alertAction.get('isExpanded')) {
                this.children.htmlDialog = new HtmlFormDialog({
                    model: {
                        application: this.model.application,
                        target: this.model.alert.entry.content
                    },
                    html: _(this.model.alertActionUI.entry.content.get('eai:data') || '').t(),
                    attributePrefix: 'action.' + this.model.alertAction.entry.get('name') + '.param.',
                    entityReference: 'alert action: ' + this.model.alertAction.entry.get('name')
                });
                this.children.htmlDialog.render().appendTo(this.$el);
            }
            return this;
        }
    });

});
