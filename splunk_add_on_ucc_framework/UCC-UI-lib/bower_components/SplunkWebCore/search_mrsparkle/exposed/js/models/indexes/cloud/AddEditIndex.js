/**
 * @author jszeto
 * @date 2/11/15
 *
 * Working model to create a new index
 */
define([
        'underscore',
        'models/Base'
    ],
    function(
        _,
        BaseModel
    ) {

        return BaseModel.extend({

            idAttribute: 'name',
            defaults: {
                name:"",
                maxIndexSize: "",
                maxIndexSizeFormat: 'GB',
                frozenTimePeriodInDays: "",
                "archive.enabled": false,
                "archive.provider": ""
            },

            validation: {
                name : [
                    {
                        fn: function(value, attr, computedState) {
                            if (computedState.isNew) {
                                if (value == "") {
                                    return _("Index Name is required.").t();
                                }
                            }
                            return;
                        }
                    },
                    {
                        fn: function(value, attr, computedState) {
                            if (computedState.isNew) {
                                if (!/^[a-z0-9]([a-z0-9_\-]*)$/.test(value)) {
                                    return _("Index Names may contain only lowercase letters, numbers, underscores, or hyphens. They must begin with a lowercase letter or number.").t();
                                }
                            }
                            return;
                        }
                    }
                ],
                maxIndexSize: [
                    {
                        required: true,
                        msg: _("Max Data Size is required.").t()
                    },
                    {
                        pattern: /^[\d]+$/,
                        msg: _("Max Data Size must be a positive integer.").t()
                    }
                ],
                frozenTimePeriodInDays: [
                    {
                        required: true,
                        msg: _("Retention is required.").t()
                    },
                    {
                        pattern: /^[\d]+$/,
                        msg: _("Retention must be a positive integer.").t()
                    }
                ]
            }
        });
    });
