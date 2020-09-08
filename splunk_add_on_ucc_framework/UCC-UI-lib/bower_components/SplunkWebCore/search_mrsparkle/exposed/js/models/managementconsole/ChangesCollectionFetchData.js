/**
 * Created by lrong on 3/3/16.
 */
define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/shared/fetchdata/EAIFetchData',
        'helpers/managementconsole/Filters'

    ],
    function(
        $,
        _,
        Backbone,
        EAIFetchData,
        FiltersHelper
    ) {
        return EAIFetchData.extend({
            initialize: function() {
                EAIFetchData.prototype.initialize.apply(this, arguments);
            },

            toJSON: function(options) {
                var json = EAIFetchData.prototype.toJSON.apply(this, arguments),
                    name = this.get('name'),
                    nameRegex = this.get('nameRegex'),
                    typeArray = this.get('type'),
                    bundleType = this.get('bundleType'),
                    bundleId = this.get('bundleId'),
                    configurationType = this.get('configurationType'),
                    outputName = this.get('outputName'),
                    timeRangeObj = this.get('timeRange'),
                    query = {$or: []},
                    now = null,
                    nowInEpoch = null,
                    targetTime = null,
                    stanzaIndex = typeArray ? typeArray.length - 1 : 0;

                if (typeArray) {
                    _.each(typeArray, function(type) {
                        query.$or.push({$and:[{type: type}]});
                    });
                } else {
                    query.$or.push({$and:[]});
                }
                // Expected the primary change type to be the first item on typeArray
                if (name) {
                    query.$or[0].$and.push({ 'key.name': name });
                } else if (nameRegex) {
                    query.$or[0].$and.push({
                        'key.name': {
                            '$regex': FiltersHelper.modifyRegExp(nameRegex),
                            '$options': 'i'
                        }
                    });
                }

                if (bundleType) {
                    query.$or[stanzaIndex].$and.push({ 'key.bundleType': bundleType });
                }
                if (bundleId) {
                    query.$or[stanzaIndex].$and.push({ 'key.bundleId': bundleId });
                }
                if (configurationType) {
                    query.$or[stanzaIndex].$and.push({ 'key.type': configurationType });
                }
                // Special query case for output group, we have to query for 'defaultGroup' attribute in both before and after objects
                // in the change record
                if (outputName) {
                    query.$or.push({'before.local': ['defaultGroup', outputName]}, {'after.local': ['defaultGroup', outputName]});
                }

                if (timeRangeObj) {
                    now = new Date();
                    nowInEpoch = now.getTime() / 1000;
                    targetTime = nowInEpoch - timeRangeObj.value;

                    _.each(query.$or, function(queryEntry) {
                        queryEntry.$and.push({
                            deployedOn: { $gt: targetTime }
                        });
                    });
                }
                if(_.isEmpty(query.$or[0].$and)) {
                    query = {};
                }

                json.query = JSON.stringify(query);

                delete json.name;
                delete json.nameRegex;
                delete json.type;
                delete json.bundleType;
                delete json.bundleId;
                delete json.configurationType;
                delete json.outputName;
                delete json.timeRange;
                return json;
            }
        });
    }
);

