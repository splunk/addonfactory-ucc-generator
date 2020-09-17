define([
    'underscore',
    'jquery'
], function (
    _,
    $
) {
    var strings = {
        PENDING_CHANGE: _('Pending Change').t(),
        STATUS: _('Status').t()
    };
    return {
        headerTypes: {
            rowExpansion: function (column) {
                return {
                    className: 'col-info',
                    html: '<i class="icon-info"></i>'
                };
            },
            bulkEdit: function (column) {
                return {className: 'bulkedit', html: '<span class="bulkedit"><input type="checkbox"/></span>'};
            },
            dmcPendingChange: function (column) {
                return {className: 'pendingChange', html: strings.PENDING_CHANGE};
            },
            enableDisableStatus: function (column) {
                return {className: 'status', html: strings.STATUS};
            }
        }
    };
});
