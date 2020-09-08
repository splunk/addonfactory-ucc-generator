define(
    [
        'jquery',
        'models/search/Job'
    ],
    function(
        $,
        SearchJob
    ) {
        return SearchJob.extend({
            initialize: function() {
                SearchJob.prototype.initialize.apply(this, arguments);
            },
            
            startJob: function(parentJob, application, sensitivity, options) {
                if (!parentJob.isPatternable()) {
                    throw new Error("You should never try this at home.");
                }
                
                this.entry.content.custom.set({
                    parentEventCount: parentJob.entry.content.get('eventCount')
                });
                
                var saveData = {
                    search: '| loadjob ' + parentJob.id + ' events=true require_finished=false | cluster t=' + sensitivity + ' labelonly=true labelfield=_patterns match=termset | findkeywords labelfield=_patterns dedup=true',
                    earliest_time: parentJob.getDispatchEarliestTimeOrAllTime(),
                    latest_time: parentJob.getDispatchLatestTimeOrAllTime(),
                    preview: false,
                    app: application.get('app'),
                    owner: application.get('owner'),
                    ui_dispatch_app: application.get('app')
                };
                
                options = options || {};
                $.extend(true, saveData, options.data);
                
                return this.save({},{
                    data: saveData
                });
            },
            
            getParentEventCount: function() {
                return parseInt(this.entry.content.custom.get('parentEventCount'), 10);
            }
        });
    }
);