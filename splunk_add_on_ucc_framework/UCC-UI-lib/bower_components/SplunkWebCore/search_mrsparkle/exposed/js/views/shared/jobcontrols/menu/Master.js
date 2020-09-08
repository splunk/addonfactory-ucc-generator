define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/shared/jobcontrols/menu/Messages',
        'views/shared/jobcontrols/menu/Edit',
        'views/shared/jobcontrols/menu/SendBackground',
        'views/shared/jobcontrols/menu/Touch',
        'views/shared/jobcontrols/menu/Inspect',
        'views/shared/jobcontrols/menu/Delete',
        'views/shared/delegates/Popdown',
        'util/splunkd_utils'
    ],
    function(_, module, Base, Messages, Edit, SendBackground, Touch, Inspect, Delete, Popdown, splunkd_utils) {
        return Base.extend({
            moduleId: module.id,
            className: 'job-menu dropdown',
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
                
                this.children.messages = new Messages({
                    model: {
                        searchJob: this.model.searchJob,
                        application: this.model.application
                    }
                });
                
                this.children.edit = new Edit({
                    model: {
                        searchJob: this.model.searchJob,
                        application: this.model.application,
                        report: this.model.report,
                        serverInfo: this.model.serverInfo
                    },
                    externalJobLinkPage: this.options.externalJobLinkPage
                });

                this.children.sendBackground = new SendBackground({
                    model: {
                        searchJob: this.model.searchJob,
                        application: this.model.application,
                        appLocal: this.model.appLocal
                    }
                });
                
                this.children.touch = new Touch({
                    model: {
                        searchJob: this.model.searchJob,
                        application: this.model.application,
                        report: this.model.report,
                        serverInfo: this.model.serverInfo
                    },
                    externalJobLinkPage: this.options.externalJobLinkPage
                });

                this.children.inspect = new Inspect({
                    model: {
                        searchJob: this.model.searchJob,
                        application: this.model.application
                    }
                });

                this.children.del = new Delete({
                    model: {
                        searchJob: this.model.searchJob,
                        application: this.model.application
                    }
                });
                
                this.activate();
            },
            startListening: function() {
                this.listenTo(this.model.searchJob, "serverValidated", this.checkMessages);
            },
            checkMessages: function(isValid, model, messages) {
                var hasInfo = splunkd_utils.messagesContainsOneOfTypes(messages, [splunkd_utils.INFO]),
                    hasWarning = splunkd_utils.messagesContainsOneOfTypes(messages, [splunkd_utils.WARNING]);
                
                if (hasWarning) {
                    this.showMessageIndicator(splunkd_utils.WARNING);
                } else if (hasInfo) {
                    this.showMessageIndicator(splunkd_utils.INFO);
                } else {
                    this.$(".message-indicator").hide();
                    this.children.messages.$el.addClass("hidden");
                }
            },
            showMessageIndicator: function(type) {
                var iconClassName = splunkd_utils.normalizeType(type) == 'info' ? 'icon-info-circle' : 'icon-warning';
                this.$(".message-indicator").attr('class', 'message-indicator ' + iconClassName).show();
                
                this.children.messages.$el.removeClass("hidden");
            },
            render: function() {
                var $ul;
                if (this.$el.html().length) {
                    return this;
                }
                this.$el.html(this.compiledTemplate({
                    _: _
                }));
                
                this.$('.dropdown-menu > .arrow').after(this.children.messages.render().el);
                
                $ul = this.$('.controls');
                this.children.edit.render().appendTo($ul);
                
                if (this.options.allowSendBackground) {
                    this.children.sendBackground.render().appendTo($ul);
                }
                
                if (this.options.allowTouch) {
                    this.children.touch.render().appendTo($ul);
                }
                
                this.children.inspect.render().appendTo($ul);

                if (this.options.allowDelete) {
                    this.children.del.render().appendTo($ul);
                }

                this.children.popdown = new Popdown({el: this.el, attachDialogTo:'body'});
                
                this.checkMessages(undefined, this.model.searchJob, this.model.searchJob.getMessages());
                return this;
            },
            template: '\
                <a class="btn-pill dropdown-toggle" href="#">\
                    <i class="message-indicator" style="display:none"></i>\
                    <%- _("Job").t() %><span class="caret"></span>\
                </a>\
                <div class="dropdown-menu">\
                    <div class="arrow"></div>\
                    <ul class="controls"></ul>\
                </div>\
            '
        });
    }
);
