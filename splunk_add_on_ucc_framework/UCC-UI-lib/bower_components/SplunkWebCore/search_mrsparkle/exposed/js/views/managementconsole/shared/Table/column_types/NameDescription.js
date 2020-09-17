define([
    'jquery',
    'underscore',
    './Util'
], function (
    $,
    _,
    util
) {
    var tdTPL = _.template(
        '<td class="cell-name">' +
        '<a href="#" class="entity-edit-link name-description-type" data-no="<%- no %>"><%- name %></a><br/>' +
        '<%- description %></td>'
    );
    return {
        events: {
            'click .name-description-type': function (e) {
                e.preventDefault();
                var $e = $(e.currentTarget);
                this.radio.trigger('link:' + $e.data('fires') + ':click', {no: $e.data('no')});
            }
        },
        rowTypes: {
            nameDescription: function (column, model, count, totalCounter) {
                var name, description;
                if (_.isArray(column.key) && column.key.length == 2) {
                    name = util.getValueUsingComplexKey(model, column.key[0]);
                    description = util.getValueUsingComplexKey(model, column.key[1]);
                } else {
                    name = '';
                    description = '';
                }
                return tdTPL({
                    no: count,
                    name: name,
                    description: description,
                    fires: column.fires
                });
            }
        }
    };
});
