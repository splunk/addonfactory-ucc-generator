define(
    [
        'jquery',
        'module',
        'underscore',
        'views/Base',
        'views/shared/controls/ControlGroup',
        'views/shared/controls/SyntheticSelectControl',
        'uri/route',
        'splunk.util',
        'util/infodelivery_utils'
    ],
    function(
        $,
        module,
        _,
        BaseView,
        ControlGroup,
        SyntheticSelectControl,
        route,
        splunkUtil,
        infoUtils
    ){
        
        return BaseView.extend({
            moduleId: module.id,
            /**
            * @param {Object} options {
            *   model: {
            *       cron: <models.Cron>,
            *       application: <models.Application>
            *   }
            *   {String} lineOneLabel: (Optional) Label for the first line of the sentence. Defalult is none.
            *   {String} lineTwoLabel: (Optional) Label for the second line of the sentence. Defalult is none.
            * }
            */
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                var defaults = {
                    lineOneLabel: '',
                    lineTwoLabel: ''
                };

                _.defaults(this.options, defaults);

                var makeItems = function(num) {
                    var stringNum = num.toString();
                    return { label: stringNum, value: stringNum};
                };
                var hourly = _.map(_.range(0, 46, 15), makeItems);
                var daily = _.map(_.range(24), function(num) {
                    return { label: num + ':00', value: num.toString()};
                });
                var monthly = _.map(_.range(1,32), makeItems);

                this.children.timeRange = new ControlGroup({
                    className: 'control-group',
                    controlType: 'SyntheticSelect',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'cronType',
                        model: this.model.cron,
                        items: [
                            { label: _('Run every hour').t(), value: 'hourly' },
                            { label: _('Run every day').t(), value: 'daily' },
                            { label: _('Run every week').t(), value: 'weekly' },
                            { label: _('Run every month').t(), value: 'monthly' },
                            { label: _('Run on Cron Schedule').t(), value: 'custom' }
                        ],
                        save: false,
                        toggleClassName: 'btn',
                        labelPosition: 'outside',
                        elastic: true,
                        popdownOptions: $.extend(true, {}, this.options.popdownOptions)
                    },
                    label: this.options.lineOneLabel
                });

                this.children.hourly = new SyntheticSelectControl({
                    additionalClassNames: 'schedule_hourly',
                    modelAttribute: 'minute',
                    model: this.model.cron,
                    items: hourly,
                    save: false,
                    toggleClassName: 'btn',
                    labelPosition: 'outside',
                    elastic: true,
                    popdownOptions: $.extend(true, {}, this.options.popdownOptions)
                });

                this.children.weekly = new SyntheticSelectControl({
                    additionalClassNames: 'schedule_weekly',
                    modelAttribute: 'dayOfWeek',
                    model: this.model.cron,
                    items: [
                        { label: _('Monday').t(),    value: '1'  },
                        { label: _('Tuesday').t(),   value: '2'  },
                        { label: _('Wednesday').t(), value: '3'  },
                        { label: _('Thursday').t(),  value: '4'  },
                        { label: _('Friday').t(),    value: '5'  },
                        { label: _('Saturday').t(),  value: '6'  },
                        { label: _('Sunday').t(),    value: '0'  }
                    ],
                    save: false,
                    toggleClassName: 'btn',
                    labelPosition: 'outside',
                    popdownOptions: $.extend(true, {}, this.options.popdownOptions)
                });

                this.children.monthly = new SyntheticSelectControl({
                    menuClassName: 'dropdown-menu-short',
                    additionalClassNames: 'schedule_monthly',
                    modelAttribute: 'dayOfMonth',
                    model: this.model.cron,
                    items: monthly,
                    save: false,
                    toggleClassName: 'btn',
                    labelPosition: 'outside',
                    popdownOptions: $.extend(true, {}, this.options.popdownOptions)
                });

                this.children.daily = new SyntheticSelectControl({
                    menuClassName: 'dropdown-menu-short',
                    additionalClassNames: 'schedule_daily',
                    modelAttribute: 'hour',
                    model: this.model.cron,
                    items: daily,
                    save: false,
                    toggleClassName: 'btn',
                    labelPosition: 'outside',
                    popdownOptions: $.extend(true, {}, this.options.popdownOptions)
                });

                var docRoute = route.docHelp(
                    this.model.application.get("root"),
                    this.model.application.get("locale"),
                    'learnmore.alert.scheduled'
                );
                this.children.cronSchedule = new ControlGroup({
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'cron_schedule',
                        model: this.model.cron
                    },
                    label: _('Cron Expression').t(),
                    help: splunkUtil.sprintf(_('e.g. 00 18 *** (every day at 6PM). %s').t(),
                        '<a href="'+ docRoute +'" class="help" target="_blank" title="' +
                        _("Splunk help").t() +'">' + _("Learn More").t() + '</a>')
                });

                if(this.model.infoDeliveryAvailable) {
                    this._initHasApp();
                } else {
                    this._initNoApp();
                }

                this.activate();
            },
            /**
             * Initializes custom control groups if the app is installed.
             *
             * @private
             */
            _initHasApp: function() {
                this.children.timeRange = new SyntheticSelectControl({
                        modelAttribute: 'cronType',
                        model: this.model.cron,
                        items: [
                            { label: _('Run every hour').t(), value: 'hourly' },
                            { label: _('Run every day').t(), value: 'daily' },
                            { label: _('Run every week').t(), value: 'weekly' },
                            { label: _('Run every month').t(), value: 'monthly' },
                            { label: _('Run on Cron Schedule').t(), value: 'custom' }
                        ],
                        save: false,
                        toggleClassName: 'btn',
                        labelPosition: 'outside',
                        elastic: true,
                        popdownOptions: $.extend(true, {}, this.options.popdownOptions)
                });

                this.children.scheduleOptions = new ControlGroup({
                    className: 'control-group app-schedule',
                    controls: [
                        this.children.timeRange,
                        this.children.hourly,
                        this.children.weekly,
                        this.children.monthly,
                        this.children.daily
                    ],
                    label: this.options.lineOneLabel
                });
            },
            /**
             * Initializes standard control groups if the app is NOT installed.
             *
             * @private
             */
            _initNoApp: function () {
                this.children.timeRange = new ControlGroup({
                    className: 'control-group',
                    controlType: 'SyntheticSelect',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'cronType',
                        model: this.model.cron,
                        items: [
                            { label: _('Run every hour').t(), value: 'hourly' },
                            { label: _('Run every day').t(), value: 'daily' },
                            { label: _('Run every week').t(), value: 'weekly' },
                            { label: _('Run every month').t(), value: 'monthly' },
                            { label: _('Run on Cron Schedule').t(), value: 'custom' }
                        ],
                        save: false,
                        toggleClassName: 'btn',
                        labelPosition: 'outside',
                        elastic: true,
                        popdownOptions: $.extend(true, {}, this.options.popdownOptions)
                    },
                    label: this.options.lineOneLabel
                });

                this.children.scheduleOptions = new ControlGroup({
                    controls: [
                        this.children.hourly,
                        this.children.weekly,
                        this.children.monthly,
                        this.children.daily
                    ],
                    label: this.options.lineTwoLabel
                });
            },
            timeRangeToggle: function() {
                var $preLabel = this.children.scheduleOptions.$el.find('.pre_label'),
                    $hourPostLabel = this.children.scheduleOptions.$el.find('.hour_post_label'),
                    $weeklyPreLabel = this.children.scheduleOptions.$el.find('.weekly_pre_label'),
                    $monthlyPreLabel = this.children.scheduleOptions.$el.find('.monthly_pre_label'),
                    $dailyPreLabel = this.children.scheduleOptions.$el.find('.daily_pre_label'),
                    $customControls = this.$el.find('.custom_time');

                this.children.hourly.$el.hide();
                this.children.daily.$el.hide();
                this.children.weekly.$el.hide();
                this.children.monthly.$el.hide();

                $preLabel.hide();
                $hourPostLabel.hide();
                $weeklyPreLabel.hide();
                $monthlyPreLabel.hide();
                $dailyPreLabel.hide();

                $customControls.css('display', 'none');

                switch(this.model.cron.get('cronType')){
                    case 'hourly':
                        this.children.scheduleOptions.$el.show();
                        this.children.hourly.$el.css('display', '');
                        $preLabel.css('display', '');
                        $hourPostLabel.css('display', '');
                        break;
                    case 'daily':
                        this.children.scheduleOptions.$el.show();
                        this.children.daily.$el.css('display', '');
                        $preLabel.css('display', '');
                        break;
                    case 'weekly':
                        this.children.scheduleOptions.$el.show();
                        this.children.weekly.$el.css('display', '');
                        this.children.daily.$el.css('display', '');
                        $weeklyPreLabel.css('display', '');
                        $dailyPreLabel.css('display', '');
                        break;
                    case 'monthly':
                        this.children.scheduleOptions.$el.show();
                        this.children.monthly.$el.css('display', '');
                        this.children.daily.$el.css('display', '');
                        $monthlyPreLabel.css('display', '');
                        $dailyPreLabel.css('display', '');
                        break;
                    case 'custom':
                        $customControls.css('display', '');
                        if(!this.model.infoDeliveryAvailable) {
                           this.children.scheduleOptions.$el.hide();
                        }
                        break;
                }
            },
            startListening: function() {
                this.listenTo(this.model.cron, 'change:cronType', function() {
                    this.timeRangeToggle();
                    this.model.cron.setDefaults();
                });
            },
            /**
             * Determines what version of the modal to load based on the info delivery flags. Will load the vanilla version
             * of the app if there was an error with the data retrieved.
             *
             * @returns {exports}
             */
            render: function()  {
                this.$el.append(this.children.timeRange.render().el);
                this.$el.append(this.children.scheduleOptions.render().el);

                var at = _("At ").t(), on = _("On ").t(), onDay = _("On day ").t();
                // TODO may need to change with viz refresh / moving into core
                // cleaning up the strings so they look better in App
                if(this.model.infoDeliveryAvailable) {
                    // set to lower case and clear whitespace
                    at = at.toLowerCase().trim(), on = on.toLowerCase().trim(), onDay = onDay.toLowerCase().trim();
                }

                this.children.scheduleOptions.$el.find('.schedule_hourly').before(
                    '<span class="pre_label">' + at + '</span>');
                this.children.scheduleOptions.$el.find('.schedule_hourly').after(
                    '<span class="hour_post_label">' + _(" minutes past the hour").t() + '</span>');

                this.children.scheduleOptions.$el.find('.schedule_weekly').before(
                    '<span class="weekly_pre_label">' + on + '</span>');
                this.children.scheduleOptions.$el.find('.schedule_weekly .btn').width('75px');

                this.children.scheduleOptions.$el.find('.schedule_monthly').before(
                    '<span class="monthly_pre_label">' + onDay + '</span>');
                this.children.scheduleOptions.$el.find('.schedule_monthly .btn').width('55px');

                this.children.scheduleOptions.$el.find('.schedule_daily').before(
                    '<span class="daily_pre_label">' + (this.model.infoDeliveryAvailable ? at : _(" at ").t()) + '</span>');
                this.children.scheduleOptions.$el.find('.schedule_daily .btn').width('50px');

                this.$el.append('<div class="custom_time"></div>');
                this.$el.find('.custom_time').append(this.children.cronSchedule.render().el);

                this.timeRangeToggle();

                return this;
            }
        });
     }
 );