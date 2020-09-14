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
                    className: 'ad-name control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.name',
                        model: this.model.input,
                        save: false
                    },
                    label:   _('Collection name').t()
                });

                var availableItems = _.map(['Computer','OperatingSystem','Processor','Disk','NetworkAdapter','Service','Process','Driver','Roles'], function(item) {
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
                    tooltip: _('Select Windows host statistics you want to collect.').t()
                });

                this.children.interval = new ControlGroup({
                    className: 'net-port control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.interval',
                        model: this.model.input,
                        save: false
                    },
                    label:   _('Interval').t(),
                    help: _('sec').t()
                });

                var hostmonHelpLink = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.adddata.winhostmon'
                );

                this.children.faq = new Faq({faqList: this.faqList(hostmonHelpLink)});
            },

            faqList: function() {
                return [
                {
                    question: _('What information does the Windows Host Monitoring input gather?').t(),
                    answer: _('The Host Monitoring input gathers information about a Windows machine, including \
                     operating system build, hardware information, service and process status, and installed \
                     applications. ').t() +
                     '<a class="external" href="' + arguments[0] + '" target="_blank">' + _("Learn More").t() + '</a>'
                },
                {
                    question: _('Does Splunk need to run as an administrative user to access local host monitoring information?').t(),
                    answer: _('Yes. You must run Splunk as the "Local System" user or as a domain user that is a member of the local Administrators group.').t()
                },
                {
                    question: _('Can I configure Windows local host monitoring on remote Windows machines?').t(),
                    answer: _('Yes, if you install a universal forwarder on the machines that you want to get this \
                    information from. You can’t collect this type of data from remote machines from this Splunk instance.').t()
                }
                ];
            },

            template:
                '<div class="inputform_wrapper">\
                    <p> \
                        <%= _("Configure this instance to capture detailed information about this machine, such as software \
                        installation, service control, and uptime. The host monitor input runs once for every input defined, \
                        at the interval specified in the input. ").t() %> \
                        <a class="external" href="<%- helpLink %>" target="_blank"> <%= _("Learn More").t() %> </a>\
                    </p>\
                </div>',

            render: function () {
                var helpLink = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.adddata.winhostmon'
                );

                this.$el.append(_.template(this.template, {helpLink: helpLink}));

                var $form = this.$('.inputform_wrapper');
                $form.append(this.children.flashMessages.render().el);
                $form.append(this.children.name.render().el);
                $form.append(this.children.eventTypes.render().el);
                $form.append(this.children.interval.render().el);
                this.$el.append(this.children.faq.render().el);
                return this;
            }
        });
    }
);
