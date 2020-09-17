define([
    'underscore',
    './ItemState',
    'splunkjs/mvc/savedsearchmanager',
    'splunkjs/mvc/postprocessmanager'
], function(_,
            ItemState,
            SavedSearchManager,
            PostProcessManager) {

    var SearchState = ItemState.extend({
        idAttribute: 'id',
        setState: function(search) {
            ItemState.prototype.setState.call(this, _.extend({
                id: search.id
            }, SearchState.searchManagerToState(search, _.extend({tokens: true}, this._stateOptions))));
        }
    }, {
        searchManagerToState: function(manager, options) {
            options || (options = {tokens: true});
            var searchType = 'inline';
            if (manager instanceof SavedSearchManager) {
                searchType = 'saved';
            } else if (manager instanceof PostProcessManager) {
                searchType = 'postprocess';
            } else if (manager.has('metadata') && manager.get('metadata').global) {
                searchType = 'global';
            }

            var state = {
                type: searchType,
                search: searchType == 'postprocess' ? manager.settings.postProcessResolve(options) : manager.settings.resolve(options),
                earliest_time: manager.settings.get('earliest_time', options),
                latest_time: manager.settings.get('latest_time', options),
                base: manager.settings.get('managerid'),
                name: manager.settings.get('searchname')
            };

            var sampleRatio = manager.get('sample_ratio');
            if (sampleRatio != null) {
                state.sampleRatio = sampleRatio;
            }

            var refresh = manager.get('refresh', options);
            if (refresh != null) {
                state.refresh = refresh;
                state.refreshType = manager.get('refreshType', options);
            }

            return state;
        }
    });

    return SearchState;
});