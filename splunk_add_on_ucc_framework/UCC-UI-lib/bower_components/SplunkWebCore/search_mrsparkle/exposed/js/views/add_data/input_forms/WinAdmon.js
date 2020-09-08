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
    function (_,
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

                this.children.target = new ControlGroup({
                    className: 'ad-target control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.targetDc',
                        model: this.model.input,
                        save: false,
                        placeholder: _('optional').t()
                    },
                    label:   _('Target domain controller').t(),
                    tooltip: _('Provide the host name of the domain controller to monitor, or leave empty and Splunk will discover the nearest domain controller automatically.').t()
                });


                this.children.monitorSubtree = new ControlGroup({
                    className: 'reg-subtree control-group',
                    controlType: 'SyntheticCheckbox',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.monitorSubtree',
                        model: this.model.input,
                        save: false
                    },
                    label:   _('Monitor subtree').t(),
                    tooltip: _('Check this box if Splunk should monitor all child nodes. If the box is unchecked, only the node you specify is monitored.').t()
                });

                this.children.faq = new Faq({faqList: this.faqList});

                this.updateStartingNode();

                /* Events */
                this.model.input.on('change:ui.targetDc', function() {
                    this.updateStartingNode();
                }, this);
            },

            updateStartingNode: function() {
                var reRender = false;
                if (this.children.startingNode) {
                    this.children.startingNode.remove();
                    reRender = true;
                }
                var targetDc = this.model.input.get('ui.targetDc'),
                    urlArgsOverride = targetDc ? {targetDc: targetDc} : {};
                this.children.startingNode = new ControlGroup({
                    className: 'ad-startingNode control-group',
                    controlType: 'TextBrowse',
                    controlClass: '',
                    controlOptions: {
                        modelAttribute: 'ui.startingNode',
                        model: this.model.input,
                        applicationModel: this.model.application,
                        browserType: 'ad',
                        urlArgsOverride: urlArgsOverride,
                        save: false,
                        placeholder: _('optional').t()
                    },
                    label:   _('Starting node').t(),
                    tooltip: _('Select the node that Splunk should begin monitoring from. Leave empty and Splunk will start monitoring from the highest part of the tree it can.').t()
                });

                if (reRender) {
                    this.$('.ad-target').after(this.children.startingNode.render().el);
                }
            },

            faqList: [
                {
                    question: _('Does Active Directory monitoring work if I run Splunk Enterprise as the "Local System" user?').t(),
                    answer: _('Only if you install it on a domain controller. Otherwise, you must run Splunk Enterprise as a domain account with read access to Active Directory.').t()
                },
                {
                    question: _('Does this Splunk Enterprise instance have to be a domain controller for me to collect Active Directory data?').t(),
                    answer: _('No. As long as you run Splunk Enterprise as a domain user, the system binds to the closest available domain controller to get Active Directory data.').t()
                },
                {
                    question: _('Can I choose a specific domain controller to collect AD data from?').t(),
                    answer: _('Yes, use the "Target Domain Controller" field in the input setup dialog box.').t()
                },
                {
                    question: _('How do the "Starting Node" and "Monitor Sub tree" controls work?').t(),
                    answer: _('Specify an entry in the "Starting Node" field to tell Splunk Enterprise to monitor Active \
                             Directory starting at that node. Check the "Monitor Sub tree" check box to tell Splunk \
                             Enterprise to monitor the starting AD node and all sub-nodes.').t()
                },
                {
                    question: _('Specify an entry in the "Starting Node" field to tell Splunk Enterprise to monitor \
                              Active Directory starting at that node.').t(),
                    answer: _('Check the "Monitor Sub tree" check box to tell Splunk Enterprise to monitor the starting \
                            AD node and all sub-nodes.').t()
                },
                {
                    question: _('Why should I be careful about the number of AD items I monitor?').t(),
                    answer: _('Active Directory changes can generate a lot of events. This can impact performance on the \
                            indexer, as well as license usage.').t()
                }
            ],

            template:
                '<div class="inputform_wrapper">\
                    <p> <%= _("Configure this instance to watch for changes to your Active Directory forest and to collect user \
                    and machine metadata. You can also take a snapshot of your entire AD schema, which can take a while. ").t() %> \
                    <a class="external" href="<%- helpLink %>" target="_blank"> <%= _("Learn More").t() %> </a> \
                    </p>\
                </div>',

            render: function () {
                var helpLink = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.adddata.winadmon'
                );

                this.$el.append(_.template(this.template, {
                    helpLink: helpLink
                }));

                var $form = this.$(".inputform_wrapper");
                $form.append(this.children.flashMessages.render().el);
                $form.append(this.children.name.render().el);
                $form.append(this.children.target.render().el);
                $form.append(this.children.startingNode.render().el);
                $form.append(this.children.monitorSubtree.render().el);
                this.$el.append(this.children.faq.render().el);
                return this;
            }
        });
    }
);
