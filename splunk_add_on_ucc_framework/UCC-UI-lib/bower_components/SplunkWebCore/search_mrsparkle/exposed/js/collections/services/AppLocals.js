define(
    [
        "jquery",
        "underscore",
        "backbone",
        "models/services/AppLocal",
        "collections/SplunkDsBase",
        'util/general_utils'
    ],
    function($, _, Backbone, AppModel, SplunkDsBaseCollection, general_utils) {
        return SplunkDsBaseCollection.extend({
            model: AppModel,
            url: "apps/local",
            initialize: function() {
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
            },
            /* sort the apps collection based on user preference (appOrderString).
            any app not declared in the indexDictionary, is sorted alphabetically */
            sortWithString: function(appOrderString){
                //FOR SAFETY cast to string
                appOrderString = typeof appOrderString === 'string' ? appOrderString : '';
                var indexDictionary = {};
                var appOrderArray = appOrderString.split(',');
                if(_.isArray(appOrderArray) && appOrderArray.length > 0){
                    for(var i=0, len=appOrderArray.length; i<len; i++){
                        indexDictionary[appOrderArray[i]] = i;
                    }
                }

                this.comparator = function(appA, appB){
                    var nameA = appA.entry.get('name'),
                        nameB = appB.entry.get('name'),
                        labelA = appA.entry.content.get('label'),
                        labelB = appB.entry.content.get('label'),
                        positionA = indexDictionary[nameA],
                        positionB = indexDictionary[nameB],
                        isNumberA = _.isNumber(positionA),
                        isNumberB = _.isNumber(positionB);
                    if(isNumberA && isNumberB){
                        return positionA < positionB ? -1 : 1;
                    }
                    if(!isNumberA && !isNumberB){
                        return general_utils.compareWithDirection(labelA, labelB, true);
                    }
                    if(isNumberA && !isNumberB){
                        return -1;
                    }
                    if(!isNumberA && isNumberB){
                        return 1;
                    }
                };
                this.sort();
            },

            listWithoutInternals: function() {
                var internalApps = ['splunk_datapreview','splunk_monitoring_console','learned','introspection_generator_addon','framework'];
                return this.filter(function(model) {
                    var appName = model.entry.get('name');
                    return (internalApps.indexOf(appName) === -1);
                });
            }
        });
    }
);