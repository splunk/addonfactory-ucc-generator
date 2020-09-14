define(
    [
        'underscore',
        'module',
        'views/Base',
        'models/shared/Cron'
    ],
    function(
        _,
        module,
        Base,
        Cron
    ) {
        return Base.extend({
            moduleId: module.id,
            tagName: 'span',
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
                var render = _.debounce(this.render, 0);
                this.model.entry.content.on('change:is_scheduled change:cron_schedule change:dispatch.earliest_time change:dispatch.latest_time', render, this);
            },
            render: function() {
                var text = _('Real-time.').t();

                // Check if real-time
                if (!this.model.isRealTime()) {
                    this.cronModel = Cron.createFromCronString(this.model.entry.content.get('cron_schedule'));
                    text = _("Scheduled. ").t() + this.cronModel.getScheduleString();
                }

                this.$el.html(text);
            }
        });
    }
);
