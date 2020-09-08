/**
 * @author jszeto
 * @date 1/14/14
 */

/**
 * A model representing a single data model object lookup input field for a Lookup Calculation.
 *
 * To be used only as a model inside the "collections/services/datamodel/private/LookupInputFields" collection
 */

define(
    [
        'underscore',
        'models/Base'
    ],
    function(_, BaseModel) {

        return BaseModel.extend({

            idAttribute: 'lookupField',

            defaults: {
                lookupField: '',
                inputField: ''
            },

            validation: {
                lookupField: {
                    required: true,
                    msg: _("Field in Lookup is a required field.").t()
                },
                inputField: {
                    required: true,
                    msg: _("Input Attribute is required.").t()
                }
            }
        });
    }
);
