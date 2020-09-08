define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/controls/ControlGroup',
        'models/services/data/inputs/WinPerfmonFind',
        'util/splunkd_utils',
        'views/shared/FlashMessages',
        'views/shared/waitspinner/Master',
        'views/shared/Faq',
        'uri/route'
    ],
    function (
        $,
        _,
        module,
        BaseView,
        ControlGroup,
        PerfmonFindModel,
        splunkd_utils,
        FlashMessagesView,
        WaitSpinner,
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
                        // reset validation redness
                        this.model.input.trigger('validated', true, this.model.input, []);
                    }
                }
            },
            initialize: function (options) {
                BaseView.prototype.initialize.apply(this, arguments);
                this.fwdObjects = ['Processor','LogicalDisk','Memory','Network','PhysicalDisk','Process','System'];
                this.fwdAvailableCounters = {
                    'Processor': ['% Processor Time','% User Time','% Privileged Time','Interrupts/sec','% DPC Time','% Interrupt Time','DPCs Queued/sec','DPC Rate','% Idle Time','% C1 Time','% C2 Time','% C3 Time','C1 Transitions/sec','C2 Transitions/sec','C3 Transitions/sec'],
                    'LogicalDisk': ['% Free Space', 'Free Megabytes', 'Current Disk Queue Length', '% Disk Time', 'Avg. Disk Queue Length', '% Disk Read Time', 'Avg. Disk Read Queue Length', '% Disk Write Time', 'Avg. Disk Write Queue Length', 'Avg. Disk sec/Transfer', 'Avg. Disk sec/Read', 'Avg. Disk sec/Write', 'Disk Transfers/sec', 'Disk Reads/sec', 'Disk Writes/sec', 'Disk Bytes/sec', 'Disk Read Bytes/sec', 'Disk Write Bytes/sec', 'Avg. Disk Bytes/Transfer', 'Avg. Disk Bytes/Read', 'Avg. Disk Bytes/Write', '% Idle Time', 'Split IO/Sec'],
                    'PhysicalDisk': ['Current Disk Queue Length', '% Disk Time', 'Avg. Disk Queue Length', '% Disk Read Time', 'Avg. Disk Read Queue Length', '% Disk Write Time', 'Avg. Disk Write Queue Length', 'Avg. Disk sec/Transfer', 'Avg. Disk sec/Read', 'Avg. Disk sec/Write', 'Disk Transfers/sec', 'Disk Reads/sec', 'Disk Writes/sec', 'Disk Bytes/sec', 'Disk Read Bytes/sec', 'Disk Write Bytes/sec', 'Avg. Disk Bytes/Transfer', 'Avg. Disk Bytes/Read', 'Avg. Disk Bytes/Write', '% Idle Time', 'Split IO/Sec'],
                    'Memory': ['Page Faults/sec', 'Available Bytes', 'Committed Bytes', 'Commit Limit', 'Write Copies/sec', 'Transition Faults/sec', 'Cache Faults/sec', 'Demand Zero Faults/sec', 'Pages/sec', 'Pages Input/sec', 'Page Reads/sec', 'Pages Output/sec', 'Pool Paged Bytes', 'Pool Nonpaged Bytes', 'Page Writes/sec', 'Pool Paged Allocs', 'Pool Nonpaged Allocs', 'Free System Page Table Entries', 'Cache Bytes', 'Cache Bytes Peak', 'Pool Paged Resident Bytes', 'System Code Total Bytes', 'System Code Resident Bytes', 'System Driver Total Bytes', 'System Driver Resident Bytes', 'System Cache Resident Bytes', '% Committed Bytes In Use', 'Available KBytes', 'Available MBytes', 'Transition Pages RePurposed/sec', 'Free & Zero Page List Bytes', 'Modified Page List Bytes', 'Standby Cache Reserve Bytes', 'Standby Cache Normal Priority Bytes', 'Standby Cache Core Bytes', 'Long-Term Average Standby Cache Lifetime (s)'],
                    'Network': ['Bytes Total/sec', 'Packets/sec', 'Packets Received/sec', 'Packets Sent/sec', 'Current Bandwidth', 'Bytes Received/sec', 'Packets Received Unicast/sec', 'Packets Received Non-Unicast/sec', 'Packets Received Discarded', 'Packets Received Errors', 'Packets Received Unknown', 'Bytes Sent/sec', 'Packets Sent Unicast/sec', 'Packets Sent Non-Unicast/sec', 'Packets Outbound Discarded', 'Packets Outbound Errors', 'Output Queue Length', 'Offloaded Connections', 'TCP Active RSC Connections', 'TCP RSC Coalesced Packets/sec', 'TCP RSC Exceptions/sec', 'TCP RSC Average Packet Size'],
                    'Process': ['% Processor Time', '% User Time', '% Privileged Time', 'Virtual Bytes Peak', 'Virtual Bytes', 'Page Faults/sec', 'Working Set Peak', 'Working Set', 'Page File Bytes Peak', 'Page File Bytes', 'Private Bytes', 'Thread Count', 'Priority Base', 'Elapsed Time', 'ID Process', 'Creating Process ID', 'Pool Paged Bytes', 'Pool Nonpaged Bytes', 'Handle Count', 'IO Read Operations/sec', 'IO Write Operations/sec', 'IO Data Operations/sec', 'IO Other Operations/sec', 'IO Read Bytes/sec', 'IO Write Bytes/sec', 'IO Data Bytes/sec', 'IO Other Bytes/sec', 'Working Set - Private'],
                    'System': ['File Read Operations/sec', 'File Write Operations/sec', 'File Control Operations/sec', 'File Read Bytes/sec', 'File Write Bytes/sec', 'File Control Bytes/sec', 'Context Switches/sec', 'System Calls/sec', 'File Data Operations/sec', 'System Up Time', 'Processor Queue Length', 'Processes', 'Threads', 'Alignment Fixups/sec', 'Exception Dispatches/sec', 'Floating Emulations/sec', '% Registry Quota In Use']
                };
                this.fwdAvailableInstances = ['*'];

                this.children.flashMessages = new FlashMessagesView({
                    model: {
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
                    label:   _('Collection name').t(),
                    tooltip: _('Assign a unique name to this collection').t()
                });

                this.children.interval = new ControlGroup({
                    className: 'interval control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.interval',
                        model: this.model.input,
                        save: false
                    },
                    label:   _('Polling interval').t(),
                    help: _('sec').t()
                });

                var remotePerfmonHelpLink = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.adddata.winperfmon.remote'
                );

                this.children.faq = new Faq({faqList: this.faqList(remotePerfmonHelpLink)});

                if (this.model.wizard.isForwardMode()) {

                    if (this.model.input.get('ui.object')) {
                        // if we're coming from the next step, (assuming object will be set) just load all the elements
                        this.updateAvailableObjects(this.fwdObjects);
                        this.updateObjectDetails(this.fwdAvailableCounters[this.model.input.get('ui.object')], this.fwdAvailableInstances);
                        this.availableObjectsDfd = $.Deferred().resolve();
                        return;
                    }

                    this.updateAvailableObjects(this.fwdObjects);

                }
                else if (this.model.wizard.isLocalMode()) {
                    this.children.waitSpinner = new WaitSpinner();

                    if (this.model.input.get('ui.object')) {
                        // if we're coming from the next step, (assuming object will be set) just load all the elements
                        this.updateAvailableObjects(this.model.perfmonFind.entry.content.get('objects'));
                        this.updateObjectDetails(this.model.perfmonFindDetails.entry.content.get('counters'), this.model.perfmonFindDetails.entry.content.get('instances'));
                        this.availableObjectsDfd = $.Deferred().resolve();
                        return;
                    }

                    this.model.perfmonFind = new PerfmonFindModel();
                    this.model.perfmonFind.set({id: 'PERFResult'});
                    this.availableObjectsDfd = this.model.perfmonFind.fetch();
                    this.children.waitSpinner.start();

                    this.availableObjectsDfd.done(function () {
                        this.updateAvailableObjects(this.model.perfmonFind.entry.content.get('objects'));
                    }.bind(this));
                }

                /* Events */
                this.model.input.on('change:ui.object', function() {
                    this.model.input.set('ui.counters', null);
                    this.model.input.set('ui.instances', null);
                    if (this.model.wizard.isLocalMode()) {
                        this.model.perfmonFindDetails = new PerfmonFindModel();
                        this.model.perfmonFindDetails.set({id: 'PERFResult'});
                        this.model.perfmonFindDetails.fetch({
                            data: {
                                object: this.model.input.get('ui.object')
                            }
                        }).done(function () {
                            this.updateObjectDetails(this.model.perfmonFindDetails.entry.content.get('counters'), this.model.perfmonFindDetails.entry.content.get('instances'));
                            this._reflowCountersInstances();
                        }.bind(this));

                    } else if (this.model.wizard.isForwardMode()) {
                        this.updateObjectDetails(this.fwdAvailableCounters[this.model.input.get('ui.object')], this.fwdAvailableInstances);
                        this._reflowCountersInstances();
                    }
                }.bind(this));
            },

            updateAvailableObjects: function(objects) {
                var availableObjectsList = [];
                availableObjectsList.push({label: _('-- Select object --').t(), value: ''});
                _.each(objects, function (item) {
                    availableObjectsList.push({label: item, value: item});
                }.bind(this));

                this.children.availableObjects = new ControlGroup({
                    className: 'available-objects control-group',
                    controlType: 'SyntheticSelect',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.object',
                        model: this.model.input,
                        items: availableObjectsList,
                        className: 'btn-group view-count',
                        toggleClassName: 'btn',
                        placeholder: _('optional').t()
                    },
                    label: _('Available objects').t(),
                    tooltip: _('Select an object to view and add available counters.').t()
                });
            },

            updateObjectDetails: function(counters, instances) {
                var availableCounters = _.map(counters, function (item) {
                        return {label: item, value: item};
                    }),
                    availableInstances = _.map(instances, function (item) {
                        return {label: item, value: item};
                    }),

                    selectedCounters = this.model.input.get('ui.counters'),
                    selectedInstances = this.model.input.get('ui.instances');

                this.children.counters = new ControlGroup({
                    className: 'counters control-group',
                    controlType: 'Accumulator',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.counters',
                        model: this.model.input,
                        save: false,
                        availableItems: availableCounters,
                        selectedItems: selectedCounters,
                        itemName: _('counter(s)').t()
                    },
                    label: _('Select Counters').t()
                });
                this.children.instances = new ControlGroup({
                    className: 'instances control-group',
                    controlType: 'Accumulator',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.instances',
                        model: this.model.input,
                        save: false,
                        availableItems: availableInstances,
                        selectedItems: selectedInstances,
                        itemName: _('instance(s)').t()
                    },
                    label: _('Select Instances').t()
                });

            },

            reflowCountersInstances: function() {
                this.$('#counters-placehoder').html(this.children.counters.render().el);
                this.$('#instances-placehoder').html(this.children.instances.render().el);
            },
            _reflowCountersInstances: function() {
                // TODO: why doesn't it work without this?
                $('#counters-placehoder').html(this.children.counters.render().el);
                $('#instances-placehoder').html(this.children.instances.render().el);
            },
            faqList: function() {
                return [
                    {
                        question: _('What Windows performance metrics can Splunk collect?').t(),
                        answer: _('Splunk can monitor all available performance monitoring metrics on the local system if you install it as the “Local System” user.').t()
                    },
                    {
                        question: _('What is the best method for monitoring performance metrics of remote windows machines?').t(),
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
                    <% if (inputMode == 1) { %> \
                    <p> \
                    <%= _("Configure this instance to monitor Windows performance counters. The performance objects \
                    available for monitoring depend on the system libraries installed. Microsoft and third-party vendors provide performance libraries.").t() %> \
                                    <a class="external" href="<%- localHelpLink %>" target="_blank"> <%= _("Learn More").t() %> </a>\
                    </p> \
                    <% } else { %>\
                    <p> \
                    <%= _("Configure selected Splunk Universal Forwarders to monitor Windows performance \
                    counters. The performance objects available to Splunk for monitoring depend on the \
                    performance libraries installed on the system. Both Microsoft and third-party vendors provide \
                    libraries that contain performance counters. ").t() %> \
                    <a class="external" href="<%- remoteHelpLink %>" target="_blank"> <%= _("Learn More").t() %> </a> \
                    </p>\
                    <p>\
                    <bold> <%= _("Important: ").t() %> </bold> \
                    <%= _("Only Splunk Universal Forwarders that run version 6.2 or later support remote \
                    configuration from this page. If you have older versions running, either upgrade to the latest \
                    release, or define performance monitoring inputs manually.").t() %> \
                    </p>\
                    <% } %>\
                </div>',

            render: function () {
                var localHelpLink = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.adddata.winperfmon.local'
                );

                var remoteHelpLink = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.adddata.winperfmon.remote'
                );

                this.$el.append(_.template(this.template, {
                    localHelpLink: localHelpLink,
                    remoteHelpLink: remoteHelpLink,
                    inputMode: this.model.wizard.get("inputMode")
                }));

                var $form = this.$('.inputform_wrapper');
                $form.append(this.children.flashMessages.render().el);
                $form.append(this.children.name.render().el);

                $form.append($('<div id="availableObjects-placehoder"></div>'));
                $form.append($('<div id="counters-placehoder"></div>'));
                $form.append($('<div id="instances-placehoder"></div>'));

                if (this.model.wizard.isLocalMode()) {
                    this.$('#availableObjects-placehoder').html(this.children.waitSpinner.render().el);
                    this.availableObjectsDfd.done(function () {
                        this.$('#availableObjects-placehoder').html(this.children.availableObjects.render().el);
                        this.children.waitSpinner.remove();
                        if (this.model.input.get('ui.object')) {
                            this.reflowCountersInstances();
                        }
                    }.bind(this));

                } else if (this.model.wizard.isForwardMode()) {
                    this.$('#availableObjects-placehoder').html(this.children.availableObjects.render().el);
                    if (this.model.input.get('ui.object')) {
                        this.reflowCountersInstances();
                    }
                }

                $form.append(this.children.interval.render().el);

                $form.append(this.children.faq.render().el);

                return this;
            }
        });
    }
);
