/**
 * @author jszeto
 * @date 9/30/15
 *
 * Displayed when the user goes to the search page via a link and that search contains a potentially risky command (eg.
 * sendemail). This can pose a security risk, so we warn the user about the side effects.
 */

define([
        'jquery',
        'underscore',
        'backbone',
        'module',
        'views/shared/Modal',
        'uri/route',
        'util/keyboard',
        './RiskyCommand.pcss'
    ],

    function(
        $,
        _,
        Backbone,
        module,
        Modal,
        route,
        keyboard,
        css
    ) {
        
        return Modal.extend({
            moduleId: module.id,
            /**
             * @param {Object} options {
             *     model: {
             *         searchJob: <models.search.Job>,
             *         application: <models.Application>
             *     }
             * }
             */
            className: Modal.CLASS_NAME + " risky-command-dialog",
            initialize: function(options) {
                Modal.prototype.initialize.apply(this, arguments);
                var defaults = {
                    actionableText: _("Do you want to investigate the search string?").t(),
                    hideInvestigateBtn: false
                };
                _.defaults(this.options, defaults);
                this.listenTo(this, 'shown', function(options) {
                    this.$el.on('keyup.dismiss.modal', function(e) {
                        if (this.options.keyboard && e.which === keyboard.KEYS.ESCAPE) {
                            this.trigger('cancel');
                        }
                    }.bind(this));
                    $('.modal-backdrop').on('click.' + this.cid, function(e) {
                        if (this.options.backdrop) {
                            this.trigger('cancel');
                        }
                    }.bind(this));
                }.bind(this));

                this.listenTo(this, 'hidden', function(options) {
                    this.$el.off('keyup.dismiss.modal');
                    $('.modal-backdrop').off('click.' + this.cid);
                }.bind(this));
            },
            
            focus: function() { 
                this.$('.modal-btn-investigate').focus();
            },

            events: $.extend({}, Modal.prototype.events, {
                'click .modal-btn-confirm': function(e) {
                    this.hide();
                    this.trigger('runSearch');
                    e.preventDefault();
                },
                
                'click .modal-btn-investigate': function(e) {
                    this.hide();
                    this.trigger('investigate');
                    e.preventDefault();
                },
                
                'click .modal-btn-cancel, .close': function(e) {
                    this.trigger('cancel');
                }
            }),
            
            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html( _('Warning').t());
                
                this.$(Modal.BODY_SELECTOR).html(this.compiledTemplate({
                    _: _,
                    commands: this.model.searchJob.getRiskyCommands(),
                    actionableText: this.options.actionableText,
                    learnMoreLink: route.docHelp(
                        this.model.application.get("root"),
                        this.model.application.get("locale"),
                        'learnmore.splsafeguards')
                }));
                
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn modal-btn-confirm">' + _('Run').t() + '</a>');
                if (!this.options.hideInvestigateBtn) {
                    this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn btn-primary modal-btn-primary modal-btn-investigate">' + _('Investigate').t() + '</a>');
                }
                return this;
            },

            template: '\
                <div class="alert-warning">\
                    <div>\
                        <i class="icon-alert"/>\
                        <%- _("The search that you are about to run contains commands that might present a security risk.").t() %><a class="learn-more-link" href="<%- learnMoreLink %>" target="_blank" title="<%- _("Splunk help").t()%>"><%- _("Learn More").t() %> <i class="icon-external"></i></a>\
                        </br>\
                    </div>\
                    <%- _("The commands are:").t() %>\
                    <ul>\
                    <% _.each(commands, function(command) { %>\
                        <li><%- command %></li>\
                    <% }); %>\
                    </ul>\
                    <%- actionableText %>\
                </div>\
            '
        });
    }
);