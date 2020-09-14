// Scripts model
// @author: lbudchenko
define([
    'jquery',
    'underscore',
    'backbone',
    'models/managementconsole/inputs/Base',
    'splunk.util'
], function (
    $,
    _,
    Backbone,
    BaseModel,
    splunkUtil
) {
    var currentStep = 0;
    var STANZA_NAME_PREFIX = 'script://';

    var InputModel = BaseModel.extend({
        url: '/script',

        initialize: function () {
            BaseModel.prototype.initialize.apply(this, arguments);

            this._documentationType = 'script';
        },

        getStanzaName: function() {
            return STANZA_NAME_PREFIX + this.entry.get('name');
        },

        getName: function () {
             return this.get('filename') || BaseModel.prototype.getName.call(this);
        },

        getReviewFields: function () {
            return [
                'name',
                'interval',
                'source',
                'host',
                'index',
                'sourcetype',
                'bundle'
            ];
        },

        formatDataToPOST: function (postData) {
            if (this.get('filename') && this.get('script')) {
                postData['@attach'] = [{
                    name: this.get('filename'),
                    content: window.btoa(this.get('script'))
                }];
                postData.name = this.get('filename');
            }
            // backend does not like it.
            delete postData.intervalSelection;
        },

        // saves the step # in model's outer scope
        setStep: function(step) {
            currentStep = step;
        },

        validation: function() {
            if (currentStep === 0 && this.isNew()) {
                return {
                    'script': [
                        {
                            required: true,
                            msg: _('Script must be selected.').t()
                        }
                    ]
                };
            }
            return {};
        }
    });

    InputModel.Entry = InputModel.Entry.extend({});
    InputModel.Entry.Content = InputModel.Entry.Content.extend({
        validation: function() {
            if (currentStep === 0) {
                return {
                    'interval': function(value) {
                        var isSeconds = this.get('intervalSelection') === 'In Seconds';
                        var isCron = this.get('intervalSelection') === 'Cron Schedule';
                        var isEmpty = _.isEmpty(value) || value.match(/^\s+$/g);
                        var isInvalidNumber = isNaN(parseFloat(value)) || !isFinite(value) || (value < 0 && value !== -1);
                        var isInvalidCron = !splunkUtil.validateCronString(value);

                        if (isEmpty) {
                            return _('Interval is required.').t();
                        }
                        if (isSeconds && isInvalidNumber) {
                            return _('Interval must be a valid number.').t();
                        }
                        if (isCron && isInvalidCron) {
                            return _('Interval must be a valid cron.').t();
                        }
                    }
                };
            } else if (currentStep === 1) {
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
