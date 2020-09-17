/**
 * Displays the selected Master Event in a separate box to the user in the Select Sample wizard step.
 */
define([
            'jquery',
            'module',
            'util/field_extractor_utils',
            'views/Base',
            'bootstrap.tooltip'  // package without return type
        ],
        function(
            $,
            module,
            fieldExtractorUtils,
            Base
        ) {

    return Base.extend({

        moduleId: module.id,

        initialize: function() {
            Base.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model.state, 'change:masterEvent', this.render);
        },

        render: function() {
            this.$el.html(this.compiledTemplate(this.model.state.pick('masterEvent')));
            if (this.model.state.get('masterEvent')) {
                var requiredTextObject =  {text: this.model.state.get('requiredText'), startIndex: this.$el.find('.required-text').data('start-index') || '' };
                this.$('.event-wrapper .event-text').html(fieldExtractorUtils.replaceBoundingGroupsWithTemplate(
                    this.model.state.get('masterEvent'),
                    this.model.state.get('existingExtractions') || [],
                    requiredTextObject,
                    -1,
                    fieldExtractorUtils.highlightedContentTemplate
                ));
                this.$('.highlighted-existing-match').each(function(index, element) {
                    $(element).tooltip({ animation: false, title: element.getAttribute('data-field-name'), container: element });
                });
            }
            
            return this;
        },

        template: '\
            <% if(masterEvent) { %>\
                <div class="event-wrapper sample-event-wrapper not-interactive">\
                    <span class="event-text"></span>\
                </div>\
            <% } %>\
        '

    });

});
