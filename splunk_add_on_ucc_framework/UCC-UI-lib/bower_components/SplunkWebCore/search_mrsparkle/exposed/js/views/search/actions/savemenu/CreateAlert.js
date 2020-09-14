define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/alertcontrols/dialogs/saveas/Master'
    ],
    function($, _, module, Base, AlertDialog) {
        return Base.extend({
            moduleId: module.id,
            tagName: 'li',
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
            },
            events: {
                'click a': function(e) {
                    this.children.alertDialog = new AlertDialog({
                        model:  {
                            report: this.model.report,
                            reportPristine: this.model.reportPristine,
                            application: this.model.application,
                            user: this.model.user,
                            serverInfo: this.model.serverInfo
                        },
                        collection: {
                            times: this.collection.times
                        },
                        onHiddenRemove: true
                    });
                    
                    this.children.alertDialog.render().appendTo($('body')).show();

                    e.preventDefault();
                }
            },
            render: function() {
                this.$el.html(this.compiledTemplate({
                    _: _
                }));
                return this;
            },
            template: '<a href="#"><%- _("Alert").t() %></a>'
        });
    }
);
