/**
 * @author jszeto
 * @date 1/14/14
 * A working model representing a single output field form in the AddEditLookupView. Extends LookupOutputField and adds
 * selected and isInputField
 */

define(
    [
        'underscore',
        'models/services/datamodel/private/LookupOutputField'
    ],
    function(_, LookupOutputField) {

        return LookupOutputField.extend({

            idAttribute: 'fieldName',

            defaults: {
                type: 'string',
                constraints: [],
                fieldName: '',
                lookupOutputFieldName: '',
                required: false,
                multivalue: false,
                hidden: false,
                editable: true,
                selected: false,
                isInputField: false
            },

            validation: {
                fieldName: [
                    {
                        required: true,
                        msg: _("Field Name is required.").t()
                    },
                    {
                        pattern: /^((?![{}"\s*']).)*$/g,
                        msg: _("Field Name can not contain whitespace, double quotes, single quotes, curly braces or asterisks.").t()
                    }
                ],
                displayName: [
                    {
                        required: false
                    },
                    {
                        pattern: /^((?!\*).)*$/,
                        msg: _("Display Name can not contain an asterisk.").t()
                    }
                ],
                lookupOutputFieldName: {
                    required: true,
                    msg: _("Field in Lookup is a required field.").t()
                }
            },

            getBasicDescription: function() {
                return ({
                    displayName: this.get('displayName'),
                    lookupOutputFieldName: this.get('lookupOutputFieldName'),
                    fieldName: this.get('fieldName'),
                    type: this.get('type'),
                    localizedType: this.getLocalizedType(),
                    hidden: this.get('hidden'),
                    required: this.get('required'),
                    owner: this.get('owner'),
                    editable: this.get('editable')
                });
            }
        });
    }
);
