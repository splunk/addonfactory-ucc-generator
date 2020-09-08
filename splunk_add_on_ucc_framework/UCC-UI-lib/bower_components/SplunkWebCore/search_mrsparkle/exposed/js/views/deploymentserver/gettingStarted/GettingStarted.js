define(
    ['module',
     'views/Base',
     'uri/route', 
     'views/deploymentserver/gettingStarted/LearnMoreButton'
    ],
    function(
        module,
        BaseView,
        route, 
        LearnMoreButton 
    ) {

        return BaseView.extend({
            moduleId: module.id,
            className: 'gettingstarted-msg',
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments); 
                this.children.learnmorelink = new LearnMoreButton({model: {application: this.model.application}}); 
            },
            render: function() {
		var html = this.compiledTemplate();
                this.$el.html(html);
                this.$('#learnmorelink_container').append(this.children.learnmorelink.render().el);
                return this;
            },
            template: '\
                <div class="section-header section-padded">\
                  <h2 class="section-title"> <%-_("Forwarder Management").t()%></h2>\
                  <div id="gettingstarted-content"><%-_("The forwarder management UI distributes deployment apps to Splunk clients. No clients or apps are currently available on this deployment server.").t()%></div>\
                  <div id="learnmorelink_container"></div>\
                </div>\
            '


        });

});






