define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/controls/ControlGroup',
        'collections/services/data/inputs/WinPerfmonWMIFind',
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
        PerfmonWMIFindCollection,
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
                'click a.lookup-btn': function() {
                    this.clearSelection();
                    if (!this.model.input.get('ui.lookup_host')) {
                        this.model.input.set('ui.lookup_host', 'localhost');
                    }
                    this.fetchRemoteClasses();
                },
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

                this.children.waitSpinner = new WaitSpinner();

                if (!this.collection.perfmonFind) {
                    this.collection.perfmonFind = new PerfmonWMIFindCollection();
                }

                this.children.flashMessages = new FlashMessagesView({
                    model: {
                        input: this.model.input
                    },
                    collection: this.collection.perfmonFind
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

                this.children.lookupHost = new ControlGroup({
                    className: 'lookup-host control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.lookup_host',
                        model: this.model.input,
                        save: false
                    },
                    label:   _('Select target host').t(),
                    tooltip: _('Enter a host name then click "Query" to find available classes.').t()
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

                this.children.hosts = new ControlGroup({
                    className: 'hosts control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.server',
                        model: this.model.input,
                        save: false
                    },
                    label:   _('Collect the same set of logs from additional hosts').t(),
                    tooltip: _('Enter a comma-separated list of host names or IP addresses.').t()
                });

                var remoteperfmonHelpLink = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.adddata.winperfmon'
                );
                this.children.faq = new Faq({faqList: this.faqList(remoteperfmonHelpLink)});


                /* Events */
                this.model.input.on('change:ui.classes change:ui.lookup_host', function() {
                    this.collection.perfmonFind.fetch({
                        data: {
                            'class': this.model.input.get('ui.classes'),
                            'server': this.model.input.get('ui.lookup_host')
                        }
                    }).done(function() {
                        this.updateObjectDetails();
                        this.reflowCountersInstances();
                    }.bind(this));
                }, this);
            },

            clearSelection: function() {
                this.$('#availableClasses-placehoder').empty();
                this.$('#counters-placehoder').empty();
                this.$('#instances-placehoder').empty();
                this.$('#hosts-placehoder').empty();
                this.children.interval.$el.hide();
            },

            fetchRemoteClasses: function() {
                this.clearSelection();
                this.children.waitSpinner.$el.show();
                this.children.waitSpinner.start();
                this.collection.perfmonFind.fetch({
                    data: {
                        server: this.model.input.get('ui.lookup_host')
                    }
                }).done(function() {
                    this.updateAvailableClasses();
                    this.children.waitSpinner.stop();
                    this.children.waitSpinner.$el.hide();
                }.bind(this)).fail(function() {
                    this.children.waitSpinner.stop();
                    this.children.waitSpinner.$el.hide();
                }.bind(this));
            },

            updateAvailableClasses: function() {
                var classes = this.collection.perfmonFind.at(0).entry.content.get('classes'),
                    availableClassesList = [],
                    CLASSNAME_PREFIX = 'Win32_PerfFormattedData_';

                availableClassesList.push({label: _('-- Select Class --').t(), value:''});
                _.each(classes, function(item) {
                    // cut the prefix from the label
                    var label;
                    if (item.indexOf(CLASSNAME_PREFIX) > -1) {
                        label = item.substring(CLASSNAME_PREFIX.length);
                    } else {
                        label = item;
                    }
                    availableClassesList.push({label: label, value: item});
                }.bind(this));

                this.children.availableClasses = new ControlGroup({
                    className: 'available-objects control-group',
                    controlType: 'SyntheticSelect',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.classes',
                        model: this.model.input,
                        items: availableClassesList,
                        className: 'btn-group view-count',
                        toggleClassName: 'btn',
                        placeholder: _('optional').t()
                    },
                    label: _('Select Class').t(),
                    tooltip: _('Select a class to view and add available counters.').t()
                });
                this.$('#availableClasses-placehoder').empty().append(this.children.availableClasses.render().el);
            },

            updateObjectDetails: function() {
                var availableInstances = _.map(this.collection.perfmonFind.at(0).entry.content.get('instances'), function(item) {
                        return {label:item, value:item};
                    }),
                    availableFields = _.map(this.collection.perfmonFind.at(0).entry.content.get('fields'), function(item) {
                        return {label:item, value:item};
                    }),
                    selectedFields = this.model.input.get('ui.fields'),
                    selectedInstances = this.model.input.get('ui.instances');

                this.children.counters = new ControlGroup({
                    className: 'counters control-group',
                    controlType: 'Accumulator',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.fields',
                        model: this.model.input,
                        save: false,
                        availableItems: availableFields,
                        selectedItems: selectedFields
                    },
                    label:   _('Select Counters').t()
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
                        selectedItems: selectedInstances
                    },
                    label:   _('Select Instances').t()
                });


            },

            reflowCountersInstances: function() {
                this.$('#counters-placehoder').html(this.children.counters.render().el);
                this.$('#instances-placehoder').html(this.children.instances.render().el);
                this.children.hosts.$el.show();
                this.children.interval.$el.show();
            },

            faqList: function() {
                return [
                    {
                        question: _('What is the best method for monitoring performance metrics of remote windows machines?').t(),
                        answer: _('If possible, use a universal forwarder rather than WMI to collect data from remote \
                    machines. The resource load of WMI can exceed that of a Splunk universal forwarder in \
                    many cases. In particular, consider a forwarder if you collect multiple event logs or performance \
                    counters from each host, or from very busy hosts like domain controllers. ').t() +
                            '<a class="external" href=' + arguments[0] + ' target="_blank">' + _("Learn More").t() + '</a>'
                    }
                    ];
            },

            template:
                '<div class="inputform_wrapper"> \
                     <p> \
                         <%= _("Configure this instance to collect performance metrics on remote Windows machines using the \
                         Windows Management Instrumentation (WMI) framework. Splunk must run as an Active Directory \
                         user with appropriate access to the remote machine. Both Splunk and the remote machine must \
                         reside in the same AD domain or forest. ").t() %>\
                        <a class="external" href="<%- helpLink %>" target="_blank"> <%= _("Learn More").t() %> </a>\
                    </p>\
                </div>',

            render: function () {
                var helpLink = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.adddata.winperfmon'
                );

                this.$el.append(_.template(this.template, {helpLink: helpLink}));
                var $form = this.$('.inputform_wrapper');
                $form.append(this.children.flashMessages.render().el);
                $form.append(this.children.name.render().el);
                $form.append($('<a class="btn lookup-btn" style="margin-bottom: 20px;margin-left: -5px;float:right;">'+ _("Query").t() + '</a><div style="width: 540px;" id="lookup-host-placeholder"></div>'));
                this.$('#lookup-host-placeholder').append(this.children.lookupHost.render().el);

                $form.append($('<div id="availableClasses-placehoder"></div>'));
                this.$('#availableClasses-placehoder').before(this.children.waitSpinner.render().el);
                this.children.waitSpinner.$el.hide();
                $form.append($('<div id="counters-placehoder"></div>'));
                $form.append($('<div id="instances-placehoder"></div>'));
                $form.append($('<div id="hosts-placehoder"></div>'));


                $form.append(this.children.interval.render().el);
                this.children.interval.$el.hide();
                this.$el.append(this.children.faq.render().el);

                if (this.model.input.get('ui.classes')) {
                    // if we're coming back from the next step
                    this.updateAvailableClasses();
                    this.updateObjectDetails();
                    this.reflowCountersInstances();
                }

                return this;
            }
        });
    }
);
