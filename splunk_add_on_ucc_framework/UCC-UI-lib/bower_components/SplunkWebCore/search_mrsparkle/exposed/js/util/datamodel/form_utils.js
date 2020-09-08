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
         * Take a string and returns a version allowed for an ID, such as Object.objectName or DataModel.modelName
         *
         * @param input
         * @return {*}
         */
        var normalizeForID = function(input) {
            var results = input.replace(/\s/g, "_");
            results = results.replace(/\W/g, "");
            return results;
        };

        return ({
            normalizeForID: normalizeForID
        });

    });
