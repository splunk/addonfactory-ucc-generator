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
             *      model:  {
             *          // Only pass in search job model if touching a single job,
             *          // if touching multiple jobs just pass in application model.
             *          searchJob <models.services.search.Job> (Optional),
             *          application: : <models.shared.Application>
             *      }
             *  }
             */
            moduleId: module.id,
            initialize: function() {
                Modal.prototype.initialize.apply(this, arguments);
            },
            render: function() {
                var isBulk = !this.model.searchJob,
                    template = this.compiledTemplate({
                        learnMoreLink: route.docHelp(
                            this.model.application.get("root"),
                            this.model.application.get("locale"),
                            'learnmore.jobs.extend.lifetime'
                        ),
                        isBulk: isBulk,
                        time: isBulk ? '' : this.model.searchJob.getExpirationString(),
                        _: _,
                        splunkUtil: splunkUtil
                    });
                
                this.$el.html(Modal.TEMPLATE);

                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Extend Job Lifetime").t());

                this.$(Modal.BODY_SELECTOR).append(template);

                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CLOSE);
                
                return this;
            },
            template: '\
                <p>\
                    <% if (isBulk) { %>\
                        <%- _("The lifetime of selected jobs was extended by time specified in Job Settings.").t() %> \
                    <% } else { %>\
                        <%= splunkUtil.sprintf(_("The lifetime of the job was extended to %s.").t(), time) %> \
                    <% } %>\
                    <a href="<%= learnMoreLink%>" target="_blank">\
                        <%- _("Learn More").t() %> <i class="icon-external"></i>\
                    </a>\
                </p>\
            '
        });
    }
);