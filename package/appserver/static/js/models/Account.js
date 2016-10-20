import {configManager} from 'app/util/configManager';

/*global define*/
define([
    'app/models/Base.Model'
], function (
    BaseModel
) {
    return BaseModel.extend({
        url: () => configManager.generateEndPointUrl('account'),

        initialize: function (attributes, options) {
            options = options || {};
            this.collection = options.collection;
            BaseModel.prototype.initialize.call(this, attributes, options);
            this.addValidation('api_uuid', this.nonEmptyString);
            this.addValidation('api_key', this.nonEmptyString);
        }
    });
});
