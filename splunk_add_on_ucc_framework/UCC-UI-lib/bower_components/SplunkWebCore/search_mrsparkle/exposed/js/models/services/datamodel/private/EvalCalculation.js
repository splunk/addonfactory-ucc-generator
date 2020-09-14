/**
 * @author jszeto
 * @date 12/7/12
 */
define(['underscore', 'models/services/datamodel/private/Calculation'], function(_, Calculation) {

    /**
     * Represents an Eval Calculation.
     *
     */
    return Calculation.extend({

        defaults: {
            calculationType: "Eval",
            expression: "",
            editable: true
        },

        validation: {
            expression : {
                required : true,
                msg: _("Eval Expression is a required field.").t()
            },
            calculationType : {
                oneOf : ["Eval"]
            }
        },

        toString: function() {
            if (this.outputFields.length > 0)
                return "EvalCalc [" + this.outputFields.at(0).get("displayName") + "]";
            else
                return "Empty EvalCalc";
        }

    });
});