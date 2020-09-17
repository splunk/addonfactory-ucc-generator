define([
    'jquery',
    'helpers/user_agent',
    'contrib/select2-3.4.6/select2.css',
    'views/shared/pcss/select2.pcss',
    'imports?jQuery=jquery!contrib/select2-3.4.6/select2'
], function($, UserAgent, select2css, select2cssShared, select2) {
    var Select2 = window.Select2;
    Select2['class'].single.prototype.getPlaceholder = function() {
        // if a placeholder is specified on a single select without a valid placeholder option ignore it
        if (this.select) {
            if (this.getPlaceholderOption() === undefined) {
                return undefined;
            }
        }
        // https://github.com/select2/select2/issues/3300
        // SPL-111895, SPL-112886, disable placeholder for IE <= 11
        if (UserAgent.isIELessThan(12)) {
            return undefined;
        }
        return Select2['class']['abstract'].prototype.getPlaceholder.apply(this, arguments);
    };
    return Select2;
});
