define([
            'module',
            'views/shared/Modal',
            'views/shared/ViewStack'
        ],
        function(
            module,
            Modal,
            ViewStack
        ) {

    return Modal.extend({

        initialize: function() {
            Modal.prototype.initialize.apply(this, arguments);
            this.stepViewStack = new ViewStack({ selectedIndex: 0 });
        },

        getStepViews: function() {
            throw new Error('getStepViews must be implemented by each subclass');
        },

        render: function() {
            Modal.prototype.render.apply(this, arguments);
            this.stepViewStack.render().appendTo(this.el);
            this.stepViewStack.setPanes(this.getStepViews());
            return this;
        }

    });

});