define(
    ['module',
     'views/Base',
     'views/deploymentserver/editServerclass/AddClientsButton',
     'uri/route'
    ],
    function(
        module,
        BaseView,
        AddClientsButton,
        route) {

        return BaseView.extend({
            moduleId: module.id,
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments); 
                this.children.addClientsButton = new AddClientsButton({
                    model: this.model, 
                    isReadOnly: this.options.isReadOnly, 
                    application: this.options.application
                });

            },
            render: function() {
		var html = this.compiledTemplate();
                this.$el.html(html);
                this.$('#addClientsButton').append(this.children.addClientsButton.render().el);
                return this;
            },
            template: '\
                     <div class="dashboard-header">\
                         <h3 class="dashboard-title"><%- _("You haven\'t added any clients").t() %></h3>\
                     </div>\
                    <div id="addClientsButton" class="action-button"></div>\
           '
        });

});

