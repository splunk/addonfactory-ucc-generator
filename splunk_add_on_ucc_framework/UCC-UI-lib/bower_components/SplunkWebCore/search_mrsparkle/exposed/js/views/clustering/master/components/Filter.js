/**
 * Created by ykou on 8/1/14.
 */
define(
    [
        'module',
        'underscore',
        'views/shared/FindInput',
        'util/splunkd_utils'
    ],
    function(
        module,
        _,
        InputView,
        splunkdUtils
        )
    {
        /**
         * The only reason we use this instead of Input.js is that we want the search string be something like:
         * search: key1=val1 OR key2=val2 OR ...
         * instead of search: key1=val1 key2=val2 ...
         * NOTE:
         *      1. 'OR' is important in our case, which allows use search in multiple attributes
         *      2. in our case the endpoints don't allow 'rawSearch' attribute
         *      3. please set fetchDataFilter = False if you want 'OR', because
         *          1) splunkdUtils.createSearchFilterObj construct search string without 'OR'
         *          2) splunkdUtils.createSearchFilterString construct search string with 'OR'
         *
         * @param {Object} options {
         *     model: <models.State>
         *     fetchDataFilter: <boolean> true if this view is for the 'filter' attribute instead of 'search' attribute
         * }
         */
        return InputView.extend({
            moduleId: module.id,
            initialize: function() {
                InputView.prototype.initialize.apply(this, arguments);
            },
            set: _.debounce(function(value) {
                if(this.fetchDataFilter && !value) {
                    this.model.unset('filter');
                } else {
                    this.model.set({
                        'offset': '0'
                    });
                    var keys = _.isArray(this.key) ? this.key : this.key.split(' ');
                    if(this.fetchDataFilter) {
                        //in the future, consumers of the shared input should refactor away
                        //from passing fetch data as the state model
                        this.model.set('filter', splunkdUtils.createSearchFilterObj(value, keys));
                    } else {
                        this.model.set('search', splunkdUtils.createSearchFilterString(value, keys));
                    }
                }
            }, 250)
       });
    }
);
