define(
    [
        'collections/services/data/ui/Times',
        'underscore'
    ],
    function(TimesCollection, _) {
        var SharedTimesCollection = TimesCollection.extend({
            // no instance methods
        }, {
            /**
             * Creates a times collection from a list of provided
             * preset definitions.
             * 
             * A preset definition is a dictionary with structure similar to:
             * {label: 'Last 10 minutes', earliest_time: '-10m', latest_time: 'now'}.
             */
            createFromPresets: function(presets) {
                var entries = [];
                _.each(presets, function(preset) {
                    var id = _.uniqueId('time_');
                    entries.push({
                        'name': id,
                        'id': id,
                        'links': {},
                        'author': 'nobody',
                        'acl': {},
                        'content': preset
                    });
                });
                
                // Emulate the format of the data/ui/times REST endpoint,
                // which is the closest thing to an API this class appears to have.
                var collection = new TimesCollection();
                collection.setFromSplunkD({
                    'links': {
                       'create': '/services/data/ui/times/_new',
                       '_reload': '/services/data/ui/times/_reload'
                    },
                    'origin': '',
                    'updated': '',
                    'generator': {},
                    'entry': entries
                });
                return collection;
            }
        });
        
        return SharedTimesCollection;
    }
);