// HTTP Inputs model
// @author: lbudchenko
define([
    'jquery',
    'underscore',
    'backbone',
    'models/managementconsole/inputs/Base'
], function (
    $,
    _,
    Backbone,
    BaseModel
) {
    var currentStep = 0;
    var STANZA_NAME_PREFIX = 'http://';

    var InputModel = BaseModel.extend({
        url: '/http',

        initialize: function () {
            BaseModel.prototype.initialize.apply(this, arguments);

            this._documentationType = 'http';
        },

        getStanzaName: function() {
            return STANZA_NAME_PREFIX + this.entry.get('name');
        },

        getReviewFields: function () {
            return [
                'name',
                'source',
                'description',
                'useACK',
                'index',
                'indexes',
                'sourcetype',
                'bundle'
            ];
        },

        // saves the step # in model's outer scope
        setStep: function(step) {
            currentStep = step;
        },

        formatDataToPOST: function (postData) {
            if (_.has(postData, 'useACK')) {
                postData.useACK = "" + !!postData.useACK;
            }
        }
    });

    InputModel.Entry = InputModel.Entry.extend({
        validation: function() {
            if (currentStep === 0) {
                return {
                    'name': [
                        {
                            required: true,
                            msg: _('Token name is required.').t()
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
                            msg: _('Default index is required.').t()
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
