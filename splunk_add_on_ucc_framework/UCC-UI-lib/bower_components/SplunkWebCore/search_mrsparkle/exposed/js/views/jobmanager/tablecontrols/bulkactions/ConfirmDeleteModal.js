define(
    [   
        'jquery',
        'underscore',
        'backbone',
        'module',
        'views/Base',
        'views/shared/Modal',
        'splunk.util',
        'splunk.i18n'
     ],
     function(
        $,
        _,
        Backbone,
        module,
        Base,
        Modal,
        splunkUtil,
        i18n
    ){
        return Modal.extend({
            /**
             * @param {Object} options {
                    colleciton: {
                        selectedJobs: <collections.search.Jobs>
                    }
             *  }
             */
            moduleId: module.id,
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
            },
            
            events: $.extend({}, Modal.prototype.events, {
                'click .btn-primary': function(e) {
                    this.trigger('deleteAll');

                    e.preventDefault();
                }
            }),
            
            render: function() {
                var template = this.compiledTemplate({
                        numOfJobs: this.collection.selectedJobs.length,
                        i18n: i18n,
                        splunkUtil: splunkUtil
                    });
                
                this.$el.html(Modal.TEMPLATE);
                
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_('Delete Jobs').t());
                
                this.$(Modal.BODY_SELECTOR).append(template);
                
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_DELETE);
                
                return this;
            },
            
            template: '\
                <p>\
                    <%- splunkUtil.sprintf(i18n.ungettext("Are you sure that you want to delete %s job?", "Are you sure that you want to delete %s jobs?", numOfJobs), i18n.format_decimal(numOfJobs)) %>\
                </p>\
            '
        });
    }
);