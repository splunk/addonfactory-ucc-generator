define([
            'collections/SplunkDsBase',
            'models/services/data/props/Extraction'
        ],
        function(
            SplunkDsBase,
            Extraction
        ) {

    return SplunkDsBase.extend({

        model: Extraction,
        url: 'data/props/extractions'

    });

});