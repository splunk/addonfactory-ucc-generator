define(
    [
        'underscore',
        'module',
        'views/Base'
    ],
    function(_, module, Base) {
        return Base.extend({
            moduleId: module.id,
            tagName: 'span',
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
                var render = _.debounce(this.render, 0);
                this.model.entry.content.on('change:alert_type change:alert_condition change:alert_comparator change:alert_threshold change:dispatch.earliest_time change:dispatch.latest_time', render, this);
            },
            render: function() {
                this.$el.html(this.model.getAlertTriggerConditionString());
            }
        });
    }
);
