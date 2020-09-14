// Base contextual collection
// Abstract class, please implement the url function.
// @author: nmistry
define([
    'underscore',
    'splunk.util',
    'models/managementconsole/DMCContextualFetchData',
    'collections/managementconsole/DmcsBase'
], function (
    _,
    splunkUtil,
    DMCContextualFetchData,
    DmcBaseCollection
) {
    return DmcBaseCollection.extend({
        urlRoot: 'dmc',

        initialize: function (models, options) {
            options = options || {};
            // please ensure your fetchData model implements
            // the getDataInputsContext or use the InputsFetchData Model.
            options.fetchData = options.fetchData || new DMCContextualFetchData();
            DmcBaseCollection.prototype.initialize.call(this, models, options);
        },

        /**
         * Use this to combine url root with list of arguments
         * @param {...string} param
         * @returns {string}
         */
        buildCompleteUrl: function () {
            var urlRoot = this.urlRoot.split('/');
            var segments = Array.prototype.slice.call(arguments);
            return this._sanitizeAndJoinUrl(urlRoot.concat(segments));
        },

        /**
         * Helper function to sanitize and join url segments
         * @param {string[]} segments
         * @returns {string}
         * @private
         */
        _sanitizeAndJoinUrl: function (segments) {
            var urlSafeSegments = _.map(segments, function (segment) {
                return encodeURIComponent(segment);
            });
            return urlSafeSegments.join('/');
        },

        getBundle: function () {
            return this.fetchData.getContext();
        },

        getSyncErrorMessage: function () {
            return (this.fetchXhr
                    && this.fetchXhr.responseJSON
                    && this.fetchXhr.responseJSON.error
                    && this.fetchXhr.responseJSON.error.message
                ) || _('Server error').t();
        },

        parse: function () {
            this.links.clear({silent: true});
            return DmcBaseCollection.prototype.parse.apply(this, arguments);
        }

    });
});
