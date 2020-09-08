/**
 * @author jszeto
 * @date 1/4/13
 *
 * Working model to create a new data model
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

            idAttribute: 'displayName',
            defaults: {displayName:"",
                       description:"",
                       modelName:"",
                       app:""},

            validation: {
                displayName : [
                    {
                        required : true,
                        msg: _("Title is required.").t()
                    },
                    {
                        pattern: /^((?!\*).)*$/,
                        msg: _("Title can not contain an asterisk.").t()
                    }
                ],
                modelName: [
                    {
                        required: true,
                        msg: _("ID is required.").t()
                    },
                    {
                        pattern: /^[\w\-]+$/,
                        msg: _("ID can only contain alphanumeric characters, underscores or hyphens. Whitespace is not allowed.").t()
                    }
                ]
            }
        });
    });