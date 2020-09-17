define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/jobstatus/buttons/ShareDialog',
        'util/splunkd_utils',
        'bootstrap.tooltip'
    ],
    function($, _, module, Base, ShareDialog, splunkd_utils) {
        return Base.extend({
            moduleId: module.id,
            className: 'share btn-pill btn-square disabled',
            tagName: 'a',
            attributes: {
                "href": "#"
            },
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
                this.$el.html('<i class="icon-share"></i><span class="hide-text">' + _("Share").t() + '</span>');
                this.$el.tooltip({animation:false, title:_('Share').t(), container: this.$el});
                this.activate();
            },
            startListening: function() {
                this.listenTo(this.model.searchJob.entry.acl, "change", this.render);
                this.listenTo(this.model.searchJob.entry.content, "change:ttl", this.render);
            },
            activate: function(options) {
                if (this.active) {
                    return Base.prototype.activate.apply(this, arguments);
                }
                this.defaultSaveTTL = parseInt(this.model.searchJob.entry.content.get("defaultSaveTTL"), 10);

                return Base.prototype.activate.apply(this, arguments);
            },
            events: {
                'click': function(e) {
                    var $target = $(e.currentTarget);
                    e.preventDefault();

                    if ($target.hasClass("disabled")) {
                        return;
                    }
                    
                    var $shareDeferred = $.Deferred();
                    this.model.searchJob.share({
                        success: function(model, response) {
                            $shareDeferred.resolve();
                        }.bind(this),
                        error: function(model, response) {
                            if (response.status == splunkd_utils.NOT_FOUND) {
                                this.model.searchJob.trigger('jobStatus:notFound', { title: _('Share Job').t() });
                                $shareDeferred.reject();
                            } else {
                                $shareDeferred.resolve();
                            }
                        }.bind(this)
                    });
                    
                    $.when($shareDeferred).done(function() {
                        this.children.shareDialog = new ShareDialog({
                            model: {
                                searchJob: this.model.searchJob,
                                application: this.model.application,
                                report: this.model.report,
                                serverInfo: this.model.serverInfo
                            },
                            onHiddenRemove: true,
                            externalJobLinkPage: this.options.externalJobLinkPage
                        });

                        this.children.shareDialog.render().appendTo($("body"));
                        this.children.shareDialog.show();
                    }.bind(this));
                }
            },
            render: function() {
                var canWrite = this.model.searchJob.entry.acl.canWrite();

                if (canWrite) {
                    this.$el.removeClass("disabled");
                } else {
                    this.$el.addClass("disabled");
                }
                return this;
            }
        });
    }
);
