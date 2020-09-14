define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/alert/history/eventstable/Master',
        'views/alert/history/Controls'
    ],
    function(
        _,
        module,
        BaseView,
        EventsTableView,
        ControlsView
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'trigger-history',
            /**
             * @param {Object} options {
             *      model: {
             *         savedAlert: <models.Report>,
             *         application: <models.Application>
             *     },
             *     collection: {
             *          roles: <collections.services.authorization.Roles> 
             *          alertsAdmin: <collections.services.admin.Alerts>      
             * }
             */
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                //title

                //control
                this.children.controlsView = new ControlsView({
                    collection: {
                        alertsAdmin: this.collection.alertsAdmin
                    }
                });

                //events viewer
                this.children.eventsTableView = new EventsTableView({
                    model: {
                        application: this.model.application
                    },
                    collection: {
                        alertsAdmin: this.collection.alertsAdmin
                    }
                });

            },
            render: function() {
                this.$el.html(this.compiledTemplate({
                    _: _
                }));

                this.children.controlsView.render().appendTo(this.$el);
                this.children.eventsTableView.render().appendTo(this.$el);
                return this;
            },
            template: '\
                <h3><%- _("Trigger History").t() %></h3>\
            '
        });
    }
);
