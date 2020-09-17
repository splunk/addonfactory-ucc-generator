/**
 * Last step in the workflow: Success.
 * Shows links where to go next.
 *
 */
define(
    [
        'underscore',
        'backbone',
        'module',
        'views/Base',
        'views/shared/controls/ControlGroup',
        'views/shared/FlashMessages',
        'views/shared/Paywall',
        'collections/services/deploymentserver/DeploymentServerClients',
        'collections/services/deploymentserver/DeploymentServerClasses',
        'contrib/text!views/add_data/ForwardersSelect.html',
        'uri/route',
        'views/shared/Faq',
        './ForwardersSelect.pcss'
    ],
    function (
        _,
        Backbone,
        module,
        BaseView,
        ControlGroup,
        FlashMessagesView,
        PaywallView,
        DeploymentServerClients,
        DeploymentServerClasses,
        template,
        route,
        Faq,
        css
    ) {
        /**
         */
        return BaseView.extend({
            template: template,
            moduleId: module.id,

            initialize: function (options) {
                BaseView.prototype.initialize.apply(this, arguments);
                this.isCloud = this.model.serverInfo.isCloud();

                if (this.model.user.isFree()) {
                    this.paywallView = new PaywallView({
                        title: _('Select Forwarders').t(),
                        model: {
                            application: this.model.application
                        }
                    });
                    return;
                }

                this.children.flashMessages =  new FlashMessagesView({
                    model: this.model.deploymentClass
                });

                var defaults = {viewBy: 'new'};
                _.defaults(this.model.deploymentClass.attributes, defaults);

                this.collection.deploymentClients = new DeploymentServerClients();
                this.collection.deploymentClasses = new DeploymentServerClasses();
                this.model.deploymentClass.associated.deploymentClientsCollection = this.collection.deploymentClients;

                this.deferreds = {};

                this.checkForwarders();

                this.deferreds.dclassesDfd = this.collection.deploymentClasses.fetch({
                    data: {
                        count: -1
                    }
                });

                this.deferreds.dclassesDfd.done(function() {
                    // populating list of groups
                    var groupsList = [];
                    groupsList.push({label:_('-- Select --').t(), value:''});
                    this.collection.deploymentClasses.map(function(item) {
                        var groupname = item.entry.get('name');
                        groupsList.push({label:groupname, value:groupname});
                    });

                    this.children.groups = new ControlGroup({
                        className: 'fwders-groups control-group',
                        controlType: 'SyntheticSelect',
                        controlClass: 'controls-quarterblock',
                        controlOptions: {
                            modelAttribute: 'group',
                            model: this.model.deploymentClass,
                            items: groupsList,
                            className: 'btn-group view-count',
                            toggleClassName: 'btn'
                        },
                        label: _('Server Class').t()
                    });

                    this.$('#groups-placeholder').html(this.children.groups.render().el);
                    this.updateVisibility();
                }.bind(this));

                this.children.viewBy = new ControlGroup({
                    className: 'fwders-viewby control-group',
                    controlType: 'SyntheticRadio',
                    controlClass: 'controls-quarterblock',
                    controlOptions: {
                        modelAttribute: 'viewBy',
                        model: this.model.deploymentClass,
                        save: false,
                        items: [{label: _('New').t(), value: 'new'}, {label: _('Existing').t(), value: 'existing'}]
                    },
                    label:   _('Select Server Class').t()
                });

                this.children.newGroup = new ControlGroup({
                    className: 'fwdr-group control-group',
                    controlType: 'Text',
                    controlClass: 'controls-quarterblock',
                    controlOptions: {
                        modelAttribute: 'ui.name',
                        model: this.model.deploymentClass,
                        save: false
                    },
                    label:   _('New Server Class Name').t()
                });

                var configHelpLink = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.adddata.configds'
                );

                var forwarderManagementLink = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.adddata.selectfwd'
                );

                var deploymentHelpLink = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.adddata.referencehw'
                );

                this.children.faq = new Faq({faqList: this.faqList(configHelpLink, forwarderManagementLink, deploymentHelpLink)});

                /* EVENTS  */
                this.model.wizard.off('forwardersValidated');
                this.model.wizard.on('forwardersValidated', function() {
                    // After validation, attempt to create a new server class or just select an existing
                    var that = this,
                        serverClassName = '';

                    if (this.model.deploymentClass.get('viewBy') === 'new') {
                        serverClassName = this.model.deploymentClass.get('ui.name');
                        this.model.wizard.set('serverClassName', serverClassName);

                        this.model.deploymentClass.set({
                            'ui.restartSplunkd': 'true'
                        });
                        // get rid of unwanted args that could get here after previous save
                        this.model.deploymentClass.entry.content.clear();
                        this.model.deploymentClass.transposeToRest();
                        this.model.deploymentClass.save({}, {
                            success: function() {
                                that.model.wizard.stepForward(true);
                            }
                        });

                    } else if (this.model.deploymentClass.get('viewBy') === 'existing') {
                        serverClassName = this.model.deploymentClass.get('group');
                        that.model.wizard.set('serverClassName', serverClassName);
                        that.model.wizard.stepForward(true);
                    }
                }.bind(this));

                this.model.deploymentClass.on('change:viewBy', function() {
                    this.updateVisibility();
                    this.clearErrors();
                }, this);

                this.model.deploymentClass.on('change:fwdGroupIsWindows', function(model, fwdGroupIsWindows) {
                    this.model.wizard.set('fwdGroupIsWindows', fwdGroupIsWindows);
                }, this);

                this.model.deploymentClass.on('change:group', function(model, groupName) {
                    this.collection.deploymentClients.fetch({
                        data: {
                            serverclasses: groupName,
                            count: -1
                        }
                    }).done(function() {
                        var forwarderList = this.collection.deploymentClients.map(function(model) {
                            return model.entry.content.get('hostname');
                        }.bind(this));

                        this.model.deploymentClass.set('fwders', forwarderList);
                        this.showGroupContents(forwarderList);
                    }.bind(this));
                }, this);
            },

            events: {
                'click .refresh': function(e) {
                    e.preventDefault();
                    this.checkForwarders();
                }
            },

            showGroupContents: function(forwarderList) {
                if (!forwarderList) {
                    this.$('#group-fwders-placeholder').empty().hide();
                    return;
                }

                this.deferreds.dclientsDfd.done(function() {
                    var values = _.map(forwarderList, function(hostname) {
                        var os = this.collection.deploymentClients.getClientDetails(hostname).os;
                        return {name:hostname, os:os};
                    }.bind(this));

                    var listBox = _.template(this.listboxTemplate, {
                        values: values
                    });
                    this.$('#group-fwders-placeholder').html(listBox).show();
                }.bind(this));
            },

            updateVisibility: function() {
                if (this.model.deploymentClass.get('viewBy') === 'new') {
                    this.$('#new_group').show();
                    this.$('#existing_group').hide();
                } else { // existing
                    this.$('#existing_group').show();
                    this.$('#new_group').hide();
                }
            },

            checkForwarders: function() {
                this.deferreds.dclientsDfd = this.collection.deploymentClients.fetch({
                    data: {
                        sort_key: 'utsname',
                        sort_dir: 'asc',
                        count: -1
                    }
                });
                this.deferreds.dclientsDfd.done(function() {
                    // populating list of forwarders
                    if (!this.collection.deploymentClients.length) {
                        this.showNoForwarders();
                        return;
                    }

                    var availableFwders = [];
                    var selectedFwders = this.model.deploymentClass.get('fwders') || [];
                    this.collection.deploymentClients.map(function(model) {
                        var hostname = model.entry.content.get('hostname'),
                            ip = model.entry.content.get('ip'),
                            os = model.getPrettyOsName(),
                            label = hostname,
                            icon = os;

                        availableFwders.push({label:label, icon:icon, value:hostname});
                    }.bind(this));

                    this.children.forwarderList = new ControlGroup({
                        className: 'fwders control-group',
                        controlType: 'Accumulator',
                        controlClass: 'controls-block',
                        controlOptions: {
                            modelAttribute: 'fwders',
                            model: this.model.deploymentClass,
                            save: false,
                            availableItems: availableFwders,
                            selectedItems: selectedFwders,
                            itemName: _('host(s)').t()
                        }
                    });

                    this.$('#forwarder-list-placeholder').html(this.children.forwarderList.render().el);
                    if (this.isCloud) {
                        this.$('.availableOptionsHeader').append(' <a class="refresh" href="#">' + _('refresh').t() + '<i class="icon icon-rotate"></i></a>');
                        this.$('#forwarder-list-placeholder .shared-controls-accumulatorcontrol').after('<i>' + _("If you don't see your recently added forwarder in the list above, please refresh.").t() + '</i>');
                    }
                    this.showForwardersList();
                }.bind(this));
            },

            showNoForwarders: function() {
                this.$('.no-forwarders').show();
                this.$('.has-forwarders').hide();
            },

            showForwardersList: function() {
                this.$('.no-forwarders').hide();
                this.$('.has-forwarders').show();
            },

            clearErrors: function() {
                this.model.deploymentClass.trigger('validated', true, this.model.deploymentClass, []);
                this.$('.control-group').removeClass('error');
            },

            listboxTemplate: '\
                <label class="control-label" for="fwder-listbox"><%= _("List of Forwarders").t() %></label>\
                <select class="control" id="fwder-listbox" size="5">\
                    <% $.each(values, function(ix,val) { %>\
                        <option value="<%= val.name %>" disabled="disabled"><%= val.os %> | <%= val.name %></option>\
                    <% }); %>\
                </select>\
            ',

            faqList: function(){
                 return [
                {
                    question: _('How do I create source types for data originating from Forwarders?').t(),
                    answer: _('Splunk does not support data preview through universal forwarders. Use a full Splunk instance to upload and preview a sample of the data that you want to index. After confirming proper data indexing with the selected source type, use that source type for the objects that you want to monitor with the universal forwarder.').t()
                },
                {
                    question: _('What is a deployment server?').t(),
                    answer: _('A deployment server is a Splunk instance that manages configurations for any number of Splunk instances. These remotely-configured instances are known as deployment clients. Deployment clients download content - known as deployment apps - from deployment servers.').t()
                },
                {
                    question: _('What are deployment clients?').t(),
                    answer: _('Deployment clients are Splunk instances that a deployment server manages and configures. You can group deployment clients into one or more server classes. Deployment clients poll deployment servers for new or updated content, then download the content and use it according to the instructions specified by their server class. Content can range from apps and system configurations to scripts, images, and supporting material. ').t()
                },
                {
                    question: _('What are server classes?').t(),
                    answer: _('Server classes are groups of deployment clients. They enable management of deployment clients as a single unit based on elements such as application, operating system or type of data. Deployment servers use server classes to determine what content they should deploy to clients in a particular class.').t()
                },
                {
                    question: _('How do I make changes to the deployment server configuration?').t(),
                    answer: _('You can use Splunk Web or edit configuration files to change the deployment server configuration. ').t() + '<a href="' + arguments[0] + '" class="external" target="_blank">' + _("Learn More.").t() + '</a>'
                },
                {
                    question: _('How do I manage deployment clients?').t(),
                    answer: _('Use forwarder management to manage deployment clients. ').t() + '<a href="' + arguments[1] + '" class="external" target="_blank">' + _("Learn More").t() + '</a>'
                },
                {
                    question: _('How many deployment clients are supported by this instance?').t(),
                    answer: _('This instance supports up to 300 deployment clients provided it has the hardware configuration recommended by Splunk. ').t() + '<a href="' + arguments[2] + '" class="external" target="_blank">' + _("Learn More").t() + '</a>'
                },
                {
                    question: _('How do I add data from forwarders in distributed Splunk environments?').t(),
                    answer: _('Use this page only in a single-instance Splunk environment. There is no support for configuring forwarder outputs or indexer clustering. If you have multiple indexers, ensure that they all have identical configurations and indexes.').t()
                }
            ];},

            render: function () {
                if (this.model.user.isFree()) {
                    this.$el.html(this.paywallView.render().el);
                    return;
                }
                var setupLink = route.docHelp(
                        this.model.application.get('root'),
                        this.model.application.get('locale'),
                        'learnmore.adddata.setupforwarder'),
                    UFSetupLink = route.page(
                        this.model.application.get('root'),
                        this.model.application.get('locale'),
                        'search',
                        'setupuf'),
                    template = this.compiledTemplate({
                        setupLink: setupLink,
                        UFSetupLink: UFSetupLink,
                        isCloud: this.isCloud
                    });

                this.$el.html(template);

                this.$('#viewby-placeholder').html(this.children.viewBy.render().el);
                this.$('#viewby-placeholder').prepend(this.children.flashMessages.render().el);
                this.$('#newgroup-placeholder').append(this.children.newGroup.render().el);
                this.$el.append(this.children.faq.render().el);

                this.showGroupContents(this.model.deploymentClass.get('fwders'));

                return this;
            }
        });
    }
);
