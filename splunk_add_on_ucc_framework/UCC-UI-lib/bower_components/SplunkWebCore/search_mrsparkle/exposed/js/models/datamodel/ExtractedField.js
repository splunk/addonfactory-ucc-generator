/**
 * @author jszeto
 * @date 12/20/12
 *
 * Model used for the AddExtractedFieldsDialog and its FieldRow subview. It combines attributes from the search/jobs/Summary
 * model (Field summary information) a Data Model Field model and two UI state variables.
 */


define(
    [
        'models/Base',
        'underscore'
    ],
    function(BaseModel, _) {

        return BaseModel.extend({

            idAttribute: 'fieldName',

            /**
             * Attributes
             *
             * Most of these attributes map to a back-end concept of the same name (see http://eswiki.splunk.com/Data_Model_JSON_Specification)
             *
             * fieldName {String} - the unique name of the field in splunkd
             * displayName {String} - the string to display in the UI to represent this field
             * type {String} - the data type of the field, possible values are "string", "number", "boolean", "timestamp",
             *                      "ipv4", "objectCount", "childCount"
             * required {Boolean} - whether the field is a required property
             * multivalue {Boolean} - whether the field is multi-valued
             * hidden {Boolean} - whether the field is hidden in a reporting context
             * selected {Boolean} - whether the field has been selected
             * distinctValues {Array} - list of distinct values for the field
             * isNumeric {Boolean} - True if more than half of the field values are numeric
             * isExpanded {Boolean} - True if the field row has been expanded
             */

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
                ]
            },
            defaults: {
                type: "string",
                fieldName: "",
                displayName: "",
                required: false,
                multivalue: false,
                hidden: false,
                selected: false,
                distinctValues: [],
                isNumeric: false,
                isExpanded: false
            }
        });
    }
);
