/**
 * Created by lrong on 8/4/15.
 */
define([
    'jquery',
    'underscore',
    "backbone",
    'module',
    'models/Base',
    'views/Base',
    'views/managementconsole/topology/controls/FilterBox',
    'views/managementconsole/topology/table/Master',
    'views/managementconsole/topology/instances/controls/ForwarderSetupDialog',
    'views/managementconsole/topology/instances/controls/ForwarderAuthenticationDialog',
    'views/shared/Modal',
    'views/managementconsole/shared/DeleteConfirmationDialog',
    'helpers/managementconsole/url',
    'contrib/text!views/managementconsole/topology/instances/Master.html',
    'views/managementconsole/shared.pcss',
    './Master.pcss',
    'bootstrap.tooltip'
], function(
    $,
    _,
    Backbone,
    module,
    BaseModel,
    BaseView,
    FilterBox,
    TableView,
    ForwarderSetupDialog,
    ForwarderAuthenticationDialog,
    Modal,
    DeleteConfirmationDialog,
    urlHelper,
    Template,
    cssShared,
    css
    //tooltip
){
    var STRINGS = {
        TITLE: _('Forwarders').t(),
        DESCRIPTION: _('A forwarder is a lightweight Splunk Enterprise instance that forwards data to Splunk Cloud. To take full advantage of Forwarder Management features, use forwarders that are version 6.5 or newer.').t(),
        CONFIGURE: _('Edit Configuration for All Forwarders').t(),
        TOPOLOGY: _('Deployment Management').t(),
        FWD_SETUP: _('Forwarder setup instructions').t(),
        FWD_AUTH_DESCRIPTION: _('You can secure communication between forwarders and this server.').t(),
        FWD_AUTH: _('Click here to modify forwarder authentication settings.').t(),
        SHOW_FILTERS: _('Show Filters').t(),
        CONFIGURE_FORWARDERS_TOOLTIP: _('Click here to make configuration changes applicable to all of your forwarders').t()
    };

    return BaseView.extend({
        moduleId: module.id,
        template: Template,

        initialize: function() {
            BaseView.prototype.initialize.call(this, arguments);
            this.deferreds = this.options.deferreds || {};
            var filters = [
                FilterBox.FILTER_TYPES.SERVER_CLASSES,
                FilterBox.FILTER_TYPES.METADATA];

            this.children.filterBox = new FilterBox({
                filters: filters,
                model: {
                    classicurl: this.model.classicurl,
                    filter: this.model.filter,
                    user: this.model.user,
                    state: this.model.state
                },
                collection: {
                    serverClasses: this.collection.serverClasses,
                    builtinGroups: this.collection.builtinGroups
                }
            });

            var hiddenColumns = [],
                hiddenColumnNames = this.model.user.isForwarderOnly() ? ['SELECT_ALL', 'SERVER_ROLE', 'REGISTRATION_STATUS', 'EDIT_ACTIONS'] : ['SELECT_ALL', 'PHONE_HOME', 'REGISTRATION_STATUS', 'EDIT_ACTIONS'];

            _.each(hiddenColumnNames, function(columnName){
                hiddenColumns.push(TableView.TABLE_COLUMNS[columnName]);
            });

            this.children.gridView = new TableView({
                deferreds: this.deferreds,
                hiddenColumns: hiddenColumns,
                hiddenColumnNames: hiddenColumnNames,
                model: {
                    classicurl: this.model.classicurl,
                    filter: this.model.filter,
                    user: this.model.user
                },
                collection: {
                    instances: this.collection.instances,
                    pendingChanges: this.collection.pendingChanges
                }
            });

            if (this.model.state.get('fwdSetupDialogOpen')) {
                this._showFwdSetupDialog();
            }

            this.listenTo(this.model.state, "change:hideFilters", this._onHideFiltersChanged);
            this.listenTo(this.model.classicurl, "change", this._updateReturnUrl);
            this.listenTo(this.children.gridView, 'removeClicked', this._deleteForwarder);
        },

        events: {
            'click .fwd-setup-instructions': '_showFwdSetupDialog',
            'click .fwd-authentication': '_showFwdAuthenticationDialog',
            'click .show-filters-btn': '_showFilters'
        },

        // Create/show dialog with forwarder setup instructions
        _showFwdSetupDialog : function(e) {
            if (!_.isUndefined(e)) {
                e.preventDefault();
            }
            this._showDialog(ForwarderSetupDialog, {
                forwarderSetup: this.model.forwarderSetup
            });
        },

        _showFwdAuthenticationDialog: function(e) {
            if (!_.isUndefined(e)) {
                e.preventDefault();
            }
            this._showDialog(ForwarderAuthenticationDialog, {
                user: this.model.user,
                forwarderSetup: this.model.forwarderSetup,
                fwdAuthTask: this.model.fwdAuthTask
            },{
                topologies: this.collection.topologies
            });
        },

        _showDialog: function(Dialog, model, collection) {
            var dialog = new Dialog({
                onHiddenRemove: true,
                model: model,
                collection: collection
            });

            $('body').append(dialog.render().el);
            dialog.show();
        },

        _showFilters: function(e) {
            e.preventDefault();
            this.model.state.set('hideFilters', false);
        },
        
        _onHideFiltersChanged: function() {
        	var hideFilters = this.model.state.get("hideFilters");
        	if (hideFilters) {
        		this.$('.show-filters-btn').show();
            	this.$('.filter-toolbox').hide();
                this.$('.result-section').addClass('result-section-expanded');
        	}
        	else {
        		this.$('.show-filters-btn').hide();
        		this.$('.filter-toolbox').show();
                this.$('.result-section').removeClass('result-section-expanded');
        	}
        },

        _deleteForwarder: function(instanceId) {
            var instance = this.collection.instances.get({id: instanceId}),
                confirmDialog = new DeleteConfirmationDialog({
                    id: "modal_delete",
                    flashModel: instance,
                    entitySingular: _('Forwarder').t(),
                    dialogButtonLabel: _('Remove').t(),
                    targetEntity: instance,
                    task: this.model.fwdRemoveTask,
                    onActionSuccess: function(response) {
                        this.model.fwdRemoveTask.entry.set('name', response.entry[0].task.taskId);
                    }.bind(this)
                });
            $('body').append(confirmDialog.render().el);
            confirmDialog.show();
        },

        _updateReturnUrl: function() {
            this.$('.btn-configure-forwarders').attr('href', this.model.forwarderGroup.getConfigureUrl({ return_to: window.location.href, return_to_page: 'topology_page' }));
            var opts = { return_to: window.location.href, return_to_page: 'topology_page'},
                url = urlHelper.pageUrl(
                    'topology_management',
                    opts
                );
            this.$('.deployment-management').attr('href', url);
        },

        render: function() {
            this.$el.html(this.compiledTemplate({
                user: this.model.user,
                strings: STRINGS,
                showForwarderAuthLink:  this.canUserChangeForwarderAuth(),
                showForwarderConfigureButton: this.model.user.isForwarderOnly() &&
                    this.model.forwarderGroup.canListStanzas() &&
                    this.model.forwarderGroup.entry.content.get('@memberCount') > 0
            }));
            
            // Add tooltip to configure all forwarders button
            this.$('.btn-configure-forwarders.tooltip-link').tooltip({animation:false, title: STRINGS.CONFIGURE_FORWARDERS_TOOLTIP, container: 'body'});
            
            this._updateReturnUrl();

            if (this.children.filterBox) {
                this.children.filterBox.detach();
            }
            if (this.children.gridView) {
                this.children.gridView.detach();
            }

            this.children.filterBox.render().appendTo(this.$('.filter-toolbox'));
            this.children.gridView.render().appendTo(this.$('.grid-placeholder'));

            return this;
        },

        canUserChangeForwarderAuth: function () {
            var canEditForwarderSetup = this.model.user.canEditForwarderSetup();
            var canEditForwarderAuth = this.model.user.canEditForwarderAuth();
            var requireAuth = this.model.forwarderSetup.entry.content.get('requireAuthentication');
            return canEditForwarderSetup && (canEditForwarderAuth || requireAuth);
        },

        remove: function() {
        	// Remove tooltip
            this.$('.btn-configure-forwarders.tooltip-link').tooltip('destroy');
            return BaseView.prototype.remove.apply(this, arguments);
        }
    });
});