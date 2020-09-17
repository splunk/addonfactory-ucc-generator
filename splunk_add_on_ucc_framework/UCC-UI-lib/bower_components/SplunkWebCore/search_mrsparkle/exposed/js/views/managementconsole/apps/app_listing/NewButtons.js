define([
        'underscore',
        'helpers/managementconsole/url',
        'views/managementconsole/shared/NewButtons',
        './NewButtons.pcss'
    ],
    function (
        _,
        urlHelper,
        NewButtons,
        css
    ) {
        var MANAGE_LOCAL_APPS_BTN = '<a href="<%- manageLocalAppsLink %>" class="btn manage-local-apps-button"><%- _("Manage Local Apps").t() %></a>';
        return NewButtons.extend({

            initialize: function() {
                NewButtons.prototype.initialize.apply(this, arguments);
                // store the disable state . In case of re-render the button is rendered in the correct state.
                this.installDisabled = false;
                // On load set the install app button state
                this.handleInstallState();
                this.listenTo(this.model.deployTask.entry.content, 'change:state', this.handleInstallState);
            },

            /**
             * Changes the state of install button if the state of deployTask is running or new.
             */
            handleInstallState: function() {
                var name = this.model.deployTask.entry.get('name');
                if (name) {
                    var taskState = this.model.deployTask.entry.content.get('state');
                    if ( (taskState === 'running' || taskState === 'new')) {
                        this.installDisabled = true;
                        this.$el.find('a.new-entity-button').addClass('disabled');
                        return;
                    }
                }
                this.installDisabled = false;
                this.$el.find('a.new-entity-button').removeClass('disabled');
            },


            render: function () {
                var html = this.compiledTemplate({
                    entitySingular: this.options.entitySingular,
                    editLinkHref: this.options.editLinkHref || '#',
                    manageLocalAppsLink: urlHelper.manageLocalAppsUrl(),
                    installCss: this.installDisabled? 'disabled': ''
                });

                this.$el.html(html);

                return this;
            },

            template: MANAGE_LOCAL_APPS_BTN + '\
                <a href="<%- editLinkHref %>" class="btn btn-primary new-entity-button <%- installCss %>"><%- _("Install").t() + " " + entitySingular %></a>\
            ',

            cannotCreateTemplate: MANAGE_LOCAL_APPS_BTN
        });
    }
);

