define(
    ['module',
     'views/Base',
     'views/deploymentserver/editServerclass/AddAppsButton',
     'uri/route'
    ],
    function(
        module,
        BaseView,
        AddAppsButton,
        route) {

        return BaseView.extend({
            moduleId: module.id,
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments); 
                this.children.addAppsButton = new AddAppsButton({
                    model: this.model, 
                    isReadOnly: this.options.isReadOnly, 
                    application: this.options.application
                });

            },
            render: function() {
		var html = this.compiledTemplate();
                this.$el.html(html);

                // TODO [JCS] We really shouldn't be reaching in to the internals like this. The alternative is to
                // create a Button class and add enable/disable function to it. The Control base class has these functions
                this.children.addAppsButton.$el.prop("disabled", this.collection.length == 0);

                this.$('.btn-add-apps').append(this.children.addAppsButton.render().el);
                return this;
            },
            template: '\
                 <div class="dashboard-header">\
                     <h2 class="dashboard-title"><%- _("You haven\'t added any apps").t() %></h2>\
                 </div>\
                <div class="btn-add-apps action-button"></div>\
           '


        });

});





