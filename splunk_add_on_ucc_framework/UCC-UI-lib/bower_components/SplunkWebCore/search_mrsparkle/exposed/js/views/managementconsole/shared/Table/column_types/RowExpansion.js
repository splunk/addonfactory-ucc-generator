define([
    'underscore',
    'jquery'
], function (
    _,
    $
) {
    var tdCollapsedTPL = _.template(
        '<td class="expands" data-key="<%- key %>" data-state="collapsed" data-no="<%- no %>" rowspan="1">' +
        '<a href="#"><i class="icon-triangle-right-small"></i></a>' +
        '</td>'
    );
    var tdExpandedTPL = _.template(
        '<td class="expands" data-key="<%- key %>" data-state="expanded" data-no="<%- no %>" rowspan="2">' +
        '<a href="#"><i class="icon-triangle-down-small"></i></a>' +
        '</td>'
    );
    var detailTRTPL = _.template(
        '<tr class="more-info <%- styleClass %>" data-key="<%- key %>">' +
        '<td class="details" colspan="<%- colspan %>" data-rendered="false"> Loading ... </td>' +
        '</tr>');

    function showDetails($e) {
        var state = $e.data('state');
        this.radio.trigger('row:expanded', {no: $e.data('no')});

        if (state === 'expanded') return;

        var $icon = $e.find('i');
        var $parent = $e.parent();
        var $next = $parent.next();
        var $details = $next.find('td.details');
        var key = parseInt($e.data('key'), 10);

        // show the detail panel
        $e.data('state', 'expanded');
        $icon.removeClass('icon-triangle-right-small');
        $icon.addClass('icon-triangle-down-small');
        $next.show();
        $e.attr('rowSpan', 2);

        // add detail content
        if ($details.data('rendered') == false) {
            $details.html(
                this.options.config.rowExpansion.renderer.apply(
                    this, [this.collection.at(key)]
                )
            );
            $details.data('rendered', true);
        }
    }

    function hideDetails($e) {
        var state = $e.data('state');
        this.radio.trigger('row:collapsed', {no: $e.data('no')});

        if (state === 'collapsed') return;

        var $icon = $e.find('i');
        var $parent = $e.parent();
        var $next = $parent.next();

        // collapse
        $e.data('state', 'collapsed');
        $icon.removeClass('icon-triangle-down-small');
        $icon.addClass('icon-triangle-right-small');
        $next.hide();
        $e.attr('rowSpan', 1);
    }

    function toggleDetails($selection) {
        var state = $selection.data('state');
        if (state === 'collapsed') {
            showDetails.call(this, $selection);
        } else {
            hideDetails.call(this, $selection);
        }
    }

    return {
        rowTypes: {
            rowExpansion: function (column, model, count, totalCounter) {
                if (this.options.rowExpansion.currentState === 'collapsed') {
                    return tdCollapsedTPL({key: count, no: count});
                }
                return tdExpandedTPL({key: count, no: count});
            },
            rowExpansionDetail: function (
                columns, model, count, totalCounter, styleClass
            ) {
                var $html = $(detailTRTPL({key: count, colspan: columns.length - 1, styleClass: styleClass}));
                if (this.options.rowExpansion.currentState === 'collapsed') {
                    $html.css('display', 'none');
                } else {
                    $html.find('td.details').html(this.options.rowExpansion.renderer.apply(this, [model]));
                }
                return $html;
            }
        },

        events: {
            'click td.expands': function (e) {
                e.preventDefault();
                var $e = $(e.currentTarget);
                toggleDetails.call(this, $e);
            }
        },

        toggleAllRows: function (expand) {
            var callback = !!expand ? showDetails : hideDetails;
            var rows = this.$('td.expands');
            _.each(rows, function toggleRow(row) {
                callback.call(this, $(row));
            }, this);
        }
    };
});
