define(['underscore'], function(_) {
    var mergeObjects = function(obj1, obj2, mergeFn) {
        var result = {},
            keys = _.union(_.keys(obj1), _.keys(obj2));

        _.each(keys, function(key) {
            result[key] = mergeFn(obj1[key], obj2[key]);
        });

        return result;
    };

    return {
        mergeObjects: mergeObjects
    };
});