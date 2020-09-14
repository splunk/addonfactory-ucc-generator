/**
 * @author jszeto
 * @date 12/7/12
 */
define(['underscore',
        'backbone',
        'splunk.util',
        'models/services/datamodel/private/Calculation',
        'models/services/datamodel/private/RexOutputFields'],
    function(
        _,
        Backbone,
        splunkUtil,
        Calculation,
        RexOutputFields) {

    /**
     * Represents a Rex Calculation.
     *
     */
    return Calculation.extend({
        outputFieldsClass: RexOutputFields,

        defaults: {
            calculationType: "Rex",
            expression: "",
            inputField: "",
            outputFields: undefined,
            editable: true
        },

        validation: {
            expression : [
                {
                    required : true,
                    msg: _("Regular Expression is a required field.").t()
                }/*,
                {
                    fn : function(value, attr, computedState) {
                        var outputFields = computedState.outputFields;
                        if (outputFields instanceof Backbone.Collection) {
                            if (outputFields.length == 0) {
                                return "A Rex Calculation must contain at least one outputField";
                            }
                        } else {
                            return "Rex Calculation outputFields is invalid";
                        }
                    }
                }*/
            ],
            inputField : {
                required : true,
                msg : _("Select a field to Extract From.").t()
            },
            calculationType : {
                oneOf : ["Rex"]
            }

        },

        getPreviewSearch: function() {
            return splunkUtil.sprintf('rex field=%s "%s" max_match=1',
                                this.get("inputField"), this.get("expression"));
        },

        getPreviewAllSearch: function() {
            return splunkUtil.sprintf('eval _is_match = if(match(%s, "%s"), 1, 0)',
                                this.get("inputField"), this.get("expression"));
        },

        getPreviewMatchSearch: function() {
            return splunkUtil.sprintf('where match(%s, "%s")',
                                this.get("inputField"), this.get("expression"));
        },

        getPreviewNonMatchSearch: function() {
            return splunkUtil.sprintf('where NOT match(%s, "%s")',
                                this.get("inputField"), this.get("expression"));
        }

    });
});