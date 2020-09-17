// splunk bar
define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'views/Base',
        'splunk.util'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        BaseView,
        splunk_util
        ){
        /**
         * View Hierarchy:
         *
         * Messages
         */
        return BaseView.extend({
            moduleId: module.id,
            className: 'view-navbar-global navbar navbar-fixed-top',
            messageMap: {
                'restart_required': _('Splunk must be restarted for changes to take effect. [[/manager/search/control|Click here to restart from the Manager]].').t()
            },
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
            },
            render: function() {

                var msgId = (this.model.get('id')||'').toLowerCase(),
                    msg,
                    msgLevel = this.model.get('severity') || 'warn';
                if (msgId && this.messageMap[msgId]) {
                    msg = this.messageMap[msgId];
                } else {
                    msg = this.model.get("content") || "";
                }
                var html = this.compiledTemplate({
                    msgId: msgId,
                    msg: splunk_util.getWikiTransform(msg),
                    msgLevel: msgLevel
                });
                this.$el = $(html);
                return this;
            },
            template: '<li class="<%- msgLevel %>" data-islegacy="1" data-id="<%- msgId %>">\
                <span class="message-content"><%= msg %></span>\
                <a href="#" class="delete-message"><i class="icon-x-circle"></i></a>\
            </li>'
        });
    });
