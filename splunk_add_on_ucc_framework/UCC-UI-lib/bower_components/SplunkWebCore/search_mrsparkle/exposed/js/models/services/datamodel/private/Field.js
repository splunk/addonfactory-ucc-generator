/**
 * A model representing a single data model object field.
 *
 * To be used only as a model inside the "collections/services/datamodel/private/Fields" collection
 *
 * For a description of possible attributes, see http://eswiki.splunk.com/Data_Model_JSON_Specification#Field
 */

define(
    [
        'underscore',
        'models/Base'
    ],
    function(_, BaseModel) {

        var Field =  BaseModel.extend({

            idAttribute: 'fieldName',

            defaults: {
                type: 'string',
                constraints: [],
                fieldName: '',
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
                ]
            },

            getBasicDescription: function() {
                return ({
                    displayName: this.get('displayName'),
                    fieldName: this.get('fieldName'),
                    type: this.get('type'),
                    localizedType: this.getLocalizedType(),
                    hidden: this.get('hidden'),
                    required: this.get('required'),
                    owner: this.get('owner'),
                    editable: this.get('editable')
                });
            },

            getLocalizedType: function() {
                var type = this.get("type");
                var localizedType = type;
                switch (type) {
                    case "string":
                        localizedType = _("String").t();
                        break;
                    case "number":
                        localizedType = _("Number").t();
                        break;
                    case "timestamp":
                        localizedType = _("Time").t();
                        break;
                    case "boolean":
                        localizedType = _("Boolean").t();
                        break;
                    case "ipv4":
                        localizedType = _("IPv4").t();
                        break;
                }

                return localizedType;
            }
        },
        {
            createRawField: function() {
                return new Field({multivalue: false,
                                  owner: "BaseEvent",
                                  fieldSearch: "",
                                  fieldName: "_raw",
                                  type: "string",
                                  displayName: "_raw",
                                  hidden: false,
                                  required: false,
                                  editable: true});
            }
        });
        return Field;
    }
);