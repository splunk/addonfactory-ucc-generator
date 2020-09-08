define([
    'underscore',
    './Util'
], function (
    _,
    Util
) {
    var tdTPL = _.template('<td class="<%- key %>"><%- value %></td>');
    return {
        rowTypes: {
            dynamic: function (column, model, count, totalCount) {
                return tdTPL({
                    value: Util.getValueUsingComplexKey(model, column.key),
                    key: column.key.replace(/[.]/g, '_')
                });
            }
        }
    };
});
