define([
    'jquery',
    'underscore'
], function (
    $,
    _
) {
    var tdTPL = _.template('<td class="bulkedit"><input type="checkbox" data-no="<%- no %>"/></td>');
    var bulkSelected = false;

    return {
        events: {
            'click th.bulkedit input[type=checkbox]': function (e) {
                // e needs to be the checkbox
                var $e = $(e.currentTarget);
                var selectedCheckboxes = $e.closest('table')
                    .find('td.bulkedit input[type=checkbox]');
                var selectedIds = [];
                selectedCheckboxes.prop('checked', $e.prop('checked'));
                bulkSelected = $e.prop('checked');
                if (bulkSelected) {
                    selectedIds = _.map(selectedCheckboxes, function (e) {
                        return e.dataset.no;
                    });
                }
                this.radio.trigger('select:click', {selected: selectedIds});
            },
            'click td.bulkedit input[type=checkbox]': function (e) {
                var $e = $(e.currentTarget);
                var $table = $e.closest('table');
                var $selectAllCheckbox = $table.find('th.bulkedit input[type=checkbox]');
                var $selectedCheckboxes = $table.find('td.bulkedit input[type=checkbox]:checked');
                var selectedIds = [];
                // unselect selectall if one of the items is unselected
                if (bulkSelected) {
                    bulkSelected = !bulkSelected;
                    $selectAllCheckbox.prop('checked', $e.prop('checked'));
                } else {
                    // if all the checkboxes are selected, then select selectall
                    var $allCheckboxes = $table.find('td.bulkedit input[type=checkbox]');
                    if ($allCheckboxes.length === $selectedCheckboxes.length) {
                        $selectAllCheckbox.prop('checked', $e.prop('checked'));
                        bulkSelected = !bulkSelected;
                    }
                }
                selectedIds = _.map($selectedCheckboxes, function (e) {
                    return e.dataset.no;
                });
                this.radio.trigger('select:click', {selected: selectedIds, no: $e.data('no')});
            }
        },
        rowTypes: {
            bulkEdit: function (column, model, count, totalCounter) {
                return tdTPL({no: count});
            }
        }
    };
});
