define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/shared/controls/ControlGroup',
        'views/shared/FlashMessages',
        'views/shared/Faq',
        'uri/route',
        'splunk.util'
    ],
    function (_,
              module,
              BaseView,
              ControlGroup,
              FlashMessagesView,
              Faq,
              route,
              splunkUtil
    ) {
        /**
         */
        return BaseView.extend({
            moduleId: module.id,
            initialize: function (options) {
                BaseView.prototype.initialize.apply(this, arguments);

                this.children.flashMessages = new FlashMessagesView({
                    model: {
                        input: this.model.input
                    }
                });
                // set defaults
                var defaults = {
                        sourceSwitchPort: this.getSourceSwitchPort()
                    },
                    isForwarderMode = this.model.wizard.isForwardMode(),
                    canEditBoth = (this.model.user.canEditTCP() && this.model.user.canEditUDP()) || isForwarderMode;
                _.defaults(this.model.input.attributes, defaults);

                // Control description text to show 'TCP', 'UDP' or both depending on capabilities.
                this.tcpOrUdp = _('TCP').t();
                if (canEditBoth){
                    this.tcpOrUdp = _('TCP or UDP').t();
                } else if (this.model.user.canEditUDP()) {
                    this.tcpOrUdp = _('UDP').t();
                }

                this.children.sourceSwitch = new ControlGroup({
                    className: 'source-switch control-group',
                    controlType: 'SyntheticRadio',
                    controlClass: 'controls-halfblock',
                    controlOptions: {
                        modelAttribute: 'sourceSwitchPort',
                        model: this.model.input,
                        items: [
                            {
                                label: _('TCP').t(),
                                value: 'tcp',
                                className: 'tcpUdpBtn',
                                tooltip: !this.model.user.canEditTCP() && !isForwarderMode ? _('You do not have the capability to add a TCP port.').t() : undefined
                            },
                            {
                                label: _('UDP').t(),
                                value: 'udp',
                                className: 'tcpUdpBtn',
                                tooltip: !this.model.user.canEditUDP() && !isForwarderMode ? _('You do not have the capability to add a UDP port.').t() : undefined
                            }
                        ],
                        save: false,
                        enabled: canEditBoth // Disable switching of options if user does not have edit capabilities for both.
                    }
                });

                this.children.port = new ControlGroup({
                    className: 'net-port control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.name',
                        model: this.model.input,
                        save: false
                    },
                    label:   _('Port').t(),
                    help:    _('Example: 514').t(),
                    tooltip: splunkUtil.sprintf(_('%s port to listen on').t(), this.tcpOrUdp)
                });

                this.children.sourceOverride = new ControlGroup({
                    className: 'net-port control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.source',
                        model: this.model.input,
                        save: false,
                        placeholder: _('optional').t()
                    },
                    label:   _('Source name override').t(),
                    help: _('host:port').t(),
                    tooltip: splunkUtil.sprintf(_('If set, overrides the default source value for your %s entry.').t(), this.tcpOrUdp)
                });


                this.children.restrictToHost = new ControlGroup({
                    className: 'net-restrict control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.restrictToHost',
                        model: this.model.input,
                        save: false,
                        placeholder: _('optional').t()
                    },
                    label:   _('Only accept connection from').t(),
                    help:    _('example: 10.1.2.3, !badhost.splunk.com, *.splunk.com').t(),
                    tooltip: _('If not set, accepts connections from all hosts.').t()
                });

                this.children.faq = new Faq({faqList: this.faqList});

                this.model.input.on('change:sourceSwitchPort', function(model, sourceSwitchPort) {
                    // A tricky part: here we hackishly change the input model's url as the switch value changes.
                    // It's because we can't just switch a model from underneath a view on switch change.
                    if (sourceSwitchPort == 'tcp') {
                        this.model.input.url = this.model.wizard.isLocalMode() ? 'data/inputs/tcp/raw' : 'deployment/server/setup/data/inputs/tcp/remote_raw';
                    } else {
                        this.model.input.url = this.model.wizard.isLocalMode() ? 'data/inputs/udp' : 'deployment/server/setup/data/inputs/remote_udp';
                    }
                }, this);

            },

            getSourceSwitchPort: function() {
                var inputType = this.model.wizard.get('inputType'),
                    isForwarderMode = this.model.wizard.isForwardMode();
                if ((inputType === 'tcp' && this.model.user.canEditTCP()) || isForwarderMode) {
                    return 'tcp';
                }
                if ((inputType === 'udp' && this.model.user.canEditUDP()) || isForwarderMode) {
                    return 'udp';
                }
            },

            template:
                '<div class="inputform_wrapper"><p> \
                <% if (inputMode == 1) { %> \
                    <%= splunkUtil.sprintf(_("Configure this instance to listen on any %s port to capture data sent over the network (such as syslog).").t(), tcpOrUdp) %> \
                <% } else { %> \
                    <%= splunkUtil.sprintf(_("Configure selected Splunk Universal Forwarders to listen on any %s port \
                    to capture data sent over the network from services such as syslog. ").t(), tcpOrUdp) %> \
                <% } %> \
                    <a class="external" href="<%- helpLink %>" target="_blank"> <%= _("Learn More").t() %></a> \
                </p>\
                </div>',

            faqList: [
                {
                    question: _('How should I configure Splunk for syslog traffic?').t(),
                    answer: _('The syslog service runs on UDP port 514 by default. If possible, send this traffic over TCP for better transmission reliability.').t()
                },
                {
                    question: _('What\'s the difference between receiving data over TCP versus UDP?').t(),
                    answer: _('TCP requires a handshake between your system and the remote system for network communications. \
                    It ensures content delivery, as the sending machine waits for an acknowledgement from the recipient before \
                    passing more data along. With UDP, traffic arrives with best effort, with no knowledge of whether or not \
                    the data was received. You can specify a list of connection restrictions from specific machines or networks for either protocol.').t()
                },
                {
                    question: _('Can I collect syslog data from Windows systems?').t(),
                    answer: _('The system logging facility on Windows is the Windows Event Log service. However, if you \
                            install a third-party syslog service on your Windows hosts, you can collect the data on Splunk with syslog monitoring.').t()
                },
                {
                    question: _('What is a source type?').t(),
                    answer: _('A source type is a field that defines how Splunk handles a piece of incoming data. The \
                    source type defines specifications for line break behavior, timestamp location, and character set.').t()
                }
            ],

            render: function () {
                var helpLink = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.adddata.tcpudp'
                );

                this.$el.append(_.template(this.template, {
                    helpLink: helpLink,
                    inputMode: this.model.wizard.get("inputMode"),
                    splunkUtil: splunkUtil,
                    tcpOrUdp: this.tcpOrUdp
                }));

                var $form = this.$('.inputform_wrapper');
                $form.append(this.children.flashMessages.render().el);
                $form.append(this.children.sourceSwitch.render().el);
                $form.append(this.children.port.render().el);
                $form.append(this.children.sourceOverride.render().el);
                $form.append(this.children.restrictToHost.render().el);

                this.$el.append(this.children.faq.render().el);
                return this;
            }
        });
    }
);
