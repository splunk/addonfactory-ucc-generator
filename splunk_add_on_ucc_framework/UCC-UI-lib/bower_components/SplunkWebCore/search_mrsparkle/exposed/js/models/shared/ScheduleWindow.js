define(
    [   
        'underscore',
        'models/Base',
        'util/validation'
    ],
    function(
        _,
        BaseModel,
        validationUtils
    ) {
        var ScheduleWindow =  BaseModel.extend({
            initialize: function() {
                BaseModel.prototype.initialize.apply(this, arguments);
            },
            validation: {
                custom_window: {
                    fn: 'validateCustomWindow'
                }
            },
            validateCustomWindow: function(value, attr, computedState) {
                if (computedState.schedule_window_option === 'custom' &&
                    (!validationUtils.isNonNegValidInteger(value)) || value > 44640) {
                    return _('Custom window must be an integer from 0 to 44,640').t();
                }
            },
            getScheduleWindow: function() {
                return (this.get('schedule_window_option') === 'custom') ? this.get('custom_window') : this.get('schedule_window_option');
            },
            setScheduleWindow: function(schedule_window) {
                
                if (_.indexOf(ScheduleWindow.VALUE_OPTIONS, schedule_window) !== -1) {
                    this.set('schedule_window_option', schedule_window);
                } else {
                    this.set({
                        schedule_window_option: 'custom',
                        custom_window: schedule_window
                    });
                }
            }
        }, 
        {
            VALUE_OPTIONS: ['auto', '0', '5', '15', '30', '60', '120', '240', '480']
        });
        return ScheduleWindow;
    }
);
