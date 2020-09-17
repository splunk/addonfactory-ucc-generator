/**
 * A controller to simplify the process of generating a extraction regex based on examples and counter examples.
 */

define([
            'jquery',
            'underscore',
            'controllers/Base',
            'models/services/field_extractor/RegexGenerator'
        ],
        function(
            $,
            _,
            BaseController,
            RegexGenerator
        ) {

    return BaseController.extend({

        /**
         * @constructor
         *
         * @param options {Object} {
         *     model: {
         *         searchJob <models.search.Job> the job to use for sample events
         *         application <models.shared.Application>
         *         state {Model} a model with the current state of the extraction operation
         *     }
         * }
         */

        initialize: function() {
            this.model.regexGenerator = new RegexGenerator();
            this.masterEvent = null;
            this.examples = [];
            this.sampleEvents = [];
            this.counterExamples = [];
            this.requiredText = null;
        },

        setMasterEvent: function(rawText) {
            this.reset();
            this.masterEvent = rawText;
        },

        addRequiredText: function(requiredText) {
            this.requiredText = requiredText;
            return this._fetchNewRegexes();
        },

        removeRequiredText: function() {
            this.requiredText = null;
            return this._fetchNewRegexes();
        },

        /**
         * Call this method to add a new extraction example.  Returns a promise that will be resolved with an
         * updated list of regexes.
         *
         * @param fieldName
         * @param startIndex
         * @param endIndex
         * @returns Promise
         */
        addExample: function(exampleConfig) {
            this.examples.push(exampleConfig);
            return this._fetchNewRegexes();
        },

        removeExample: function(fieldName) {
            this.examples = _(this.examples).filter(function(example){
                return example.fieldName !== fieldName;
            }, this);
            this.counterExamples = _(this.counterExamples).filter(function(example){
                return example.fieldName !== fieldName;
            }, this);
            _(this.sampleEvents).each(function(sampleList) {
                sampleList.extractions = _(sampleList.extractions).filter(function(extraction) {
                    return extraction.fieldName !== fieldName;
                });
            });
            return this._fetchNewRegexes();
        },

        renameExample: function(oldFieldName, newFieldName) {
            _(this.examples).each(function(example){
                if(example.fieldName === oldFieldName){
                    example.fieldName = newFieldName;
                }
            }, this);
            _(this.counterExamples).each(function(counterExample){
                if(counterExample.fieldName === oldFieldName){
                    counterExample.fieldName = newFieldName;
                }
            }, this);
            _(this.sampleEvents).each(function(sampleList) {
                _(sampleList.extractions).each(function(extraction) {
                    if(extraction.fieldName === oldFieldName){
                        extraction.fieldName = newFieldName;
                    }
                });
            });
            return this._fetchNewRegexes();
        },

        addSampleEvent: function(eventText) {
            this.sampleEvents.push({
                rawText: eventText,
                extractions: []
            });
        },

        removeSampleEvent: function(index) {
            var sample = this.sampleEvents[index];
            this.sampleEvents.splice(index, 1);
            if(sample.extractions.length === 0) {
                return $.Deferred().resolve(this.model.regexGenerator.get('rules'));
            }
            return this._fetchNewRegexes();
        },

        addSampleExtraction: function(exampleConfig, index) {
            var sample = this.sampleEvents[index],
                extractions = _(sample.extractions).filter(function(extraction) {
                    return exampleConfig.fieldName !== extraction.fieldName;
                });

            extractions.push(exampleConfig);
            sample.extractions = extractions;
            return this._fetchNewRegexes();
        },

        removeSampleExtraction: function(fieldName, index) {
            var sample = this.sampleEvents[index],
                extractions = _(sample.extractions).filter(function(extraction) {
                    return fieldName !== extraction.fieldName;
                });

            sample.extractions = extractions;
            return this._fetchNewRegexes();
        },

        /**
         * Call this method to add a new extraction example.  Returns a promise that will be resolved with an
         * updated list of regexes.
         *
         * @param rawText
         * @param fieldName
         * @param startIndex
         * @param endIndex
         * @returns Promise
         */
        addCounterExample: function(counterExampleConfig) {
            this.counterExamples.push(counterExampleConfig);
            return this._fetchNewRegexes();
        },

        removeCounterExample: function(index) {
            this.counterExamples.splice(index, 1);
            return this._fetchNewRegexes();
        },

        /**
         * Returns the most recently fetched regexes, or an empty array if none have been fetched yet.
         */
        getCurrentRegex: function() {
            var rules = this.model.regexGenerator.get('rules');
            if(!rules) {
                return '';
            }
            return rules[0] || '';
        },

        getRegexGeneratorModel: function() {
            return this.model.regexGenerator;
        },

        getCurrentExamples: function() {
            return $.extend(true, [], this.examples);
        },

        getCurrentSampleEvents: function() {
            return $.extend(true, [], this.sampleEvents);
        },

        getCurrentCounterExamples: function() {
            return $.extend(true, [], this.counterExamples);
        },

        getCurrentRequiredText: function() {
            return this.requiredText;
        },

        getCurrentMasterEvent: function() {
            return this.masterEvent;
        },

        /**
         * Resets the controller to its initial state.
         */
        reset: function() {
            this.masterEvent = null;
            this.examples = [];
            this.sampleEvents = [];
            this.counterExamples = [];
            this.requiredText = null;
            this.model.regexGenerator.clear();
        },

        _addToExampleList: function(list, rawText, fieldName, startIndex, endIndex) {
            var matchingExample = _(list).findWhere({ _rawtext: rawText });
            if(matchingExample) {
                matchingExample[fieldName] = [startIndex, endIndex];
            }
            else {
                var newExample = { _rawtext: rawText };
                newExample[fieldName] = [startIndex, endIndex];
                list.push(newExample);
            }
        },

        _fetchNewRegexes: function() {
            if(this.examples.length === 0) {
                var resolvedRegex = this.requiredText ? [this.requiredText] : [''];
                this.model.regexGenerator.set('rules', resolvedRegex);
                return $.Deferred().resolve(resolvedRegex);
            }
            var fetchExamples = [ { _rawtext: this.masterEvent }],
                fetchCounterExamples = [];

            _(this.examples).each(function(example) {
                fetchExamples[0][example.fieldName] = [example.startIndex, example.endIndex];
            });
            _(this.sampleEvents).each(function(sample) {
                if(sample.extractions.length === 0 ) {
                    return;
                }
                var example = { _rawtext: sample.rawText };
                _(sample.extractions).each(function(extraction) {
                    example[extraction.fieldName] = [extraction.startIndex, extraction.endIndex];
                });
                fetchExamples.push(example);
            });
            _(this.counterExamples).each(function(counterExample) {
                this._addToExampleList(
                    fetchCounterExamples,
                    counterExample.rawText,
                    counterExample.fieldName,
                    counterExample.startIndex,
                    counterExample.endIndex
                );
            }, this);

            var fetchData = {
                app: this.model.application.get('app'),
                owner: this.model.application.get('owner'),
                field: this.model.state.get('inputField'),
                sid: this.model.searchJob.id,
                filter: this.requiredText,
                examples: JSON.stringify(fetchExamples),
                counter_examples: fetchCounterExamples.length > 0 ? JSON.stringify(fetchCounterExamples) : undefined
            };

            return this.model.regexGenerator.fetch({ data: fetchData }).then(
                _(function() {
                    // We are imposing some validation that the endpoint has not yet implemented.
                    // If we don't get back exactly one regex, simulate a server error and reject the promise.
                    var rules = this.model.regexGenerator.get('rules');
                    if(!_(rules).isArray() || rules.length !== 1 || !rules[0]) {
                        return this._respondWithRegexError('Endpoint did not return exactly one regex');
                    }
                    this.model.regexGenerator.trigger('serverValidated', false, this);
                    return rules;
                }).bind(this),
                _(this._respondWithRegexError).bind(this)
            );
        },

        _respondWithRegexError: function(errorMessage) {
            return $.Deferred().reject(errorMessage);
        }

    });

});