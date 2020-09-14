define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base',
    'util/time'
],
function(
    $,
    _,
    Backbone,
    module,
    Base,
    time_utils
){
    return Base.extend({
        moduleId: module.id,
        className: 'accordion-inner presets-container',
        /**
         * @param {Object} options {
         *     model: <models.TimeRange>,
         *     collection (Optional): <collections.services.data.ui.TimesV2>
         *     showRealTime (Optional): hide or show RealTime in the Presets panel.
         *     showRealTimeOnly (Optional): Only show RealTime in the Presets panel.
         *     showRelative (Optional): hide or show the Relative in the Presets panel.
         *     showAllTime (Optional): hide or show All Time in the Presets panel.
         * }
         */
        initialize: function() {
            this.label = _('Presets').t();

            var defaults = {
                showRealTime:true,
                showRealTimeOnly:false,
                showRelative:true, //currently partially supported. Some may slip through.
                showAllTime:true
            };

            _.defaults(this.options, defaults);

            Base.prototype.initialize.apply(this, arguments);

            this.activate();
        },
        startListening: function() {
            if (this.collection) {
                this.listenTo(this.collection, 'reset', this.render);
            }
        },
        supportsRange: function() {
            var earliest = this.model.get('earliest'),
                latest = this.model.get('latest');

            return time_utils.generateAllTimeLabel(earliest, latest) || time_utils.findPresetLabel(this.collection, earliest, latest);
        },
        events: {
            'click a' : function(e) {
                e.preventDefault();
                var $target = $(e.currentTarget);
                this.model.save({
                    'earliest': $target.data('earliest'),
                    'latest': $target.data('latest')
                });
                this.model.trigger('applied');
            }
        },
        render: function() {
            var periodPresets = this.options.showRelative && !this.options.showRealTimeOnly ? this.collection.filterToPeriod() : false,
                hasPeriodPresets = periodPresets && periodPresets.length,
                lastPresets = this.options.showRelative && !this.options.showRealTimeOnly ? this.collection.filterToLast() : false,
                hasLastPresets = lastPresets && lastPresets.length;

            var template = _.template(this.template, {
                    _: _,
                    realTimePresets: this.options.showRealTime ? this.collection.filterToRealTime() : false,
                    periodPresets: periodPresets,
                    hasPeriodPresets: hasPeriodPresets,
                    lastPresets: lastPresets,
                    hasLastPresets: hasLastPresets,
                    otherPresets: !this.options.showRealTimeOnly ? this.collection.filterToOther() : false,
                    options: this.options,
                    isAllTime: this.isAllTime,
                    listElementPartial: this.listElementPartial
                });
            this.$el.html(template);
            return this;
        },
        isAllTime: function(model) {
            var noEarliest = !model.entry.content.get("earliest_time") || model.entry.content.get("earliest_time") == "0",
                noLatest =  !model.entry.content.get("latest_time") || model.entry.content.get("latest_time") == "now";

            return noEarliest && noLatest;
        },
        listElementPartial: _.template('\
            <li><a href="#" data-earliest="<%- model.entry.content.get("earliest_time") || "" %>" data-latest="<%- model.entry.content.get("latest_time") || "" %>"><%- _(model.entry.content.get("label")).t() %></a></li>\
        '),
        template: '\
            <% if (realTimePresets && realTimePresets.length) { %>\
                <ul class="unstyled presets-group">\
                    <li><%- _("Real-time").t() %></li>\
                    <% _.each(realTimePresets, function(model) { %>\
                        <%= listElementPartial({model: model}) %>\
                    <% }); %>\
                </ul>\
                <div class="presets-divider-wrap"><div class="presets-divider"></div></div>\
            <% } %>\
            <% if (hasPeriodPresets && hasLastPresets) { %>\
                    <ul class="unstyled presets-group">\
                        <li><%- _("Relative").t() %></li>\
                        <% _.each(periodPresets, function(model) { %>\
                            <%= listElementPartial({model: model}) %>\
                        <% }); %>\
                    </ul>\
                    <ul class="unstyled presets-group">\
                        <li>&nbsp;</li>\
                        <% _.each(lastPresets, function(model) { %>\
                             <%= listElementPartial({model: model}) %>\
                        <% }); %>\
                    </ul>\
                    <div class="presets-divider-wrap"><div class="presets-divider"></div></div>\
            <% } else if (hasPeriodPresets) { %>\
                <ul class="unstyled presets-group">\
                    <li><%- _("Relative").t() %></li>\
                    <% _.each(periodPresets, function(model) { %>\
                        <%= listElementPartial({model: model}) %>\
                    <% }); %>\
                </ul>\
                <div class="presets-divider-wrap"><div class="presets-divider"></div></div>\
            <% } else if (hasLastPresets) { %>\
                <ul class="unstyled presets-group">\
                    <li><%- _("Relative").t() %></li>\
                    <% _.each(lastPresets, function(model) { %>\
                        <%= listElementPartial({model: model}) %>\
                   <% }); %>\
                </ul>\
                <div class="presets-divider-wrap"><div class="presets-divider"></div></div>\
            <% } %>\
            <% if (otherPresets && otherPresets.length) { %>\
                <ul class="unstyled presets-group">\
                    <li><%- _("Other").t() %></li>\
                    <% _.each(otherPresets, function(model) { %>\
                        <% if (!(isAllTime(model) && !options.showAllTime)) { %>\
                            <%= listElementPartial({model: model}) %>\
                        <% } %>\
                    <% }); %>\
                </ul>\
            <% } %>\
        '
    });
});
