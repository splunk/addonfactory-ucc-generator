/**
 * View that contains all matched events selected by the user to be poor examples of their selected field extractions.
 * For each counter example, displays the event text and a remove button to remove that counter example.
 */
define([
            'jquery',
            'underscore',
            'module',
            'views/Base',
            'util/field_extractor_utils'
        ],
        function(
            $,
            _,
            module,
            BaseView,
            fieldExtractorUtils
        ) {

    return BaseView.extend({

        className: 'counter-examples-container',

        moduleId: module.id,

        events: {

            'click .remove-button': function(e) {
                e.preventDefault();
                if(this.$el.hasClass('disabled')) {
                    return;
                }
                this.trigger('action:removeCounterExample', parseInt($(e.currentTarget).data('counter-example-index'), 10));
            }
        },

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model.state, 'change:counterExamples', this.render);
        },

        disable: function() {
            this.$el.addClass('disabled');
        },

        enable: function() {
            this.$el.removeClass('disabled');
        },

        render: function() {
            this.$el.html(this.compiledTemplate({
                counterExamples: this.model.state.get('counterExamples') ? (this.model.state.get('counterExamples')).map(this.highlightEventText, this) : []
            }));
            _(this.model.state.get('counterExamples')).each((function(sample, i) {
                var centerRemoveButtonHeight = $(this.$el.find('.counter-example-wrapper')[i]).find('.event-text').height()/2;
                if (i===0) {
                    $(this.$el.find('.remove-button')[i]).css('margin-top', centerRemoveButtonHeight + 3);
                }
                else {
                    $(this.$el.find('.remove-button')[i]).css('margin-top', centerRemoveButtonHeight - 5);
                }
            }).bind(this));
            return this;
        },

        highlightEventText: function(counterExample) {
            var examplesArray = [],
                noRequiredTextObject = {text: ""},
                selectionStartIndex = -1;
            return fieldExtractorUtils.replaceBoundingGroupsWithTemplate(
                counterExample.rawText,
                [ _(counterExample).pick('fieldName', 'startIndex', 'endIndex') ],
                noRequiredTextObject,
                selectionStartIndex,
                fieldExtractorUtils.counterExampleTemplate
            );
        },

        // NOTE: it is safe to not escape the counter example text, since it has been pre-processed and escaped below
        template: '\
        <% _(counterExamples).each(function(counterExample, i) { %>\
            <a href="#" class="remove-button" data-counter-example-index="<%- i %>"><i class="icon-x-circle"></i></a>\
            <div class="event-wrapper counter-example-wrapper">\
                <span class="event-text"><%= counterExample %></span>\
            </div>\
        <% }) %>\
        '
    });

});