define(
    [
        'underscore',
        'jquery',
        'module',
        'models/shared/eventsviewer/TimeWindow',
        'splunk.util',
        'views/shared/FlashMessages',
        'views/shared/controls/ControlGroup',
        'views/shared/controls/SyntheticSelectControl',
        'views/shared/controls/TextControl',
        'views/shared/controls/Control',
        'views/shared/DrilldownPopTart',
        'strftime'
    ],
    function(
        _,
        $,
        module,
        TimeWindow,
        splunkutils,
        FlashMessages,
        ControlGroup,
        SyntheticSelectControl,
        TextControl,
        Control,
        DrilldownPopTart
    ) {
        return DrilldownPopTart.extend({
            moduleId: module.id,
            /**
             * @param {Object} options {
             *     model: {
             *          report: <models.services.SavedSearch>,
             *     }
             * }
             */
            initialize: function() {
                DrilldownPopTart.prototype.initialize.apply(this, arguments);
                this.model.timewindow = new TimeWindow();

                this.children.flashMessage = new FlashMessages({ model: this.model.timewindow });

                this.children.timewindow = new ControlGroup({
                    controls: [
                        new SyntheticSelectControl ({
                            modelAttribute: 'type',
                            className: Control.prototype.className + ' input-prepend',
                            model: this.model.timewindow,
                            items: [
                                { label: _('+').t(), value: 'plus' },
                                { label: _('-').t(), value: 'minus' },
                                { label: _('+/-').t(), value: 'plusminus' }
                            ],
                            toggleClassName: 'btn range-type',
                            menuWidth: 'narrow'
                        }),
                        new TextControl({
                            modelAttribute: 'amount',
                            className: Control.prototype.className + ' input-append input-prepend range-amount',
                            inputClassName: 'input-mini',
                            model: this.model.timewindow
                        }),
                        new SyntheticSelectControl ({
                            modelAttribute: 'unit',
                            className: Control.prototype.className + ' input-append',
                            model: this.model.timewindow,
                            menuWidth: 'narrow',
                            items: [
                                { label: _('week(s)').t(), value: 'w' },
                                { label: _('day(s)').t(), value: 'd' },
                                { label: _('hour(s)').t(), value: 'h' },
                                { label: _('minute(s)').t(), value: 'm' },
                                { label: _('second(s)').t(), value: 's' },
                                { label: _('millisecond(s)').t(), value: 'ms' }
                            ],
                            toggleClassName: 'btn range-units'
                        })
                    ]
                });
                
                this.model.timewindow.on('validated', function(isValid, model, invalidResults) {
                    if(isValid) {
                        var ranges = this.model.timewindow.getRanges(this.options.time);
                        this.model.report.entry.content.set({
                            'dispatch.earliest_time': ranges.earliestTime,
                            'dispatch.latest_time': ranges.latestTime
                        });
                        this.model.report.trigger('eventsviewer:drilldown');
                    }
                },this);
            },
            events: _.extend({}, DrilldownPopTart.prototype.events, {
                'click td > a.et-lt': function(e) {
                    var $target = $(e.currentTarget),
                        timebounds = $target.data().time,
                        epochTime = parseFloat(splunkutils.getEpochTimeFromISO(this.options.time)),
                        earliestTime,
                        latestTime;
                    if(timebounds === 'before'){
                        latestTime = epochTime + 0.001; // exclusive
                        this.model.report.entry.content.set({
                            'dispatch.earliest_time': '',
                            'dispatch.latest_time': latestTime.toFixed(3)
                        });
                    } else if (timebounds == 'after') {
                        this.model.report.entry.content.set({
                            'dispatch.earliest_time': epochTime.toFixed(3),
                            'dispatch.latest_time': 'now'
                        }); 
                    } else {
                        earliestTime = epochTime; //inclusive
                        latestTime = earliestTime + 0.001; //exclusive
                        this.model.report.entry.content.set({
                            'dispatch.earliest_time': earliestTime.toFixed(3),
                            'dispatch.latest_time': latestTime.toFixed(3)
                        });  
                    }
                    this.model.report.trigger('eventsviewer:drilldown');
                    e.preventDefault();
                },
                'click a.btn.apply': function(e) {
                    this.model.timewindow.validate();
                    e.preventDefault();
                }
            }),
            render: function() {
                DrilldownPopTart.prototype.render.call(this);
                var $popTartBody = this.$('.drilldown-poptart-body');

                this.children.flashMessage.render().appendTo($popTartBody);
                $popTartBody.append(this.compiledTemplate({_:_}));
                var $nearbyValue = this.$('.nearby-value');
                this.children.timewindow.render().appendTo($nearbyValue);
                $nearbyValue.append('<a class="apply btn" href="#"">' + _("Apply").t() + '</a>');
                return this;
            },
            template: '\
                <h3 class="before-after-header"><%- _("Events Before or After").t() %></h3>\
                <table class="before-after">\
                    <tbody>\
                        <tr class="before-after-values">\
                            <td><a class="et-lt" data-time="before" href="#"><%- _("Before this time").t() %></a></td>\
                            <td><a class="et-lt" data-time="after" href="#"><%- _("After this time").t() %></a></td>\
                            <td><a class="et-lt" data-time="at" href="#"><%- _("At this time").t() %></a></td>\
                        </tr>\
                    </tbody>\
                </table>\
                <h3 class="nearby-header"><%- _("Nearby Events").t() %></h3>\
                <div class="nearby-value"></div>\
            '
        });
    }
);
