/*
    This View renders the Help Section underneath the Extract Date Time Command Editor whenever
    the Date-time Format is set to 'Custom'. The Help Section contains a static text list containing
    strftime pattern variables and their descriptions, as well as some examples. This View
    iterates over the customHelpInfo dictionary to render each header and subsection in the list.
*/
define(
    [
        'underscore',
        'module',
        'views/Base'
    ],
    function(
        _,
        module,
        BaseView
        ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'commandeditor-form-custom-help',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
            },

            render: function() {
                var variableHelp = this.customHelpInfo.variables,
                    exampleHelp = this.customHelpInfo.examples,
                    template;

                _.each(variableHelp, function(section) {
                    template = _.template(this.headerTemplate, {
                        title: section.title
                    });
                    this.$el.append(template);
                    _.each(section.types, function(type) {
                        template = _.template(this.variableSectionTemplate, {
                            format: type.format,
                            description: type.description
                        });
                        this.$el.append(template);
                    }.bind(this));
                }.bind(this));

                this.$el.append(_.template(this.headerTemplate, {
                    title: _('Examples').t()
                }));

                _.each(exampleHelp, function(type) {
                    template = _.template(this.exampleSectionTemplate, {
                        format: type.format,
                        description: type.description
                    });
                    this.$el.append(template);
                }.bind(this));
                return this;
            },

            headerTemplate: '\
                <h5><%- title %></h5>\
            ',

            variableSectionTemplate: '\
                <dl>\
                    <dt><%- format %></dt>\
                    <dd><%- description %></dd>\
                </dl>\
            ',

            exampleSectionTemplate: '\
                <p>\
                    <span><%- format %></span>\
                    <br>\
                    <span><%- description %></span>\
                </p>\
            ',

            customHelpInfo: {
                variables: [
                    {
                        title: _('Date and time variables').t(),
                        types: [
                            {
                                format: '%c',
                                description: _("The date and time in the current locale's format as " +
                                "defined by the server's operating system. (Mon Jul 13 09:30:00 2015 " +
                                "for US English on Linux)").t()
                            },
                            {
                                format: '%+',
                                description: _("The date and time with time zone in the current locale's " +
                                "format as defined by the server's operating system. (Mon Jul 13 09:30:00 PDT " +
                                "2015 for US English on Linux)").t()
                            }
                        ]
                    },
                    {
                        title: _("Time variables").t(),
                        types: [
                            {
                                format: '%Ez',
                                description: _("Splunk specific, timezone in minutes.").t()
                            },
                            {
                                format: '%H',
                                description: _("Hour (24-hour clock) as a decimal number, includes leading " +
                                "zeros. (00 to 23)").t()
                            },
                            {
                                format: '%I',
                                description: _("Hour (12-hour clock), includes leading zeros. (01-12)").t()
                            },
                            {
                                format: '%k',
                                description: _("Like %H, the hour (24-hour clock) as a decimal number; but " +
                                "a leading zero is replaced by a space. (0 to 23)").t()
                            },
                            {
                                format: '%M',
                                description: _("Minute as a decimal number. (00 to 59)").t()
                            },
                            {
                                format: '%N',
                                description: _("Subseconds with width. (%3N = milliseconds, %6N = microseconds, " +
                                "%9N = nanoseconds)").t()
                            },
                            {
                                format: '%p',
                                description: _("AM or PM.").t()
                            },
                            {
                                format: '%Q',
                                description: _("The subsecond component of 1970-01-01 00:00:00 UTC. (%3Q " +
                                "= milliseconds, %6Q = microseconds, %9Q = nanoseconds with values of 000-999)").t()
                            },
                            {
                                format: '%S',
                                description: _("Second as a decimal number. (00 to 60)").t()
                            },
                            {
                                format: '%s',
                                description: _("The Unix Epoch Time timestamp, or the number of seconds since " +
                                "the Epoch: 1970-01-01 00:00:00 +0000 (UTC). (1352395800 is Thu Nov 8 09:30:00 " +
                                "2012)").t()
                            },
                            {
                                format: '%T',
                                description: _("The time in 24-hour notation (%H:%M:%S).").t()
                            },
                            {
                                format: '%Z',
                                description: _("The timezone abbreviation. (EST for Eastern Time)").t()
                            },
                            {
                                format: '%z',
                                description: _("The timezone offset from UTC, in hour and minute: +hhmm or -hhmm. " +
                                "(-0500 for Eastern Time)").t()
                            },
                            {
                                format: '%%',
                                description: _('A literal "%" character.').t()
                            }
                        ]
                    },
                    {
                        title: _("Date variables").t(),
                        types: [
                            {
                                format: '%F',
                                description: _("Equivalent to %Y-%m-%d (the ISO 8601 date format).").t()
                            },
                            {
                                format: '%x',
                                description: _("The date in the current locale's format. " +
                                "(7/13/2015 for US English)").t()
                            }
                        ]
                    },
                    {
                        title: _("Day variables").t(),
                        types: [
                            {
                                format: '%A',
                                description: _("Full weekday name. (Sunday, ..., Saturday)").t()
                            },
                            {
                                format: '%a',
                                description: _("Abbreviated weekday name. (Sun, ..., Sat)").t()
                            },
                            {
                                format: '%d',
                                description: _("Day of the month as a decimal number, includes a leading zero. " +
                                "(01 to 31)").t()
                            },
                            {
                                format: '%e',
                                description: _("Like %d, the day of the month as a decimal number, but a leading " +
                                "zero is replaced by a space. (1 to 31)").t()
                            },
                            {
                                format: '%j',
                                description: _("Day of year as a decimal number, includes a leading zero. " +
                                "(001 to 366)").t()
                            },
                            {
                                format: '%w',
                                description: _("Weekday as a decimal number. (0 = Sunday, ..., 6 = Saturday)").t()
                            }
                        ]
                    },
                    {
                        title: _("Months variables").t(),
                        types: [
                            {
                                format: '%b',
                                description: _("Abbreviated month name. (Jan, Feb, etc.)").t()
                            },
                            {
                                format: '%B',
                                description: _("Full month name. (January, February, etc.)").t()
                            },
                            {
                                format: '%m',
                                description: _("Month as a decimal number. (01 to 12)").t()
                            }
                        ]
                    },
                    {
                        title: _("Year variables").t(),
                        types: [
                            {
                                format: '%y',
                                description: _("Year as a decimal number, without the century. (00 to 99)").t()
                            },
                            {
                                format: '%Y',
                                description: _("Year as a decimal number with century. (2012)").t()
                            }
                        ]
                    }
                ],
                examples: [
                    {
                        format: '%Y-%m-%d',
                        description: _("2012-12-31").t()
                    },
                    {
                        format: '%y-%m-%d',
                        description: _("12-12-31").t()
                    },
                    {
                        format: '%b %d, %Y',
                        description: _("Feb 11, 2008").t()
                    },
                    {
                        format: "q|%d%b '%y = %Y-%m-%d|",
                        description: _("q|23 Apr '12 = 2012-04-23|").t()
                    }
                ]
            }
        });
    }
);