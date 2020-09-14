define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/controls/ControlGroup',
        'views/shared/FlashMessages',
        'collections/services/data/inputs/WinEventLogsAll',
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

                this.eventLogsAllCollection = new EventLogsAllCollection();

                this.children.flashMessages = new FlashMessagesView({
                    model: {
                        wmiLookup: this.eventLogsAllCollection,
                        input: this.model.input
                    }
                });

                if (this.model.wizard.isForwardMode()) {
                    this.model.input.set('ui.name', 'localhost');   // name is a required field, but its value is ignored

                    var availableItems = [],
                        selectedItems = [];
                    _.each(['Application', 'Forwarded Events', 'Security', 'Setup', 'System'], function (name) {
                        availableItems.push({label: name, value: name});
                    });
                    this.children.eventLogs = new ControlGroup({
                        className: 'evt-logs control-group',
                        controlType: 'Accumulator',
                        controlClass: 'controls-block',
                        controlOptions: {
                            modelAttribute: 'ui.logs',
                            model: this.model.input,
                            save: false,
                            availableItems: availableItems,
                            selectedItems: selectedItems
                        },
                        label: _('Select Event Logs').t(),
                        help: _('Select the Windows Event Logs you want to index from the list.').t()
                    });

                } else if (this.model.wizard.isLocalMode()) {
                    this.availableDfd = this.eventLogsAllCollection.fetch({
                        data: {
                            sort_key: 'importance',
                            sort_dir: 'asc',
                            sort_mode: 'num'
                        }
                    });
                    $.when(this.availableDfd).done(function () {
                        var availableItems = [],
                            selectedItems = this.model.input.get('ui.logs');
                        this.eventLogsAllCollection.each(function (model) {
                            availableItems.push({label: model.entry.get('name'), value: model.entry.get('name')});
                        }.bind(this));
                        this.children.eventLogs = new ControlGroup({
                            className: 'evt-logs control-group',
                            controlType: 'Accumulator',
                            controlClass: 'controls-block',
                            controlOptions: {
                                modelAttribute: 'ui.logs',
                                model: this.model.input,
                                save: false,
                                availableItems: availableItems,
                                selectedItems: selectedItems
                            },
                            label: _('Select Event Logs').t(),
                            help: _('Select the Windows Event Logs you want to index from the list.').t()
                        });

                    }.bind(this));
                }

                var wmiHelpLink = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.recipes.windows.wmi'
                );

                this.children.faq = new Faq({faqList: this.faqList(wmiHelpLink)});
            },

            faqList: function() {
                return [
                {
                    question: _('What event logs does this Splunk instance have access to?').t(),
                    answer: _('It depends on how you installed Splunk. If you installed it as the "Local \
                            System" user, it has access to all event logs on the local machine. If you installed it as \
                            a domain user, it has access to only the event logs that you give that user access to, on \
                            either local or remote Windows machines.').t()
                },
                {
                    question: _('What is the best method for monitoring event logs of remote Windows machines?').t(),
                    answer: _('If possible, use a universal forwarder rather than WMI to collect data from remote \
                            machines. The resource load of WMI can exceed that of a Splunk universal \
                            forwarder in many cases. In particular, consider a forwarder if you collect multiple event \
                            logs or performance counters from each host, or from very busy hosts like domain \
                            controllers. ').t() +
                            '<a class="external" href="' + arguments[0] + '" target="_blank">' + _("Learn More").t() + '</a>'
                }
                ];
            },

            template:
                '<div class="inputform_wrapper">\
                    <p>\
                    <% if (inputMode == 1) { %>\
                    <%= _("Configure this instance to monitor local Windows Event Log channels where installed applications, \
                    services, and system processes send data. This monitor runs once for every Event Log input that you define. ").t() %> \
                    <% } else { %>\
                    <%= _("Configure selected Splunk Universal Forwarders to monitor local Windows event log \
                    channels, which contain log data published by installed applications, services, and system processes. \
                    The event log monitor runs once for every event log input defined in Splunk. ").t() %> \
                    <% } %> \
                    <a class="external" href="<%- helpLink %>" target="_blank"> <%= _("Learn More").t() %> </a>\
                    </p>\
                </div>',

            render: function () {
                var helpLink = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.adddata.wineventlog'
                );

                this.$el.append(_.template(this.template, {
                    helpLink: helpLink,
                    inputMode: this.model.wizard.get("inputMode")
                }));

                var $form = this.$('.inputform_wrapper');
                $form.append(this.children.flashMessages.render().el);
                if (this.model.wizard.isLocalMode()) {
                    $.when(this.availableDfd).done(function() {
                        $form.append(this.children.eventLogs.render().el);
                        this.children.eventLogs.$el.find('ul').css('height', '200px');  // TODO: move to less
                    }.bind(this));
                } else if (this.model.wizard.isForwardMode()) {
                    $form.append(this.children.eventLogs.render().el);
                }
                this.$el.append(this.children.faq.render().el);

                return this;
            }
        });
    }
);
