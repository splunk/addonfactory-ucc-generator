/**
 * A model representing a single data model object output field for a Lookup or GeoIP Calculation.
 *
 * To be used only as a model inside the "collections/services/datamodel/private/LookupOutputFields" collection
 *
 * For a description of possible attributes, see http://eswiki.splunk.com/Data_Model_JSON_Specification#Field
 */

define(
    [
        'underscore',
        'models/services/datamodel/private/Field'
    ],
    function(_, Field) {

        return Field.extend({

            idAttribute: 'fieldName',

            defaults: {
                type: 'string',
                constraints: [],
                fieldName: '',
                lookupOutputFieldName: '',
                required: false,
                multivalue: false,
                hidden: false,
                editable: true
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