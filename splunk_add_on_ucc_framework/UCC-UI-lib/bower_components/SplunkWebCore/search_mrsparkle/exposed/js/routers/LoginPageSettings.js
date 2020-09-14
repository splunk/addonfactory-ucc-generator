/**
 * @author ahebert
 * @date 5/20/16
 *
 * Router for the login background settings page.
 */
define(
    [
        'jquery',
        'underscore',
        'routers/Base',
        "collections/services/Messages",
        'views/login_page_settings/Master'
    ],
    function(
        $,
        _,
        BaseRouter,
        MessagesCollection,
        MasterView
    ) {
        return BaseRouter.extend({
            initialize: function() {
                BaseRouter.prototype.initialize.apply(this, arguments);
                this.enableAppBar = false;
            },

            page: function(locale, app, page) {
                BaseRouter.prototype.page.apply(this, arguments);
                var pageTitle = _('Customize login page background').t();
                this.setPageTitle(pageTitle);
                
                this.collection.messages = new MessagesCollection();
                this.deferreds.messages = $.Deferred();

                if (this.deferreds.messages.state() !== 'resolved') {
                    this.collection.messages.fetch({
                        success: function(collection, response) {
                            this.deferreds.messages.resolve();
                        }.bind(this),
                        error: function(collection, response) {
                            this.deferreds.messages.resolve();
                        }.bind(this)
                    });
                } else {
                    this.deferreds.messages.resolve();
                }

                $.when(this.deferreds.pageViewRendered, this.deferreds.messages).then(function() {
                    this.masterView = new MasterView({
                        model: {
                            application: this.model.application,
                            user: this.model.user,
                            serverInfo: this.model.serverInfo,
                            web: this.model.web
                        },
                        collection: {
                            messages: this.collection.messages
                        },
                        pageTitle: pageTitle
                    });

                    $('.preload').replaceWith(this.pageView.el);
                    this.pageView.$('.main-section-body').append(this.masterView.render().el);
                }.bind(this));
            }
        });
    }
);