/*
 * The model is used as the backing for any views that allow a user to edit a visualization.
 *
 * This model is not intended to be instantiated directly, instead the fromReportContentAndSchema factory
 * method should be used.
 */

define(
    [
        'jquery',
        'underscore',
        'util/math_utils',
        'models/Base',
        'views/shared/controls/BooleanRadioControl',
        'views/shared/controls/PercentTextControl',
        'util/general_utils',
        'util/validation',
        'splunk.util'
    ],
    function(
        $,
        _,
        math_utils,
        BaseModel,
        BooleanRadioControl,
        PercentTextControl,
        general_utils,
        validation_utils,
        splunk_util
    ) {

        var parseValidationFromFormElements = function(formElements) {
            var validation = {};

            var addValidationRule = function(name, rule) {
                validation[name] = (validation[name] || []).concat(rule);
            };

            _(formElements).each(function(formElement) {
                if (formElement.controlOptions && formElement.controlOptions.items) {
                    addValidationRule(formElement.name, {
                        oneOf: _(formElement.controlOptions.items).pluck('value'),
                        required: true
                    });
                } else if (formElement.control && formElement.control === BooleanRadioControl) {
                    addValidationRule(formElement.name, {
                        fn: createBooleanValidator(formElement.label),
                        required: true
                    });
                } else if (formElement.control && formElement.control === PercentTextControl) {
                    addValidationRule(formElement.name, {
                        pattern: 'number',
                        required: true,
                        min: 0,
                        max: 1,
                        msg: splunk_util.sprintf(
                            _('%s must be between 0 and 100%').t(),
                            formElement.label
                        )
                    });
                }
                if (formElement.validation) {
                    addValidationRule(formElement.name, formElement.validation);
                }
            });
            return validation;
        };

        var createBooleanValidator = function(displayName) {
            return function(value) {
                if(!general_utils.isBooleanEquivalent(value)) {
                    return splunk_util.sprintf(
                        _('%s must be a valid boolean value.').t(),
                        displayName
                    );
                }
            };
        };

        var parseDefaultsFromFormElements = function(formElements) {
            var defaults = {};
            _(formElements).each(function(formElement) {
                if (formElement.defaultValue) {
                    defaults[formElement.name] = formElement.defaultValue;
                }
            });
            return defaults;
        };

        var Visualization = BaseModel.extend({
                
            initialize: function() {
                BaseModel.prototype.initialize.apply(this, arguments);

                // SPL-77030, if a line chart is set to log scale on the y-axis, clear any stack mode
                this.on('change:display.visualizations.charting.axisY.scale', function() {
                    if(this.get('display.visualizations.charting.chart') === 'line'
                                && this.get('display.visualizations.charting.axisY.scale') === 'log') {
                        this.set({ 'display.visualizations.charting.chart.stackMode': 'default' });
                    }
                }, this);

                // SPL-77499, if all overlay fields are removed, disable the second y-axis
                this.on('change:display.visualizations.charting.chart.overlayFields', function() {
                    if(!this.get('display.visualizations.charting.chart.overlayFields')) {
                        this.set({ 'display.visualizations.charting.axisY2.enabled': '0' });
                    }
                });
                // Keep the list/raw drilldown modes in sync
                this.on('change:display.events.list.drilldown', function() {
                    if (this.get('display.events.type') === 'list') {
                        this.set('display.events.raw.drilldown', this.get('display.events.list.drilldown'));
                    }
                });
                this.on('change:display.events.raw.drilldown', function() {
                    if (this.get('display.events.type') === 'raw') {
                        this.set('display.events.list.drilldown', this.get('display.events.raw.drilldown'));
                    }
                });
                this.on('change:display.events.type', function() {
                    var displayType = this.get('display.events.type');
                    if (displayType === 'list') {
                        this.set('display.events.raw.drilldown', this.get('display.events.list.drilldown'));
                    } else if (displayType === 'raw') {
                        this.set('display.events.list.drilldown', this.get('display.events.raw.drilldown'));
                    }
                });
                // Keep the list/table wrap modes in sync
                this.on('change:display.events.list.wrap', function() {
                    if (this.get('display.events.type') === 'list') {
                        this.set('display.events.table.wrap', this.get('display.events.list.wrap'));
                    }
                });
                this.on('change:display.events.table.wrap', function() {
                    if (this.get('display.events.type') === 'table') {
                        this.set('display.events.list.wrap', this.get('display.events.table.wrap'));
                    }
                });
                this.on('change:display.events.type', function() {
                    var displayType = this.get('display.events.type');
                    if (displayType === 'list') {
                        this.set('display.events.table.wrap', this.get('display.events.list.wrap'));
                    } else if (displayType === 'table') {
                        this.set('display.events.list.wrap', this.get('display.events.table.wrap'));
                    }
                });

                // The Single Value viz editor needs to know if the before label or after label were just
                // cleared by the user.
                this.on('change:display.visualizations.singlevalue.beforeLabel', function(model, newValue) {
                    if (!newValue && !!model.previous('display.visualizations.singlevalue.beforeLabel')) {
                        this.set({ singleValueBeforeAfterLabelJustCleared: true });
                    }
                });
                this.on('change:display.visualizations.singlevalue.afterLabel', function(model, newValue) {
                    if (!newValue && !!model.previous('display.visualizations.singlevalue.afterLabel')) {
                        this.set({ singleValueBeforeAfterLabelJustCleared: true });
                    }
                });
            },

            attrToArray: function(attr) {
                return validation_utils.parseStringifiedArray(this.get(attr));
            },

            rangesValuesToArray: function(attrName) {
                return this.attrToArray(attrName);
            },

            deserializeColorArray: function(attrName) {
                return validation_utils.parseStringifiedColorArray(this.get(attrName));
            },

            // use auto mode only if ranges and colors are both not defined
            gaugeIsInAutoMode: function() {
                return !this.get('display.visualizations.charting.chart.rangeValues') && !this.get('display.visualizations.charting.gaugeColors');
            }
        },
        {
            /**
             *
             * This factory method is the implementation of the model attribute aspects of
             * https://confluence.splunk.com/display/PROD/Internal+Mod+Viz+ERD#InternalModVizERD-VisualizationEditorSchema.
             * The schema will be used to create an instance of the Visualization model with dynamically
             * generated default values and validation rules.
             *
             * @param reportContent, the content model of the report
             * @param schema, the active viz editor schema (see the link above)
             * @returns {Visualization}
             */
            fromReportContentAndSchema: function(reportContent, schema) {
                var vizModel = new Visualization();

                if (_.isObject(schema)) {
                    var formElements = _(schema).chain().pluck('formElements').flatten().value();

                    vizModel.validation = parseValidationFromFormElements(formElements);
                    vizModel.set(parseDefaultsFromFormElements(formElements));
                }

                var toSetOnViz = $.extend({}, reportContent.toJSON());
                // SPL-76456, pre-filter out any invalid gauge range values from the incoming attributes
                // this will be consistent with the renderer which uses the valid values even if some are invalid
                var validRanges = validation_utils.filterToValidRangeValues(toSetOnViz['display.visualizations.charting.chart.rangeValues']);
                toSetOnViz['display.visualizations.charting.chart.rangeValues'] = validRanges.length > 0 ? JSON.stringify(validRanges) : '';
                // SPL-80495, also pre-validate the gauge color values
                var validColors = validation_utils.parseStringifiedColorArray(toSetOnViz['display.visualizations.charting.gaugeColors']);
                toSetOnViz['display.visualizations.charting.gaugeColors'] = (validColors && validColors.length > 0) ? JSON.stringify(validColors) : '';

                // Transfer the incoming viz settings from the report to the viz model, but ignore any settings that would
                // put the viz model in an invalid state:
                //
                // 1) clone the viz model with all defaults and validation rules
                // 2) set ALL incoming settings on the clone
                // 3) iterate over all settings and create a list of keys that resulted in invalid values
                // 4) set the incoming settings on the real viz model, EXCEPT the invalid keys computed above
                //
                // This approach ensures a correct handling for validation rules that are a computation based on two different
                // attributes (e.g. a min and max value for a range where the min must be less than the max).
                var clone = vizModel.clone();
                clone.validation = vizModel.validation;
                clone.set(toSetOnViz);
                var invalidKeys = [];
                _(toSetOnViz).each(function(value, key) {
                    if (!clone.isValid(key)) {
                        invalidKeys.push(key);
                    }
                }, this);
                vizModel.set(_(toSetOnViz).omit(invalidKeys));

                // Have to break encapsulation here since the mod viz system doesn't accommodate what we need to do...
                // Single value colorBy="trend" only makes sense when it's in time series mode (SPL-102095).
                if (!vizModel.get('is_timeseries') && vizModel.get('display.visualizations.singlevalue.colorBy') === 'trend') {
                    vizModel.set({ 'display.visualizations.singlevalue.colorBy': 'value' });
                }
                // Also, reset the singleValueBeforeAfterLabelJustCleared flag since this is a transient attribute.
                vizModel.set({ singleValueBeforeAfterLabelJustCleared: false });

                return vizModel;
            }

        });

        return Visualization;
    }
);
