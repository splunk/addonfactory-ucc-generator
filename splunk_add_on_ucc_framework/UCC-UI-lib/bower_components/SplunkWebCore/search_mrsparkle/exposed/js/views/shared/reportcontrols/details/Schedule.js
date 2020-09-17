define(
    [
        'underscore',
        'module',
        'views/Base',
        'models/shared/Cron',
        'util/time',
        'splunk.util'
    ],
    function(_, module, Base, Cron, time_utils, splunkUtil) {
        return Base.extend({
            moduleId: module.id,
            tagName: 'span',
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
                var render = _.debounce(this.render, 0);
                this.model.entry.content.on('change:is_scheduled change:cron_schedule change:action.email change:action.script', render, this);
            },
            render: function() {
                var text = _('Not Applicable for Real-time Reports.').t();

                // Check if real-time
                if (!this.model.isRealTime()) {
                    if (this.model.entry.content.get("is_scheduled")) {
                        this.cronModel = Cron.createFromCronString(this.model.entry.content.get('cron_schedule'));
                        text = this.cronModel.getScheduleString();
                        if (this.model.entry.content.get("action.email") || this.model.entry.content.get("action.script")) {
                            text += splunkUtil.sprintf(_(' Actions: %s.').t(), this.model.getStringOfActions());
                        } else {
                            text += _(" No actions.").t();
                        }
                    } else {
                        text = _("Not scheduled.").t();
                    }
                }

                this.$el.html(text);
            }
        });
    }
);
