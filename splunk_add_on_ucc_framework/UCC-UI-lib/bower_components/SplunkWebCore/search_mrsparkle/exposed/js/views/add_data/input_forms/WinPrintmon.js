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
                    label:   _('Collection name').t()
                });

                var availableItems = _.map(['Printer','Job','Driver','Port'], function(item) {
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
                    label:   _('Event types').t()
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
                    tooltip: _('Query the current values when the input starts up.').t()
                });

                this.children.faq = new Faq({faqList: this.faqList});
            },

            faqList: [
                {
                    question: _('What information does the Windows print monitoring input gather?').t(),
                    answer: _('The print monitoring input retrieves information on the Windows print subsystem. This \
                    includes the number of printers, the number and status of jobs, the installed drivers, and the \
                    available printer ports.').t()
                },
                {
                    question: _('Does Splunk need to run as an administrative user to access print monitoring information?').t(),
                    answer: _('Yes. You must run Splunk as the "Local System" user or as a domain user that is a member of the local Administrators group.').t()
                },
                {
                    question: _('Can I configure Windows print monitoring on remote Windows machines?').t(),
                    answer: _('Yes, if you install a universal forwarder on the machines that you want to get this \
                    information from. You can\’t collect this type of data from remote machines from this Splunk \
                    instance.').t()
                }
             ],

            template:
                '<div class="inputform_wrapper"> \
                    <p>\
                        <%= _("Configure this instance to capture Windows information about printers, drivers, print jobs, and \
                        printer ports on this Windows machine. This monitor runs once for every input defined on the machine, at \
                        the interval specified in the input. ").t() %> \
                        <a class="external" href="<%- helpLink %>" target="_blank"> <%= _("Learn More").t() %> </a>\
                    </p>\
                </div>',

            render: function () {
                var helpLink = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.adddata.winprintmon'
                );

                this.$el.append(_.template(this.template, {helpLink: helpLink}));

                var $form = this.$('.inputform_wrapper');
                $form.append(this.children.flashMessages.render().el);
                $form.append(this.children.name.render().el);
                $form.append(this.children.eventTypes.render().el);
                $form.append(this.children.baseline.render().el);
                this.$el.append(this.children.faq.render().el);
                return this;
            }
        });
    }
);
