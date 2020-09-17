/**
 * Created by rtran on 6/13/16.
 */
define([
        'jquery',
        'underscore',
        'backbone',
        'models/managementconsole/documentation/InputAndOutputStrings',
        'splunk.i18n'
    ],
    function($,
             _,
             Backbone,
             DataInputStrings,
             i18n) {
        var UNKNOWN = _('Unknown').t();
        var GROUPS = {
            inputs: 'inputs',
            outputs: 'outputs'
        };


        return Backbone.Model.extend({
            initialize: function(context) {
                Backbone.Model.prototype.initialize.apply(this, arguments);

                this._context = context || this;
                this._stringWrappers = $.extend(true, {}, this.stringWrappers);
                this._dictionary = this.getDictionary();
                if (_.isUndefined(this._dictionary)) {
                    throw new Error('Dictionary is undefined.');
                }
            },

            getStringByType: function(group, field, stringType) {
                if (group === GROUPS.outputs) {
                    return this.getString([group, field, stringType]);
                } else if (group === GROUPS.inputs) {
                    var string = this.getString([group, this._context.getDocumentationType(), field, stringType], this._context);
                    if(!_.isUndefined(string)) {
                        return string;
                    } else {
                        string = this.getString(['_shared', field, stringType], this._context);
                        if(!_.isUndefined(string)) {
                            return string;
                        } else {
                            return UNKNOWN;
                        }
                    }
                } else {
                    throw Error('Group:' + group + ' is not defined');
                }
            },

            getLabel: function(group, field) {
                return this.getStringByType(group, field, 'label');
            },

            getTooltip: function(group, field) {
                return this.getStringByType(group, field, 'tooltip');
            },

            getHelpText: function(group, field) {
                return this.getStringByType(group, field, 'help');
            },

            getPlaceholder: function(group, field) {
                return this.getStringByType(group, field, 'placeholder');
            },

            /**
             * Iteratively applies the list of fields to the documentation label object.
             * e.g. obj = {
             *  level1: {
             *      level2: {
             *          level3: 'test string'
             *      }
             *  }
             * }
             *
             * getString(['level1', 'level2', 'level3']) -> 'test string'
             * getString(['level1', 'level2']) -> {level3: 'test string'}
             * getString(['level1', 'level2', 'level3', 'level4']) -> undefined
             *
             * @param fields - array of properties to access
             * @param context(optional) - if provided, will call function with passed context
             * @returns string or object based on passed fields
             */
            getString: function(fields, context) {
                context = context || this;
                var fn = this.lookupObject(fields, this._stringWrappers);
                // if a function is declared for the field -> call the function
                if (!_.isUndefined(fn)) {
                    return fn.call(context);

                    // else -> retrieve the string from the dictionary
                } else {
                    return this.lookupObject(fields, this._dictionary);
                }
            },

            /**
             * Iteratively applies the list of fields on the passed map object and
             * returns the value or undefined if the fields chain leads to some undefined value
             * @param fields - array of properties to access
             * @param map - dictionary that list of fields will acesss
             * @returns string or function depending on map passed
             */
            lookupObject: function(fields, map) {
                var val = $.extend(true, {}, map);
                _.each(fields, function(field) {
                    if (_.isUndefined(val)) return;
                    val = val[field];
                });

                return val;
            },

            getDictionary: function() {
                return DataInputStrings;
            },

            /**
             * Sub-models can override this object if they need to provide additional
             * logic or wrapping before the documentation label can be returned
             * e.g.
             * stringWrappers: {
             *      name: {
             *          // determine plurality for label
             *          label: function() {
             *              var names = this.model.entry.get('names');
             *
             *              if (!_.isUndefined(names) {
             *                  return names.length > 1 ? _('Names').t() : _('Name').t();
             *              } else {
             *                  return _('Names').t();
             *          }
         *          }
             * }
             */
            stringWrappers: {
                inputs: {
                    wineventlog: {
                        name: {
                            label: function() {
                                var names = this.entry.get('name');
                                return i18n.ungettext('Name', 'Names', names ? names.length : 1);
                            }
                        }
                    }
                }
            }
        });
    }
);