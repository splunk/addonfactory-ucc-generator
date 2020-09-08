define(
    [   
        'jquery',
        'underscore',
        'backbone',
        'module',
        'views/Base',
        'views/shared/Modal',
        'uri/route',
        'splunk.util'
     ],
     function(
        $,
        _,
        Backbone,
        module,
        Base,
        Modal,
        route,
        splunkUtil
    ){
        return Modal.extend({
            /**
             * @param {Object} options {
                    model:  {
                        //pass in a search job model if a single job was not found
                        searchJob:<models.services.search.Job>,
                        application: <models.shared.Application>
                    },
                    colleciton: {
                        //pass in a search job collection if a job was not found during bulk action
                        searchJobs: <collections.search.Jobs>
                    },
                    title: <String> title to display (optional)
                    action: <String> action being performed to be added to the message string (optional).
             *  }
             */
            moduleId: module.id,
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
                
                var defaults = {
                    title: _('Not Found').t(),
                    action: _('edited').t()
                };
                
                _.defaults(this.options, defaults);
                
                this.isBulk = !this.model.searchJob;
                
                this.listenTo(this, "hidden", function() {
                    if (this.isBulk) {
                        this.collection.searchJobs.trigger('refresh');
                    } else {
                        this.model.searchJob.trigger('refresh');
                    }
                });
            },
            
            render: function() {
                var template = this.compiledTemplate({
                        learnMoreLink: route.docHelp(
                            this.model.application.get("root"),
                            this.model.application.get("locale"),
                            'learnmore.jobs.extend.lifetime'
                        ),
                        isBulk: this.isBulk,
                        action: this.options.action,
                        allFailed: !this.isBulk || this.collection.searchJobs.length === this.collection.searchJobs.bulkControl.getNumOfNotFoundJobs(),
                        splunkUtil: splunkUtil
                    });
                
                this.$el.html(Modal.TEMPLATE);
                
                this.$(Modal.HEADER_TITLE_SELECTOR).html(this.options.title);
                
                this.$(Modal.BODY_SELECTOR).prepend(template);
                
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CLOSE);
                
                return this;
            },
            
            template: '\
                <p>\
                    <% if (!isBulk) { %>\
                        <%- _("This job does not exist. It may have been deleted or expired.").t() %> \
                    <% } else if (allFailed) { %>\
                        <%- splunkUtil.sprintf(_("The jobs could not be %s because they no longer exist. They might have been deleted or expired. The jobs will be removed from the list.").t(), action) %> \
                    <% } else { %>\
                        <% if (action === "extended") { %>\
                            <%- _("The active jobs are extended by the time specified in the Job Settings dialog. Jobs that are expired or deleted will be removed from the list.").t() %> \
                        <% } else { %>\
                            <%- splunkUtil.sprintf(_("Some jobs could not be %s because they no longer exist. They might have been deleted or expired. These jobs will be removed from the list.").t(), action) %> \
                        <% } %>\
                    <% } %>\
                    <a href="<%= learnMoreLink %>" target="_blank">\
                        <%- _("Learn More").t() %> <i class="icon-external"></i>\
                    </a>\
                </p>\
            '
        });
    }
);