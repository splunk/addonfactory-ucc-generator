define([
        'underscore',
        'module',
        'models/Base',
        'views/shared/controls/ControlGroup',
        'views/shared/controls/Control',
        'util/time'
    ],
    function(
        _,
        module,
        BaseModel,
        ControlGroup,
        Control,
        timeUtil
        ) {

        return ControlGroup.extend({

                moduleId: module.id,

                STOCK_TIME_RANGES: [
                    { value: '-1m', label: _('1 minute before').t() },
                    { value: '-1h', label: _('1 hour before').t() },
                    { value: '-24h', label: _('24 hours before').t() },
                    { value: '-7d', label: _('7 days before').t() }
                ],

                initialize: function() {
                    this.displayAttribute = 'display.visualizations.singlevalue.trendInterval';
                    var deltaTimeRange = this.model.get(this.displayAttribute),
                        parsedTime = timeUtil.parseTimeModifier(deltaTimeRange),
                        stockTimeRangeValues,
                        modeValue;

                    this.timeRangeStateModel = new BaseModel({});
                    if (parsedTime) {
                        this.timeRangeStateModel.set({
                            amount: parsedTime.amount,
                            unit: parsedTime.unit
                        });
                    }

                    this.modeModel = new BaseModel({});

                    // If deltaTimeRange is one of the stock time ranges, display it as one
                    stockTimeRangeValues = _.pluck(this.STOCK_TIME_RANGES, 'value');
                    if (stockTimeRangeValues.indexOf(deltaTimeRange) === -1) {
                        modeValue = 'custom'; // default mode
                    } else {
                        modeValue = deltaTimeRange;
                    }
                    this.modeModel.set({
                        mode: modeValue
                    });

                    this.additionalClasses = ' input-append delta-time-range';

                    this.options.label = _('Compared to').t();
                    this.options.controlClass = 'controls-block';
                    this.options.controls = [
                        {
                            type: 'SyntheticSelect',
                            options: {
                                className: Control.prototype.className + ' delta-time-range-mode',
                                model: this.modeModel,
                                modelAttribute: 'mode',
                                toggleClassName: 'btn',
                                menuWidth: 'narrow',
                                items: [{ value: 'custom', label: _('Custom').t() }].concat(this.STOCK_TIME_RANGES)
                            }
                        },
                        {
                            type: 'Text',
                            options: {
                                className: Control.prototype.className + this.additionalClasses + ' delta-time-range-amount',
                                model: this.timeRangeStateModel,
                                modelAttribute: 'amount',
                                inputClassName: this.options.inputClassName
                            }
                        },
                        {
                            type: 'SyntheticSelect',
                            options: {
                                className: Control.prototype.className + this.additionalClasses + ' delta-time-range-unit',
                                model: this.timeRangeStateModel,
                                modelAttribute: 'unit',
                                toggleClassName: 'btn',
                                menuWidth: 'narrow',
                                items: [
                                    { value: 'auto', label: _('Auto').t() },
                                    { value: 's', label: _('Seconds').t() },
                                    { value: 'm', label: _('Minutes').t() },
                                    { value: 'h', label: _('Hours').t() },
                                    { value: 'd', label: _('Days').t() },
                                    { value: 'w', label: _('Weeks').t() },
                                    { value: 'mon', label: _('Months').t() },
                                    { value: 'q', label: _('Quarters').t() },
                                    { value: 'y', label: _('Years').t() }
                                ]
                            }
                        }
                    ];
                    ControlGroup.prototype.initialize.call(this, this.options);
                    this.timeRangeStateModel.on('change', this.handleTimeRangeState, this);
                    this.modeModel.on('change', this.handleModeChange, this);
                },

                handleTimeRangeState: function() {
                    // Update this.model with newest amount and unit settings from viz editor
                    var amount = this.timeRangeStateModel.get('amount'),
                        unit = this.timeRangeStateModel.get('unit'),
                        amountInputControl = this.getAmountInputControl(),
                        newTimeRange;
                    if (unit === 'auto') {
                        newTimeRange = 'auto';
                        this.model.set(this.displayAttribute, newTimeRange);
                    } else if (amount && unit) {
                        newTimeRange =  '-' + amount + unit;
                        this.model.set(this.displayAttribute, newTimeRange);
                    }
                    // If there is no unit set, then defaults to 'auto'
                    if (unit === 'auto' || !unit) {
                        // Disable text box as 'auto' has no amount to enter
                        amountInputControl.$('input').attr('disabled', true);
                        // Save then clear text box contents
                        this.cachedAmount = amountInputControl.$('input').val();
                        amountInputControl.$('input').val('');
                    } else {
                        if (this.cachedAmount && (amountInputControl.$('input').val().length === 0)) {
                            amountInputControl.$('input').val(this.cachedAmount);
                        }
                        amountInputControl.$('input').attr('disabled', false);
                    }
                },

                getAmountInputControl: function() {
                    return this.childList[1];
                },

                handleModeChange: function() {
                    var mode = this.modeModel.get('mode'),
                        parsedTimeObject,
                        amount,
                        unit;
                    if (mode === 'custom') {
                        this.showTimeRangeDropdown();
                    } else {
                        this.hideTimeRangeDropdown();
                        parsedTimeObject = timeUtil.parseTimeModifier(mode);
                        amount = parsedTimeObject.amount;
                        unit = parsedTimeObject.unit;
                        this.timeRangeStateModel.set({
                            amount: amount,
                            unit: unit
                        });
                    }
                },

                showTimeRangeDropdown: function() {
                    this.getTimeRangeComponents().css('display', 'inline-block');
                    // Disable input box in time range control if unit='auto'
                    this.handleTimeRangeState();
                },

                hideTimeRangeDropdown: function() {
                    this.getTimeRangeComponents().css('display', 'none');
                },

                getTimeRangeComponents: function() {
                    return this.$('.delta-time-range');
                },

                render: function() {
                    ControlGroup.prototype.render.apply(this, arguments);
                    this.handleModeChange();
                    return this;
                }
            });

    });
