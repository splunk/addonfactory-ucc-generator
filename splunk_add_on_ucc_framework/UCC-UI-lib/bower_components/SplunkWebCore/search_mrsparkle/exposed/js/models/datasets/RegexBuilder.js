define(
    [
        'jquery',
        'underscore',
        'models/services/field_extractor/RegexGenerator',
        'splunk.util'
    ],
    function(
        $,
        _,
        RegexGenerator,
        splunkUtils
    ) {
        // NOTE: Only converts one character (so if text is "  ", "  " will be returned).
        var convertSpecialCharToString = function(text) {
            var whitespaceDict = {
                ' ': _('space').t(),
                ' ': _('non-breaking space').t(),
                '\t': _('tab').t(),
                '\v': _('vertical tab').t(),
                '\n': _('new line').t(),
                '\f': _('form feed character').t(),
                '\r': _('character return').t(),
                // These are added temporarily.  In the future, the backend will not convert these characters to english values
                // See SPL-126396
                'space': _('space').t(),
                'tab': _('tab').t(),
                'vertical tab': _('vertical tab').t(),
                'new line': _('new line').t(),
                'form feed character': _('form feed character').t(),
                'character return': _('character return').t()
            };

            return whitespaceDict[text] || text;
        };

        return RegexGenerator.extend({

            STARTING_REGEX: 'startingRegex',
            STOPPING_REGEX: 'stoppingRegex',
            EXTRACTION_REGEX: 'extractionRegex',

            RULES_NEW: 'rules_new',
            EVENTS: 'events',
            RULES_EXISTING: 'rules_existing',

            EXTRACT: 'extract_rules',
            START: 'start_rules',
            STOP: 'stop_rules',

            // Dict of functions that map the rule type and corresponding metadata to a translated label
            EXTRACT_RULES: {
                'any_character_but_following_character': function(metadata) {
                    metadata = metadata || {};

                    var followingCharacterName;

                    if (!_.isUndefined(metadata.followCharName)) {
                        followingCharacterName = convertSpecialCharToString(metadata.followCharName);
                        return _('any character except ').t() + '<i>' + followingCharacterName + '</i>';
                    }
                },
                'number_of_characters': function(metadata) {
                    metadata = metadata || {};

                    var selectedTextLength = metadata.selectedTextLength;

                    if (!_.isUndefined(selectedTextLength)) {
                        return splunkUtils.sprintf(_('%d characters').t(), selectedTextLength);
                    }
                },
                'word_characters_and_contained_irregular_characters': function(metadata) {
                    metadata = metadata || {};

                    var containedUniqueIrregularCharacters;

                    if (!_.isUndefined(metadata.uniqueIrregChars)) {
                        containedUniqueIrregularCharacters = convertSpecialCharToString(metadata.uniqueIrregChars);
                        return _('word characters and ').t() + '<i>' + containedUniqueIrregularCharacters + '</i>';
                    }
                },
                'any_character': function() {
                    return _('any character').t();
                },
                'end_of_string': function() {
                    return _('to end of string').t();
                },
                'letters': function() {
                    return _('letters').t();
                },
                'lowercase_letters': function() {
                    return _('lowercase letters').t();
                },
                'uppercase_letters': function() {
                    return _('uppercase letters').t();
                },
                'word_characters': function() {
                    return _('word characters (numbers, letters, underscore)').t();
                },
                'numbers': function() {
                    return _('numbers').t();
                }
            },

            START_RULES: {
                'nth_character': function(metadata) {
                    metadata = metadata || {};

                    var precedingCharacterCount,
                        precedingCharacterName;

                    if (!_.isUndefined(metadata.preCharCount) && !_.isUndefined(metadata.preCharName)) {
                        precedingCharacterCount = metadata.preCharCount;
                        precedingCharacterName = convertSpecialCharToString(metadata.preCharName);
                        return splunkUtils.sprintf(_('%d ').t(), precedingCharacterCount) + '<i>' + precedingCharacterName + '</i>' +  _(' characters').t();
                    }
                },
                'n_spaces_and_starting_character': function(metadata) {
                    metadata = metadata || {};

                    var precedingSpaceCount,
                        precedingCharacterName;

                    if (!_.isUndefined(metadata.preSpaceCount) && !_.isUndefined(metadata.preChar)) {
                        precedingSpaceCount = metadata.preSpaceCount;
                        precedingCharacterName = convertSpecialCharToString(metadata.preChar);
                        return splunkUtils.sprintf(_('%d spaces and a ').t(), precedingSpaceCount) + '<i>' + precedingCharacterName + '</i>';
                    }
                },
                'irregular_characters': function(metadata) {
                    metadata = metadata || {};

                    var precedingIrregularCharacters;

                    if (!_.isUndefined(metadata.preIrregChars)) {
                        precedingIrregularCharacters = convertSpecialCharToString(metadata.preIrregChars);
                        return _('characters ').t() + '<i>' + precedingIrregularCharacters + '</i>';
                    }
                },
                'n_characters': function(metadata) {
                    metadata = metadata || {};

                    var precedingCharacterCount;

                    if (!_.isUndefined(metadata.preStrLength)) {
                        precedingCharacterCount = metadata.preStrLength;
                        return splunkUtils.sprintf(_('%d characters').t(), precedingCharacterCount);
                    }
                },
                'any_characters': function() {
                    return _('any character').t();
                },
                'n_spaces_and_irregular_characters': function(metadata) {
                    metadata = metadata || {};

                    var precedingSpaceCount,
                        precedingIrregularCharactersAfterSpace;

                    if (!_.isUndefined(metadata.preSpaceCount) && !_.isUndefined(metadata.preIrregCharsAfterSpace)) {
                        precedingSpaceCount = metadata.preSpaceCount;
                        precedingIrregularCharactersAfterSpace = convertSpecialCharToString(metadata.preIrregCharsAfterSpace);
                        return splunkUtils.sprintf(_('%d spaces and characters ').t(), precedingSpaceCount) + '<i>' + precedingIrregularCharactersAfterSpace + '</i>';
                    }
                },
                // Word is alphanumeric vs. String is any set of characters delimited by spaces
                'n_spaces_and_preceding_string': function(metadata) {
                    metadata = metadata || {};

                    var precedingSpaceCount,
                        precedingStringAfterSpace;

                    if (!_.isUndefined(metadata.preSpaceCount) && !_.isUndefined(metadata.preStrAfterSpace)) {
                        precedingSpaceCount = metadata.preSpaceCount;
                        precedingStringAfterSpace = metadata.preStrAfterSpace;
                        return splunkUtils.sprintf(_('%d spaces and string ').t(), precedingSpaceCount) + '<i>' + precedingStringAfterSpace + '</i>';
                    }
                },
                'n_spaces_and_preceding_word': function(metadata) {
                    metadata = metadata || {};

                    var precedingSpaceCount,
                        precedingWord;

                    if (!_.isUndefined(metadata.preSpaceCount) && !_.isUndefined(metadata.preWord)) {
                        precedingSpaceCount = metadata.preSpaceCount;
                        precedingWord = metadata.preWord;
                        return splunkUtils.sprintf(_('%d spaces and word ').t(), precedingSpaceCount) + '<i>' + precedingWord + '</i>';
                    }
                },
                'preceding_word': function(metadata) {
                    metadata = metadata || {};

                    var precedingWord;

                    if (!_.isUndefined(metadata.preWord)) {
                        precedingWord = metadata.preWord;
                        return _('word ').t() + '<i>' + precedingWord + '</i>';
                    }
                },
                'preceding_string': function(metadata) {
                    metadata = metadata || {};

                    var precedingStringAfterSpace;

                    if (!_.isUndefined(metadata.preStrAfterSpace)) {
                        precedingStringAfterSpace = metadata.preStrAfterSpace;
                        return _('string ').t() + '<i>' + precedingStringAfterSpace + '</i>';
                    }
                },
                'n_commas_and_preceding_character': function(metadata) {
                    metadata = metadata || {};

                    var precedingCommaCount,
                        precedingCharacterName;

                    if (!_.isUndefined(metadata.preCommaCount) && !_.isUndefined(metadata.preCharName)) {
                        precedingCommaCount = metadata.preCommaCount;
                        precedingCharacterName = convertSpecialCharToString(metadata.preCharName);
                        return splunkUtils.sprintf(_('%d commas and a ').t(), precedingCommaCount) + '<i>' + precedingCharacterName + '</i>';
                    }
                },
                'start_of_string': function() {
                    return _('beginning of string').t();
                },
                'field_name': function(metadata) {
                    metadata = metadata || {};

                    var precedingFieldNamePlusPrecedingCharacter;

                    if (!_.isUndefined(metadata.preFieldNameAndChar)) {
                        precedingFieldNamePlusPrecedingCharacter = metadata.preFieldNameAndChar;
                        return '<i>' + precedingFieldNamePlusPrecedingCharacter + '</i>';
                    }
                },
                'after_literal': function(metadata) {
                    metadata = metadata || {};

                    var literal;

                    if (!_.isUndefined(metadata.literal)) {
                        literal = metadata.literal;
                        return '<i>' + literal + '</i>';
                    }
                }

            },

            STOP_RULES: {
                'nth_character': function(metadata) {
                    metadata = metadata || {};

                    var stoppingCharacterCount,
                        stoppingCharacterName;

                    if (!_.isUndefined(metadata.stopCharCount) && !_.isUndefined(metadata.stopCharName)) {
                        stoppingCharacterCount = metadata.stopCharCount;
                        stoppingCharacterName = convertSpecialCharToString(metadata.stopCharName);
                        return splunkUtils.sprintf(_('%d ').t(), stoppingCharacterCount) + '<i>' + stoppingCharacterName + '</i>' + _(' characters').t();
                    }
                },
                'stopping_character_and_n_spaces': function(metadata) {
                    metadata = metadata || {};

                    var stoppingCharacter,
                        followingSpaceCount;

                    if (!_.isUndefined(metadata.stopChar) && !_.isUndefined(metadata.followSpaceCount)) {
                        stoppingCharacter = convertSpecialCharToString(metadata.stopChar);
                        followingSpaceCount = metadata.followSpaceCount;
                        return _('character ').t() + '<i>' + stoppingCharacter + '</i>' + splunkUtils.sprintf(_(' and %d spaces').t(), followingSpaceCount);
                    }
                },
                'irregular_characters': function(metadata) {
                    metadata = metadata || {};

                    var followingIrregularCharacters;

                    if (!_.isUndefined(metadata.followIrregChars)) {
                        followingIrregularCharacters = convertSpecialCharToString(metadata.followIrregChars);
                        return _('characters ').t() +  '<i>' + followingIrregularCharacters + '</i>';
                    }
                },
                'n_characters': function(metadata) {
                    metadata = metadata || {};

                    var followingStringLength;

                    if (!_.isUndefined(metadata.followStrLength)) {
                        followingStringLength = metadata.followStrLength;
                        return splunkUtils.sprintf(_('%d characters').t(), followingStringLength);
                    }
                },
                'irregular_characters_and_n_spaces': function(metadata) {
                    metadata = metadata || {};

                    var followingIrregularCharactersAfterSpace,
                        followingSpaceCount;

                    if (!_.isUndefined(metadata.followIrregCharsAfterSpace) && !_.isUndefined(metadata.followSpaceCount)) {
                        followingIrregularCharactersAfterSpace = convertSpecialCharToString(metadata.followIrregCharsAfterSpace);
                        followingSpaceCount = metadata.followSpaceCount;
                        return _('characters ').t() + '<i>' + followingIrregularCharactersAfterSpace + '</i>' + splunkUtils.sprintf(_(' and %d spaces').t(), followingSpaceCount);
                    }
                },
                'following_string_and_n_spaces': function(metadata) {
                    metadata = metadata || {};

                    var followingStringBeforeSpace,
                        followingSpaceCount;

                    if (!_.isUndefined(metadata.followStrBeforeSpace) && !_.isUndefined(metadata.followSpaceCount)) {
                        followingStringBeforeSpace = metadata.followStrBeforeSpace;
                        followingSpaceCount = metadata.followSpaceCount;
                        return _('string ').t() + '<i>' + followingStringBeforeSpace + '</i>' + splunkUtils.sprintf(_(' and %d spaces').t(), followingSpaceCount);
                    }
                },
                'following_word_and_n_spaces': function(metadata) {
                    metadata = metadata || {};

                    var followingWord,
                        followingSpaceCount;

                    if (!_.isUndefined(metadata.followWord) && !_.isUndefined(metadata.followSpaceCount)) {
                        followingWord = metadata.followWord;
                        followingSpaceCount = metadata.followSpaceCount;
                        return _('word ').t() + '<i>' + followingWord + '</i>' + splunkUtils.sprintf(_(' and %d spaces').t(), followingSpaceCount);
                    }
                },
                'following_word': function(metadata) {
                    metadata = metadata || {};

                    var followingWord;

                    if (!_.isUndefined(metadata.followWord)) {
                        followingWord = metadata.followWord;
                        return _('word ').t() + '<i>' + followingWord + '</i>';
                    }
                },
                'following_string': function(metadata) {
                    metadata = metadata || {};

                    var followingString;

                    if (!_.isUndefined(metadata.follStrBeforeSpace)) {
                        followingString = metadata.follStrBeforeSpace;
                        return _('string ').t() + '<i>' + followingString + '</i>';
                    }
                },
                'before_literal': function(metadata) {
                    metadata = metadata || {};

                    var literal;

                    if (!_.isUndefined(metadata.literal)) {
                        literal = metadata.literal;
                        return '<i>' + literal + '</i>';
                    }
                },
                'following_character_and_n_commas': function(metadata) {
                    metadata = metadata || {};

                    var followingCharacterName,
                        followingCommaCount;

                    if (!_.isUndefined(metadata.followCharName) && !_.isUndefined(metadata.followCommaCount)) {
                        followingCharacterName = convertSpecialCharToString(metadata.followCharName);
                        followingCommaCount = metadata.followCommaCount;
                        return _('character ').t() + '<i>' + followingCharacterName + '</i>' + splunkUtils.sprintf(_(' and %d commas').t(), followingCommaCount);
                    }
                },
                'end_of_string': function() {
                    return _('end of string').t();
                },
                'following_characters': function(metadata) {
                    metadata = metadata || {};

                    var followingCharacterName;

                    if (!_.isUndefined(metadata.followChars)) {
                        followingCharacterName = metadata.followChars;
                        return _('characters ').t() + '<i>' + convertSpecialCharToString(followingCharacterName) + '</i>';
                    }
                },
                'any_characters': function() {
                    return _('any character').t();
                }
            },

            initialize: function() {
                RegexGenerator.prototype.initialize.apply(this, arguments);

                this.verifyNecessaryAttributes();
            },

            verifyNecessaryAttributes: function() {
                if (!this.get('isEditing')) {
                    if (!_.has(this.attributes, 'startPosition') || !_.has(this.attributes, 'endPosition') ||
                            !_.has(this.attributes, 'fullText') || !_.has(this.attributes, 'selectedText')) {
                        throw new Error('Missing one or more necessary attributes');
                    }
                }
            },

            // Fetches a list of events that contains the indexes to be used for highlighting the event segments
            // that have been matched by the specified start/extract/stop regex rules.
            fetchMatchedEvents: function(commandModel) {
                var fetchData = {
                    type: this.EVENTS,
                    regex_start: commandModel.get('regExpStarting') || '',
                    regex_extract: commandModel.get('regExpExtraction') || '',
                    regex_stop: commandModel.get('regExpStopping') || '',
                    count: 50
                };
                return this.fetchRegexFunctions(fetchData);
            },

            // Fetches a fresh set of start/extract/stop regex rules for the provided text selection in an event string.
            fetchNewRegexRules: function() {
                var fetchData = {
                    type: this.RULES_NEW,
                    selected_text: this.get('selectedText'),
                    start_position: this.get('startPosition'),
                    end_position: this.get('endPosition'),
                    field_value: this.get('fullText')
                };
                return this.fetchRegexFunctions(fetchData);
            },

            // Fetches start/extract/stop regex rules based on the previously selected start/extract/stop regex rules,
            // to be used when a user comes into the Regex Builder UI to edit a previously created extraction.
            fetchExistingRegexRules: function(commandModel) {
                var fetchData = {
                    type: this.RULES_EXISTING,
                    regex_start: commandModel.get('regExpStarting') || '',
                    regex_extract: commandModel.get('regExpExtraction') || '',
                    regex_stop: commandModel.get('regExpStopping') || ''
                };
                return this.fetchRegexFunctions(fetchData);
            },

            fetchRegexFunctions: function(options) {
                var fetchData = $.extend({}, options, {
                    app: this.get('app'),
                    owner: this.get('owner'),
                    sid: this.get('sid'),
                    field: this.get('fieldName')
                });

                return this.fetch({
                    data: fetchData,
                    type: 'POST'
                });
            },

            getRulesObjects: function(rulesDict, rulesCategory) {
                var fetchedRulesObjects = rulesDict[rulesCategory],
                    parsedRulesObjects = [],
                    rulesMap,
                    label,
                    regex;

                if (rulesCategory === this.START) {
                    rulesMap = this.START_RULES;
                } else if (rulesCategory === this.EXTRACT) {
                    rulesMap = this.EXTRACT_RULES;
                } else if (rulesCategory === this.STOP) {
                    rulesMap = this.STOP_RULES;
                }

                _.each(fetchedRulesObjects, function(ruleObject) {
                    label = this.getRuleLabel(rulesMap, ruleObject);
                    regex = ruleObject.regex;
                    if (!_.isUndefined(label) && !_.isUndefined(regex)) {
                        parsedRulesObjects.push({
                            label: label,
                            regex: regex
                        });
                    }
                }, this);

                return parsedRulesObjects;

            },

            getRuleLabel: function(rulesMap, ruleObject) {
                var getRuleLabelFn = rulesMap[ruleObject.type.label];
                return getRuleLabelFn && getRuleLabelFn(ruleObject.type.metadata);
            },

            validateMatch: function(match) {
                var preHighlightRanges = match['pre_highlight_ranges'], // nested array of [[1,2], [3,4]] format
                    highlightRange =  match['highlight_range'], // non-nested array of [6,8] format
                    postHighlightRanges = match['post_highlight_ranges'], // nested array of [[11,12], [13,14]] format
                    eventString = match['field_value'];

                if (!this.rangeIsValid(highlightRange)) {
                    throw new Error('Invalid highlight range generated.');
                }

                if (!_.isString(eventString)) {
                    throw new Error('Invalid field value generated.');
                }

                _.each(preHighlightRanges, function(preHighlightRange) {
                    if (!this.rangeIsValid(preHighlightRange)) {
                        throw new Error('Invalid pre-highlight range generated.');
                    }
                }, this);

                _.each(postHighlightRanges, function(postHighlightRange) {
                    if (!this.rangeIsValid(postHighlightRange)) {
                        throw new Error('Invalid post-highlight range generated.');
                    }
                }, this);

                return true;
            },

            rangeIsValid: function(array) {
                return array && (array.length === 2) && _.isNumber(array[0]) && _.isNumber(array[1]);
            },

            convertSpecialCharToString: convertSpecialCharToString

        });
    }
);