define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'views/Base',
        'views/managementconsole/configuration/group/ConfList',
        'views/managementconsole/configuration/stanzas/Master',
        'views/managementconsole/configuration/group/components/SimpleTextDialog',
        'views/managementconsole/deploy/components/StatusDialog',
        'models/managementconsole/topology/Instance',
        'helpers/managementconsole/url',
        'models/classicurl',
        'contrib/text!./Master.html',
        'views/managementconsole/SharedInputList.pcss',
        'views/managementconsole/shared.pcss',
        './Master.pcss'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        BaseView,
        ConfListView,
        StanzasView,
        SimpleTextDialog,
        StatusDialogView,
        Instance,
        urlHelper,
        classicurl,
        Template,
        cssInputList,
        cssShared,
        css
    ) {
        var STRINGS = {
            BACK: _('Back').t(),
            BACK_TO_SERVER_CLASS: _('Back to Server Classes').t(),
            BACK_TO_TOPOLOGY: _('Back to Forwarders').t(),
            BACK_TO_APPS: _('Back to Apps').t()
        };

        return BaseView.extend({
            moduleId: module.id,

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.compiledInstanceDetailsTemplate = _.template(this.instanceDetailsTemplate);
                this.compiledCustomGroupDetailsTemplate = _.template(this.customGroupDetailsTemplate);
                this.compiledAppDetailsTemplate = _.template(this.appDetailsTemplate);
                this.compiledAllForwardDetailsTemplate = _.template(this.allForwardersDetailsTemplate);

                this.children.confList = new ConfListView({
                    model: {
                        configuration: this.model.configuration,
                        stanzasMeta: this.model.stanzasMeta
                    },
                    collection: {
                        stanzas: this.collection.stanzas
                    }
                });
                this.children.stanzas = new StanzasView({
                    model: {
                        configuration: this.model.configuration,
                        stanzasMeta: this.model.stanzasMeta,
                        instance: this.model.instance,
                        state: this.model.state,
                        confSpec: this.model.confSpec,
                        confStanzaSpec: this.model.confStanzaSpec,
                        confDefaultSpec: this.model.confDefaultSpec
                    },
                    collection: {
                        stanzas: this.collection.stanzas,
                        createStanzas: this.collection.createStanzas,
                        pendingChanges: this.collection.pendingChanges
                    }
                });

                this.collection.moreList = new Backbone.Collection();
                this.children.moreListDialog = new SimpleTextDialog({collection: this.collection.moreList});

                if (urlHelper.getUrlParam('showDeployStatus')) {
                    this.onShowDeployStatus();
                }

                this.listenTo(this.model.instance, 'sync', this._renderInstanceDetails);
            },

            events: {
                'click .more-link': function(e) {
                    e.preventDefault();
                    var $target = $(e.currentTarget),
                        type = $target.data('type'),
                        list;

                    if (this.model.configuration.isSingleNode()) {
                        if (type === 'server-class') {
                            list = this.model.instance.getServerClasses();
                        } else if (type === 'apps') {
                            list = this.model.instance.getApps();
                        }

                        list = _.map(list, function(listItem) {
                            return {text: listItem.displayName};
                        });
                    } else if (this.model.configuration.isCustom()) {
                        if (type === 'apps') {
                            list = _.map(this.model.configuration.entry.content.get('@apps'), function(app) {
                                return {text: app};
                            });
                        }
                    }

                    // collection takes an array of the form [{text: name1}, {text: name2}, ... , {text: nameN}]
                    this.collection.moreList.reset(list);

                    this.children.moreListDialog.render().$el.appendTo($('body'));
                    this.children.moreListDialog.show($target);
                },

                'click .deploy-status-show-details': function(e) {
                    e.preventDefault();
                    this.onShowDeployStatus();
                }
            },

            onShowDeployStatus: function() {
                var mode = this.model.configuration.getDeployStatusMode(),
                    deployStatusDialog;

                // do not reset collection and re-fetch if first time calling onShowDeployStatus because fetch has
                // already been requested in router

                // do not need to reset and re-fetch if showing deploy status dialog for an instance since
                // that call does not support pagination and the controls will reset by default
                if (!!this.resetDeployStatus && !this.model.configuration.isSingleNode()) {
                    var fetchData = this.collection.deployStatus.fetchData;

                    // only need to re-refetch if offset (page number) was changed or one of the filter controls
                    // was modified (thus changing the deployStatusQuery) -> saves from unneeded fetches
                    if (this.model.configuration.deployStatusNeedsRefetch(fetchData)) {
                        var defaultFetchData = this.model.configuration.getDefaultDeployStatusFetchData();
                        fetchData.clear();
                        fetchData.set(defaultFetchData);
                    }
                }
                this.resetDeployStatus = true;

                deployStatusDialog = new StatusDialogView({
                    model: this.model.configuration.isSingleNode() ? this.model.instance : this.model.configuration,
                    mode: mode,
                    collection: {
                        entities: this.collection.deployStatus
                    },
                    redirectReturnToPage: null
                });

                urlHelper.replaceState({'showDeployStatus': 1});

                this.listenTo(deployStatusDialog, 'hide', function() {
                    urlHelper.removeUrlParam('showDeployStatus');
                });

                $('body').append(deployStatusDialog.render().el);
                deployStatusDialog.show();
            },

            render: function() {
                this.el.innerHTML = this.compiledTemplate({
                    title: this.model.configuration.getPrefixedTitle(),
                    returnTo: classicurl.get('return_to'),
                    returnPage: classicurl.get('return_to_page'),
                    strings: STRINGS
                });

                this.children.confList.render().$el.appendTo(this.$('.section-body'));
                this.children.stanzas.render().$el.appendTo(this.$('.section-body'));

                if (this.model.configuration.isSingleNode()) {
                    this.$('.section-body').addClass('section-with-details single-node-body');
                    this._renderInstanceDetails();
                } else if (this.model.configuration.isCustom()) {
                    this.$('.section-body').addClass('section-with-details custom-group-body');
                    this._renderCustomGroupDetails();
                } else if (this.model.configuration.isAllForwarders()) {
                    this.$('.section-body').addClass('section-with-details all-forwarders-group-body');
                    this._renderAllForwardersGroupDetails();
                } else {
                    this.$('.section-body').addClass('section-with-details app-body');
                    this._renderAppDetails();
                }

                return this;
            },

            _renderCustomGroupDetails: function() {
                if (this.model.configuration.isCustom()) {
                    this.$('.section-header').addClass('tall-header');
                    this.$('.details-header').html(this.compiledCustomGroupDetailsTemplate({
                        details: this.model.configuration.getFormattedDetailValues(),
                        entity: this.model.configuration
                    }));
                } else {
                    this.$('.section-header').removeClass('tall-header');
                    this.$('.details-header').empty();
                }
            },

            _renderInstanceDetails: function() {
                if (this.model.configuration.isSingleNode()) {
                    this.$('.section-header').addClass('tall-header');
                    this.$('.details-header').html(this.compiledInstanceDetailsTemplate({
                        details: this.model.instance.getFormattedDetailValues(),
                        entity: this.model.instance
                    }));
                } else {
                    this.$('.section-header').removeClass('tall-header');
                    this.$('.details-header-header').empty();
                }
            },

            _renderAppDetails: function() {
                if (this.model.configuration.isApp()) {
                    this.$('.section-header').addClass('tall-header');
                    this.$('.details-header').html(this.compiledAppDetailsTemplate({
                        details: this.model.configuration.getFormattedDetailValues(),
                        entity: this.model.configuration
                    }));
                } else {
                    this.$('.section-header').removeClass('tall-header');
                    this.$('.details-header-header').empty();
                }
            },

            _renderAllForwardersGroupDetails: function() {
                if (this.model.configuration.isAllForwarders()) {
                    this.$('.section-header').addClass('tall-header');
                    this.$('.details-header').html(this.compiledAllForwardDetailsTemplate({
                        instancesUpToDate: this.model.configuration.getInstancesUpToDateRatio()
                    }));
                } else {
                    this.$('.section-header').removeClass('tall-header');
                    this.$('.details-header').empty();
                }
            },

            template: Template,

            instanceDetailsTemplate: ' \
				<dl class="list-dotted pull-left"> \
					<dt><%- _("Client Name").t() %></dt><dd><%- details.clientName.label %></dd> \
				  	<dt><%- _("Host Name").t() %></dt><dd><%- details.hostname.label %></dd> \
				  	<dt><%- _("IP Address").t() %></dt><dd><%- details.ip.label %></dd> \
				</dl> \
				<dl class="list-dotted pull-left extra-padding-left"> \
				  	<dt><%- _("DNS Name").t() %></dt><dd><%- details.dns.label %></dd> \
				  	<dt><%- _("Machine Type").t() %></dt><dd><%- details.splunkPlatform.label %></dd> \
				  	<dt><%- _("Version").t() %></dt><dd><%- details.version.label %></dd> \
				</dl> \
				<dl class="list-dotted pull-left extra-padding-left"> \
				  	<dt><%- _("Phone Home").t() %></dt><dd><%- details.lastPhoneHomeTime.label %></dd> \
				  	<dt><%- _("Server Classes").t() %></dt> \
                    <dd>\
                        <% if (entity.isLimitedProperty("serverClasses")) { %> \
                            <%- entity.getLimitedPropertyMessage() %> \
                        <% } else { %> \
                        <%- details.serverClasses.value.length %> \
                       <% if (details.serverClasses.value.length) { %> \
                       <a class="more-link" data-type="server-class">(<%- _("details").t() %>)</a> \
                        <% } %> \
                        <% } %> \
                    </dd> \
				  	<dt><%- _("Apps").t() %></dt>\
                    <dd>\
                        <% if (entity.isLimitedProperty("apps")) { %> \
                            <%- entity.getLimitedPropertyMessage() %> \
                        <% } else { %> \
                        <%- details.apps.value.length %> \
                            <% if (details.apps.value.length) { %> \
                        <a class="more-link" data-type="apps">(<%- _("details").t() %>)</a> \
                        <% } %> \
                        <% } %> \
                     </dd> \
				</dl> \
				<dl class="list-dotted pull-left extra-padding-left">\
                    <dt><%- _("Deploy Status").t() %></dt><dd><%- details.deployStatus.label %> <a class="deploy-status-show-details" href="#">(<%- _("details").t() %>)</a></dd> \
                 </dl>\
				<div class="clearfix"></div> \
			',

            customGroupDetailsTemplate: '\
                <dl class="list-dotted pull-left"> \
                    <dt><%- _("White List Sequence").t() %></dt><dd><%- details.whitelist.label %> </dd>\
                    <dt><%- _("Black List Sequence").t() %></dt><dd><%- details.blacklist.label %> </dd>\
                </dl>\
                <dl class="list-dotted pull-left extra-padding-left">\
                    <dt><%- _("Machine Type Filter").t() %></dt><dd><%- details.machineTypesFilter.label %> </dd>\
                    <dt><%- _("Apps").t() %></dt>\
                    <dd>\
                        <% if (entity.isLimitedProperty("apps")) { %> \
                            <%- entity.getLimitedPropertyMessage() %> \
                        <% } else { %> \
                        <% if (details["@apps"].value.length) { %>\
                         <%- details["@apps"].value.length %>\
                         <a class="more-link" data-type="apps">(<%- _("details").t() %>)</a>\
                         <% } else { %> \
                         <%- details["@apps"].label %>\
                         <% } %>\
                         <% } %> \
                    </dd>\
                 </dl>\
                 <dl class="list-dotted pull-left extra-padding-left">\
                    <dt><%- _("Deploy Status").t() %></dt><dd><a class="deploy-status-show-details" href="#"><%- _("See Details").t() %></a></dd> \
                 </dl>\
            ',

            appDetailsTemplate: '\
                <dl class="list-dotted pull-left"> \
                    <dt><%- _("Version").t() %></dt><dd><%- details.version.label %></dd>\
            		<dt><%- _("After Installation").t() %></dt><dd><%- details.afterInstallation.label %></dd>\
            		<dt><%- _("Deploy Status").t() %></dt><dd><a class="deploy-status-show-details" href="#"><%- _("See Details").t() %></a></dd>\
                </dl>\
            ',

            allForwardersDetailsTemplate: '\
                <dl class="list-dotted pull-left"> \
                    <dt><%- _("Instances Up to Date").t() %></dt><dd><%- instancesUpToDate %> <a class="deploy-status-show-details" href="#">(<%- _("details").t() %>)</a></dd> \
                </dl> \
            '
        });
    }
);