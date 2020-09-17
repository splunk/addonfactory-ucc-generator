define(
    [
        'underscore',
        'jquery',
        'routers/Base',
        'models/shared/Error',
        'views/error/Master'
    ],
    function(
        _,
        $,
        BaseRouter,
        ErrorModel,
        ErrorView
    ) {
        return BaseRouter.extend({
            routes: {
                ':locale/*splat': 'page'
            },
            initialize: function() {
                BaseRouter.prototype.initialize.apply(this, arguments);
                this.enableAppBar = false;
                this.model.error = new ErrorModel();
                this.deferreds.error = $.Deferred();
            },
            page: function(locale, splat) {
                BaseRouter.prototype.page.call(this, locale, 'search', '');

                this.updateErrorModel();

                $.when(this.deferreds.error).then(function(){
                    var status = this.model.error.get('status');
                    // Intercept 402 Payment Required to display more user friendly message: Restricted by License
                    if (status && status.indexOf("402") != -1) {
                        var newStatus = "Restricted by License";
                        status = newStatus;
                        this.model.error.set("status", newStatus);
                    }
                    this.setPageTitle(_(status).t());
                }.bind(this));

                $.when(this.deferreds.error, this.deferreds.pageViewRendered).then(function(){
                    if (this.shouldRender) {
                        this.initializeErrorView();
                        $('.preload').replaceWith(this.pageView.el);
                        this.errorView.render().replaceContentsOf($('.main-section-body'));
                    }
                }.bind(this));
            },
            updateErrorModel: function() {
                if (this.deferreds.error.state() != 'resolved') {
                    if (typeof __error_status__ !== 'undefined') {
                        this.model.error.set('message', __error_status__['message']);
                        this.model.error.set('status', __error_status__['status']);
                    } else {
                        this.model.error.set('message', _('An unknown error has occurred.').t());
                        this.model.error.set('status', _('Error').t());
                    }
                    this.deferreds.error.resolve();
                }
            },
            initializeErrorView: function() {
                if (!this.errorView) {
                    this.errorView = new ErrorView({
                        model: {
                            error: this.model.error,
                            application: this.model.application
                        }
                    });
                }
            }
        });
    }
);