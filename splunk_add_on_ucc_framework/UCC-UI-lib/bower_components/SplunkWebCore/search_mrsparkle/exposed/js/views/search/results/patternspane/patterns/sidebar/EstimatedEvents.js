define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'util/format_numbers_utils'
    ],
    function($, _, module, Base, formatNumbersUtils) {
        return Base.extend({
            moduleId: module.id,
            className: 'estimated-events',
            initialize: function() {
                return Base.prototype.initialize.apply(this, arguments);
            },
            startListening: function() {
                this.listenTo(this.model.searchJob.entry.content, 'change:eventCount', this.render);
            },
            render: function() {
                var pattern = this.model.patternData.results.get(this.model.state.get('selectedPattern'));
                
                if (pattern) {
                    var eventCount = this.model.searchJob.entry.content.get('eventCount') || 0,
                        estimatedEvents = pattern.getNumEstimatedEvents(eventCount);
                    
                    this.$el.html(_.template(this.template, {
                        estimatedEvents: estimatedEvents,
                        formatNumbersUtils: formatNumbersUtils
                    }));
                }

                return this;
            },
            template: '\
                <div class="big-number"><%- formatNumbersUtils.abbreviateNumber(estimatedEvents) %></div>\
            '
        });
    }
);