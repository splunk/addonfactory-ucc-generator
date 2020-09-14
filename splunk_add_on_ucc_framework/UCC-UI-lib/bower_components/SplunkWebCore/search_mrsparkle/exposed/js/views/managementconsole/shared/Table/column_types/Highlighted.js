/**
 * This column type highlights the cell contents for easier copying
 *
 * @author: lbudchenko
 */
define([
    'jquery',
    'underscore',
    './Util'
], function (
    $,
    _,
    Util
) {
    var tdTPL = _.template('<td class="highlightable <%- key %>"><%- value %></td>');
    var highlightTemplate = '<input class="txt-highlight" type="text" readonly="readonly" value="<%- txt %>"/>';

    return {
        events: {
            'click .highlightable': function (e) {
                e.preventDefault();
                var $e = $(e.currentTarget);

                var txt = $e.text();
                if (txt) {
                    var highlighted = _.template(highlightTemplate, {txt: txt});
                    $e.html(highlighted);
                    this.$('.txt-highlight').focus().select();
                    this.$('.txt-highlight').blur(function() {
                        $e.text(txt);
                    });
                }
            }
        },
        rowTypes: {
            highlighted: function (column, model, count, totalCount) {
                return tdTPL({
                    value: Util.getValueUsingComplexKey(model, column.key),
                    key: column.key.replace(/[.]/g, '_')
                });
            }
        }
    };
});
