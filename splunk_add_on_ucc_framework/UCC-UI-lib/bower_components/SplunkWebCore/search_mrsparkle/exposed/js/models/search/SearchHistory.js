define(
    [
        'jquery',
        'underscore',
        'models/search/Job',
        'splunk.util'
    ],
    function($, _, SearchJob, splunkUtil) {
        var MAX_RESULTS = 100000,
            BLACKLIST = [
                {
                    field: 'search',
                    term: '| history*'
                },
                {
                    field: 'search',
                    term: '*metadata*'
                },
                {
                    field: 'search',
                    term: '*loadjob*'
                },
                {
                    field: 'savedsearch_name',
                    term: '*'
                },
                {
                    field: 'search',
                    term: 'search'
                },
                {
                    field: 'search',
                    term: '*from sid*'
                },
                {
                    field: 'search',
                    term: '| eventcount summarize=false index=* index=_**'
                }
            ],
            BASE_SEARCH = '| history | search %s| dedup search | head %s';
        return SearchJob.extend({
            initialize: function(attributes, options) {
                SearchJob.prototype.initialize.apply(this, arguments);
            },
            buildSearch: function() {
                var blacklist = "";
                _.each(BLACKLIST, function(item, idx) {
                    if (idx === 0) {
                        blacklist += splunkUtil.sprintf('NOT %s="%s" ', item.field, item.term);
                    } else {
                        blacklist += splunkUtil.sprintf('AND NOT %s="%s" ', item.field, item.term);
                    }
                });
                return splunkUtil.sprintf(BASE_SEARCH, blacklist, MAX_RESULTS);
            },
            startJob: function(application, options) {
                options = options || {};
                var saveData = {
                    search: this.buildSearch(),
                    earliest_time: 0,
                    preview: false,
                    app: application.get('app'),
                    owner: application.get('owner')
                };
                
                $.extend(true, saveData, options.data);
                
                return this.save({}, {
                    data: saveData
                });
            }
        });
    }
);