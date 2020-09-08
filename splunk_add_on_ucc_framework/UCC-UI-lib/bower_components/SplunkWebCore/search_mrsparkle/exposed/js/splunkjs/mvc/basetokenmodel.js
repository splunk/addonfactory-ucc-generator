define(function(require, exports, module) {
    var Backbone = require('backbone');

    var BaseTokenModel = Backbone.Model.extend({
        moduleId: module.id
    });
    
    return BaseTokenModel;
});
