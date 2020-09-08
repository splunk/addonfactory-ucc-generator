define(
    [
        'jquery',
        'underscore',
        'models/managementconsole/topology/Instance',
        'models/managementconsole/topology/Filter'
    ],
    function(
        $,
        _,
        InstanceModel,
        FilterModel
    ) {
        return {
            // Method to escape all non * regular expression symbols and convert * to .* to match search behavior from the core product
            modifyRegExp: function(str) {
                var result = str.replace(/[.+?^${}()|[\]\\"]/g, "\\$&");
                return result.replace(/[*]/g, '.*');
            },

            /*
             * This method will be called when the filter parameters change.
             * It constructs the proper query object string
             */
            getFilterQuery: function(filter, classicurl) {
                var searchObj = {},
                    filterObj = {},
                    modelObj = filter.toJSON(),
                    completeQuery = {'$and': []};  // Constructing the final complete query

                filterObj = _.pick(modelObj, FilterModel.getAllAttrs());

                // attributes in regexNames are comma delimited strings and need to be converted to arrays.
                _.each(FilterModel.getStringValAttrs(), function(name) {
                    var value = modelObj[name];
                    filterObj[name] = $.trim(value) === '' ? [] : value.split(',');
                });

                _.each(_.keys(filterObj), function(name){
                    var inputName = name,
                        values = filterObj[name];



                    // Ignore filter attribute with empty array, also unset the attribute from the url
                    if (values.length === 0) {
                        if (classicurl && classicurl.get(name)) {
                            classicurl.unset(name);
                        }
                        return;
                    }

                    if (classicurl) {
                        // Add non-empty filter attributes to the url, in coma delimited strings form
                        classicurl.save(name, values.join());
                    }

                    // Add each singleFilterQuery to the complete query
                    completeQuery['$and'].push({'$or': this.processSingleFilterQuery(inputName, values)});
                }.bind(this));

                if(completeQuery['$and'].length === 0) {
                    completeQuery = {};
                }

                return completeQuery;
            },

            getDeployStatusFilter: function(filter, classicurl) {
                var upToDate = filter.get('upToDate');
                if (classicurl) {
                    classicurl.save('upToDate', upToDate);
                }

                return upToDate === 'all' ? {} : {upToDate: (upToDate === 'up')};
            },

            /*
             * Process each individual filter criteria that has inputs in there.
             */
            processSingleFilterQuery: function(inputName, values) {

                // Null value attribute handling - bit tricky here
                // if filter value is '*', we need to include null value into the filter array - values
                // if user input a filter value that's a regexp match with _('Unknown').t(), we also add the null value into the filter array - values
                if (_.contains(values, '*')) {
                    values.push(null);
                } else {
                    var match = _.find(values, function(value) {
                        var pattern = new RegExp(this.modifyRegExp(value), 'i');
                        return pattern.test(InstanceModel.NULL_VALUE_DISPLAY);  // InstanceModel.NULL_VALUE_DISPLAY: _('Unknown').t()
                    }, this);
                    if (match) {
                        values.push(null);
                    }
                }

                return _.map(values, function(value) {
                    var result = {};
                    // if value is null, we don't use regex
                    result[inputName] = (_.contains(FilterModel.getStringValAttrs(), inputName) && value !== null) ? {'$regex': this.modifyRegExp(value), '$options':'i'} : value;
                    return result;
                }.bind(this));
            }
        };
    }
);