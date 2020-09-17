define(['module','underscore','views/Base','views/shared/delegates/TableRowToggle','views/dashboards/table/controls/DetailView'],
function(module,_,BaseView,TableRowToggleView,DetailView,ScheduledView) {
    return BaseView.extend({
        moduleId: module.id,
        tagName: 'tr',
        className: 'more-info',
        /**
         * @param {Object} options {
         *     model: {
         *         state: <models.State>
         *         scheduledView: <models.services.ScheduledView>
         *         dashboard: <models.services.data.ui.View>,
         *         application: <models.Application>,
         *         user: <models.service.admin.user>,
         *         serverInfo: <models.services.server.serverinfo>
         *     },
         *     collection: roles: <collections.services.authorization.Roles>
         *     index: <index_of_the_row>
         * }
         */
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.$el.addClass((this.options.index % 2) ? 'even' : 'odd').css('display', 'none');
            this.model.dashboard.meta.on('change:description', this.updateDesc, this);
        },
        events: {
            'expand': function(){
                if(!this.children.details) {
                    var scheduledView = this.model.scheduledView;
                    if(scheduledView.isNew()) {
                        scheduledView.findByName(this.model.dashboard.entry.get('name'),
                            this.model.application.get('app'), this.model.application.get('owner'));
                    }

                    this.children.details = new DetailView({
                        model: {
                            state: this.model.state,
                            scheduledView: scheduledView,
                            dashboard: this.model.dashboard,
                            application: this.model.application,
                            user: this.model.user,
                            appLocal: this.model.appLocal,
                            serverInfo: this.model.serverInfo,
                            infoDeliveryAvailable: this.model.infoDeliveryUIControl.infoDeliveryAvailable
                        },
                        collection: this.collection
                    });
                    this.children.details.render().appendTo(this.$('.details'));
                } else {
                    this.children.details.render();
                }
            }
        },
        updateDesc: function() {
            var $descriptionElement = this.$('p.dashboard-description'),
                descriptionText = this.model.dashboard.meta.get('description');
            if ($descriptionElement.length === 0 && descriptionText) {
                this.$('td.details').prepend('<p class="dashboard-description">' + _.escape(descriptionText) + '</p>');
                return;
            }
            if ($descriptionElement.length !== 0 && !descriptionText) {
               $descriptionElement.remove();
               return;
            }
            $descriptionElement.text(descriptionText);
        },
        render: function() {
            this.$el.html(this.compiledTemplate({
                cols: 4 + ((this.model.user.canUseApps()) ? 1 : 0)
            }));
            this.updateDesc();
            if(this.children.details) {
                this.children.details.render().appendTo(this.$('.details'));
            }
            return this;
        },
        template: '<td class="details" colspan="<%= cols %>"></td>'
    });
});
