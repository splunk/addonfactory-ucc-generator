define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'views/shared/FlashMessages',
        'uri/route',
        'splunk.util'
    ], 
    function($, _, Backbone, module, FlashMessages, route, splunkUtil) {

        var FlashMessagesView = FlashMessages.extend({
            moduleId: module.id,
            initialize: function(options) {
                FlashMessages.prototype.initialize.call(this, options);

                this.renderMessagesList = false;
            },
            events: $.extend({}, FlashMessages.prototype.events, {
                'click .error-details': function(e) {
                    e.preventDefault();
                    this.renderMessagesList = !this.renderMessagesList;
                    this.renderMessages();
                }
            }),
            renderMessages: function() {
                if (!this.model.searchJob.entry.content.get('isFailed') && this.flashMsgCollection.length > 1) {
                    var linkTemplate, error,
                    messagesCount =  this.flashMsgCollection.length;
                    
                    error = splunkUtil.sprintf("%s errors occurred while the search was executing. Therefore, search results might be incomplete. ", messagesCount);

                    linkTemplate = _.template(this.toggleLinkTemplate, { 
                        error: error,
                        expandedState: this.renderMessagesList
                    });

                    this.$el.html(linkTemplate);

                    if (this.renderMessagesList) {
                        this.insertMessages(this.messagesListTemplate);
                    }
                } else {
                    this.insertMessages(this.template);
                }
            },
            insertMessages: function(errorTemplate) {
                this.$el.append(_.template(errorTemplate, {
                    flashMessages: this.flashMsgCollection,
                    route: route,
                    application: this.options.applicationModel,
                    splunkUtil: splunkUtil
                }));
            },
            render: function() {
                this.$el.empty();
                this.renderMessages();
                (!this.flashMsgCollection.length) ? this.$el.hide() : this.$el.show();
                return this;
            },
            template: '\
                <% flashMessages.each(function(flashMessage){ %> \
                    <div class="alert alert-<%- flashMessage.get("type") %>">\
                        <i class="icon-alert"></i>\
                        <%= splunkUtil.getWikiTransform(_.unescape(flashMessage.get("html"))) %>\
                        <% if (flashMessage.get("help")) { %>\
                            <a href="<%- route.docHelp(application.get("root"), application.get("locale"), flashMessage.get("help")) %>"\
                            target="_blank">\
                                <%- _("Learn More").t() %>\
                                <i class="icon-external"></i>\
                            </a>\
                        <% } %>\
                    </div>\
                <% }); %> \
            ',
            messagesListTemplate: '\
                <ul>\
                    <% flashMessages.each(function(flashMessage){ %> \
                        <li><%= splunkUtil.getWikiTransform(_.unescape(flashMessage.get("html"))) %> \
                        <% if (flashMessage.get("help")) { %>\
                            <a class="learn-more" href="<%- route.docHelp(application.get("root"), application.get("locale"), flashMessage.get("help")) %>"\
                            target="_blank">\
                                <%- _("Learn More").t() %>\
                                <i class="icon-external"></i>\
                            </a>\
                        <% } %>\
                        </li>\
                    <% }); %> \
                </ul>\
            ',
            toggleLinkTemplate: '\
                <div class="alert alert-error">\
                    <i class="icon-alert"></i>\
                    <%= error %>\
                    <% if (expandedState) { %> \
                        <a class="error-details" href="#"><%- _("Hide errors.").t() %></a>\
                    <% } else { %> \
                        <a class="error-details" href="#"><%- _("Show errors.").t() %></a>\
                    <% } %> \
                </div>\
            '
        });

        return FlashMessagesView;
    }
);