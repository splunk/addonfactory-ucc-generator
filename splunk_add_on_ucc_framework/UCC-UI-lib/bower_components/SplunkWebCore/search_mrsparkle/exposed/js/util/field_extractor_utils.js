/**
 * A set of utilities for working with regular expressions that contain named capture groups, which are not supported
 * natively in JavaScript but are used by splunkd for field extraction.
 */

define([
            'underscore'
        ],
        function(
            _
        ) {

   // DELIMITERS
    var DELIM_MAP = {
        space: '\\s',
        comma: '\\,',
        tab: '\\t',
        pipe: '\\|'
    };
    var DELIM_CONF_MAP = {
        space: ' ',
        comma: ',',
        tab: '\\t',
        pipe: '|'
    };

    var getCaptureGroupNames = function (regexString) {
        var fieldNames = [], fieldNamesArray = [];
        var regex = /\(\?(P)?<([A-Za-z][A-Za-z0-9_]*)>/g;
        fieldNames = regexString.match(regex);
        _(fieldNames).each(function(field) {    //Go through string to eliminate the '(?P<' and '>'
            var noLeftAngledBracket = field.replace("(?P<", "");
            if (noLeftAngledBracket === field) { //Didn't find the (?P
                noLeftAngledBracket = field.replace("(?<", "");
            }
            var noAngledBrackets = noLeftAngledBracket.replace(">", "");
            fieldNamesArray.push(noAngledBrackets);
        });
        return fieldNamesArray;
    };

    /**
     * Separated the individual characters of the delimiter with |.
     * So abc will be returned as a|b|c
     * @param delim {String} the delimiter to separate with |
     * @returns {String}
     */
    var getMultiCharDelimRegex = function (delim) {
        if (!delim.length || delim.length === 1) {
            return delim;
        }
        var delimRegex = '';
        for (var i = 0; i < delim.length; i++) {
            if (i < delim.length - 1) {
                if (_.values(DELIM_MAP).indexOf(delim.slice(i, i + 2)) !== -1) {
                    delimRegex += '[' + delim.slice(i, i + 2) +']';
                    if (i < delim.length - 2) {
                        delimRegex += '|';
                    }
                    i++;
                } else {
                    delimRegex += '[' + delim[i] +']';
                    delimRegex += '|';
                }
            } else {
                delimRegex += '[' + delim[i] +']';
            }
        }
        return delimRegex;
    };

    /**
     * Applies the given bounding groups to the given string, the substring that the group represents is replaced with
     * the result of executing the replacement function.
     *
     * Assumes that the bounding group list is ordered by increasing start index.
     *
     * If two bounding groups overlap, the overlap will be given to the first one and the second will start at the end
     * of the first.  If a bounding group is a subset of another, it will be ignored.
     *
     * Example:
     *
     * regexUtils.replaceBoundingGroups(
     *     '-- abc 123 --',
     *     [
     *         { fieldName: 'letters', startIndex: 3, endIndex: 6 },
     *         { fieldName: 'numbers', startIndex: 7, endIndex: 10 }
     *     ],
     *     function(substring, fieldName) {
     *         return '<b class="' + fieldName + '">' + substring + '</b>';
     *     }
     * );
     * --> '-- <b class="letters">abc</b> <b class="numbers">123</b> --'
     *
     * @param string {String} the string to replace
     * @param bounds {Array} a list of bounding groups, with the structure returned by parseBoundingGroupString above
     * @param replacementFn {Function} callback to generate the replacement string
     * @param requiredText {String} optional - the required text string for the current extraction, if present
     * @param requiredTextTemplate {String} optional - template for required text highlighting
     * @returns {string}
     */

    var replaceBoundingGroupsWithTemplate = function(string, origBounds, requiredTextObject, selectionStartIndex, templateType, masterEventExamples) {
        var bounds = (origBounds || []).concat([]);
        var newString = '',
            previousEndIndex = 0;
        /* Checks to see where it can apply the required text without overlapping any existing extractions */
        if(requiredTextObject && requiredTextObject.text){
            var requiredText = requiredTextObject.text,
                requiredTextIndexOfArray = [],
                index = 0,
                requiredTextStart = -1;

            if (requiredTextObject.startIndex) {
                requiredTextStart = requiredTextObject.startIndex;
            }
            else {
                while ((index = string.indexOf(requiredText, index + 1)) !== -1) {
                    requiredTextIndexOfArray.push(index);
                }
                _(requiredTextIndexOfArray).any(function (indexStart) {
                    var requiredTextStartIndex = indexStart,
                        requiredTextEndIndex = indexStart + requiredText.length;
                    for (var j = 0; j < bounds.length; j++) {
                        var bound = bounds[j];
                        if (requiredTextStartIndex < bound.endIndex && requiredTextEndIndex > bound.startIndex) {
                            return false;
                        }
                    }
                    requiredTextStart = requiredTextStartIndex;
                    return true;
                });
            }
            if (requiredTextStart !== -1) {
                bounds.push({
                    requiredText: true,
                    startIndex: requiredTextStart,
                    endIndex: requiredTextStart + requiredText.length
                });
            }
        }
        var updatedBounds = _(bounds).sortBy('startIndex');
        // Remove extractions that aren't visible to the user.
        for (var i = 0; i < updatedBounds.length; i++) {
            if (updatedBounds[i].hidden) {
                updatedBounds.splice(i, 1);
                i--;
            }
        }

        for (i = 0; i < updatedBounds.length; i++) {
            var bound = updatedBounds[i];
            if(bound.endIndex < previousEndIndex) {
                return '';
            }
            if (templateType && bound.rawText) {
                bound.tempField = true;
            }
            var replacementFn;
            var nextStart = Math.max(bound.startIndex, previousEndIndex);
            newString += _.escape(string.substring(previousEndIndex, nextStart));
            var fnOptions = _.extend({
                selectedText: string.substring(nextStart, bound.endIndex)
            }, bound);
            if(bound.requiredText){
                var requiredTextReplacementFn = _(this.requiredTextTemplate).template();
                newString += requiredTextReplacementFn(fnOptions);
            }
            else if (bound.tempField && templateType) {
                var tempTextReplacementFn = _(templateType).template();
                newString += tempTextReplacementFn(fnOptions);
            }
            else if (selectionStartIndex === -1 && templateType === this.counterExampleTemplate) {
                newString +=_(templateType).template(fnOptions);
            }
            else if (templateType === this.highlightedContentTemplate && masterEventExamples) {
                var sortedMasterEventExamples = _(masterEventExamples).sortBy('startIndex'),
                    fieldNames = _(sortedMasterEventExamples).pluck('fieldName');
                fnOptions.color = getFieldColor(bound.fieldName, fieldNames);
                replacementFn = _(this.highlightedContentTemplate).template();
                newString += replacementFn(fnOptions);
            }
            else{
                fieldNames = _.map(updatedBounds, function(updatedBound) {
                    if (bound.existing) {
                        return updatedBound.existing ? updatedBound.fieldName : '';
                    } else {
                        return updatedBound.existing ? '' : updatedBound.fieldName;
                    }
                });
                for (var j = 0; j < fieldNames.length; j++) {
                    if (!fieldNames[j]) {
                        fieldNames.splice(j, 1);
                        j--;
                    }
                }
                fnOptions.color = getFieldColor(bound.fieldName, fieldNames);
                if (bound.existing) {
                    replacementFn = _(this.highlightedExistingContentTemplate).template();
                } else {
                    replacementFn = _(this.highlightedContentTemplate).template();
                }
                newString += replacementFn(fnOptions);
            }
            previousEndIndex = bound.endIndex;
        }

        newString += _.escape(string.substring(previousEndIndex));
        return newString;
    };
    
    var getFieldColorWithIndex = function(index) {
         var colors = [
            "green",
            "yellow",
            "pink",
            "blue",
            "orange", 
            "salmon",
            "purple" 
        ];
        //get the number of capture groups, and assign colors based on positioning, then modulo to go through again
        var numColors = colors.length;
        return colors[index%numColors];
    };

    var getFieldColor = function(fieldName, fieldNames){
        var index;
        _(fieldNames).each(function(field, i) {
            if (field === fieldName) {
                index = i;
            }
        });
        if (index === undefined) {
            return ''; //Don't want to throw an error because sample events might not have all the highlighted fields
        }
        return getFieldColorWithIndex(index);
    };

    /**
     * Parses the offset_field field that is set by calling 
     * '| rex <regex> offset_field=<fieldname>', 
     * returns a data structure that lists all named capture groups with
     * the start and end indices of the substrings they capture.
     *
     * The returned list will be ordered by increasing start index.
     *
     * Example:
     *
     * regexUtils.parseBoundingGroupString('letters=3-6&numbers=7-10');
     * --> [
     *         { fieldName: 'letters', startIndex: 3, endIndex: 6 },
     *         { fieldName: 'numbers', startIndex: 7, endIndex: 10 }
     *     ]
     *
     * @param boundingGroupString {String} the offset_field field value
     *
     * TODO [sff] This will not work if a matched value appears more than once in the original string.
     */
    var parseBoundingGroupString = function(boundingGroupString, isExisting) {
        var fieldBounds = [],
            existing = isExisting || false,
            captureGroups,
            fields = boundingGroupString.split('&'),
            regex = /(^[A-Za-z][A-Za-z0-9_]*)[\=](\d*)[\-](\d*)/; //Regex must start with a letter, and may be followed by a letter, digit, or underscore
        _(fields).each(function(field) {
            captureGroups = regex.exec(field);
            if (captureGroups[1] === "") {
                throw new Error ('Invalid field extraction name');
            }
            var endIndex = parseInt(captureGroups[3], 10) + 1; // Need to normalize because '| rex' command returns an inclusive endIndex
            if (isExisting) {
                fieldBounds.push({ 
                    fieldName: captureGroups[1],
                    startIndex: parseInt(captureGroups[2], 10),
                    endIndex: endIndex,
                    existing: isExisting,
                    hidden: true
                });
            } else {
                fieldBounds.push({ 
                    fieldName: captureGroups[1],
                    startIndex: parseInt(captureGroups[2], 10),
                    endIndex: endIndex
                });
            }
        });
        return _(fieldBounds).sortBy('startIndex');                
    };

    /**
     * Check if the extraction overlaps any of the extractions in the array.
     *
     * @param extraction {object} specific extraction to check
     * @param extractionsArray {Array} array of extractions to check
     * @param checkHidden {Boolean} should the hidden fields be checked for overlapping
     * @returns {Boolean}
     */
    var canShowExtraction = function(extraction, extractionsArray, checkHidden) {
        var extractionStart = extraction.startIndex,
            extractionEnd = extraction.endIndex;
        return !_.any(extractionsArray, function(extract) {
            if ((extract.hidden && !checkHidden) || extraction.fieldName === extract.fieldName) {
                return false;
            }
            return ((extractionStart <= extract.startIndex) && (extractionEnd > extract.startIndex)) ||
                    ((extractionStart >= extract.startIndex) && (extractionStart < extract.endIndex));
        });
    };
    
    /**
     * Checks if the extractions in extractionsArray overlap with each other.
     * If they don't overlap return true.
     * 
     * @param extractionsArray {Array} array of extractions to check
     * @returns {Boolean}
     */
    var containsNoOverlappingExtractions = function(extractionsArray) {
        return !_.any(extractionsArray, function(extract) {
            return !canShowExtraction(extract, extractionsArray, true);
        });
    };

    var getSelectionObject = function(windowSelection, $target, indexArray) {
        var selectedText = windowSelection.getRangeAt(0).toString(),
            rawText = $target.text(),
            startIndex = windowSelection.anchorOffset,
            endIndex = windowSelection.focusOffset,
            startIndexOf = rawText.indexOf(selectedText),
            endIndexOf = startIndexOf + selectedText.length;
        if (startIndex > endIndex) { //user dragged from R->L
            var tempStartIndex = startIndex;
            startIndex = endIndex;
            endIndex = tempStartIndex;
        }
        if(startIndexOf === -1 || selectedText === ""){ // selectedText was not found in the event text
            return;
        }
        /*startIndex and endIndex are relative to html tag elements, so their indices might not be correct
         But startIndexOf and endIndexOf do not necessarily indicate the proper location in the string if there are duplicates
         Solution: combine both approaches to ensure proper highlighting */
        var index, startIndexTest = 0,
            indices = [];
        while ((index = rawText.indexOf(selectedText, startIndexTest)) > -1) { //Search for potential duplicates
            indices.push(index);
            startIndexTest = index + 1;
        }
        var i, j;
        if (indices.length > 1) { //if indices.length > 1, then there are duplicates
            var endIndexArray = _.pluck(indexArray, 'endIndex'),
                matchFound = false;
            for (i = 0; i < indices.length; i++) {
                if(matchFound) {
                    break;
                }
                for(j = 0; j < endIndexArray.length; j++) {
                    if(parseInt(indices[i], 10) !== parseInt(endIndexArray[j], 10) + startIndex) {
                        continue;
                    }
                    startIndex = parseInt(indices[i], 10);
                    endIndex = parseInt(indices[i], 10) + selectedText.length;
                    matchFound = true;
                }
            }
            if (startIndex < startIndexOf) { //In case endIndexArray is empty
                startIndex = startIndexOf;
                endIndex = endIndexOf;
            }
        }
        else {  //otherwise, startIndexOf and endIndexOf contain the proper location
            startIndex = startIndexOf;
            endIndex = endIndexOf;
        }
        return ({
            rawText: rawText,
            selectedText: selectedText,
            startIndex: startIndex,
            endIndex: endIndex
        });
    };

    var MODES = {
        SELECT_SAMPLE_MODE: 'select-sample-mode',
        SELECT_METHOD_MODE: 'select-method-mode',
        SELECT_DELIM_MODE: 'select-delim-mode',
        SELECT_FIELDS_MODE: 'select-fields-mode',
        VALIDATE_FIELDS_MODE: 'validate-fields-mode',
        SAVE_FIELDS_MODE: 'save-fields-mode',
        CONFIRMATION_MODE: 'confirmation-mode',

        NO_INTERACTION_MODE: 'manual-mode',
        INTERACTION_MODE: 'automatic-mode'
    };

    var isEditFieldsMode = function(mode, interactiveMode) {
        return (
            mode === MODES.SELECT_FIELDS_MODE || 
            mode === MODES.VALIDATE_FIELDS_MODE ||
            mode === MODES.SAVE_FIELDS_MODE || 
            isManualEditorMode(mode, interactiveMode)
        );
    };

    var isEventsTableMode = function(mode, interactiveMode) {
        return  ( 
            mode === MODES.SELECT_SAMPLE_MODE || 
            mode === MODES.SELECT_FIELDS_MODE ||
            mode === MODES.SELECT_DELIM_MODE ||
            mode === MODES.VALIDATE_FIELDS_MODE ||
            isManualEditorMode(mode, interactiveMode)
        );
    };

    var isManualEditorMode = function(mode, interactiveMode) {
        return (
            interactiveMode === MODES.NO_INTERACTION_MODE &&
            mode !== MODES.CONFIRMATION_MODE &&
            mode !== MODES.SAVE_FIELDS_MODE
        );
    };

     return ({
        getCaptureGroupNames: getCaptureGroupNames,
        getMultiCharDelimRegex: getMultiCharDelimRegex,
        replaceBoundingGroupsWithTemplate: replaceBoundingGroupsWithTemplate,
        parseBoundingGroupString: parseBoundingGroupString,
        canShowExtraction: canShowExtraction,
        containsNoOverlappingExtractions: containsNoOverlappingExtractions,
        getSelectionObject: getSelectionObject,
        getFieldColor: getFieldColor,
        getFieldColorWithIndex: getFieldColorWithIndex,
        isEditFieldsMode: isEditFieldsMode,
        isEventsTableMode: isEventsTableMode,
        isManualEditorMode: isManualEditorMode,

        highlightedContentTemplate: '<span class="highlighted-match highlighted-<%- color %>" data-field-name="<%- fieldName %>" data-start-index="<%- startIndex %>" data-end-index="<%- endIndex %>"><%- selectedText %></span>',
        highlightedExistingContentTemplate: '<span class="highlighted-existing-match highlighted-border-<%- color %>" title="<%- fieldName %>" data-field-name="<%- fieldName %>" data-start-index="<%- startIndex %>" data-end-index="<%- endIndex %>"><%- selectedText %></span>',
        tempHighlightedContentTemplate: '<div class="highlighted-match-selected" data-start-index="<%- startIndex %>" data-end-index="<%- endIndex %>" style="display:inline"><%- selectedText %></div>',
        requiredTextTemplate: '<div class="required-text" data-start-index="<%- startIndex %>" data-end-index="<%- endIndex %>" style="display:inline"><%- selectedText %></div>',
        counterExampleTemplate: '<span class="removed-text"><%- selectedText %></span>',

        MATCH_FIELD_NAME: '_is_match',
        INTERACTIVE_CELL_CLASS: 'interactive-extraction-cell',
        HIGHLIGHTED_MATCH_CLASS: 'highlighted-match',
        HIGHLIGHTED_MATCH_CLASS_SELECTED: 'highlighted-match-selected',
        HIGHLIGHTED_EXISTING_MATCH_CLASS: 'highlighted-existing-match',
        REQUIRED_TEXT_CLASS: 'required-text',
        OFFSET_FIELD_NAME: '_extracted_fields_bounds',
        MAX_EVENT_LINES: 20,
        SAMPLE_EVENT_LIMIT: 4,

        // Modes
        SELECT_SAMPLE_MODE: MODES.SELECT_SAMPLE_MODE,
        SELECT_METHOD_MODE: MODES.SELECT_METHOD_MODE,
        SELECT_DELIM_MODE: MODES.SELECT_DELIM_MODE,
        SELECT_FIELDS_MODE: MODES.SELECT_FIELDS_MODE,
        VALIDATE_FIELDS_MODE: MODES.VALIDATE_FIELDS_MODE,
        SAVE_FIELDS_MODE: MODES.SAVE_FIELDS_MODE,
        CONFIRMATION_MODE: MODES.CONFIRMATION_MODE,

        NO_INTERACTION_MODE: 'manual-mode',
        INTERACTION_MODE: 'automatic-mode',

        CLUSTERING_NONE: 'clustering_none',
        CLUSTERING_DIVERSE: 'clustering_diverse',
        CLUSTERING_OUTLIERS: 'clustering_outliers',

        VIEW_ALL_EVENTS: 'view-all-events',
        VIEW_MATCHING_EVENTS: 'view-matching-events',
        VIEW_NON_MATCHING_EVENTS: 'view-non-matching-events',

        DELIM_MAP: DELIM_MAP,
        DELIM_CONF_MAP: DELIM_CONF_MAP

    });

});
