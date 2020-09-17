// Windows Event Log model input
// @author: rtran
define([
    'jquery',
    'underscore',
    'backbone',
    'models/managementconsole/inputs/Base',
    'views/managementconsole/utils/string_utils'
], function (
    $,
    _,
    Backbone,
    InputsBaseModel,
    string_utils
) {
    var additionalValueDecorators  = {
        name: function() {
            var name = this.entry.get('name');
            if (_.isUndefined(name)) {
                return InputsBaseModel.STRINGS.NOT_SET;
            }

            if(_.isArray(name)) {
                return string_utils.formatList(name);
            }

            return name;
        }
    },
    logTypes = ['Application', 'Forwarded Events', 'Security', 'Setup', 'System'];

    var currentStep = 0;
    var STANZA_NAME_PREFIX = 'WinEventLog://';

    var InputModel = InputsBaseModel.extend({
        url: '/wineventlog',

        initialize: function() {
            InputsBaseModel.prototype.initialize.apply(this, arguments);
            this.valueDecorators = $.extend(true, {}, this.valueDecorators, additionalValueDecorators);

            this._documentationType = 'wineventlog';
        },

        getStanzaName: function() {
            return STANZA_NAME_PREFIX + this.entry.get('name');
        },

        getReviewFields: function() {
            return [
                'name',
                'index',
                'bundle'
            ];
        },

        getEventLogTypes: function() {
            return logTypes;
        },

        // saves the step # in model's outer scope
        setStep: function(step) {
            currentStep = step;
        }
    });

    InputModel.Entry = InputModel.Entry.extend({
        validation: function() {
            if (currentStep === 0) {
                return {
                    'name': [
                        {
                            required: true,
                            msg: _('Select an Event log.').t()
                        }
                    ]
                };
            }
            return {};
        }
    });

    InputModel.Entry.Content = InputModel.Entry.Content.extend({
        validation: function() {
            if (currentStep === 1) {
                return {
                    'index': [
                        {
                            required: true,
                            msg: _('Index is required.').t()
                        }
                    ]
                };
            }
            return {};
        }
    });

    InputModel.Entry.ACL = InputModel.Entry.ACL.extend({
        validation: function () {
            if (currentStep === 2) {
                return {
                    'app': 'validateAclBundle'
                };
            }
            return {};
        }
    });

    return InputModel;
});
