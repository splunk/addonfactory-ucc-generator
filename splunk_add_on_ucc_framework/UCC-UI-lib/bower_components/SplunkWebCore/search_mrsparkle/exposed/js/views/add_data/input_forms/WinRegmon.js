define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/shared/controls/ControlGroup',
        'views/shared/FlashMessages',
        'views/shared/Faq',
        'uri/route'
    ],
    function (
        _,
        module,
        BaseView,
        ControlGroup,
        FlashMessagesView,
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

                this.children.flashMessages = new FlashMessagesView({
                    model: {
                        input: this.model.input
                    }
                });

                this.children.name = new ControlGroup({
                    className: 'reg-name control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.name',
                        model: this.model.input,
                        save: false
                    },
                    label:   _('Collection name').t()
                });

                this.children.hive = new ControlGroup({
                    className: 'reg-hive control-group',
                    controlType: 'TextBrowse',
                    controlClass: '',
                    controlOptions: {
                        modelAttribute: 'ui.hive',
                        model: this.model.input,
                        applicationModel: this.model.application,
                        browserType: 'registry',
                        save: false
                    },
                    label:   _('Registry hive').t(),
                    tooltip: _('Path to the Registry key that Splunk will monitor').t()
                });


                this.children.monitorSubnodes = new ControlGroup({
                    className: 'reg-subnodes control-group',
                    controlType: 'SyntheticCheckbox',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.monitorSubnodes',
                        model: this.model.input,
                        save: false
                    },
                    label:   _('Monitor subnodes').t()
                });

                var availableItems = _.map(['set','create','delete','rename','open','close','query'], function(item) {
                    return {label:item, value:item};
                }),
                    selectedItems = this.model.input.get('ui.type');

                this.children.eventTypes = new ControlGroup({
                    className: 'reg-eventTypes control-group',
                    controlType: 'Accumulator',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.type',
                        model: this.model.input,
                        save: false,
                        availableItems: availableItems,
                        selectedItems: selectedItems,
                        itemName: _('type(s)').t()
                    },
                    label:   _('Event types').t(),
                    tooltip: _('Registry event types that you want Splunk to monitor for the chosen Registry hive').t()
                });

                this.children.processPath = new ControlGroup({
                    className: 'reg-processPath control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.proc',
                        model: this.model.input,
                        save: false
                    },
                    label:   _('Process Path').t(),
                    tooltip: _('Which processes Splunk should monitor for changes to the Registry. Leave the default of C:\\.* to have Splunk monitor all processes.').t()
                });

                this.children.baseline = new ControlGroup({
                    className: 'reg-baseline control-group',
                    controlType: 'SyntheticRadio',
                    controlClass: 'controls-halfblock',
                    controlOptions: {
                        modelAttribute: 'ui.baseline',
                        model: this.model.input,
                        save: false,
                        items: [{label: _('Yes').t(), value: 1}, {label: _('No').t(), value: 0}]
                    },
                    label:   _('Baseline Index').t(),
                    tooltip: _('Scan your registry once for existing key values. This may be an expensive process and could take some time.').t()
                });

                this.children.faq = new Faq({faqList: this.faqList});
            },

            faqList: [
                {
                    question: _('What kind of Registry data does Splunk collect?').t(),
                    answer: _('Splunk collects changes to Windows Registry keys and hives. It can also set a baseline when the system first starts.').t()
                },
                {
                    question: _('Do I need administrative rights to monitor the Windows Registry?').t(),
                    answer: _('It depends. A domain user can read many Registry items, but only local administrators can access some security-related items. If you install Splunk as the Local System user, it can read all Registry items on the local machine.').t()
                },
                {
                    question: _('Why should I be careful about the number of Registry items I monitor?').t(),
                    answer: _('Registry monitoring can generate a lot of events, which can impact both machine performance and indexing volume significantly. Limit Registry monitoring to what is valuable to reduce the impact on performance and licensing.').t()
                },
                {
                    question: _('Can I configure Windows registry monitoring on remote Windows machines?').t(),
                    answer: _('Yes, if you install a universal forwarder on the machines that you want to get this information from. You can’t collect this type of data from remote machines from this Splunk instance.').t()
                }
            ],

            template:
                '<div class="inputform_wrapper"> \
                    <p>\
                        <%= _("Configure this instance to capture Windows Registry settings and monitor changes. Splunk \
                            captures the name of the process that made the change, as well as the path to the changed \
                            entry. ").t() %>\
                        <a class="external" href="<%- helpLink %>" target="_blank"> <%= _("Learn More").t() %> </a>\
                    </p>\
                </div>',

            render: function () {
                var helpLink = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.adddata.winregmon'
                );

                this.$el.append(_.template(this.template, {helpLink: helpLink}));

                var $form = this.$('.inputform_wrapper');
                $form.append(this.children.flashMessages.render().el);
                $form.append(this.children.name.render().el);
                $form.append(this.children.hive.render().el);
                $form.append(this.children.monitorSubnodes.render().el);
                $form.append(this.children.eventTypes.render().el);
                $form.append(this.children.processPath.render().el);
                $form.append(this.children.baseline.render().el);
                this.$el.append(this.children.faq.render().el);
                return this;
            }
        });
    }
);
