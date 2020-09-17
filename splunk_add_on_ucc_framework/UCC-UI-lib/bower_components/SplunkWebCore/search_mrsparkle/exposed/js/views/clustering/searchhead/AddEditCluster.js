define(
    [
        'backbone',
        'module',
        'views/Base',
        'views/clustering/searchhead/AddEditClusterForm',
        'views/clustering/searchhead/AddEditClusterSuccess'
    ],
    function(
        Backbone,
         module,
         Modal,
         FormView,
         SuccessView
    ){
        return Modal.extend({
            moduleId: module.id,
            initialize: function() {
                Modal.prototype.initialize.apply(this, arguments);

                this.children.formView = new FormView({
                    model: this.model
                }).on({
                    'stepDone': function(){
                        this.children.formView.hide();
                        this.children.successView.show();
                        this.trigger('stepDone');
                    }
                }, this);

                this.children.successView = new SuccessView({});

                this.render();
                return this;

            },
            render: function() {

                this.$el.append(this.children.formView.el);
                this.$el.append(this.children.successView.render().$el.hide());

                return this;

            }
        });
    }
);