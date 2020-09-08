/**
 * View that contains the Master Event and Sample Events, and handles their highlighting and interactivity.
 * There is only ever 1 Master Event. The user can add one required text and any number of extracted fields with brand new names to it.
 * There can be up to 4 Sample Events. The user can only add examples of extracted fields that already exist on the Master Event to them.
 * Updating the extracted fields or required text causes MatchResultsTableMaster to re-render to display new highlighting.
 */
define([
            'jquery',
            'underscore',
            'module',
            'views/Base',
            './FieldExtractionForm',
            'views/shared/delegates/Popdown',
            'util/field_extractor_utils',
            './EditExtractionDropdown',
            './RemoveRequiredTextDropdown',
            'helpers/user_agent',
            'bootstrap.tooltip'  // package without return type
        ],
        function(
            $,
            _,
            module,
            BaseView,
            FieldExtractionForm,
            Popdown,
            fieldExtractorUtils,
            EditExtractionDropdown,
            RemoveRequiredTextDropdown,
            userAgent
        ) {

    return BaseView.extend({

        moduleId: module.id,
        className: 'automatic-extraction-editor',

        /**
         * @constructor
         *
         * @param options {Object} {
         *     model: {
         *         state {Model} model to track the state of the editing process
         *     }
         * }
         */
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model.state, 'change:masterEvent change:examples change:requiredText change:sampleEvents', this.debouncedRender);
            this.selection = -1;
        },

        events: {
            'click .manual-mode-button': function(e) {
                e.preventDefault();
                this.trigger('action:selectManualMode');
            },
            'mouseup .master-event-container': function(e) {
                e.preventDefault();
                var $target = $(e.target);
                var windowSelection = window.getSelection();
                if($target.hasClass(fieldExtractorUtils.HIGHLIGHTED_MATCH_CLASS)){
                    // User has selected an existing highlighted extraction
                    this.updateExtractionHandler(e, $target);
                    this.removeTemporaryHighlight('', $target);
                }else if($target.hasClass(fieldExtractorUtils.REQUIRED_TEXT_CLASS)){
                    // User has selected an existing required text
                    this.removeRequiredTextHandler(e, $target);
                    this.removeTemporaryHighlight('', $target);
                }else if (!$target.is('.remove-button') &&
                          !$target.hasClass(fieldExtractorUtils.HIGHLIGHTED_EXISTING_MATCH_CLASS)){
                    // User has selected a brand new field or required text to extract
                    this.newExtractionHandler(e, $target, windowSelection);
                } else {
                    this.removeTemporaryHighlight('', $target);
                }
            },
            'click .remove-button': function(e) {
                e.preventDefault();
                if(this.$el.hasClass('disabled')) {
                    return;
                }
                this.trigger('action:removeExistingSampleEvent', parseInt($(e.currentTarget).data('sample-index'), 10));
            }
        },

        updateExtractionHandler: function(e, $target) {
            var fieldName = $target.data('fieldName'),
                fieldValue = $target.text(),
                $wrapper = $target.closest('.event-wrapper');

            if(this.$el.hasClass('disabled')){
                return;
            }

            if (this.children.editExtractionDropdown) {
                this.stopListening(this.children.editExtractionDropdown);
                this.children.editExtractionDropdown.remove();
            }
            this.children.editExtractionDropdown = new EditExtractionDropdown({
                fieldValue: fieldValue,
                fieldName: fieldName,
                mode: 'menu',
                model: {
                    state: this.model.state
                },
                eventType: $wrapper.is('.master-event-wrapper') ? 'master' : 'sample'
            });
            this.listenTo(this.children.editExtractionDropdown, 'action:rename', function(newFieldName) { 
                this.trigger('action:renameExistingExample', fieldName, newFieldName);
            });
            this.listenTo(this.children.editExtractionDropdown, 'action:remove', function(fieldName) {
                if($wrapper.is('.master-event-wrapper')) {
                    this.trigger('action:removeExistingExample', fieldName);
                }
                else {
                    this.trigger('action:removeExistingSampleExtraction', fieldName, parseInt($wrapper.data('sample-index'), 10));
                }
            });

            $('body').append(this.children.editExtractionDropdown.render().el);
            this.children.editExtractionDropdown.show($target, { $onOpenFocus : this.$el });
        },

        removeRequiredTextHandler: function(e, $target) {  
            if (this.children.removeRequiredTextDropdown) {
                this.stopListening(this.children.removeRequiredTextDropdown);
                this.children.removeRequiredTextDropdown.remove();
            }          
            this.children.removeRequiredTextDropdown = new RemoveRequiredTextDropdown({ requiredText: $target.text() });
            this.listenTo(this.children.removeRequiredTextDropdown, 'action:remove', function() {
                this.trigger('action:removeRequiredText');
            });
            $('body').append(this.children.removeRequiredTextDropdown.render().el);
            this.children.removeRequiredTextDropdown.show($target, { $onOpenFocus : this.$el });
        },

        newExtractionHandler: function(e, $target, windowSelection) {
            // windowSelection.type is not supported in Firefox or IE
            // so we compare the startIndex (anchorOffset) and endIndex (focusOffset)
            // to make sure they contain a range of chars
            if(windowSelection.anchorOffset !== windowSelection.focusOffset) {
                $target = $target.is('.master-event-container') ? $(windowSelection.anchorNode).closest('.event-text') : $target;
                $target = $target.is('.highlighted-match-selected') ? $target.closest('.event-text') : $target;
                var $wrapper = $target.closest('.event-wrapper');
                if(this.$el.hasClass('disabled')){
                    return;
                }
                if ($wrapper.is('.master-event-wrapper')) {
                    if ((this.model.state.get('examples').length > 0) && (!this.model.state.get('regex'))) {
                        return;
                    }
                }
                else {
                    if (this.model.state.get('sampleEvents')[parseInt($wrapper.data('sample-index'), 10)] && (!this.model.state.get('regex')) && this.model.state.get('examples').length > 0) {
                        // user has selected a valid sample event and there are existing fields extracted, but the regex is broken - do not render extraction dialog
                        return;
                    }
                }

                var fieldsAndRequiredText = (this.model.state.get('examples') || []).concat([]);
                if (this.model.state.get('requiredText')) {
                    var requiredText = $('.master-event-wrapper .required-text');
                    fieldsAndRequiredText.push({
                        endIndex: $(requiredText).data('end-index'),
                        fieldName: $(requiredText).text(),
                        startIndex: $(requiredText).data('start-index')
                    });
                }
                // Include visible existing extractions.
                var existingExtractions = this.model.state.get('existingExtractions');
                _(existingExtractions).each(function(extract) {
                    if (!extract.hidden) {
                        fieldsAndRequiredText.push({
                            endIndex: extract.endIndex,
                            fieldName: extract.fieldName,
                            startIndex: extract.startIndex
                        });
                    }
                }); 
                
                var selection = fieldExtractorUtils.getSelectionObject(windowSelection, $target, fieldsAndRequiredText);

                if (!selection){
                    return;
                }
                if(this.children.fieldExtractionForm) {
                    this.stopListening(this.children.fieldExtractionForm);
                    this.children.fieldExtractionForm.remove();
                }
                if(this.children.fieldExtractionPopdown) {
                    this.stopListening(this.children.fieldExtractionPopdown);
                    this.children.fieldExtractionPopdown.remove();
                }
                if(this.$extractFieldPopdownDialog) {
                    this.$extractFieldPopdownDialog.remove();
                }
                var tempHighlightSuccess = this.temporaryHighlight($target, selection);
                if (tempHighlightSuccess) {
                    this.$extractFieldPopdownDialog = $(this.extractFieldPopdownTemplate).appendTo(this.el);
                    var eventType = $wrapper.is('.master-event-wrapper') ? 'master' : 'sample';
                    this.children.fieldExtractionForm = new FieldExtractionForm({
                        selection: selection,
                        requiredText: this.model.state.get('requiredText'),
                        model: {
                            state: this.model.state
                        },
                        eventType: eventType,
                        sampleEventIndex: ((eventType === 'sample') ? $wrapper.data('sample-index') : null)
                    });
                    this.children.fieldExtractionPopdown = new Popdown({
                        el: this.el,
                        dialog: '.popdown-dialog',
                        mode: 'dialog',
                        attachDialogTo: 'body',
                        adjustPosition: false
                    });
                    this.children.fieldExtractionForm.render().appendTo(this.$extractFieldPopdownDialog);
                    this.listenTo(this.children.fieldExtractionForm, 'action:addExtraction', function (selection) {
                        this.trigger('action:addExtraction', selection);
                        this.children.fieldExtractionPopdown.hide();
                    });
                    this.listenTo(this.children.fieldExtractionForm, 'action:addRequiredText', function (selection) {
                        this.trigger('action:addRequiredText', selection);
                        this.children.fieldExtractionPopdown.hide();
                    });
                    this.listenTo(this.children.fieldExtractionForm, 'action:addSampleExtraction', function (selection) {
                        this.trigger('action:addSampleExtraction', selection, parseInt($wrapper.data('sample-index'), 10));
                        this.children.fieldExtractionPopdown.hide();
                    });

                    this.children.fieldExtractionPopdown.pointTo($target.find('.highlighted-match-selected'));
                    this.listenTo(this.children.fieldExtractionPopdown, "hidden", function (e) {
                        if(e && $(e.target).is('.highlighted-match-selected')) {
                            return;
                        }
                        this.removeTemporaryHighlight(selection, $target);
                    });
                    this.children.fieldExtractionPopdown.show();
                    this.children.fieldExtractionForm.focus();
                }
            }
            else {
                this.removeTemporaryHighlight('', $target);
            }
        },
        
        verifyNoExistingOverlap: function(startOffset, endOffset, highlightedExistingMatches) {
            return !_.any(highlightedExistingMatches, function(highlightedExisting) {
                return (((startOffset >= $(highlightedExisting).data('start-index')) && (startOffset < $(highlightedExisting).data('end-index'))) ||
                        ((startOffset <= $(highlightedExisting).data('start-index')) && (endOffset > $(highlightedExisting).data('start-index'))));
            });
        },
        
        verifyNoFieldOverlap: function(highlightedMatches, highlightedExistingMatches, selection, requiredText) {
            var execute = true,
                startOffset = selection.startIndex,
                endOffset = selection.endIndex;

            if (requiredText.length > 0) {
                var requiredTextStartIndex = $(requiredText).data('start-index'),
                    requiredTextEndIndex = $(requiredText).data('end-index');
                if (requiredTextStartIndex < endOffset && requiredTextEndIndex > startOffset) {
                    return false;
                }
            }
            if (!this.verifyNoExistingOverlap(startOffset, endOffset, highlightedExistingMatches)) {
                return false;
            }
            return !_.any(highlightedMatches, function(highlightedMatch) {
                return (((startOffset >= $(highlightedMatch).data('start-index')) && (startOffset < $(highlightedMatch).data('end-index'))) ||
                        ((startOffset <= $(highlightedMatch).data('start-index')) && (endOffset > $(highlightedMatch).data('start-index'))));
            });
        },

        verifyNoSampleFieldOverlap: function(highlightedMatches, highlightedExistingMatches, selection) {
            var execute = true,
                startOffset = selection.startIndex,
                endOffset = selection.endIndex;

            if (!this.verifyNoExistingOverlap(startOffset, endOffset, highlightedExistingMatches)) {
                return false;
            }
            return !_.any(highlightedMatches, function(highlightedMatch) {
                return (((startOffset >= highlightedMatch.startIndex) && (startOffset < highlightedMatch.endIndex)) ||
                        ((startOffset <= highlightedMatch.startIndex) && (endOffset > highlightedMatch.startIndex)));
            });
        },


        temporaryHighlight: function($target, selection) {
            var $wrapper = $target.closest('.event-wrapper');
            if (selection.startIndex > selection.endIndex) { //User dragged from right to left
                var savedEndIndex = selection.endIndex;
                selection.endIndex = selection.startIndex;
                selection.startIndex = savedEndIndex;
            }

            if($wrapper.is('.master-event-wrapper')) {
                var highlightedMatches = this.$('.master-event-wrapper .highlighted-match');
                var highlightedExistingMatches = this.$('.master-event-wrapper .highlighted-existing-match');
                var requiredText = this.$('.master-event-wrapper .required-text');
                var execute = this.verifyNoFieldOverlap(highlightedMatches, highlightedExistingMatches, selection, requiredText);

                if (execute){
                    var examples = this._buildExtractions();
                    var newExamples = examples.concat([selection]);
                    if ($target.find('.event-text').length > 0) {
                        $target = $target.find('.event-text');
                    }
                    var requiredTextObject =  {text: this.model.state.get('requiredText'), startIndex: this.$el.find('.required-text').data('start-index') || ''};
                    $target.html(fieldExtractorUtils.replaceBoundingGroupsWithTemplate(
                        this.model.state.get('masterEvent'),
                        newExamples,
                        requiredTextObject,
                        selection.startIndex,
                        fieldExtractorUtils.tempHighlightedContentTemplate
                    ));
                    this.$('.highlighted-existing-match').each(function(index, element) {
                        $(element).tooltip({ animation: false, title: element.getAttribute('data-field-name'), container: element });
                    });
                    return true;
                }
                else {
                    this.removeTemporaryHighlight('', $target);
                    return false;
                }
            }
            else if ($wrapper.is('.sample-event-wrapper')) {
                highlightedMatches = this.model.state.get('sampleEvents')[parseInt($wrapper.data('sample-index'), 10)].extractions;
                var noRequiredTextObject = {text: ''},
                    highlightedMatchesArray = [];
                _(highlightedMatches).each(function(highlightedMatch){
                    highlightedMatchesArray.push({startIndex: highlightedMatch.startIndex, endIndex: highlightedMatch.endIndex});
                });
                highlightedExistingMatches = this.$('.sample-event-wrapper .highlighted-existing-match');

                execute = this.verifyNoSampleFieldOverlap(highlightedMatchesArray, highlightedExistingMatches, selection);
                if (execute){
                    var sampleIndex = parseInt($wrapper.data('sample-index'), 10);
                    var sample = this.model.state.get('sampleEvents')[sampleIndex];
                    var extractions = sample.extractions || [];
                    if (this.model.state.get('existingSampleExtractions')) {
                        extractions = extractions.concat(this.model.state.get('existingSampleExtractions')[sampleIndex]);
                    }
                    var newExtractions = extractions.concat([selection]);
                    if ($target.find('.event-text').length > 0) {
                        $target = $target.find('.event-text');
                    }
                    $target.html(fieldExtractorUtils.replaceBoundingGroupsWithTemplate(
                        sample.rawText,
                        newExtractions,
                        noRequiredTextObject,
                        selection.startIndex,
                        fieldExtractorUtils.tempHighlightedContentTemplate
                    ));
                    this.$('.highlighted-existing-match').each(function(index, element) {
                        $(element).tooltip({ animation: false, title: element.getAttribute('data-field-name'), container: element });
                    });
                    return true;
                }
                else {
                    this.removeTemporaryHighlight('', $target);
                    return false;
                }
            }
        },

        removeTemporaryHighlight: function(selection, $target) {
            this.saveSelection(selection);
            var $wrapper = $target.closest('.event-wrapper');
            // Collapsing the window selection will remove unsightly highlighting, but is not safe to do in IE unless we
            // are also replacing the contents of the element (SPL-89794).  So avoid doing it here in IE and do it below
            // if we get there.
            if(!userAgent.isIE() && $wrapper.length > 0) {
                window.getSelection().collapse($wrapper[0], 0);
            }
            // If there is nothing currently highlighted, avoid replacing the wrapper's HTML, as this can cause issues in IE.
            if($wrapper.find('.highlighted-match-selected').length === 0) {
                return;
            }
            var selectionStartIndex = -1;
            if ($wrapper.is('.master-event-wrapper')) {
                var requiredTextObject = {text: this.model.state.get('requiredText')};
                $wrapper.find('.event-text').html(fieldExtractorUtils.replaceBoundingGroupsWithTemplate(
                    this.model.state.get('masterEvent'),
                    this._buildExtractions(),
                    requiredTextObject,
                    selectionStartIndex,
                    fieldExtractorUtils.highlightedContentTemplate
                ));
            }
            else {
                var sampleIndex = parseInt($wrapper.data('sample-index'), 10),
                    sample = this.model.state.get('sampleEvents')[sampleIndex],
                    extractions = sample.extractions || [],
                    noRequiredTextObject = {text: ''};
                if (this.model.state.get('existingSampleExtractions')) {
                    extractions = extractions.concat(this.model.state.get('existingSampleExtractions')[sampleIndex]);
                }
                $wrapper.find('.event-text').html(fieldExtractorUtils.replaceBoundingGroupsWithTemplate(
                    sample.rawText,
                    extractions,
                    noRequiredTextObject,
                    selectionStartIndex,
                    fieldExtractorUtils.highlightedContentTemplate
                ));
            }
            this.$('.highlighted-existing-match').each(function(index, element) {
                $(element).tooltip({ animation: false, title: element.getAttribute('data-field-name'), container: element });
            });
            if(userAgent.isIE() && $wrapper.length > 0) {
                window.getSelection().collapse($wrapper[0], 0);
            }
        },

        saveSelection: function(selection) {
            this.selection = selection.startIndex;
        },

        _buildExtractions: function () {
            var extractions = [];
            if (this.model.state.get('examples')) {
                extractions = extractions.concat(this.model.state.get('examples'));
            }
            if (this.model.state.get('existingExtractions')) {
                extractions = extractions.concat(this.model.state.get('existingExtractions'));
            }
            return extractions;
        },

        render: function() {
            this.$el.html(this.compiledTemplate({
                sampleEvents: this.model.state.get('sampleEvents')
            }));
            if(this.model.state.get('masterEvent')){
                var requiredTextObject =  {text: this.model.state.get('requiredText'), startIndex: this.$el.find('.required-text').data('start-index') || '' };
                this.$('.master-event-wrapper .event-text').html(fieldExtractorUtils.replaceBoundingGroupsWithTemplate(
                    this.model.state.get('masterEvent'),
                    this._buildExtractions(),
                    requiredTextObject,
                    this.selection,
                    fieldExtractorUtils.highlightedContentTemplate
                ));
            }
            var $sampleEvents = this.$('.sample-event-wrapper');
            var noRequiredTextObject = {text: ''},
                noStartIndex = -1;
            _(this.model.state.get('sampleEvents')).each((function(sample, i) {
                var centerRemoveButtonHeight = $(this.$el.find('.sample-event-wrapper')[i]).find('.event-text').height()/2;
                $(this.$el.find('.remove-button')[i]).css('top', centerRemoveButtonHeight - 3);
                var extractions = sample.extractions;
                if (this.model.state.get('existingSampleExtractions')) {
                    extractions = extractions.concat(this.model.state.get('existingSampleExtractions')[i]);
                }
                $sampleEvents.eq(i).find('.event-text').html(fieldExtractorUtils.replaceBoundingGroupsWithTemplate(
                    sample.rawText,
                    extractions,
                    noRequiredTextObject,
                    noStartIndex,
                    fieldExtractorUtils.highlightedContentTemplate
                ));
            }).bind(this));
            this.$('.highlighted-existing-match').each(function(index, element) {
                $(element).tooltip({ animation: false, title: element.getAttribute('data-field-name'), container: element });
            });
            return this;
        },

        disable: function() {
            this.$el.addClass('disabled');
        },

        enable: function() {
            this.$el.removeClass('disabled');
        },

        // NOTE: The div.event-wrapper element must be on a single line in the template to avoid introducing
        // leading/trailing white space in the event text.
        template: '\
            <div class="master-event-container">\
                <div class="event-wrapper master-event-wrapper"><span class="event-text"></span></div>\
                <% _(sampleEvents || []).each(function(sampleEvent, i) { %>\
                    <a href="#" class="remove-button" data-sample-index="<%- i %>"><i class="icon-x-circle"></i></a>\
                    <div class="event-wrapper sample-event-wrapper" data-sample-index="<%- i %>"><span class="event-text"><%- sampleEvent.rawText %></span></div>\
                <% }) %>\
            </div>\
        ',

        extractFieldPopdownTemplate: '\
            <div class="popdown-dialog">\
                <div class="arrow extraction-dialog-arrow"></div>\
            </div>\
        '

    });

});
