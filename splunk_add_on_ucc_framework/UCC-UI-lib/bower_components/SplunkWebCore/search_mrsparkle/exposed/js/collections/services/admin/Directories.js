/**
 * All Configurations collection
 * @author nmistry
 * @date 09/08/2016
 */

define([
    'jquery',
    'underscore',
    'models/services/admin/Directory',
    'collections/SplunkDsBase'
], function(
    $,
    _,
    DirectoryModel,
    SplunkDsBaseCollection
) {
    return SplunkDsBaseCollection.extend({
        url: 'admin/directory',
        model: DirectoryModel,

        initialize: function (models, options) {
            SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
            this.isLite = (!_.isUndefined(options) && _.isBoolean(options.isLite)) ? options.isLite : false;
        },

        /**
         * Helper function. Promise.all() is all or none, we need something
         * to hold until all promises are complete.
         *
         * @param {Array} promises
         * @returns {promise}
         */
        whenAll: function (promises) {
            var $bulkPromise = $.Deferred();
            var total = promises.length;
            var pending = total;
            var resolved = 0;
            var promiseSuccess = function () {
                resolved++;
                if (0 === --pending) {
                    if (resolved === total) {
                        $bulkPromise.resolve();
                    } else {
                        $bulkPromise.reject();
                    }
                }
            };
            var promiseFailure = function (error) {
                if (0 === --pending) {
                    $bulkPromise.reject();
                }
            };
            _.each(promises, function (p, i) {
                p.done(promiseSuccess).fail(promiseFailure);
            });

            return $bulkPromise;
        },

        /**
         * Reassigns all the models in the collection to new owner
         * @param {string} newOwner - user id of the new owner.
         * @returns {promise}
         */
        reassign: function (newOwner) {
            if (!_.isString(newOwner)) {
                throw new Error('newOwner needs to be a string value');
            }

            var executeOnEachModel = function (model) {
                return model.reassign(newOwner);
            };

            return this.whenAll(this.map(executeOnEachModel));
        }
    });
});
