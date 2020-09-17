/*
 * Based on implementation from: http://open.bekk.no/mixins-in-backbone
 *
 * creating composite initialize and render functions... great idea. Hats
 * off to @kimjoar
 */
/*global define*/
define([
    'lodash'
], function (
    _
) {
    var Util = {};

    Util.viewMixin = function (mixin) {
        var orig = this.prototype;

        // copy over members/properties of mixin that do not exist
        // on the orig object
        _.defaults(orig, mixin);

        // copy over events defined on mixin that are not defined
        // on the orig object
        _.defaults(orig.events, mixin.events);

        Util.extendMethod(orig, mixin, "initialize");
        Util.extendMethod(orig, mixin, "render");
    };

    Util.modelMixin = function (mixin) {
        var orig = this.prototype;

        // copy over members/properties of mixin that do not exist
        // on the orig object
        _.defaults(orig, mixin);

        // copy over events defined on mixin that are not defined
        // on the orig object
        _.defaults(orig.defaults, mixin.defaults);

        Util.extendMethod(orig, mixin, "initialize");

    };

    // basic mixin to copy over methods and properties. No special handling
    // for  views/models/initialize, etc...

    Util.dynamicMixin = function (mixin) {
        // copy over members/properties of mixin that do not exist
        // on the orig object
        _.defaults(this, mixin);
    };

    Util.extendMethod = function (orig, mixin, methodName) {
        if (_.has(mixin, methodName) && _.isFunction(mixin[methodName])) {
            var origMethod = orig[methodName];

            // update the method on our original object to now call both
            // the orig method and then the mixin method. return the value
            // from the orig method
            orig[methodName] = function () {
                var origReturn = origMethod.apply(this, arguments);

                // now invoke the mixin method
                mixin[methodName].apply(this, arguments);

                return origReturn;
            };
        }

    };

    return Util;
});
