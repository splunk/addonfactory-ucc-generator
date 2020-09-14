define([
            'jquery',
            'models/Base',
            'util/splunkd_utils'
        ],
        function(
            $,
            BaseModel,
            splunkdUtils
        ) {

    return BaseModel.extend({

        url: 'field_extractor/generate_regex',

        sync: function(method, model, options) {
            if(method !== 'read') {
                throw new Error('Sync operation not supported: ' + method);
            }
            // We are not inheriting from SplunkDBase so we have to do our own app-owner URL handling.
            options = $.extend(true, {}, options);
            var syncOptions = splunkdUtils.prepareSyncOptions(options, model.url);
            return BaseModel.prototype.sync.call(this, method, model, syncOptions);
        }

    });

});