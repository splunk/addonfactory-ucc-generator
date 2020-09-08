define(
    [
         'underscore',
         'backbone',
         'module',
         'views/shared/Modal',
         'views/shared/jobcontrols/menu/sendbackgroundmodal/Settings',
         'views/shared/jobcontrols/menu/sendbackgroundmodal/Success'
     ],
     function(_, Backbone, module, Modal, Settings, Success){
        return Modal.extend({
            /**
             * @param {Object} options {
             *  model:  {
             *      searchJob: <models.services.search.Job>,
             *      application: <models.Application>,
             *      appLocal: <models.services.AppLocal>
             *  }
             * 
             */
            moduleId: module.id,
            initialize: function() {
                Modal.prototype.initialize.apply(this, arguments);
                
                this.model.inmem = this.model.searchJob.clone();
                this.model.inmem.set({
                    email: false,
                    results: "none",
                    subject: _("Splunk Job Complete: $name$").t()
                });

                this.children.settings = new Settings({
                    model: {
                        application: this.model.application,
                        inmem: this.model.inmem,
                        appLocal: this.model.appLocal
                    }
                });

                this.children.success = new Success({
                    model: {
                        application: this.model.application,
                        inmem: this.model.inmem
                    }
                });

                this.model.inmem.on('saveSuccess', function(){
                    this.children.settings.$el.hide();
                    this.children.success.$el.show();
                },this);

                this.on("hidden", function() {
                    if (this.model.inmem.isBackground()) {
                        this.model.searchJob.trigger("close");
                    }
                }, this);  
            },
            render: function() {
                this.children.settings.render().appendTo(this.$el);
                this.children.success.render().appendTo(this.$el);
                this.children.success.$el.hide();
            }
        });
    }
);