/**
 * @author jszeto
 * @date 11/4/13
 *
 * ResultTableMaster subclass that adds special logic for showing a checkmark or x in the left column
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    './ResultsTableMaster',
    './MatchResultsTableHeader',
    './renderers/CheckmarkCellRenderer',
    'util/field_extractor_utils',
    'bootstrap.tooltip'  // package without return type
],
    function (
        $,
        _,
        Backbone,
        module,
        ResultsTableMaster,
        MatchResultsTableHeader,
        CheckmarkCellRenderer,
        fieldExtractorUtils) {
        
        var MatchResultsTableMaster = ResultsTableMaster.extend({

            moduleId: module.id,

            events: _.extend({}, ResultsTableMaster.prototype.events, {
                'click .remove-button': function(e) {
                    e.preventDefault();
                    var $target = $(e.currentTarget),
                        $highlighted = $target.closest('.' + fieldExtractorUtils.HIGHLIGHTED_MATCH_CLASS),
                        $td = $target.closest('td');

                    this.trigger(
                        'action:removeExtraction',
                        {
                            rawText: $td.text(),
                            fieldName: $highlighted.data('fieldName'),
                            selectedText: $highlighted.text(),
                            startIndex: $highlighted.data('startIndex'),
                            endIndex: $highlighted.data('endIndex')
                        }
                    );
                },
                'mouseenter tr.shared-resultstable-resultstablerow': function(e) {
                    var $target = $(e.target),
                        $tableRow = $target.closest('tr'),
                        $firstCell = $tableRow.children().first();
                    if(this._getAddSampleEnabled()){
                        // Clean up existing add sample event buttons if mouseleave event is not fired because
                        // the user immediately moused into another row's button location
                        _.invoke($('.results-table').find('.add-sample-event-button'), 'remove');
                        $firstCell.append(_(this.addSampleEventButton).template({}));

                        var windowWidth = $(window).width(),
                            buttonMarginLeft = windowWidth - 200;
                        $target.find('.add-sample-event-button').css({ 'margin-left': buttonMarginLeft + 'px' });

                        // Have to dynamically add styling to keep data cell contents aligned correctly
                        $tableRow.find('td:last').css({ 'padding-right':'20px' });
                    }
                },
                'mouseleave tr.shared-resultstable-resultstablerow': function(e) {
                    var $target = $(e.target);
                    if(this._getAddSampleEnabled()){
                        $target.closest('tr').find('.add-sample-event-button').remove();
                    }
                },
                'dblclick tbody td': function(e) {
                    this.handleCellClick($(e.target), e);
                    if(this.model.state.get('mode') === fieldExtractorUtils.SELECT_SAMPLE_MODE && this.model.state.get('interactiveMode') === fieldExtractorUtils.INTERACTION_MODE){
                        this.trigger('action:nextStep');
                    }
                },
                'mousemove tbody td': function(e) {
                    if(this.model.state.get('mode') === fieldExtractorUtils.SELECT_SAMPLE_MODE){
                        e.preventDefault();
                    }
                }
            }),

            initialize: function (options) {
                var validRegex = !this.model.state.get('errorState') && !this.model.state.get('regexGenErrorState'),
                    sampleCount = this.model.state.get('sampleEvents') ? this.model.state.get('sampleEvents').length : 0,
                    belowSampleCountLimit = sampleCount < fieldExtractorUtils.SAMPLE_EVENT_LIMIT,
                    samplesEnabled = belowSampleCountLimit && (validRegex === true);

                this.options = $.extend(true, {
                    headerClass: MatchResultsTableHeader
                }, this.options);

                this.setAddSamplesEnabled(samplesEnabled);

                ResultsTableMaster.prototype.initialize.call(this, this.options);
                this.addCellRenderer(_(this.highlightedFieldsCellRenderer).bind(this));
                this.addCellRenderer(new CheckmarkCellRenderer());
                this.listenTo(this.model.state, 'change:mode change:interactiveMode', function() {
                    var mode = this.model.state.get('mode'),
                        previousMode = this.model.state.previous('mode'),
                        interactiveMode = this.model.state.get('interactiveMode'),
                        prevInteractiveMode = this.model.state.previous('interactiveMode');
                    this.updateTableInteractivity();
                    if ((mode === fieldExtractorUtils.VALIDATE_FIELDS_MODE && previousMode === fieldExtractorUtils.SELECT_FIELDS_MODE) ||
                        (previousMode === fieldExtractorUtils.VALIDATE_FIELDS_MODE && mode === fieldExtractorUtils.SELECT_FIELDS_MODE) ||
                        (interactiveMode === fieldExtractorUtils.NO_INTERACTION_MODE && mode === fieldExtractorUtils.VALIDATE_FIELDS_MODE) ||
                        (prevInteractiveMode === fieldExtractorUtils.NO_INTERACTION_MODE && mode === fieldExtractorUtils.VALIDATE_FIELDS_MODE) ||
                        (prevInteractiveMode !== interactiveMode && this.options.requiredText))  {
                        this.debouncedRender();
                    }
                });
            },

            setAddSamplesEnabled: function(isEnabled) {
                this.addSamplesEnabled = isEnabled;
                this.updateTableInteractivity();
            },

            updateTableInteractivity: function() {
                if(this._getCellClickEnabled()) {
                    this.model.config.set({ 'display.statistics.drilldown': 'row' });
                }
                else {
                    this.model.config.set({ 'display.statistics.drilldown': 'none' });
                    this.$('tr').removeClass('highlighted');
                }
            },

            handleCellClick: function($target, event) {
                // Keyboard events can sometimes result in an empty target here, ignore these events (SPL-88809).
                if($target.length === 0) {
                    return;
                }
                if(this._getCellClickEnabled()) {
                    event.preventDefault();
                    $target.blur();
                    $target.closest('tr').blur();
                    var row = $target.closest('tr').attr('data-row-index');
                    var fieldBounds = [];
                    if(this.model.state.get('mode') === fieldExtractorUtils.SELECT_SAMPLE_MODE){
                        var rawIndex = _(this.rawFields).indexOf('_raw');
                        fieldBounds = this.generateFieldBounds(row,
                                                               fieldExtractorUtils.OFFSET_FIELD_NAME) || [];
                        this.trigger('action:selectEvent', this.rawRows[row][rawIndex], fieldBounds);
                    }else{
                        var rowTarget = $target.closest('tr').find('.interactive-extraction-cell'); //preserve closest tr in case $target is the add-sample-event-button that is removed
                        fieldBounds = this.generateExistingFieldBounds(row,
                                                                       fieldExtractorUtils.OFFSET_FIELD_NAME) || [];
                        $('.add-sample-event-button').remove();
                        this.trigger('action:selectEvent', rowTarget.text(), fieldBounds);
                        $('html,body').animate({scrollTop: "0px"}, 300);
                    }
                }
            },

            // handleCellMouseover: function($target) {
            //     ResultsTableMaster.prototype.handleCellMouseover.apply(this, arguments);
            //     //TODO - when user hovers over the currently selected sample event, show the htmlBlue
            //     // $('.highlighted').children().css("background-color", "#b5d6fd");
            // },

            generateHeaderViewOptions: function() {
                return _.extend(
                    { matchFieldName: fieldExtractorUtils.MATCH_FIELD_NAME },
                    ResultsTableMaster.prototype.generateHeaderViewOptions.apply(this, arguments)
                );
            },

            generateCellObjects: function(row, fields, dataOverlay, rowNumber) {
                var cellObjects = _(ResultsTableMaster.prototype.generateCellObjects.apply(this, arguments)).map(function(cellObject) {
                    return _.extend({
                            matchFieldName: fieldExtractorUtils.MATCH_FIELD_NAME,
                            inputField: this.options.inputField,
                            fieldBounds: this.generateFieldBounds(rowNumber, fieldExtractorUtils.OFFSET_FIELD_NAME)
                        },
                        cellObject
                    );
                }, this);
                var captureGroupField = _(cellObjects).find(
                    function(cellObject){
                        return cellObject.field === fieldExtractorUtils.OFFSET_FIELD_NAME;
                    }
                );
                _(cellObjects).each(function(cellObject){
                    if(captureGroupField && !cellObject.fieldBounds){
                        cellObject.fieldBounds = captureGroupField.fieldBounds;
                    }
                });
                return cellObjects;
            },

            generateExistingFieldBounds: function(rowIndex, offsetName) {
                var existingIndex = _(this.rawFields).indexOf(offsetName + 0);
                if (existingIndex === -1) {
                    return [];
                }
                var boundingGroups = [],
                    boundingGroup = '',
                    groups = [];
                var i = 0,
                    j = 0,
                    k = 0,
                    extractions = this.model.state.get('existingExtractions');
                while (existingIndex !== -1) {
                    boundingGroup = this.rawRows[rowIndex][existingIndex],
                    groups = boundingGroup ? fieldExtractorUtils.parseBoundingGroupString(boundingGroup, true) : [];
                    for (j = 0; j < groups.length; j++) {
                        for (k = 0; k < extractions.length; k++) {
                            if (extractions[k].fieldName === groups[j].fieldName){
                                groups[j].hidden = extractions[k].hidden;
                                break;
                            }
                        }
                        boundingGroups.push(groups[j]);
                    }
                    i++;
                    existingIndex = _(this.rawFields).indexOf(offsetName + i);
                }
                return _(boundingGroups).sortBy('startIndex');
            },

            generateFieldBounds: function(rowIndex, offsetName) {
                var selectedIndex = _(this.rawFields).indexOf(offsetName),
                    existingIndex = _(this.rawFields).indexOf(offsetName + 0);
                if(selectedIndex === -1 && existingIndex === -1) {
                    return;
                }
                // This cell is or has an extracted field
                var boundingGroups = [],
                    boundingGroup = this.rawRows[rowIndex][selectedIndex],
                    groups = boundingGroup ? fieldExtractorUtils.parseBoundingGroupString(boundingGroup) : [];
                boundingGroups = boundingGroups.concat(groups);
                boundingGroups = boundingGroups.concat(this.generateExistingFieldBounds(rowIndex,offsetName));
                return _(boundingGroups).sortBy('startIndex');
            },

            isDataField: function(fieldName) {
                return fieldName === fieldExtractorUtils.MATCH_FIELD_NAME
                            || ResultsTableMaster.prototype.isDataField.apply(this, arguments);
            },

            highlightedFieldsCellRenderer: function($td, cellData) {
                if(cellData.field !== cellData.inputField) {
                    return false;
                }
                var selectionStartIndex = -1,
                    requiredTextObject = {text: this.options.requiredText},
                    html;
                if (!this.options.regex) {
                    requiredTextObject.text = "";
                }
                if (this.model.state.get('interactiveMode') === fieldExtractorUtils.NO_INTERACTION_MODE) {
                    // Do not display required text highlighting when in manual mode
                    html = fieldExtractorUtils.replaceBoundingGroupsWithTemplate(
                        cellData.value,
                        cellData.fieldBounds
                    );
                } else if (this.model.state.has('method') && this.model.state.get('method') === 'delim') {
                    // Do not display highlighting in delim mode
                    html = cellData.value;
                } else {
                    html = fieldExtractorUtils.replaceBoundingGroupsWithTemplate(
                        cellData.value,
                        cellData.fieldBounds,
                        requiredTextObject,
                        selectionStartIndex,
                        fieldExtractorUtils.highlightedContentTemplate
                    );
                }
                
                $td.addClass(fieldExtractorUtils.INTERACTIVE_CELL_CLASS).addClass('field-extraction').html(html);
                if(this.model.state.get('mode') === fieldExtractorUtils.VALIDATE_FIELDS_MODE && this.model.state.get('interactiveMode') === fieldExtractorUtils.INTERACTION_MODE) {
                    $td.find('.' + fieldExtractorUtils.HIGHLIGHTED_MATCH_CLASS).append('<a class="remove-button" href="#"><i class="icon-x-circle icon-large"></i></a>');
                }
                $td.find('.highlighted-existing-match').each(function(index, element) {
                    $(element).tooltip({ animation: false, title: element.getAttribute('data-field-name'), container: element });
                });
                return true;
            },

            _getCellClickEnabled: function() {
                return (
                    (this._getAddSampleEnabled() || this.model.state.get('mode') === fieldExtractorUtils.SELECT_SAMPLE_MODE) &&
                    this.model.state.get('interactiveMode') === fieldExtractorUtils.INTERACTION_MODE
                );
            },

            _getAddSampleEnabled: function() {
                return (this.model.state.get('mode') === fieldExtractorUtils.SELECT_FIELDS_MODE && this.model.state.get('interactiveMode') === fieldExtractorUtils.INTERACTION_MODE && this.addSamplesEnabled);
            },

            addSampleEventButton: '<div class="add-sample-event-button"><i class="icon-plus" style="color:white"></i><%- _(" Add sample event").t() %></div>'

        });

        return MatchResultsTableMaster;

    });

