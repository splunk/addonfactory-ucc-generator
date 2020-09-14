define(
    [
        'jquery',
        'underscore',
        'models/Base',
        'jquery.ui.datepicker',
        'strftime'
    ],
    function($, _, BaseModel) {

        var ISO_WITH_TZ_REGEX = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d+)/;

        var DateTime = BaseModel.extend({
            initialize: function() {
                BaseModel.prototype.initialize.apply(this, arguments);
            },
            defaults: function() {
                var now = new Date();
                return this.convertDateToAttrsObject(now);
            },
            validation: {
                year: {
                    required: true,
                    range: [1000, 9999],
                    pattern: 'digits',
                    msg: _("Year must be a 4 digit number.").t()
                },
                month: {
                    required: true,
                    range: [0, 11],
                    pattern: 'digits',
                    msg: _("Month must be a number between 0 and 11.").t()
                },
                day: {
                    required: true,
                    range: [1, 31],
                    pattern: 'digits',
                    msg: _("Day must be a number between 1 and 31.").t()
                },
                hour: [
                    {
                        required: true,
                        range: [0, 24],
                        pattern: 'digits',
                        msg: _("Hour must be a number between 0 and 24.").t()
                    },
                    {
                        fn: 'validateFullTime'
                    }
                ],
                minute: [
                    {
                        required: true,
                        range: [0, 59],
                        pattern: 'digits',
                        msg: _("Minute must be a number between 0 and 59.").t()
                    },
                    {
                        fn: 'validateFullTime'
                    }
                ],
                second: [
                    {
                        required: true,
                        range: [0, 59],
                        pattern: 'digits',
                        msg: _("Second must be a number between 0 and 59.").t()
                    },
                    {
                        fn: 'validateFullTime'
                    }
                ],
                millisecond: [
                    {
                        required: true,
                        range: [0, 999],
                        pattern: 'digits',
                        msg: _("Millisecond must be a number between 0 and 999.").t()
                    },
                    {
                        fn: 'validateFullTime'
                    }
                ]
            },
            validateFullTime: function(value, attr, computedState) {
                if (computedState.hour === 24) {
                    if (((attr === "minute") || (attr === "second") || (attr === "millisecond")) && (value > 0)) {
                        return _("You cannot set the time greater than 24:00:00.000.").t();
                    }
                }
            },
            setHoursMinSecFromStr: function(time, options) {
                //assumes format hours:min:sec.millsec (00:00:00.000)
                var error_msg, error_object,
                    timeArray = time.split(":");
                if (timeArray.length == 3){
                    var secondsArray = timeArray[2].split('.');
                    if (secondsArray.length == 2) {
                        if (timeArray[0].length > 2 || timeArray[1].length > 2 || secondsArray[0].length > 2 || secondsArray[1].length > 3) {
                            error_msg = _("Hours, Minutes and Seconds can have up to 2 digits and Milliseconds up to 3 digits ").t();
                        } else {
                            return this.set(
                                {
                                    hour: parseInt(timeArray[0], 10),
                                    minute: parseInt(timeArray[1], 10),
                                    second: parseInt(secondsArray[0], 10),
                                    millisecond: parseInt(secondsArray[1], 10)
                                },
                                options
                            );

                        }
                    } else {
                        error_msg = _("Could not parse the time stamp given into second and millisecond.").t();
                    }
                } else {
                    error_msg = _("Could not parse the time stamp given into hour, minute, second, and millisecond.").t();
                }
                error_object = {
                    second: error_msg
                };
                this.trigger("validated", false, this, error_object);
                this.trigger("validated:invalid", this, error_object);
                return false;
            },
            setMonDayYearFromJSDate: function(jsDate, options) {
                return this.set(
                    {
                        year: jsDate.getFullYear(),
                        month: jsDate.getMonth(),
                        day: jsDate.getDate()
                    }, 
                    options
                );
            },
            setFromJSDate: function(jsDate, options) {
                return this.set(this.convertDateToAttrsObject(jsDate), options);
            },
            jsDate: function(options){
                options = options || {};
                var defaults = {
                    includeTime: true
                };
                _.defaults(options, defaults);

                var year = this.get('year'),
                    month = this.get('month'),
                    day = this.get('day'),
                    hour =  this.get('hour'),
                    minute = this.get('minute'),
                    second = this.get('second'),
                    millisecond = this.get('millisecond');
                if (this.isValid(true) && !_.isUndefined(year) && !_.isUndefined(month) &&
                        !_.isUndefined(day) && !_.isUndefined(hour) && !_.isUndefined(minute) &&
                        !_.isUndefined(second) && !_.isUndefined(millisecond)){
                    if(options.includeTime) {
                        return new Date(year, month, day, hour, minute, second, millisecond);
                    }
                    return new Date(year, month, day);
                }
                throw "You have an invalid DateTime object for creating a JSDate.";
            },
            strftime: function(formatString) {
                return this.jsDate().strftime(formatString);
            },
            isoWithoutTZ: function(){
                return this.strftime("%Y-%m-%dT%H:%M:%S.%Q");
            },
            time: function(){
                return this.strftime("%H:%M:%S.%Q");
            },
            dateFormat: function(){
                return $.datepicker._defaults['dateFormat'];
            },
            formattedDate: function(){
                return $.datepicker.formatDate(this.dateFormat(), this.jsDate());
            },
            convertDateToAttrsObject: function(jsDate) {
                return ({
                    year: jsDate.getFullYear(),
                    month: jsDate.getMonth(),
                    day: jsDate.getDate(),
                    hour: jsDate.getHours(),
                    minute: jsDate.getMinutes(),
                    second: jsDate.getSeconds(),
                    millisecond: jsDate.getMilliseconds()
                });
            }
        },
        // class-level properties
        {
            createFromIsoString: function(isoString) {
                var pieces = ISO_WITH_TZ_REGEX.exec(isoString);
                if(!pieces || pieces.length !== 8) {
                    throw ('Invalid ISO string: ' + isoString);
                }
                // the above only verifies that the time string had the correct format,
                // next make sure it also represents a valid time
                var dtModel = new DateTime({
                    year: parseInt(pieces[1], 10),
                    month: parseInt(pieces[2], 10) - 1, // convert to zero-indexed
                    day: parseInt(pieces[3], 10),
                    hour: parseInt(pieces[4], 10),
                    minute: parseInt(pieces[5], 10),
                    second: parseInt(pieces[6], 10),
                    millisecond: parseInt(pieces[7], 10)
                });

                if(!dtModel.isValid(true)) {
                    throw ('Invalid time encoded: ' + isoString);
                }
                return dtModel;
            }
        });

        return DateTime;
    }
);
