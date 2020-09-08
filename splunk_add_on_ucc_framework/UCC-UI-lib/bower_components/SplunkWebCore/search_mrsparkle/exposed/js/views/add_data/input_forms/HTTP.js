define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/controls/ControlGroup',
        'views/shared/FlashMessages',
        'views/shared/Faq',
        'collections/services/data/outputs/tcp/Groups',
        'uri/route'
    ],
    function ($,
              _,
              module,
              BaseView,
              ControlGroup,
              FlashMessagesView,
              Faq,
              OutputsCollection,
              route
    ) {
        /**
         */
        return BaseView.extend({
            moduleId: module.id,
            initialize: function (options) {
                BaseView.prototype.initialize.apply(this, arguments);

                this.collection = this.collection || {};
                this.collection.outputs = new OutputsCollection();
                var outputsDfd = this.collection.outputs.fetch({
                    data: {
                        search: 'disabled=0',
                        count: -1
                    }
                });

                this.children.flashMessages = new FlashMessagesView({
                    model: {
                        input: this.model.input
                    }
                });

                this.children.name = new ControlGroup({
                    className: 'http-name control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.name',
                        model: this.model.input,
                        save: false
                    },
                    label:   _('Name').t()
                });

                this.children.source = new ControlGroup({
                    className: 'http-source control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.source',
                        model: this.model.input,
                        save: false,
                        placeholder: _('optional').t()
                    },
                    label:   _('Source name override').t(),
                    tooltip: _('If set, overrides the default source value of the HTTP Event Collector entry.').t()
                });

                this.children.description = new ControlGroup({
                    className: 'http-desc control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.description',
                        model: this.model.input,
                        save: false,
                        placeholder: _('optional').t()
                    },
                    label:   _('Description').t(),
                    tooltip: _('Text that describes what this input is.').t()
                });

                this.children.useAck = new ControlGroup({
                    className: 'http-useack control-group',
                    controlType: 'SyntheticCheckbox',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.useACK',
                        model: this.model.input,
                        save: false
                    },
                    label:   _('Enable indexer acknowledgement').t()
                });

                outputsDfd.done(function() {
                    this.updateOutputsControl();
                }.bind(this));

                var generalHelpLink = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.adddata.httpec'
                ), defaultsHelpLink = route.docHelp(
                        this.model.application.get('root'),
                        this.model.application.get('locale'),
                        'learnmore.adddata.httpec.defaults'
                );
                this.children.faq = new Faq({faqList: this.faqList(generalHelpLink, defaultsHelpLink)});

            },

            updateOutputsControl: function() {
                var items = [{'label':_('None').t(), 'value':''}];
                this.collection.outputs.each(function(model) {
                    var outputName = model.entry.get('name');
                    items.push({label: outputName, value:outputName});
                }.bind(this));
                this.children.outputs = new ControlGroup({
                    className: 'output-group control-group',
                    controlType: 'SyntheticSelect',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.outputgroup',
                        model: this.model.input,
                        items: items,
                        className: 'btn-group view-count',
                        menuWidth: 'wide',
                        toggleClassName: 'btn',
                        popdownOptions: { attachDialogTo: 'body' }
                    },
                    label: _('Output Group (optional)').t()
                });
                this.children.outputs.render().appendTo(this.$(".outputs-placeholder"));
            },


            faqList: function(generalHelpLink, defaultsHelpLink) {
                return [
                    {
                        question: _('What is the HTTP Event Collector?').t(),
                        answer: _('The HTTP Event Collector is an endpoint that lets developers send application events directly to the Splunk software via HTTP or HTTPS using a token-based authentication model.').t()
                    },
                    {
                        question: _('How do I set up the HTTP Event Collector?').t(),
                        answer: _('Enable the collector on this page. Provide a name for the token (all other fields are optional.) After saving, configure your logging client with the token that the Splunk software displays to send data to the collector in a specific format.').t() +' '+ '<a class="external" href="' + generalHelpLink + '" target="_blank">' + _('Learn more').t() + '</a>'
                    },
                    {
                        question: _('How do I view and configure the tokens that I can use to send data to the HTTP Event Collector?').t(),
                        answer: _('You can use the HTTP Event Collector management page to view, enable, disable, and configure token defaults (like source type and default index.)').t() +' '+ '<a class="external" href="' + defaultsHelpLink + '" target="_blank">' + _('Learn more').t() + '</a>'
                    },
                    {
                        question: _('What clients can send data to the HTTP Event Collector?').t(),
                        answer: _('You can use the Splunk .NET and Java logging libraries or any standard HTTP Client that lets you send data in JavaScript Object Notation (JSON) format.').t()
                    },
                    {
                        question: _('What port and protocol does the HTTP Event Collector receive data on and how can I change that?').t(),
                        answer: _('The HTTP Event Collector receives data over HTTPS on TCP port 8088 by default. You can change the port as well as disable HTTPS by clicking on the Global Settings button at the top of the HTTP Event Collector management page.').t()
                    },
                    {
                        question: _('What is an output group?').t(),
                        answer: _('An output group is a group of one or more destinations that forwards data. You can use output groups to send data over HTTP to multiple destinations.').t()
                    }
                ];
            },

            render: function () {
                var helpLink = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.adddata.httpec'
                );

                this.$el.append(_.template(this.template, {
                    helpLink: helpLink,
                    inputMode: this.model.wizard.get("inputMode")
                }));

                var $form = this.$('.inputform_wrapper');
                this.children.flashMessages.render().appendTo($form);
                this.children.name.render().appendTo($form);
                this.children.source.render().appendTo($form);
                this.children.description.render().appendTo($form);
                $('<div class="outputs-placeholder"/>').appendTo($form);
                this.children.useAck.render().appendTo($form);

                this.$el.append(this.children.faq.render().el);
                return this;
            },

            template:
                '<div class="inputform_wrapper"><p> \
                    <%= _("Configure a new token for receiving data over HTTP.").t() %> \
                    <a class="external" href="<%- helpLink %>" target="_blank"> <%= _("Learn More").t() %></a> \
                </p>\
                </div>'
        });
    }
);
