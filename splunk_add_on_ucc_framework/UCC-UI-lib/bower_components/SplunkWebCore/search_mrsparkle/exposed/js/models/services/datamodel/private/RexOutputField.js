/**
 * @author jszeto
 * @date 3/5/14
 *
 * A model representing a single data model object output field for a Rex Calculation.
 *
 * To be used only as a model inside the "collections/services/datamodel/private/RexOutputFields" collection
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

            toJSON: function(options) {
                var json = Field.prototype.toJSON.apply(this, arguments);
                // If options.data.provisional == true, then always return required = false
                if (options && options.data && options.data.provisional) {
                    json.required = false;
                }
                return json;
            }

        });
    }
);