/**
 * @author ahebert
 * @date 4/18/16
 *
 * Represents a cell in the table. The cell contains information of the entity's status.
 */
define([
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'splunk.util'
    ],
    function (
        $,
        _,
        module,
        BaseView,
        splunkUtils
    ) {

        return BaseView.extend({
            moduleId: module.id,
            className: "status-cell",

            render: function () {
                var html;

                if (!splunkUtils.normalizeBoolean(this.model.entity.entry.content.get("disabled"))) {
                    html = _.template(this.enabledtemplate);
                } else {
                    html = _.template(this.disabledtemplate);
                }

                this.$el.html(html);

                return this;
            },

            enabledtemplate: '\
                <i class="icon-check enable-icon"></i> <span class="enable-text"><%= _("Enabled").t() %></span>\
            ',

            disabledtemplate: '\
                <i class="icon-lock disable-icon"></i> <span class="enable-text"><%= _("Disabled").t() %></span>\
            '

        });
    });

