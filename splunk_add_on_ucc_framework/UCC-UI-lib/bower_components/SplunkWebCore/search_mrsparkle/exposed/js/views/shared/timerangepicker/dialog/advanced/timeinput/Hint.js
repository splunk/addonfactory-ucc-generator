define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base',
    'util/time',
    'splunk.i18n'
],
function(
    $,
    _,
    Backbone,
    module,
    Base,
    time_utils,
    i18n
){
    return Base.extend({
        moduleId: module.id,
        tagName: 'span',
        initialize: function() {
            Base.prototype.initialize.apply(this, arguments);
            this.activate();
        },
        startListening: function() {
            this.listenTo(this.model.timeParser, 'error sync', this.render);
        },
        render: function() {
            var parseError = this.model.timeParser.error.get("messages"),
                date = time_utils.isoToDateObject(this.model.timeParser.get("value")),
                error = parseError || isNaN(date.getTime());

            var template = _.template(this.template, {
                    _: _,
                    timeParser: this.model.timeParser,
                    error: error,
                    value: error || i18n.format_datetime_microseconds(time_utils.jsDateToSplunkDateTimeWithMicroseconds(date), "short", "full")
                });
            this.$el.html(template);
            return this;
        },
        template: '\
            <% if (error) { %>\
                <%- _("Invalid time").t() %>\
            <% } else if (timeParser.get("value")) { %>\
                <%- value %>\
            <% } %>\
            '
    });
});
