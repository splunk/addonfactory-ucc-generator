define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/shared/controls/ControlGroup',
        'views/shared/FlashMessages',
        'views/shared/controls/SyntheticCheckboxControl',
        'views/shared/Faq',
        'uri/route'
    ],
    function (
        _,
      module,
      BaseView,
      ControlGroup,
      FlashMessagesView,
      SyntheticCheckboxControl,
      Faq,
      route
        ) {
        /**
         */
        return BaseView.extend({
            moduleId: module.id,
            className: '',
            events: {
                'click .control': function() {
                    // reset error messages
                    if (this.children.flashMessages.flashMsgCollection.length) {
                        this.model.input.trigger('validated', true, this.model.input, []);
                        this.$('.control-group').removeClass('error');
                    }
                }
            },
            initialize: function (options) {
                BaseView.prototype.initialize.apply(this, arguments);

                this.model.input.set({
                    ipv4: 1,
                    ipv6: 1,
                    connect: 1,
                    accept: 1,
                    inbound: 1,
                    outbound: 1,
                    tcp: 1,
                    udp: 1
                });

                this.children.flashMessages = new FlashMessagesView({
                    model: {
                        input: this.model.input
                    }
                });

                this.children.name = new ControlGroup({
                    className: 'print-name control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.name',
                        model: this.model.input,
                        save: false
                    },
                    label:   _('Network monitor name').t()
                });

                this.children.addressFamily_ipv4 = new SyntheticCheckboxControl({
                    modelAttribute: 'ipv4',
                    model: this.model.input,
                    label: _('ipv4').t()
                });

                this.children.addressFamily_ipv6 = new SyntheticCheckboxControl({
                    modelAttribute: 'ipv6',
                    model: this.model.input,
                    label: _('ipv6').t()
                });

                this.children.packetType_connect = new SyntheticCheckboxControl({
                    modelAttribute: 'connect',
                    model: this.model.input,
                    label: _('Connect').t()
                });
                this.children.packetType_accept = new SyntheticCheckboxControl({
                    modelAttribute: 'accept',
                    model: this.model.input,
                    label: _('Accept').t()
                });
                this.children.packetType_transport = new SyntheticCheckboxControl({
                    modelAttribute: 'transport',
                    model: this.model.input,
                    label: _('Transport').t()
                });

                this.children.direction_inbound = new SyntheticCheckboxControl({
                    modelAttribute: 'inbound',
                    model: this.model.input,
                    label: _('Inbound').t()
                });
                this.children.direction_outbound = new SyntheticCheckboxControl({
                    modelAttribute: 'outbound',
                    model: this.model.input,
                    label: _('Outbound').t()
                });

                this.children.protocol_tcp = new SyntheticCheckboxControl({
                    modelAttribute: 'tcp',
                    model: this.model.input,
                    label: _('TCP').t()
                });
                this.children.protocol_udp = new SyntheticCheckboxControl({
                    modelAttribute: 'udp',
                    model: this.model.input,
                    label: _('UDP').t()
                });

                this.children.remoteAddress = new ControlGroup({
                    className: 'net-remoteAddress control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.remoteAddress',
                        model: this.model.input,
                        save: false
                    },
                    label:   _('Remote Address').t(),
                    tooltip: _('Specifies remote address to monitor. Can be a regular expression.').t()
                });

                this.children.process = new ControlGroup({     // TODO: see submit logic in original xml
                    className: 'net-process control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.process',
                        model: this.model.input,
                        save: false
                    },
                    label:   _('Process').t(),
                    tooltip: _('Specifies process/application name to monitor. Can be a regular expression.').t()
                });

                this.children.user = new ControlGroup({     // TODO: see submit logic in original xml
                    className: 'net-user control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.user',
                        model: this.model.input,
                        save: false
                    },
                    label:   _('User').t(),
                    tooltip: _('Specifies user name to monitor. Can be a regular expression.').t()
                });

                var netmonHelpLink = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.adddata.winnetmon'
                );

                this.children.faq = new Faq({faqList: this.faqList(netmonHelpLink)});

            },

            faqList: function() {
                return [
                    {
                        question: _('What information does the Windows network monitoring input gather?').t(),
                        answer: _('The network monitoring input gathers network activity on a Windows machine, including IP \
                    address family, packet type, protocol used, the machines involved in the transaction, and more.').t() +
                            '<a class="external" href="' + arguments[0] + '" target="_blank">' + _("Learn More").t() + '</a>'
                    },
                    {
                        question: _('Does Splunk need to run as an administrative user to access local network monitoring information?').t(),
                        answer: _('Yes. You must run Splunk as the "Local System" user or as a domain user that is a member of the local Administrators group.').t()
                    },
                    {
                        question: _('Can I configure Windows network monitoring on remote Windows machines?').t(),
                        answer: _('Yes, if you install a universal forwarder on the machines that you want to get this \
                    information from. You can’t collect this type of data from remote machines from this Splunk instance.').t()
                    },
                    {
                        question: _('I\'m having problems with the network monitoring input. Are there any common problems I should be aware of?').t(),
                        answer: _('Make sure that you have updated the machine with all available patches, including the \
                    <a href="http://support.microsoft.com/kb/2685811" target="_blank"> Kernel-Mode Driver Framework version 1.11 Update</a> \
                    that is part of Knowledge Base article 2685811. Network monitoring input might not function if \
                    this update is not present on your system.').t()
                    }
                    ];
            },

            template:
                '<div class="inputform_wrapper">\
                    <p>\
                        <%= _("Configure this instance to capture statistics about network activity into or out of this machine. \
                        The network monitor input runs once for every input defined, at the interval specified in the input.").t() %> \
                    </p>\
                    <p>\
                        <%= _("This monitor is available only on 64-bit Windows systems. ").t() %>\
                        <a class="external" href="<%- helpLink %>" target="_blank"> <%= _("Learn More").t() %> </a>\
                    </p>\
                 </div>',

            settingsTemplate:
                '<div class="control-group clearfix">\
                    <label class="control-label"><%= _("Address Family").t() %></label>\
                        <div class="inline" id="addressFamily_ipv4"/>\
                        <div class="inline" id="addressFamily_ipv6"/>\
                 </div>\
                 <div class="control-group clearfix">\
                     <label class="control-label"><%= _("Packet Type").t() %></label>\
                        <div class="inline" id="packetType_connect"/>\
                        <div class="inline" id="packetType_accept"/>\
                        <div class="inline" id="packetType_transport"/>\
                 </div>\
                 <div class="control-group clearfix">\
                     <label class="control-label"><%= _("Direction").t() %></label>\
                        <div class="inline" id="direction_inbound"/>\
                        <div class="inline" id="direction_outbound"/>\
                 </div>\
                 <div class="control-group clearfix">\
                     <label class="control-label"><%= _("Protocol").t() %></label>\
                        <div class="inline" id="protocol_tcp"/>\
                        <div class="inline" id="protocol_udp"/>\
                 </div>\
                 <div style="clear:both;"/>\
                ',


            render: function () {
                var helpLink = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.adddata.winnetmon'
                );

                this.$el.append(_.template(this.template, {helpLink: helpLink}));

                var $form = this.$('.inputform_wrapper');
                $form.append(this.children.flashMessages.render().el);
                $form.append(this.children.name.render().el);
                $form.append(_.template(this.settingsTemplate));
                this.$('#addressFamily_ipv4').append(this.children.addressFamily_ipv4.render().el);
                this.$('#addressFamily_ipv6').append(this.children.addressFamily_ipv6.render().el);
                this.$('#packetType_connect').append(this.children.packetType_connect.render().el);
                this.$('#packetType_accept').append(this.children.packetType_accept.render().el);
                this.$('#packetType_transport').append(this.children.packetType_transport.render().el);
                this.$('#direction_inbound').append(this.children.direction_inbound.render().el);
                this.$('#direction_outbound').append(this.children.direction_outbound.render().el);
                this.$('#protocol_tcp').append(this.children.protocol_tcp.render().el);
                this.$('#protocol_udp').append(this.children.protocol_udp.render().el);
                $form.append(this.children.remoteAddress.render().el);
                $form.append(this.children.process.render().el);
                $form.append(this.children.user.render().el);
                this.$el.append(this.children.faq.render().el);
                return this;
            }
        });
    }
);
