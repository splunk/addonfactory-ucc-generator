/**
 * A subclass of the Page view that dynamically collapses the header for small screen sizes
 * and provides a way to click to expand to see the full header.
 *
 * For the relevant CSS see exposed/less/base/navs-responsive.less under "Styles for the responsive header"
 */

define([
            'jquery',
            'underscore',
            'module',
            'models/config',
            'models/shared/Application',
            'models/services/server/ServerInfo',
            'models/services/data/ui/Nav',
            'models/services/data/ui/Tour',
            'models/shared/User',
            'collections/services/data/ui/Tours',
            'collections/services/data/ui/Managers',
            'views/shared/Page',
            'views/shared/appbar/Master',
            'views/extensions/DeclarativeDependencies',
            'helpers/user_agent',
            'util/color_utils',
            'jquery.resize',
            './ResponsiveHeaderPage.pcss'

        ],
        function(
            $,
            _,
            module,
            config,
            Application,
            ServerInfo,
            Nav,
            Tour,
            User,
            Tours,
            Managers,
            Page,
            AppbarMaster,
            DeclarativeDependencies,
            userAgent,
            colorUtils,
            jqueryResize,
            css
        ) {

    var HEIGHT_OF_COLLAPSED_NAV_BAR = 6,
        ANIMATION_DURATION = 200,
        INITIAL_HIDE_DELAY = 500;

    var ResponsiveHeaderPage = Page.extend({

        moduleId: module.id,

        events: {
            'click .expand-collapse-control': function(e) {
                e.preventDefault();
                if(this.isAnimating) {
                    return;
                }
                if(this.isExpanded) {
                    this.hideFullHeader();
                }
                else {
                    this.showFullHeader();
                }
            }
        },

        initialize: function() {
            this.options.model = _.extend({}, this.options.model, this.model);
            this.options.collection = _.extend({}, this.options.collection, this.collection);
            this.options.deferreds = _.extend({}, this.options.deferreds, this.deferreds);
            Page.prototype.initialize.call(this, this.options);
            this.updateHeaderHeight = this.updateHeaderHeight.bind(this);
            this.isExpanded = false;
            this.isAnimating = false;
            // boolean to keep track of whether the view has done its initial hide-show animation
            this.hasInitialized = false;
            this.$screen = $('<div class="expanded-nav-screen" tabindex=-1></div>').hide().appendTo('body');
            var that = this;
            this.$screen.on('click.' + this.cid, function() {
                if(that.isAnimating) {
                    return;
                }
                that.hideFullHeader();
            });
            $(window).on('resize.' + this.cid, function() {
                that.resetToInitialState();
                if(that.isInCollapsibleMode() && that.hasInitialized) {
                    that.detachNavAndAppBar();
                }
                else {
                    that.attachNavAndAppBar();
                }
                that.updateHeaderHeight();
                that.isExpanded = false;
                that.isAnimating = false;
            });

            this.activate();
        },

        startListening: function() {
            if (this.model.appNav) {
                this.listenTo(this.model.appNav.entry.content, 'change:color', function() {
                    this.parseBannerColor();
                    this.updateBannerColor();
                });
            }
        },

        remove: function() {
            this.$screen.remove();
            $(window).off('resize.' + this.cid);
            return Page.prototype.remove.apply(this, arguments);
        },

        render: function() {
            this.renderLoadingMessage();

            if (this.model.tour) {
                this.renderTour();
                this.setTourHeight();
            }

            this.renderHeader();
            this.renderFooter();
            this.$header = this.$('header');
            this.$navBar = this.$('.navbar-splunkbar');
            this.$appBar = this.$('.app-bar');
            var hideHeader = this.options.splunkBar === false &&
                this.options.showAppNav === false;
            var $expandCollapseControl = $(this.expandCollapseControlTemplate);
            if (hideHeader) {
                $expandCollapseControl.hide();
            }
            this.$header.append($expandCollapseControl);
            if (this.model.appNav) {
                this.parseBannerColor();
                this.updateBannerColor();
            }

            return this;
        },

        setTourHeight: function() {
            if (!this.isImgTour && !this.isInteractive) {
                this.$el.addClass("non-responsive");
                this.children.tour.setFixedHeight(this.getComputedHeaderHeight() + HEIGHT_OF_COLLAPSED_NAV_BAR);
            }
        },

        parseBannerColor: function() {
            var appNavColor = this.model.appNav.entry.content.get('color');
            if(appNavColor) {
                this.bannerColor = colorUtils.normalizeHexString(appNavColor);
            }
        },

        updateBannerColor: function() {
            if(!this.bannerColor) {
                return;
            }
            this.$('.expand-collapse-control').css({ 'background-color': this.bannerColor });
        },

        showFullHeader: function() {
            if (!this.$navBar || !this.$appBar || !this.$screen || !this.$header) {
                return;
            }
            var that = this;
            this.isAnimating = true;
            this.attachNavAndAppBar();
            this.$screen.fadeIn(ANIMATION_DURATION);
            this.$screen.css({'filter': 'alpha(opacity=30)'}); // FIX IE ALPHA FILTER
            var windowHeight = $(window).height();
            // Before animating we need to make sure the header has a concrete pixel value for its bottom.
            // When the bottom is defined using a calc(...) expression Safari is not able to animate it (SPL-107323).
            this.$header.css({ bottom: windowHeight - HEIGHT_OF_COLLAPSED_NAV_BAR });
            var bottomOffset = (HEIGHT_OF_COLLAPSED_NAV_BAR + this.getComputedHeaderHeight());
            this.$header.animate({ bottom: windowHeight - bottomOffset }, {
                duration: ANIMATION_DURATION,
                done: function() {
                    that.isExpanded = true;
                    that.isAnimating = false;
                }
            });
        },

        hideFullHeader: function(onSuccess) {
            if (!this.$navBar || !this.$appBar) return;
            if (!this.$screen || !this.$header) {
                onSuccess();
                return;
            }
            var that = this;
            this.isAnimating = true;
            this.$screen.fadeOut(ANIMATION_DURATION);
            this.$header.animate({ bottom: $(window).height() - HEIGHT_OF_COLLAPSED_NAV_BAR }, {
                duration: ANIMATION_DURATION,
                done: function() {
                    that.detachNavAndAppBar();
                    that.isExpanded = false;
                    that.isAnimating = false;
                    if(onSuccess) {
                        onSuccess();
                    }
                }
            });
        },

        resetToInitialState: function() {
            this.$('header').stop().css('bottom', '');
            this.$screen.hide();
        },

        onAddedToDocument: function() {
            if (!this.$navBar || !this.$appBar) return;
            this.updateHeaderHeight();
            this.$('header').on('elementResize', this.updateHeaderHeight);
            // on initial reflow in collapsible mode, make the full header visible anyway and hide it after a delay
            // NOTE: assumes that render will only be called once, at the beginning of the view's lifecycle
            if(this.isInCollapsibleMode()) {
                // Delay the entire process by a little bit to make sure the app nav has rendered to its full height.
                setTimeout(function() {
                    var bottomOffset = (HEIGHT_OF_COLLAPSED_NAV_BAR + this.getComputedHeaderHeight());
                    this.$('header').css({ bottom: $(window).height() - bottomOffset });
                    this.isExpanded = true;
                    setTimeout(function() {
                        this.hideFullHeader(function() {
                            this.hasInitialized = true;
                        }.bind(this));
                    }.bind(this), INITIAL_HIDE_DELAY);
                }.bind(this), 10);
            }
            else {
                this.hasInitialized = true;
            }
            Page.prototype.onAddedToDocument.call(this);
        },

        updateHeaderHeight: function() {
            // In the very unlikely event that the header height changes while animation is in progress,
            // bail out and reset the header to its initial state.
            if (this.isAnimating) {
                this.resetToInitialState();
            }
            if (!this.isInCollapsibleMode()) {
                this.$('.main-section-body').css({ top: this.getComputedHeaderHeight() });
            } else {
                this.$('.main-section-body').css({ top: '' });
            }
            if (this.model.tour) {
                this.setTourHeight();
            }
        },

        getComputedHeaderHeight: function() {
            return this.$('header').height() - HEIGHT_OF_COLLAPSED_NAV_BAR;
        },

        isInCollapsibleMode: function() {
            // sniff out the CSS of the expand/collapse control element
            return this.$('.expand-collapse-control').css('display') !== 'none';
        },

        detachNavAndAppBar: function() {
            if (!this.$navBar || !this.$appBar) return;
            // Detaching the header will cause its height change event to fire, which we don't want.
            // Remove the event listener here, and add it back in attachNavAndAppBar below.
            this.$('header').off('elementResize', this.updateHeaderHeight);
            this.$navBar.detach();
            this.$appBar.detach();
        },

        attachNavAndAppBar: function() {
            if (this.$navBar && this.$appBar) {
                this.$navBar.prependTo(this.$header);
                if (this.options.splunkBar === false) {
                    this.$appBar.prependTo(this.$header);
                } else {
                    this.$appBar.insertAfter(this.$navBar);
                }
                this.$('header').on('elementResize', this.updateHeaderHeight);
            }
        },

        expandCollapseControlTemplate: '\
            <div class="expand-collapse-control">\
                <a href="#" class="tab"><i class="icon-menu"></i></a>\
            </div>\
        '

    },
    {
        apiDependencies: {
            application: Application,
            appNav: Nav,
            config: config.constructor,
            user: User,
            serverInfo: ServerInfo,
            tour: Tour,
            tours: Tours,
            managers: Managers
        }
    });

    return DeclarativeDependencies(ResponsiveHeaderPage);

});
