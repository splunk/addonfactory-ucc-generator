define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/jobcontrols/Cancel',
        'views/shared/jobcontrols/Stop',
        'views/shared/jobcontrols/PlayPause',
        'views/shared/jobcontrols/Reload',
        'views/shared/jobcontrols/menu/Master',
        'views/shared/JobNotFoundModal',
        'util/console',
        './Master.pcss'
    ],
    function($, _, module, Base, Cancel, Stop, PlayPause, Reload, Menu, JobNotFound, console, css) {
        return Base.extend({
            moduleId: module.id,
            className: 'pull-left includes-job-menu',
            /**
             * @param {Object} options {
             *     model: {
             *         searchJob: <helpers.ModelProxy>,
             *         application: <models.Application>,
             *         appLocal: <models.services.AppLocal>,
             *         report: <models.Report> (Optional.),
             *         serverInfo: <models.services.server.ServerInfo>
             *     },
             *     showJobMenu: <Boolean> Controls if job menu is displayed. Defaluts to true.
             *     allowDelete: <Boolean> Controls if delete job link is displayed. Defaluts to true.
             *     allowTouch: <Boolean> Controls if touch job link is displayed. Defaluts to false.
             *     externalJobLinkPage: <String> Page externernal job liks should link to. Defalut current page.
             *     enableReload: <Boolean> Controls if the reload button will be shown when the job is done. Defaults to false
             * }
             */
            initialize: function(){
                Base.prototype.initialize.apply(this, arguments);
                
                var defaults = {
                    showJobMenu: true,
                    allowDelete: true,
                    allowSendBackground: true,
                    allowTouch: false,
                    enableReload: false
                };

                _.defaults(this.options, defaults);

                if (this.options.showJobMenu) {
                    this.children.menu = new Menu({
                        model: {
                            searchJob: this.model.searchJob,
                            application: this.model.application,
                            appLocal: this.model.appLocal,
                            report: this.model.report,
                            serverInfo: this.model.serverInfo
                        },
                        allowDelete: this.options.allowDelete,
                        allowSendBackground: this.options.allowSendBackground,
                        allowTouch: this.options.allowTouch,
                        externalJobLinkPage: this.options.externalJobLinkPage
                    });
                } else {
                    this.$el.removeClass('includes-job-menu');
                }

                this.children.playPause = new PlayPause({
                    model: this.model.searchJob,
                    attachTooltipTo: this.options.attachTooltipTo
                });
                //TODO: hiding cancel for now because it doesn't show up in the prototype
                //this.children.cancel = new Cancel({model: this.model});
                this.children.stop = new Stop({
                    model: this.model.searchJob,
                    attachTooltipTo: this.options.attachTooltipTo
                });

                if (this.options.enableReload) {
                    this.children.reload = new Reload({
                        model: this.model.searchJob,
                        attachTooltipTo: this.options.attachTooltipTo
                    });
                }
                
                this.activate({skipRender: true});
            },
            startListening: function() {
                this.listenTo(this.model.searchJob, 'sync', this.render);
                this.listenTo(this.model.searchJob, 'jobControls:notFound', function(options) {
                    options = options || {};
                    this.children.jobNotFound = new JobNotFound({
                        model: {
                            searchJob: this.model.searchJob,
                            application: this.model.application
                        },
                        title: options.title,
                        onHiddenRemove: true
                    });
                    
                    this.children.jobNotFound.render().appendTo($("body"));
                    this.children.jobNotFound.show();
                });
            },
            activate: function(options) {
                options = options || {};  
                if (this.active) {
                    return Base.prototype.activate.apply(this, arguments);
                }
                if (!options.skipRender && this.el.innerHTML) {
                    this.render();
                }
                return Base.prototype.activate.apply(this, arguments);
            },
            render: function() {
                if (!this.el.innerHTML) {
                    _.each(this.children, function(child) {
                        child.render().appendTo(this.$el);
                    }, this);
                }

                var dynamicChildren = [
                    this.children.playPause,
                    //this.children.cancel,
                    this.children.stop
                ];

                if (this.options.enableReload) {
                    dynamicChildren.push(this.children.reload);
                }
                _.each(dynamicChildren, function(child) {
                        child.$el[child.isActive() ? "removeClass" : "addClass"]("disabled");
                        // Only append the child if it's not already there, this avoids a flickering button. (SPL-80413)
                        if(!$.contains(this.el, child.el)) {
                            child.appendTo(this.$el);
                        }
                        var wasFocused = child.$el.is(':focus');
                        if(wasFocused) {
                            child.$el.focus();
                        }
                        
                }, this);

                return this;
            }
        });
    }
);
