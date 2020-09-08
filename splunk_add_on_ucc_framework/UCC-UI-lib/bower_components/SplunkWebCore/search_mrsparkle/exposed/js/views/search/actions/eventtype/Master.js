define(
    [
        'underscore',
        'jquery',
        'module',
        'views/shared/Modal',
        'models/Base',
        'models/services/saved/EventType',
        'views/shared/controls/ControlGroup',
        'views/search/actions/eventtype/Create',
        'views/search/actions/eventtype/Success'
    ],
    function(_, $, module, Modal, BaseModel, EventType, ControlGroup, EventTypeCreate, EventTypeSuccess){
        return Modal.extend({
            moduleId: module.id,
            className: 'modal',
            initialize: function() {
                Modal.prototype.initialize.apply(this, arguments);
                this.model.eventType = new EventType();
                this.eventTypeFetchDeferred = this.model.eventType.fetch();

                this.model.state = new BaseModel();

                this.children.create  = new EventTypeCreate({
                    model: {
                        eventType: this.model.eventType,
                        application: this.model.application,
                        state: this.model.state,
                        report: this.model.report
                    },
                    showSearch: this.options.showSearch
                });
                
                this.children.success = new EventTypeSuccess({
                    model: {
                        eventType: this.model.eventType,
                        state: this.model.state,
                        application: this.model.application,
                        user: this.model.user
                    }
                });

                this.listenTo(this.model.eventType, 'success', function(){
                    this.children.create.$el.hide();
                    this.children.success.$el.show();                    
                });
                this.listenTo(this.model.eventType, 'close', function(){
                    this.$el.modal('hide');
                });
            },
            render: function() {
                $.when(this.eventTypeFetchDeferred).then(function() {
                    this.children.create.render().appendTo(this.$el);
                    this.children.success.render().appendTo(this.$el);
                    this.children.success.$el.hide();
                    // SPL-109450 must call focus here due to the deferred
                    this.children.create.focus();
                }.bind(this));
                return this;
            }
        }
    );
});
