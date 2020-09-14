define(function(require, exports, module) {
    var _ = require('underscore');
    var $ = require('jquery');
    var mvc = require('splunkjs/mvc');
    var Dashboard = require('splunkjs/mvc/simplexml/controller');

    var registeredInputTypes = {};

    var FormUtils = {

        /**
         * Submit the form data, placing tokens from the "default" token namespace into the "submitted" token
         * namespace, as well as copying all form.* tokens (including earliest and latest) from "default" to the
         * "url" namespace.
         *
         * @param options {Object} - {
         *      replaceState {Boolean} - use replaceState when updating the URL model (prevent it from adding an entry
         *                               to the browser history). Default is false.
         * }
         */
        submitForm: _.debounce(function(options) {
            if (!FormUtils.isFormReady()) {
                FormUtils.onFormReady().then(_.bind(FormUtils.submitForm, FormUtils, {replaceState: true}));
                return;
            }
            options || (options = {});
            // submit the form
            var defaultTokenModel = mvc.Components.getInstance("default", { create: true });
            var submittedTokenModel = mvc.Components.getInstance('submitted');
            if (submittedTokenModel) {
                submittedTokenModel.set(defaultTokenModel.toJSON());
            }
            var urlTokenModel = mvc.Components.getInstance('url');
            if (urlTokenModel) {
                urlTokenModel.saveOnlyWithPrefix('form\\.', defaultTokenModel.toJSON(), {
                    replaceState: options.replaceState
                });
            }
        }),

        /**
         * Handle the change of an input value, compute and store a new token value by considering prefix, suffix, the
         * default value and options for combining values of multi-value inputs (valuePrefix, -Suffix and delimiter)
         *
         * @param input - the input component (a subclass of splunkjs/mvc/simpleform/input/base)
         */
        handleValueChange: function(input) {
            var settings = input.vizSettings;
            var inputType = settings.get('type');
            var defaultTokenModel = mvc.Components.getInstance("default", {create: true});
            var inputTypeSettings = FormUtils.getInputTypeSettings(inputType);
            var token = settings.get('token');

            if (inputType === 'time') {
                if (!settings.get('value')) {
                    var defaultValue = settings.get("default");
                    var presetValue = settings.get("preset");
                    if (defaultValue) {
                        input.val(defaultValue);
                    } else if (presetValue) {
                        // Synchronize the displayed preset and the actual set value.
                        input.visualization._onTimePresetUpdate();
                    } else {
                        settings.set('value', { earliest_time: '', latest_time: '' });
                    }
                    return;
                }
                if (token) {
                    var value = input.val();
                    var tokens = {};
                    tokens[token + '.earliest'] = value['earliest_time'] || '';
                    tokens[token + '.latest'] = value['latest_time'] || '';
                    defaultTokenModel.set(tokens);
                }
            } else {
                if (!input.hasValue()) {
                    input.defaultUpdate = true;
                    input.val(settings.get('default'));
                    return;
                }

                var newValue = input.val();

                if (newValue === undefined) {
                    defaultTokenModel.set(token, newValue);
                    input.defaultUpdate = false;
                    FormUtils._handleAutoSubmit(input);
                    return;
                }

                if (inputTypeSettings.multiValue) {
                    if (newValue === null || newValue.length === 0) {
                        defaultTokenModel.set(token, undefined);
                        input.defaultUpdate = false;
                        FormUtils._handleAutoSubmit(input);
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
                defaultTokenModel.set(token, newComputedValue);
            }

            FormUtils._handleAutoSubmit(input);
        },

        _handleAutoSubmit: function(input, options) {
            var settings = input.vizSettings;
            var autoSubmitEnabled = settings.get('searchWhenChanged') === true ||
                (settings.get('searchWhenChanged') == null && !mvc.Components.get('submit'));

            if (autoSubmitEnabled) {
                // submit the token only if it wasn't from setting the default
                if (!FormUtils.isFormReady() && input.defaultUpdate) {
                    input.defaultUpdate = false;
                } else {
                    FormUtils.submitForm();
                }
            }
        },

        getInputType: function(type) {
            var obj = registeredInputTypes[type];
            if (!obj) {
                throw new Error('Unkonwn input type: ' + type);
            }
            return obj.clazz;
        },

        getInputTypeSettings: function(type) {
            var obj = registeredInputTypes[type];
            if (!obj) {
                throw new Error('Unkonwn input type: ' + type);
            }
            return obj.settings;
        },

        registerInputType: function(name, clazz, settings) {
            registeredInputTypes[name] = {
                clazz: clazz,
                settings: settings
            };
        },

        isInputTypeRegistered: function(name) {
            return _.has(registeredInputTypes, name);
        },

        /**
         * Returns a promise for when the form is ready (all inputs have loaded all information necessary for their
         * initial state)
         *
         * @returns {*} a promise for when the form is ready
         */
        onFormReady: _.once(function() {
            var dfd = $.Deferred();
            Dashboard.onReady(function() {
                var inputs = FormUtils.getFormInputs();
                if (inputs.length > 0) {
                    var promises = _(inputs).invoke('_onReady');
                    $.when.apply($, promises).always(dfd.resolve);
                } else {
                    dfd.resolve();
                }
            });
            return dfd.promise();
        }),

        /**
         * Check is the form is ready (all inputs have loaded the data necessary for computing the initial value).
         *
         * @returns {boolean} true if form is ready, otherwise false
         */
        isFormReady: function() {
            return FormUtils.onFormReady().state() === 'resolved';
        },

        /**
         * Check if the given argument is a dashboard form input.
         *
         * @param component the component instance to check
         * @returns {boolean} true if it's a form input, otherwise false
         */
        isFormInput: function(component) {
            return component && component._isDashboardInput;
        },

        /**
         * Fetch all currently registered form input instances.
         *
         * @returns {Array} an array containing all form input instances
         */
        getFormInputs: function() {
            return _(mvc.Components.toJSON()).filter(FormUtils.isFormInput);
        }
    };

    return FormUtils;
});
