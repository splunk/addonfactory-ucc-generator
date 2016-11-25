/*global define,$*/
define([
    'views/shared/controls/Control',
    'splunk.util',
    'app/util/Util'
], function (
    Control,
    SplunkdUtil,
    Util
) {
    return Control.extend({
        initialize: function (options) {
            Control.prototype.initialize.apply(this, arguments);
            this.displayText = options.displayText;
            this.helpLink = options.helpLink;
            if (this.helpLink) {
                this.url = SplunkdUtil.make_url("help") + "?location=" + Util.getLinkPrefix() + this.helpLink;
            }
        },

        render: function () {
            this.$el.html(this.compiledTemplate({displayText: this.displayText, url: this.url}));
            return this;
        },

        template: '<div><%- displayText %><% if (url) { %><a class=\"external\" target=\"_blank\" href=\"<%- url %>\">Learn more</a><% } %></div>'
    });
});
