define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var Settings = require('../settings');
    var DashboardController = require('../simplexml/controller');

    var InputSettings = Settings.extend({
        validation: {
            'token': {
                fn: 'validateToken'
            },
            'labelField': {
                fn: 'validateLabelAndValueFields'
            },
            'valueField': {
                fn: 'validateLabelAndValueFields'
            },
            'choices': {
                fn: 'validateChoices'
            }
        },
        validateToken: function(val, attr){
            if (!val && this.get('type') !== 'time') {
                return _('Token is required').t();
            }
        },
        validateLabelAndValueFields: function(val, attr, options){
            var type = (this.get('type') !== 'time' && this.get('type') !== 'text'),
                isEmpty;

            if (options.searchType == 'inline') {
                isEmpty = !options.search;
            } else {
                isEmpty = false;
            }

            if (type && !val && !isEmpty) {
                return _('Field For Label and Value are required for search').t();
            }
        },
        validateChoices: function(val, attr, options) {
            var type = (this.get('type') !== 'time' && this.get('type') !== 'text');

            if (type && options.choices && options.choices.length > 0) {
                var isMissingName = false;
                var hasDupes = false;
                var dupesMap = {};

                _.each(options.choices, function(choice) {
                    if (choice.value) {
                        if (!choice.label) {
                            isMissingName = true;
                        }
                        if (_.has(dupesMap, choice.value)) {
                            hasDupes = true;
                        }
                        dupesMap[choice.value] = true;
                    }
                });

                if (isMissingName) {
                    return _('Static option values must have a name attributed to them').t();
                } else if (hasDupes) {
                    return _('Static option values must be unique').t();
                }
            }
        },
        save: function(key, val, options) {
            // pulled from backbone
            var attrs, method, xhr, attributes = this.attributes;

            // Handle both `"key", value` and `{key: value}` -style arguments.
            if (key == null || typeof key === 'object') {
              attrs = key;
              options = val;
            } else {
              (attrs = {})[key] = val;
            }

            options = _.extend({validate: true}, options);

            // If we're not waiting and attributes exist, save acts as
            // `set(attr).save(null, opts)` with validation. Otherwise, check if
            // the model will be valid when the attributes, if any, are set.
            if (attrs && !options.wait) {
              if (!this.set(attrs, options)) return false;
            } else {
              if (!this._validate(attrs, options)) return false;
            }

            // save the xml
            return DashboardController.model.view.updateInput(this);
        },
        destroy: function(){
            var dfd = $.Deferred();
            var that = this;
            DashboardController.model.view.deleteInput(that.get('id')).done(function(){
                dfd.resolve();
                that.trigger('removeInput');
            }).fail(function(err){
                dfd.reject(err);
            });
            return dfd.promise();
        }
    });

    return InputSettings;
});
