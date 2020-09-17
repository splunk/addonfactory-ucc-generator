define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/controls/ControlGroup',
        'views/shared/FlashMessages',
        'collections/services/data/inputs/WinEventLogsAll',
        'models/services/data/inputs/WinEventLogsWMI',
        'views/shared/waitspinner/Master',
        'views/shared/Faq',
        'uri/route'
    ],
    function ($,
              _,
              module,
              BaseView,
              ControlGroup,
              FlashMessagesView,
              EventLogsAllCollection,
              EventLogsWMIModel,
              WaitSpinner,
              Faq,
              route
    ) {
        /**
         */
        return BaseView.extend({
            moduleId: module.id,
            className: '',
            initialize: function (options) {
                BaseView.prototype.initialize.apply(this, arguments);

                if (!this.model.eventLogsWMI) {
                    this.model.eventLogsWMI = new EventLogsWMIModel();
                }

                this.children.waitSpinner = new WaitSpinner();

                this.children.flashMessages = new FlashMessagesView({
                    model: {
                        wmiLookup: this.model.eventLogsWMI,
                        input: this.model.input
                    }
                });
                this.children.name = new ControlGroup({
                    className: 'name control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.name',
                        model: this.model.input,
                        save: false
                    },
                    label:   _('Event Log collection name').t(),
                    tooltip: _('Assign a unique name to this collection').t()
                });

                this.children.lookupHost = new ControlGroup({
                    className: 'lookup-host control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.lookup_host',
                        model: this.model.input,
                        save: false
                    },
                    label:   _('Choose logs from this host').t(),
                    tooltip: _('Enter IP address or host name, for example 10.1.1.39 or foo.ad.yourdomain.com.').t()
                });

                this.children.hosts = new ControlGroup({
                    className: 'hosts control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'hosts',
                        model: this.model.input.entry.content,
                        save: false,
                        placeholder: _('optional').t()
                    },
                    label:   _('Collect the same set of logs from additional hosts').t(),
                    tooltip: _('Enter a comma-separated list of host names or IP addresses.').t()
                });

                var wmiHelpLink = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.recipes.windows.wmi'
                );

                this.children.faq = new Faq({faqList: this.faqList(wmiHelpLink)});


            },

            events: {
                'click a.lookup-btn': function() {
                    if (!this.model.input.get('ui.lookup_host')) {
                        this.model.input.set('ui.lookup_host', 'localhost');
                    }
                    this.$('#eventlogs-placehoder').html(this.children.waitSpinner.render().el);
                    this.children.hosts.$el.hide();
                    this.model.input.set('ui.logs', null);
                    this.fetchRemoteEventLogs();
                },
                'click .control': function() {
                    // reset error messages
                    if (this.children.flashMessages.flashMsgCollection.length) {
                        this.model.input.trigger('validated', true, this.model.input, []);
                        this.$('.control-group').removeClass('error');
                    }
                }
            },

            fetchRemoteEventLogs: function() {
                var lookupHost = this.model.input.get('ui.lookup_host');
                if (!lookupHost) {
                    this.model.input.validate(['ui.lookup_host']);
                    return;
                }

                this.children.waitSpinner.$el.show();
                this.children.waitSpinner.start();
                this.model.eventLogsWMI.set({id: lookupHost});
                this.model.eventLogsWMI.fetch({
                    data: {
                        sort_key: 'importance',
                        sort_dir: 'asc',
                        sort_mode: 'num',
                        server: this.model.input.get('ui.lookup_host')
                    }
                }).done(function() {
                    this.updateLogs(this.model.eventLogsWMI.entry.content.get('logs'));
                    this.reflowLogs();
                }.bind(this)).fail(function() {
                    this.children.waitSpinner.stop();
                    this.children.waitSpinner.$el.hide();
                }.bind(this));
            },

            updateLogs: function(loglist) {
                var availableItems = _.map(loglist, function(item) {
                        return {label:item, value:item};
                    }),
                    selectedItems = this.model.input.get('ui.logs');

                this.children.eventLogs = new ControlGroup({
                    className: 'net-port control-group',
                    controlType: 'Accumulator',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.logs',
                        model: this.model.input,
                        save: false,
                        availableItems: availableItems,
                        selectedItems: selectedItems
                    },
                    label:   _('Select Event Logs').t(),
                    help: _('Select the Windows Event Logs you want to index from the list.').t()
                });

            },

            reflowLogs: function() {
                this.children.waitSpinner.stop();
                this.children.waitSpinner.$el.hide();
                this.$('#eventlogs-placehoder').html(this.children.eventLogs.render().el);
                this.children.hosts.$el.show();
            },

            faqList: function() {
                return [
                {
                    question: _('What is the best method for monitoring event logs of remote windows machines?').t(),
                    answer: _('If possible, use a universal forwarder rather than WMI to collect data from remote \
                    machines. The resource load of WMI can exceed that of a Splunk universal forwarder in \
                    many cases. In particular, consider a forwarder if you collect multiple event logs or performance \
                    counters from each host, or from very busy hosts like domain controllers. ').t() +
                    '<a class="external" href="' + arguments[0] + '" target="_blank">' + _("Learn More").t() + '</a>'
                }
                ];
            },

            template:
                '<div class="inputform_wrapper">\
                    <p> \
                        <%= _("Configure this instance to monitor Event Log channels of remote Windows machines using the \
                        Windows Management Instrumentation (WMI) framework. Splunk must run as an Active Directory \
                        user with appropriate access to the remote machine. Both Splunk and the remote machine must \
                        reside in the same AD domain or forest.").t() %> \
                        <a class="external" href="<%- helpLink %>" target="_blank"> <%= _("Learn More").t() %> </a>\
                    </p>\
                </div>',

            render: function () {
                var helpLink = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.adddata.wineventlog'
                );

                this.$el.append(_.template(this.template, {helpLink: helpLink}));
                var $form = this.$(".inputform_wrapper");

                $form.append(this.children.flashMessages.render().el);
                $form.append(this.children.name.render().el);
                $form.append($('<a class="btn lookup-btn" style="margin-bottom: 20px;float:right;">'+ _("Find logs").t() + '</a><div style="width: 513px;" id="lookup-host-placeholder"></div>'));
                this.$('#lookup-host-placeholder').append(this.children.lookupHost.render().el);
                $form.append($('<div id="eventlogs-placehoder"></div>'));
                $form.append(this.children.hosts.render().el);

                this.children.waitSpinner.$el.hide();
                this.children.hosts.$el.hide();
                this.$el.append(this.children.faq.render().el);

                if (this.model.input.get('ui.logs')) {
                    // if coming from the next step
                    this.updateLogs(this.model.eventLogsWMI.entry.content.get('logs'));
                    this.reflowLogs();
                    this.children.hosts.$el.show();
                }

                return this;
            }
        });
    }
);
