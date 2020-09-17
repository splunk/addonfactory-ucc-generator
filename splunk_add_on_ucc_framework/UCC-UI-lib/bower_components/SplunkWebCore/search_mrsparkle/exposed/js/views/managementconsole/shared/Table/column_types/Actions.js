define([
    'underscore',
    'jquery',
    'views/shared/delegates/Popdown',
    './Util'
], function (
    _,
    $,
    Popdown,
    util
) {
    var linkMenuTPL = _.template(
        '<span class="entity-action action-<%- no %>">' +
        '<a href="#" class="dropdown-toggle" title="<%- label %>">' +
        '<%- label %>' +
        '<b class="caret"></b>' +
        '</a>' +
        '<div class="dropdown-menu dropdown-menu-narrow">' +
        '<div class="arrow"></div>' +
        '<ul>' +
        '<% _.each(links, function(link) { %>' +
        '<li><%= link %></li>' +
        '<% }) %>' +
        '</ul>' +
        '</div>' +
        '</span>'
    );
    return {
        events: {
            'click td a.entity-action-link': function (e) {
                e.preventDefault();
                var $e = $(e.currentTarget);
                if ($e.hasClass('disabled')) return;
                var event = 'actions:' + $e.data('fires') + ':click';
                this.children.gridView.children['menupopdown'+$e.data('no')].hide();
                this.radio.trigger(event, {no: $e.data('no')});
            }
        },
        rowTypes: {
            actions: function (column, model, count, totalCounter) {
                var $td = $('<td></td>');
                var items = _.map(column.actions, function renderAction(action) {
                    if (action.links && action.links.length > 0) {
                        // render the menu
                        var links = _.map(action.links, function (linkDef) {
                           return util.getLink(linkDef, model, count, totalCounter, {
                               className: 'entity-action entity-action-link',
                                label: linkDef.label
                           });
                        });
                        if (!_.isEmpty(links.join(''))) {
                            var $menu = $(
                                linkMenuTPL({
                                    no: count,
                                    label: action.label,
                                    links: links
                                })
                            );
                            this.children['menupopdown'+count] = new Popdown({ el: $menu, mode: 'dialog' });
                            return $menu;
                        }
                        return '';
                    }
                    return util.getLink(action, model, count, totalCounter, {
                        className: 'entity-action entity-action-link',
                        label: action.label
                    });
                }, this);
                $td.append(items);
                return $td;
            }
        }
    };
});
