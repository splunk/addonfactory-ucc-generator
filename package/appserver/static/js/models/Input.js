/*global define*/
define([
    'underscore',
    'app/models/Base.Model',
    'app/config/ContextMap'
], function (
    _,
    BaseModel,
    ContextMap
) {
    return BaseModel.extend({
        url: [
            ContextMap.restRoot,
            ContextMap.input
        ].join('/'),

        initialize: function (attributes, options) {
            options = options || {};
            this.collection = options.collection;
            BaseModel.prototype.initialize.call(this, attributes, options);
            this.addValidation('account', this.nonEmptyString);
            this.addValidation('start_offset', this.validStartOffset);
            this.addValidation('index', this.nonEmptyString);
            this.addValidation('interval', this.validInterval);
        },

        validStartOffset: function (attr) {
            var start_offset = this.entry.content.get(attr);
            if (start_offset){
                start_offset = Number(start_offset);
                if (isNaN(start_offset) || start_offset != parseInt(start_offset, 10)) {
                    return _('Field "Start Offset" is not valid').t();
                } else if (start_offset < 0) {
                    return _('Field "Start Offset" should not be negative.').t();
                }
            }
        },

        validInterval: function (attr) {
            var interval = this.entry.content.get(attr);
            if (interval) {
                interval = Number(interval);
                if (isNaN(interval) || interval != parseInt(interval, 10)) {
                    return _('Field "Interval" is not valid').t();
                } else if (interval <= 0) {
                    return _('Field "Interval" should be positive number').t();
                }
            } else {
                return _('Field "Interval" is required').t();
            }
        }
    });
});
