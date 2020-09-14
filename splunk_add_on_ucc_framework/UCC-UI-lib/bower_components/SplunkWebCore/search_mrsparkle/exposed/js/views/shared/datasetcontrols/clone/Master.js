define([
    'underscore',
    'jquery',
    'backbone',
    'views/shared/Modal',
    'module',
    'views/shared/datasetcontrols/clone/Clone',
    'views/shared/datasetcontrols/clone/Success'
    ],
    function(
        _,
        $,
        Backbone,
        Modal,
        module,
        Clone,
        Success
    ) {
    return Modal.extend({
            moduleId: module.id,
            /**
            * @param {Object} options {
            *   model: {
            *       dataset: <models.PolymorphicDataset>,
            *       application: <models.Application>
            *       user: <models.service.admin.user>
            *   }
            * }
            */
            initialize: function() {
                Modal.prototype.initialize.apply(this, arguments);
                this.model.inmem = this.model.dataset.clone();

                this.children.clone = new Clone({
                    model: {
                        dataset: this.model.dataset,
                        application: this.model.application,
                        inmem: this.model.inmem,
                        serverInfo: this.model.serverInfo
                    },
                    nameLabel: this.options.nameLabel
                });

                this.children.success = new Success({
                    model: {
                        application: this.model.application,
                        dataset: this.model.dataset,
                        inmem: this.model.inmem,
                        user: this.model.user
                    },
                    nameLabel: this.options.nameLabel
                });

                this.model.inmem.on('createSuccess', function(){
                    this.children.clone.$el.hide();
                    this.children.success.render().appendTo(this.$el);
                }, this);

                this.on("hidden", function() {
                    if (!this.model.inmem.isNew()) {
                        this.model.dataset.trigger('updateCollection');
                    }
                }, this);

            },
            
            render: function() {
                this.children.clone.render().appendTo(this.$el);

                return this;
            }
        }
    );
});
