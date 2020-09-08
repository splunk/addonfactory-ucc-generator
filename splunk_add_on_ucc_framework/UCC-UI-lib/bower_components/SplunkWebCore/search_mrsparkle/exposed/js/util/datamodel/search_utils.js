/**
 * @author jszeto
 * @date 1/2/14
 */
define([
    'jquery',
    'underscore'
],
    function(
        $,
        _
        )
    {
        /**
         * Helper function to generate a fields sub search
         * @param fieldArray
         * @param inputField
         * @return {String}
         */
        var generateFieldSubSearch = function(fieldArray, inputField) {
            var result = " | fields " + fieldArray.join(",");

            var fieldsToRemove = [];
            if (inputField != "_raw" && !_(fieldArray).contains("_raw")) {
                fieldsToRemove.push("_raw");
            }
            if (inputField != "_time" && !_(fieldArray).contains("_time")) {
                fieldsToRemove.push("_time");
            }

            if (fieldsToRemove.length > 0)
                result += " | fields - " + fieldsToRemove.join(",");

            return result;
        };

        return ({
            generateFieldSubSearch: generateFieldSubSearch 
        });

    });


