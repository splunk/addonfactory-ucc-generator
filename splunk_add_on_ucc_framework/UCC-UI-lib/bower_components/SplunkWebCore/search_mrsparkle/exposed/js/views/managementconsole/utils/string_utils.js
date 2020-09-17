/**
 * Created by rtran on 3/4/16.
 */
define([
    'underscore',
    'models/managementconsole/Change'
], function(
    _,
    Change
) {
    /**
     * if a dictionary is passed -> override the item value with the value provided in dictionary if its key is present
     * else -> simply return the item
     **/
    var getLabel = function (item, labelDictionary) {
        if (!labelDictionary) {
            return item;
        }
        return labelDictionary[item] ? labelDictionary[item] : item;
    };

    /**
     * Formats an array into a nice comma separated string based on the number of items in the list
     * if a dictionary (dict) is passed, the value presented in the dictionary can be used to override the value
     * presented in the list
     *
     * Example:
     * formatList(['one']) -> 'one'
     * formatList(['one', 'two']) -> 'one and two'
     * formatList(['one', 'two', 'three']) -> 'one, two, and three'
     * formatList(['one', 'two', 'three'], {one: 1, two: 2: three: 3}) -> '1, 2, and 3'
     **/
    var formatList = function(list, dict) {
        var string = '';
        if (list.length === 0) {
            string = _('None').t();
        } else if (list.length === 1) {
            string = getLabel(list[0], dict);
        } else if (list.length === 2) {
            string = getLabel(list[0], dict) + ' and ' + getLabel(list[1], dict);
        } else {
            _.each(list, function(item, i) {
                if (i === list.length - 1) {
                    string += 'and ' + getLabel(item, dict);
                } else {
                    string += item + ', ';
                }
            });
        }

        return string;
    };

    return {
        formatServerClassList: function(list) {
            return formatList(list, Change.APP_LABELS);
        },

        formatAppList: formatList,

        formatList: formatList
    };

});