define(function(require, exports, module) {
    var _ = require("underscore");
    var mvc = require("./mvc");
    var console = require("util/console");
    require("css!../css/messages.css");

    // Predefined messages
    var messages = {
        'cancelled': {
            icon: "info-circle",
            level: "info",
            message: _("Search was cancelled").t()
        },
        'refresh': {
            icon: "info-circle",
            level: "info",
            message: _("Search is refreshing...").t()
        },
        'empty': {
            icon: "blank",
            level: "info",
            message: ""
        },
        'unresolved-search': {
            icon: "warning-sign",
            level: "error",
            message: _("Search is waiting for input...").t()
        },
        'unresolved-tokens': {
            icon: "warning-sign",
            level: "error",
            message: _("Search was not dispatched. To adjust search dispatch settings, edit the dashboard XML.").t()
        },
        'no-events': {
            icon: "info-circle",
            level: "info",
            message: _("Search did not return any events.").t()
        },
        'no-results': {
            icon: "blank",
            level: "info",
            message: _("No results found.").t()
        },
        'no-search': {
            icon: "info-circle",
            level: "info",
            message: _("No search set.").t()
        },
        'no-stats': {
            icon: "warning-sign",
            level: "error",
            message: _("Search isn't generating any statistical results.").t()
        },
        'not-started': {
            icon: "info-circle",
            level: "info",
            message: _("No search started.").t()
        },
        'waiting': {
            icon: "blank",
            level: "info",
            message: _("Waiting for data...").t()
        },
        'waiting-queued': {
            icon: "info-circle",
            level: "info",
            message: _("Waiting for queued job to start.").t()
        },
        'waiting-preparing': {
            icon: "info-circle",
            level: "info",
            message: _("Waiting for search to start: job is preparing.").t()
        }
    };

    var messageTemplate = '\
<div class="splunk-message-container <%- compact ? \'compact\' : \'\' %>">\
    <div class="alert alert-<%= level %>"> \
        <i class="icon-alert"></i> \
        <%- message %> \
    </div> \
</div>';

    var SPLUNKD_MESSAGE_ORDER = { 'FATAL': 1, 'ERROR': 2, 'WARN': 3, 'INFO': 4, 'DEBUG': 5 };

    var Messages = {
        messageTemplate: messageTemplate,
        messages: messages,

        // Render the indicated message into the given container element.
        // The `info` argument is either a message name (for predefined
        // messages) or a literal message info structure.
        render: function(info, $el) {
            if (_.isString(info)) {
                info = this.messages[info];
            }

            if (!info) {
                console.log("Warning: Unknown message: " + info);
                return;
            }

            // default compact to false
            info.compact = !!info.compact;
            $el.html(_.template(this.messageTemplate, info));
        },

        resolve: function(info) {
            return this.messages[info];
        },

        _extractErrorMessage: function(state, contentProperty, combineMessages, defaultMessage) {
            if (state) {
                var content = state[contentProperty || 'content'];
                if (content && content.isZombie) {
                    return _("The search job terminated unexpectedly.").t();
                }
                if (content && content.messages && content.messages.length) {
                    // Eliminate all non-error/fatal or empty messages
                    var msgs = _(content.messages).filter(function(msg) {
                        return (msg.type === 'ERROR' || msg.type === 'FATAL') && !!msg.text;
                    });
                    if (msgs.length) {
                        var result = _.chain(msgs)
                                // Show fatal messages first
                                .sortBy(function(msg) { return SPLUNKD_MESSAGE_ORDER[msg.type] || 99; })
                                // Extract unique message texts
                                .pluck('text').unique().value();

                        return combineMessages ? result.join('; ') : result[0];
                    }
                }
            }
            return defaultMessage;
        },

        getSearchErrorMessage: function(state) {
            return Messages._extractErrorMessage(state, 'data', true);
        },

        getSearchFailureMessage: function(jobState) {
            return Messages._extractErrorMessage(jobState, 'content', false, _("The search failed").t());
        }
    };

    return Messages;
});
