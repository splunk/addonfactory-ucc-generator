define(
    [
        'underscore',
        'views/Base',
        'module',
        'views/shared/alertcontrols/dialogs/shared/triggerconditions/RealTimeConditions',
        'views/shared/alertcontrols/dialogs/shared/triggerconditions/ScheduledConditions',
        'views/shared/alertcontrols/dialogs/shared/triggerconditions/TriggerOptions'
    ], 
    function(
        _,
        BaseView,
        module,
        RealTimeConditionsView,
        ScheduledConditionsView,
        TriggerOptionsView
    ) {
    return BaseView.extend({
        moduleId: module.id,
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            
            this.children.realTimeTriggerConditions = new RealTimeConditionsView({
                model: {
                    alert: this.model.alert
                }
            });
            
            this.children.scheduledTriggerConditions = new ScheduledConditionsView({
                model: {
                    alert: this.model.alert
                }
            });

            this.children.scheduledTriggerOptions = new TriggerOptionsView({
                model: {
                    alert: this.model.alert
                }
            });

            this.listenTo(this.model.alert.entry.content, 'change:ui.type', this.toggleTriggerConditions);
        },
        toggleTriggerConditions: function() {
            switch(this.model.alert.entry.content.get('ui.type')){
                case 'realtime':
                    this.children.realTimeTriggerConditions.$el.show();
                    this.children.scheduledTriggerConditions.$el.hide();
                    break;
                case 'scheduled':
                    this.children.realTimeTriggerConditions.$el.hide();
                    this.children.scheduledTriggerConditions.$el.show();
                    break;
            }
        },
        render: function() {
            this.$el.html(this.compiledTemplate({
                _: _
            }));
            this.children.realTimeTriggerConditions.render().appendTo(this.$el);
            this.children.scheduledTriggerConditions.render().appendTo(this.$el);
            this.children.scheduledTriggerOptions.render().appendTo(this.$el);
            this.toggleTriggerConditions();
            return this;
        },
        template: '\
            <p class="control-heading"><%- _("Trigger Conditions").t() %></p>\
        '
    });
});

