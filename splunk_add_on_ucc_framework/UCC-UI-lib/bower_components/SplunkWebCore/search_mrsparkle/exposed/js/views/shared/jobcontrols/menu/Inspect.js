define(['underscore', 'module', 'views/Base', 'uri/route', 'splunk.window'], function(_, module, BaseView, route, splunkwindow) {
    return BaseView.extend({
        moduleId: module.id,
        className: 'inspect',
        tagName: 'li',
        initialize: function(){
            BaseView.prototype.initialize.apply(this, arguments);
        },
        events: {
            'click a:not(".disabled")': function(e) {
                splunkwindow.open(
                    route.jobInspector(this.model.application.get('root'), this.model.application.get('locale'), this.model.application.get('app'), this.model.searchJob.id),
                    'splunk_job_inspector',
                    {
                        width: 870,
                        height: 560,
                        menubar: false
                    }
                );
                e.preventDefault();
            },
            'click a.disabled': function(e) {
                e.preventDefault();
            }
        },
        startListening: function() {
            this.listenTo(this.model.searchJob, 'error', function(){
                this.disableInspect();
            });

            this.listenTo(this.model.searchJob.control, 'error', function(){
                this.disableInspect();
            });
        },

        disableInspect : function(){
            this.$('.job-inspect').addClass('disabled');
        },

        render: function() {
            this.$el.html('<a class="job-inspect" href="#">' + _('Inspect Job').t() + '</a>');
            return this;
        }
    });
});
