// Monitor model
// @author: nmistry
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
    var STANZA_NAME_PREFIX = 'monitor://';

    var InputModel = BaseModel.extend({
        url: '/monitor',

        initialize: function () {
            BaseModel.prototype.initialize.apply(this, arguments);
            $.extend(true, this.valueDecorators, { recursive: this.getRecursive });

            this._documentationType = 'monitor';
        },

        getStanzaName: function() {
            return STANZA_NAME_PREFIX + this.entry.get('name');
        },

        getRecursive: function () {
            return !!this.entry.content.get('recursive');
        },
        
        getReviewFields: function () {
            return [
                'name',
                'whitelist',
                'blacklist',
                'ignoreOlderThan',
                'crcSalt',
                'initCrcLength',
                'recursive',
                'host',
                'index',
                'sourcetype',
                'bundle'
            ];
        },

        // saves the step # in model's outer scope
        setStep: function(step) {
            currentStep = step;
        },

        formatDataToPOST: function (postData) {
            if(_.has(postData, 'recursive')) {
                postData.recursive = "" + !!postData.recursive;
            }
            if(_.has(postData, 'initCrcLength')) {
                postData.initCrcLength = parseInt(postData.initCrcLength, 10);
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
                            msg: _('File or directory path is required.').t()
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
        validation: function() {
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
