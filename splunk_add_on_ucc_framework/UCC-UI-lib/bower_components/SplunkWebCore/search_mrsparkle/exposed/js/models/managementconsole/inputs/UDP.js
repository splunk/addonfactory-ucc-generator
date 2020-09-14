// UDP model input
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
    var STANZA_NAME_PREFIX = 'udp://';

    var InputModel = BaseModel.extend({
        url: '/udp',

        initialize: function () {
            BaseModel.prototype.initialize.apply(this, arguments);
            // ideally there should a way to set this.entry.content defaults.
            if (_.isEmpty(this.entry.content.get('connection_host'))) {
                this.entry.content.set('connection_host', BaseModel.CONNECTION_HOST_VALUES.DNS, { silent: true });
            }

            this._documentationType = 'udp';
        },

        getStanzaName: function() {
            return STANZA_NAME_PREFIX + this.entry.get('name');
        },

        getReviewFields: function () {
            return [
                'name',
                'acceptFrom',
                'connection_host',
                'index',
                'source',
                'sourcetype',
                'bundle'
            ];
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
                            msg: _('Port number is required.').t()
                        },
                        {
                            range: [0, 65536],
                            pattern: 'digits',
                            msg: _("Port must be a number from 0 to 65536.").t()
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
