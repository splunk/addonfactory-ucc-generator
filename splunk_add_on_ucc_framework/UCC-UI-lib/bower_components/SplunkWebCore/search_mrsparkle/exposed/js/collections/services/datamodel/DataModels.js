/**
 * A collection of data models
 */

define([
            'jquery',
            'underscore',
            'collections/SplunkDsBase',
            'models/services/datamodel/DataModel'
        ],
        function(
            $,
            _,
            SplunkDsBase,
            DataModel
        ) {

    return SplunkDsBase.extend({

        model: DataModel,
        url: 'datamodel/model'

    });

});