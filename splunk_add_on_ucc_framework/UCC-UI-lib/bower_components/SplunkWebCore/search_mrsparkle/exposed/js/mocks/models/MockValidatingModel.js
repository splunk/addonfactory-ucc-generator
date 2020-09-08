/**
 * @author jszeto
 * @date 9/24/13
 */
define(
    [
        'mocks/models/MockModel'
    ],
    function(MockModel) {

        return MockModel.extend({
            defaults: {
                validAttr : "",
                typeAttr : ""
            },

            validation: {
                validAttr : {
                    required : true,
                    msg: "Valid Attr is required"
                },
                typeAttr : {
                    oneOf : ["validType"]
                }
            }
        });
    }
);

