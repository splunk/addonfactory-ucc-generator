define([
    'jquery',
    'underscore',
    'models/url',
    'splunkjs/mvc',
    'util/general_utils',
    'splunkjs/mvc/sharedmodels'
], function($,
            _,
            UrlModel,
            mvc,
            GeneralUtils,
            SharedModels) {

    var REGISTRY = mvc.Components;

    var GLOBAL_TOKENS = {
        'default': REGISTRY.getInstance('default', {create: true}),
        'submitted': REGISTRY.getInstance('submitted', {create: true}),
        'url': UrlModel
    };

    var timeRangeIsDefault = true;

    return {
        bootstrapTokenModels: _.once(function() {
            if (!REGISTRY.hasInstance('url')) {
                REGISTRY.registerInstance('url', GLOBAL_TOKENS['url'], {replace: true});
            }

            // Initialize time tokens to default
            if (!GLOBAL_TOKENS['default'].has('earliest') && !GLOBAL_TOKENS['default'].has('latest')) {
                GLOBAL_TOKENS['default'].set({earliest: '0', latest: ''});
            }
            this._updateFromUrl(GLOBAL_TOKENS['default']);
        }),
        handleValueChange: function(input) {
            var settings = input.vizSettings;
            var inputType = settings.get('type');
            var token = settings.get('token');
            if (inputType === 'time') {
                if (timeRangeIsDefault && !token) {
                    timeRangeIsDefault = false;
                    // Apply the default of the time range picker as the global time range since we're still using the default
                    var inputDefault = settings.get("default");
                    var inputPresetName = settings.get("preset");
                    if (inputDefault) {
                        input.val(inputDefault);
                    } else if (inputPresetName) {
                        var timesCollection = SharedModels.get('times');
                        var preset = timesCollection.find(function(model) { return model.entry.content.get('label') == inputPresetName; });
                        if (preset) {
                            input.val({
                                earliest_time: preset.entry.content.get('earliest_time'),
                                latest_time: preset.entry.content.get('latest_time')
                            });
                        }
                    }
                }
                if (!settings.get('value')) {
                    var defaultValue = settings.get("default");
                    var presetValue = settings.get("preset");
                    if (defaultValue) {
                        input.val(defaultValue);
                    } else if (presetValue) {
                        // Synchronize the displayed preset and the actual set value.
                        input.getInputView() && input.getInputView()._onTimePresetUpdate();
                    } else {
                        settings.set('value', {earliest_time: '', latest_time: ''});
                    }
                    return;
                }
                var value = input.val();
                var tokens = {};
                if (token) {
                    tokens[token + '.earliest'] = value['earliest_time'] || '';
                    tokens[token + '.latest'] = value['latest_time'] || '';
                }
                else {
                    // default tokens for time input
                    tokens['earliest'] = value['earliest_time'] || '';
                    tokens['latest'] = value['latest_time'] || '';
                }
                GLOBAL_TOKENS['default'].set(tokens);
            } else {
                if (!input.hasValue()) {
                    input.defaultUpdate = true;
                    input.val(settings.get('default'));
                    return;
                }

                var newValue = input.val();

                if (newValue === undefined) {
                    GLOBAL_TOKENS['default'].set(token, newValue);
                    input.defaultUpdate = false;
                    this._handleAutoSubmit(input);
                    return;
                }

                if (input.settings.get('multiValue')) {
                    if (newValue === null || newValue.length === 0) {
                        GLOBAL_TOKENS['default'].set(token, undefined);
                        input.defaultUpdate = false;
                        this._handleAutoSubmit(input);
                        return;
                    }
                    var valuePrefix = settings.has('valuePrefix') ? settings.get('valuePrefix') : '';
                    var valueSuffix = settings.has('valueSuffix') ? settings.get('valueSuffix') : '';
                    var delimiter = settings.has('delimiter') ? settings.get('delimiter') : ' ';
                    newValue = _(newValue).map(function(v) { return valuePrefix + v + valueSuffix; }).join(delimiter);
                }

                var newComputedValue = "";
                if (newValue) {
                    var prefixValue = settings.get('prefix');
                    if (prefixValue) {
                        newComputedValue += prefixValue;
                    }
                    newComputedValue += newValue;
                    var suffixValue = settings.get('suffix');
                    if (suffixValue) {
                        newComputedValue += suffixValue;
                    }
                }
                GLOBAL_TOKENS['default'].set(token, newComputedValue);
            }

            this._handleAutoSubmit(input);
        },
        _handleAutoSubmit: function(input) {
            if (this._shouldAutoSubmit(input)) {
                // submit the token only if it wasn't from setting the default
                if (!this.isFormReady() && input.defaultUpdate) {
                    input.defaultUpdate = false;
                } else {
                    this.submitForm();
                }
            }
        },
        submitForm: _.debounce(function(options) {
            if (!this.isFormReady()) {
                this.onFormReady().then(_.bind(this.submitForm, this, {replaceState: true}));
                return;
            }
            options || (options = {});
            //copy tokens from default namespace to submitted name space
            GLOBAL_TOKENS.submitted.set(GLOBAL_TOKENS['default'].toJSON());
            this._updateToUrl(GLOBAL_TOKENS.submitted, options);
        }),
        _updateToUrl: function(tokenModel, options) {
            if (GLOBAL_TOKENS.url) {
                //only update form tokens
                GLOBAL_TOKENS.url.save(this._filterFormTokens(tokenModel), options);
            }
        },
        _updateFromUrl: function(tokenModel, options) {
            if (GLOBAL_TOKENS.url) {
                var urlTokens = GLOBAL_TOKENS.url.toJSON();
                if (urlTokens.earliest === undefined && urlTokens.latest === undefined) {
                    _.extend(urlTokens, {earliest: '0', latest: ''});
                } else {
                    timeRangeIsDefault = false;
                }
                tokenModel.set(urlTokens, options);
            }
        },
        _filterFormTokens: function(tokenModel) {
            var filter = ["^form\.*", "^earliest$", "^latest$"];
            var filtered = GeneralUtils.filterObjectByRegexes(tokenModel.toJSON(), filter, {
                allowEmpty: true,
                allowObject: true
            });
            if (String(filtered.earliest) === '0' && filtered.latest === '') {
                filtered.earliest = undefined;
                filtered.latest = undefined;
            }
            return filtered;
        },
        onFormReady: function() {
            var dfd = $.Deferred();
            var inputs = this._getInputs();
            if (inputs.length > 0) {
                var promises = _(inputs).invoke('onInputReady');
                $.when.apply($, promises).always(dfd.resolve);
            } else {
                dfd.resolve();
            }
            return dfd.promise();
        },
        isFormReady: function() {
            return this.onFormReady().state() == 'resolved';
        },
        hasSubmitButton: function() {
            return $('.form-submit').length > 0;
        },
        hasUrlTokens: function() {
            return !_.isEmpty(GLOBAL_TOKENS['url'].toJSON());
        },
        _getInputs: function() {
            return _($('.input')).chain()
                .map(function(el) {
                    return $(el).attr('id');
                })
                .map(_.bind(REGISTRY.get, REGISTRY))
                .filter(_.identity)
                .value();
        },
        /**
         * submit when
         * searchWhenChanged == true or
         * no submit button and no searchWhenChanged defined
         * @param input
         * @returns {boolean}
         * @private
         */
        _shouldAutoSubmit: function(input) {
            var settings = input.vizSettings;
            return settings.get('searchWhenChanged') === true ||
                (settings.get('searchWhenChanged') == null && !this.hasSubmitButton());
        }
    };
});
