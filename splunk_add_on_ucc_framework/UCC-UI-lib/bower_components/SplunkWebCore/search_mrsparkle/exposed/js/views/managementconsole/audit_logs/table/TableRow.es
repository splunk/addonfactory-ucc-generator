import $ from 'jquery';
import TableRowView from 'views/managementconsole/deploy/table/TableRow';

export default TableRowView.extend({
    initialize(options) {
        TableRowView.prototype.initialize.call(this, $.extend(true, options, {
            columnBlacklist: [
                'entityType',
                'editTime',
                'editUser',
            ],
        }));
    },
});