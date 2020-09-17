/**
 * WithDeepClone.Mixin.js
 *
 * Description:  provides a deepClone method, courtesy of jQuery.
 *
 * Usage: Invoke on the prototype before instantiaing, using the mixin()
 *        method.
 *
 * Example: BaseModel.extend(WithDeepClone);
 *          var model = new BaseModel({});
 *
 *
 * @method  {Object} deepClone(<target>) Returns a deep clone of the <target>
 *                                       object.
 *
 */
/*global define*/
define([
    "jquery"
], function ($) {
    return {
        deepClone: function (source) {
            return $.extend(true, {}, source);
        }
    };
});
