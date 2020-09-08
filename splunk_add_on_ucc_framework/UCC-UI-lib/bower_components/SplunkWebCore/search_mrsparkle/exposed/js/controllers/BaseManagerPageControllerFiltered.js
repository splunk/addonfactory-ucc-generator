define([
        'jquery',
        'underscore',
        'backbone',
        'module',
        'controllers/BaseManagerPageController',
        'models/services/AppLocal',
        'models/classicurl',
        'views/shared/basemanager/Master',
        'views/error/Master',
        'util/splunkd_utils',
        'splunk.util'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        BaseManagerPageController,
        AppLocalModel,
        classicurl,
        MasterView,
        ErrorView,
        splunkDUtils,
        splunkUtil
    ) {
        return BaseManagerPageController.extend({
            initialize: function(options) {
                this.model.classicUrl = classicurl;
                this.model.classicUrl.fetch();

                this.options = options;
                this.options.namespaceFilterCandidate = this.model.classicUrl.get('ns');

                this.canUseApps = this.model.user.canUseApps();
                
                // Don't update the pageTitle and the noEntities message in Splunk Enterprise
                if (this.options.namespaceFilterCandidate && !this.canUseApps) {
                    if (!this.options.header) {
                        this.options.header = {};
                    }
                    this.options.header.pageTitle = splunkUtil.sprintf(_("%s for %s").t(),
                        this.options.entitiesPlural, this.options.namespaceFilterCandidate);

                    this.options.grid = $.extend(true, this.options.grid, {
                        noEntitiesMessage: splunkUtil.sprintf(_("No %s found for %s").t(),
                        this.options.entitiesPlural, this.options.namespaceFilterCandidate)
                    });
                }
                BaseManagerPageController.prototype.initialize.call(this, this.options);

                // Launch validation asynchronously
                this.validateNamespace();
                this.listenTo(this.model.metadata, "change:appSearch", this.onAppFilterChanged.bind(this));
            },

            onAppFilterChanged: function() {
                // Update page title back to initial
                this.children.masterView.$('.section-title').text(this.options.entitiesPlural);
                // Update noEntitiesMessage back to initial
                this.options.grid.noEntitiesMessage = splunkUtil.sprintf(_('No %s found. ').t(), this.options.entitiesPlural.toLowerCase());

                // Remove namespace from URL
                this.model.classicurl.replaceState('');
            },

            /**
             * Override of method from superclass, adding app to filter
             * @returns the fetch data option object.
             */
            getFetchData: function() {
                var data = BaseManagerPageController.prototype.getFetchData.call(this);
                if (this.options.namespaceFilterCandidate) {
                    data['appSearch'] = this.options.namespaceFilterCandidate;
                }
                return data;
            },

            /**
             * Validate the namespace parameter passed in the URL.
             * Namespace can be an app or an add-on, e.g.: ns=Splunk_TA_windows
             * will be applied as a filter on the list of objects.
             * If the namespace is not a valid, then don't filter, show error page.
             * @returns the deferred's promise
             */
            validateNamespace: function () {
                if (!this.canUseApps && this.options.namespaceFilterCandidate) {
                    this.model.namespaceTest = new AppLocalModel();
                    this.model.namespaceTest.set({
                        id: this.model.namespaceTest.url + '/' + this.options.namespaceFilterCandidate});
                    this.model.namespaceTest.fetch({
                        success: _(function(model, response) {
                            // Do nothing
                        }).bind(this),
                        error: _(function(model, response) {
                            this.renderError();
                        }).bind(this)
                    });
                } else {
                    // In Splunk Enterprise and when no namespace, just proceed as usual, do nothing
                }
            },

            /**
             * Render an error page when the namespace entered is not valid.
             */
            renderError: function() {
                this.children.errorView = new ErrorView({
                    model: {
                        application: this.model.application,
                        error: new Backbone.Model({
                            status: splunkUtil.sprintf(_("Invalid filter: %s!").t(),
                                this.options.namespaceFilterCandidate),
                            message: splunkUtil.sprintf(_("Couldn't retrieve list of %s.").t(),
                                this.options.entitiesPlural)
                        })
                    }
                });
                this.children.errorView.render().replaceContentsOf($('.main-section-body'));
            }
        });

    });