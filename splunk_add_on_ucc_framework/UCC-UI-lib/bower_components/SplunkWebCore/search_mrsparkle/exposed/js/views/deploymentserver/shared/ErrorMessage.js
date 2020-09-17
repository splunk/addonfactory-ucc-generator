define(
    ['module',
     'views/Base'
    ],
    function(
        module,
        BaseView
    ) {

        return BaseView.extend({
            moduleId: module.id,
            className: 'gettingstarted-msg',
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments); 
            },
            render: function() {
		var html = this.compiledTemplate();
                this.$el.html(html);
                return this;
            },
            template: '\
                <div class="section-header section-padded">\
                  <h2 class="section-title"> <%-_("Forwarder Management").t()%></h2>\
                  <div id="gettingstarted-content"><%-_("There is an error in your serverclass.conf which is preventing deployment server from initializing.  Please see your serverclass.conf.spec file for more information.").t()%></div>\
                </div>\
            '


        });

});






