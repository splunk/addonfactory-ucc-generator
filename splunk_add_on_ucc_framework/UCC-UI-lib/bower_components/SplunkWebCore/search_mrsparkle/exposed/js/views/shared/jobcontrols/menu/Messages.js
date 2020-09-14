define(
    [        
        'underscore',
        'module',
        'views/Base',
        'util/splunkd_utils',
        'uri/route',
        'splunk.util'
    ], 
    function(_, module, Base, splunkd_utils, route, splunk_util) {
        return Base.extend({
            moduleId: module.id,
            className: 'job_messages hidden',
            tagName: 'ul',
            initialize: function(){
                Base.prototype.initialize.apply(this, arguments);
                this.activate();
            },
            startListening: function() {
                this.listenTo(this.model.searchJob, 'serverValidated', this.checkMessages);  
            },
            checkMessages: function(isValid, model, messages) {
                var filteredMessages = splunkd_utils.filterMessagesByTypes(messages, [splunkd_utils.INFO, splunkd_utils.WARNING]);
                
                if (filteredMessages.length) {
                    this.showMessages(filteredMessages);
                } else {
                    this.$el.empty();
                }
            },
            showMessages: function(messages) {
                this.$el.empty();
                _.each(messages, function(message, index){
                    this.$el.append(
                        _.template(this.messagesTemplate, {
                            message: message,
                            route: route,
                            application: this.model.application,
                            util: splunk_util
                        })
                    );
                }.bind(this));
            },
            render: function() {
                this.checkMessages(undefined, this.model.searchJob, this.model.searchJob.getMessages());
                return this;
            },
            messagesTemplate: '\
                <li class="job_message">\
                    <%= util.getWikiTransform(message.text) %>\
                    <% if (message.help) { %>\
                        <a href="<%- route.docHelp(application.get("root"), application.get("locale"), message.help) %>"\
                        target="_blank" class="learn_more">\
                            <%- _("Learn More").t() %>\
                            <i class="icon-external"></i>\
                        </a>\
                    <% } %>\
                </li>\
            '
        });
    }
);