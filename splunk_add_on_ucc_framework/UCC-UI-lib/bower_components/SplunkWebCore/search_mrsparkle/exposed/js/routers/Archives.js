/**
 * @author jszeto
 * @date 3/18/15
 *
 * Router for Archive Manager
 *
 *
 */

define(
    [
        'underscore',
        'backbone',
        'jquery',
        'routers/Base',
        'views/error/Master',
        'views/archives/shared/ArchivesController',
        'views/archives/shared/ArchivesDisabledView'
    ],
    function(
        _,
        Backbone,
        $,
        BaseRouter,
        ErrorView,
        ArchivesController,
        ArchivesDisabledView
    ) {
        return BaseRouter.extend({
            initialize: function() {
                BaseRouter.prototype.initialize.apply(this, arguments);
                this.setPageTitle(_('Manage Archives').t());
                this.enableAppBar = false;
                this.fetchUser = true;

            },
            page: function(locale, app, page) {
                BaseRouter.prototype.page.apply(this, arguments);

                $.when(this.deferreds.pageViewRendered).done(_(function() {
                    $('.preload').replaceWith(this.pageView.el);

                    if (!this.model.user.canArchive()) {
                        this.archivesController = new ArchivesDisabledView({
                            model:this.model,
                            collection: this.collection
                        });
                    } else if (!this.model.user.canEditArchives()) {
                        this.archivesController = new ErrorView({
                            model: {
                                application: this.model.application,
                                error: new Backbone.Model({
                                    status: _("Access Denied").t(),
                                    message: _("You do not have permission to view this page.").t()
                                })
                            }
                        });
                    } else {
                        this.archivesController = new ArchivesController({
                            model:this.model,
                            collection: this.collection
                        });
                    }

                    this.pageView.$('.main-section-body').append(this.archivesController.render().el);
                }).bind(this));
            }
        });
    }
);
