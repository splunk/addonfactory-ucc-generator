/**
 * @author ahebert
 * @date 4/15/16
 *
 * Represents a cell in the table. The cell contains information of the entity's sharing.
 */
define([
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'util/splunkd_utils'
    ],
    function (
        $,
        _,
        module,
        BaseView,
        splunkdUtils
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: "sharing-cell",

            getSharingString: function() {
                var sharing = this.model.entity.entry.acl.get("sharing");
                if (splunkdUtils.GLOBAL === sharing) {
                    return _('Global').t();
                } else if (splunkdUtils.APP === sharing) {
                    return !this.model.user.canUseApps() ? _('Global').t() : _('App').t();
                } else {
                    return _('Private').t();
                }
            },

            render: function () {
                var html = this.compiledTemplate({
                    sharing: this.getSharingString(),
                    model: this.model.entity
                });
                this.$el.html(html);
                return this;
            },

            template: ' <span class="sharing-info"><%- sharing %></span>'
        });
    });

