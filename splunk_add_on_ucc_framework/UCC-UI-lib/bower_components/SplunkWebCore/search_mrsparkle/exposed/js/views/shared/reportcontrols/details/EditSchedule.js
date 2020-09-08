define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'views/Base',
        'views/shared/reportcontrols/dialogs/schedule_dialog/Master'
    ],
    function($, _, Backbone, module, Base, ScheduleDialog) {
        return Base.extend({
            moduleId: module.id,
            tagName: 'span',
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
            },
            events: {
                'click a.edit-schedule': function(e) {
                    this.children.scheduleDialog = new ScheduleDialog({
                        model: {
                            report: this.model.report,
                            application: this.model.application,
                            user: this.model.user,
                            appLocal: this.model.appLocal,
                            serverInfo: this.model.serverInfo
                        },
                        onHiddenRemove: true
                    });

                    this.children.scheduleDialog.render().appendTo($("body"));
                    this.children.scheduleDialog.show();

                    e.preventDefault();
                }
            },
            render: function() {
                this.$el.html(this.compiledTemplate({
                    _: _
                }));
                return this;
            },
            template: '\
                <a class="edit-schedule" href="#"><%- _("Edit").t() %></a>\
            '
        });
    }
);
