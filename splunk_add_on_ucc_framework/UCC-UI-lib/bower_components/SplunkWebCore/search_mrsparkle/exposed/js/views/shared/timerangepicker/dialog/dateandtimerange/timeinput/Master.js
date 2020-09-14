define([
            "jquery",
            "underscore",
            "backbone",
            "module",
            "views/Base",
            "views/shared/controls/DateControl",
            "views/shared/timerangepicker/dialog/dateandtimerange/timeinput/HoursMinutesSeconds"
      ],
     function($, _, Backbone, module, Base, DateControl, HoursMinutesSeconds) {
        return Base.extend({
            tagName: 'span',
            className: 'timeinput',
            moduleId: module.id,
            initialize: function(options) {
                Base.prototype.initialize.apply(this, arguments);

                this.children.monthDayYear = new DateControl({
                    model: this.model.dateTime,
                    className: 'control pull-left',
                    inputClassName: this.options.inputClassName || 'date',
                    validate: true
                });

                this.children.hoursMinutesSeconds = new HoursMinutesSeconds({
                    model: this.model.dateTime
                });

                this.$el.addClass(this.options.inputClassName || 'earliest');
            },
            render: function() {
                if (!this.el.innerHTML) {
                    var template = _.template(this.template, {
                        _: _,
                        cid: this.cid,
                        label: this.options.label
                    });
                    this.$el.html(template);

                    this.children.monthDayYear.render().appendTo(this.$(".time-mdy").last());
                    this.children.hoursMinutesSeconds.render().appendTo(this.$(".time-hms").last());
                } else {
                    this.children.monthDayYear.render();
                    this.children.hoursMinutesSeconds.render();
                }
                return this;
            },
            template: '\
                <span class="time-mdy"></span>\
                <span class="time-hms"></span>\
            '
        });
    }
);
