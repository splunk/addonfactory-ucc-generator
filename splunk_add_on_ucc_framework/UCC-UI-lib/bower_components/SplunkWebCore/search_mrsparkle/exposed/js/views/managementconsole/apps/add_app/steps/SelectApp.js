/**
 * Created by rtran on 2/23/16.
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base',
    'views/shared/controls/SyntheticRadioControl',
    'views/managementconsole/apps/add_app/overrides/shared/apps_remote/Master',
    'views/managementconsole/apps/add_app/shared/SideListView',
    'views/managementconsole/apps/add_app/SelectAppFile',
    'views/managementconsole/apps/add_app/overrides/shared/apps_remote/ResultsPane',
    'views/shared/FlashMessagesLegacy',
    'collections/shared/FlashMessages',
    'contrib/text!views/managementconsole/apps/add_app/steps/SelectApp.html',
    'views/managementconsole/shared.pcss',
    '../AddApp.pcss'
], function(
    $,
    _,
    Backbone,
    module,
    BaseView,
    SyntheticRadioControl,
    AppBrowserView,
    SideListView,
    SelectAppFileView,
    ResultsPaneView,
    FlashMessagesLegacyView,
    FlashMessagesCollection,
    template,
    cssShared,
    css
) {
    var DEFAULT_INSTALL_TYPE = 'upload',
        STRINGS = {
            FILTER: _('Filter').t()
        };

    return BaseView.extend({
        template: template,
        moduleId: module.id,

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            /*
             * This view controls the side bar that toggles which view to display
             */
            this.children.sideListView = new SideListView({
                model: this.model.wizard,
                modelAttribute: 'appInstallType',
                items: [
                    { label: _('Upload App').t(), desc: _('Upload an App Description').t(), value: 'upload' },
                    { label: _("Browse Apps").t(), desc: _("Browse an App Description").t(), value: 'browse' }
                ],
                defaultValue: DEFAULT_INSTALL_TYPE
            });

            this.children.appBrowserView = new AppBrowserView({
                model: {
                    user: this.model.user,
                    metadata: this.model.metadata,
                    auth: this.model.auth,
                    application: this.model.application,
                    serverInfo: this.model.serverInfo,
                    appModel: this.model.appModel,
                    wizard: this.model.wizard
                },
                collection: {
                    appsRemote: this.collection.appsRemote,
                    appLocals: this.collection.appLocals,
                    messages: this.collection.messages,
                    options: this.collection.options
                },
                hideDock: true,
                resultsPaneClass: ResultsPaneView
            });

            this.children.selectAppFileView = new SelectAppFileView({
                model: {
                    wizard: this.model.wizard,
                    appModel: this.model.appModel
                },
                viewSize: 'large',
                showFlashMessages: true
            });

            this.listenTo(this.model.wizard, 'change:appInstallType', this._updateRightSideView);
            this.listenTo(this.model.wizard, 'browseAppError', function() {
                this.$('.app-browser-side-bar').hide();
                this.$('.app-browser-main-section').addClass('error');
            }.bind(this));
        },

        events: {
            // this event handler controls the filter tab
            'click .tab': function(e) {
                e.preventDefault();
                var $prevSelectedTab = this.$selectedTab,
                    tabValue = $(e.currentTarget).data('value');

                if ($prevSelectedTab) {
                    $prevSelectedTab.removeClass('selected');
                }

                // if same tab clicked, simply remove selected class
                if (!$prevSelectedTab || this.$selectedTab.get(0) !== $prevSelectedTab.get(0)) {
                    this.$selectedTab = $(e.currentTarget);
                    this.$selectedTab.addClass('selected');
                } else {
                    this.$selectedTab = null;
                }

                if (tabValue === 'filter') {
                    this.model.wizard.set('hideFilter', !this.model.wizard.get('hideFilter'));
                }
            }
        },

        _updateRightSideView: function(model, appInstallType) {
            /*
             * On reload, if file exists, then update the file input
             */
            var file = this.model.appModel.entry.content.get('data');
            if (file) {
                this.children.selectAppFileView.updateFile(file);
            }

            if (appInstallType === 'browse') {
                this.$('.browse-app-section').show();
                this.$('.upload-app-section').hide();

                /*
                 * Logic to enable / disable next button when
                 * app browser is selected
                 if (!this.appBrowsed) {
                 this.model.wizard.trigger('disableNext');
                 } else {
                 this.model.wizard.trigger('enableNext');
                 }
                 */
            } else if (appInstallType === 'upload') {
                this.$('.upload-app-section').show();
                this.$('.browse-app-section').hide();

                if (!this.model.appModel.entry.content.get('data')) {
                    this.model.wizard.trigger('disableNext');
                } else {
                    this.model.wizard.trigger('enableNext');
                }
            }
        },

        render: function() {
            this.$el.append(this.compiledTemplate({
                Strings: STRINGS
            }));

            this.$('.installation-type-list').append(this.children.sideListView.render().el);
            this.$('.upload-app-section').hide();
            this.$('.browse-app-section').hide();

            this.$('.upload-app-section').append(this.children.selectAppFileView.render().el);
            this.$('.app-browser-main-section').append(this.children.appBrowserView.render().el);

            this._updateRightSideView(null, this.model.wizard.get('appInstallType'));

            return this;
        }
    });
});