/**
 * @author usaha
 * @date 11/5/13
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

            idAttribute: 'fileContents',
            defaults: {fileContents:"",
                       app:""},

            validation: {
                fileContents : {
                    required : true,
                    msg: _("File is required.").t()
                }, 
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
