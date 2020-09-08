define(
    [
        'jquery',
        'module',
        'views/Base',
        'views/shared/splunkbar/Master',
        'views/shared/litebar/Master',
        'views/shared/litebar/BannerContent',
        'views/shared/appbar/Master',
        'views/shared/footer/Master',
        'views/shared/instrumentation/optinmodal/Master',
        'helpers/TourHelper'
    ],
    function(
        $,
        module,
        BaseView,
        SplunkBarView,
        SplunkBarSideView,
        BannerContentView,
        AppBarView,
        FooterView,
        OptInModal,
        TourHelper
    ) {
        var PageView = BaseView.extend({
            moduleId: module.id,
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.useSideNav = this.model.user.canUseSidenav();

                if (this.useSideNav) {
                    this.children.sideNav = SplunkBarSideView.create({
                        model: {
                            application: this.model.application,
                            appNav: this.model.appNav,
                            appLocal: this.model.appLocal,
                            user: this.model.user,
                            serverInfo: this.model.serverInfo,
                            config: this.model.config,
                            updateChecker: this.model.updateChecker,
                            userPref: this.model.userPref,
                            webConf: this.model.web
                        },
                        collection: this.collection
                    });

                    this.children.bannerContent = new BannerContentView({
                        collection: this.collection
                    });
                } else {
                    if (this.options.splunkBar) {
                        this.children.splunkBar = SplunkBarView.create({
                            model: {
                                application: this.model.application,
                                appNav: this.model.appNav,
                                appLocal: this.model.appLocal,
                                user: this.model.user,
                                serverInfo: this.model.serverInfo,
                                config: this.model.config,
                                updateChecker: this.model.updateChecker,
                                userPref: this.model.userPref
                            },
                            collection: this.collection,
                            showAppsList: this.options.hasOwnProperty("showAppsList") ? this.options.showAppsList : true
                        });
                    }
                    if (this.options.showAppNav !== false &&
                        this.model.appNav || this.options.showAppNav) {
                        this.children.appBar = AppBarView.create({
                            section: this.options.section || '',
                            model: {
                                application: this.model.application,
                                appNav: this.model.appNav,
                                user: this.model.user,
                                serverInfo: this.model.serverInfo
                            },
                            collection: this.collection
                        });
                    }
                }

                if (this.options.footer) {
                    this.children.footer = FooterView.create({
                        model: this.model,
                        collection: this.collection
                    });
                }
            },
            render: function() {
                this.renderLoadingMessage();
                this.renderHeader();

                // Check if user has already dismissed instrumentation opt in modal and has capability, else load modal.
                var notCloud = this.model.serverInfo && !this.model.serverInfo.isCloud(),
                    hasInstrumentationCapability = this.model.user && this.model.user.canEditInstrumentation && this.model.user.canEditInstrumentation(),
                    showOptInModal = this.model.userPref && this.model.userPref.showInstrumentationOptInModal();
                if (notCloud && hasInstrumentationCapability && showOptInModal) {
                    this.renderOptInModal();
                } else {
                    this.renderTour();
                }

                this.renderFooter();
                return this;
            },
            renderHeader: function() {
                if (this.useSideNav) {
                    this.$('header').append(this.children.sideNav.el);
                    var bannerContent = this.children.bannerContent.render();
                    this.$('header').prepend(bannerContent.el);
                    bannerContent.$el.hide();
                } else {
                    if (this.options.splunkBar) {
                        this.$('header').append(this.children.splunkBar.render().el);
                    }
                    if (this.options.showAppNav !== false &&
                        this.model.appNav || this.options.showAppNav) {
                        this.$('header').append(this.children.appBar.el);
                    }
                }
            },
            renderOptInModal: function() {
                this.children.optInModal = new OptInModal({
                    model: {
                        application: this.model.application,
                        userPref: this.model.userPref,
                        optIn: this.model.optIn
                    },
                    onHide: function() {
                        // Show tour modal after opt in modal is hidden.
                        this.renderTour();
                    }.bind(this)
                });
                this.children.optInModal.render().appendTo($("body"));
            },
            renderTour: function() {
                TourHelper.renderTour(this.model.tour, this.model.application, this.model.user, this.collection.tours);
            },
            killTour: function() {
                TourHelper.killTour();
            },
            renderFooter: function() {
                if (this.options.footer) {
                    this.$('footer').append(this.children.footer.render().el);
                }
            },
            renderLoadingMessage: function() {
                var html = this.compiledTemplate({loadingMessage: this.options.loadingMessage || ''});
                this.$el.html(html);
            },
            template: '\
                <a class="navSkip" href="#navSkip" tabIndex="1" style="position: absolute; top: 0; left: -1000px;">Screen reader users, click here to skip the navigation bar</a>\
                <header role="banner"></header>\
                <a id="navSkip"></a> \
                <div class="main-section-body" role="main">\
                    <% if (loadingMessage) { %>\
                        <div class="loading-message"><%- loadingMessage %></div>\
                    <% } %>\
                </div>\
                <footer role="contentinfo"></footer>\
            '
        });

        return PageView;
    }
);
