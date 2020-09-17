define(
    [
        "jquery",
        "underscore",
        "views/Base",
        "splunk.util"
    ],
    function(
        $,
        _,
        BaseView,
        splunk_util
    ) {
        return BaseView.extend({
            className: 'enable-wrapper',

            events: {
                'click .enable-checkbox': function() {
                    var checked = this.$("#" + this.id).prop("checked");
                    this.trigger('enableDisable', checked);
                    document[this.id].submit();
                }
            },

            render: function() {
                if (this.model.local) {
                    this.id = "enable_" + this.model.local.getAppId();
                    var namespace = this.model.application.get("app"),
                        endpoint = splunk_util.make_url("manager", namespace, "apps", "local", "multidelete"),
                        key = splunk_util.getFormKey(),
                        ctrl = this.model.local.isDisabled() ? 'enable' : 'disable',
                        link = this.model.local.getLink(ctrl),
                        name = this.model.local.getAppId();

                    this.$el.html(this.compiledTemplate({
                        id: this.id,
                        endpoint: endpoint,
                        splunk_form_key: key,
                        ctrl: ctrl,
                        ctrl_link: link,
                        ctrl_name: name
                    }));
                    this.$("#" + this.id).prop("checked", !this.model.local.isDisabled());
                }
                return this;
            },

            template: ' \
                <input id="<%- id %>" class="enable-checkbox" type="checkbox"> \
                <label for="<%- id %>"> \
                    <%- _("Enable").t() %> \
                </label> \
                <form name="<%- id %>" action="<%- endpoint %>" method="post"> \
                    <input type="hidden" name="splunk_form_key" value="<%- splunk_form_key %>"> \
                    <input type="hidden" name="ctrl" id="ctrl" value="<%- ctrl %>"> \
                    <input type="hidden" name="ctrl_link" id="ctrl-link" value="<%- ctrl_link %>"> \
                    <input type="hidden" name="ctrl_name" id="ctrl-name" value="%<- ctrl_name %>"> \
                    <input type="hidden" name="showAppContext" id="showAppContext"> \
                    <input type="hidden" name="app_only" value="True"> \
                </form> \
            '
        });
    }
);