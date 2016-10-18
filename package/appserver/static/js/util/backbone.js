import {configManager} from 'app/util/configManager';
import BaseModel from 'app/models/Base.Model';

export function generateModel(name, options) {
    // TODO: provide more features based on options paramater
    const {unifiedConfig: {meta}} = configManager;

    const newModel = BaseModel.extend({
        url: meta.restRoot + '/' + name,
        initialize: function (attributes, options) {
            BaseModel.prototype.initialize.call(this, attributes, options);
        },
    });

    return newModel;
}
