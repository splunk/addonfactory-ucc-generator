/**
 * @author jszeto
 * @date 1/23/13
 *
 * Displays information and controls to manage/edit a DataModel
 *
 * Inputs:
 *
 *     model: {
 *         application {models/Application}
 *         dataModel {models/services/datamodel/DataModel}
 *         settings {Backbone.Model}
 *         user {models/services/authentication/User}
 *     }
 *     isExpanded {boolean} whether the row is expanded or not
 *     index {number} the item index in the collection/array (zero-based),
 *     rowNumber {number} the row number after applying the offset (one-based)
 *
 * @fires DataModelRow#action:editPermissions
 * @fires DataModelRow#action:editAcceleration
 * @fires DataModelRow#action:cloneDataModel
 * @fires DataModelRow#action:openAccelerateDialog
 * @fires DataModelRow#action:editDataModel
 * @fires DataModelRow#action:editDataModelTitle
 * @fires DataModelRow#action:deleteDataModel
 */

define([
    'jquery',
    'underscore',
    'module',
    'util/splunkd_utils',
    'splunk.util',
    'splunk.i18n',
    'uri/route',
    'views/Base',
    'views/shared/delegates/RowExpandCollapse',
    'views/shared/DropDownMenu',
    'views/data_model_manager/components/AccelerationInfo',
    'models/Base',
    'models/services/datamodel/DataModel',
    'models/services/summarization/TStatsSummarization'

],
    function(
        $,
        _,
        module,
        splunkDUtils,
        splunkUtils,
        i18n,
        route,
        BaseView,
        RowExpandCollapse,
        DropDownMenu,
        AccelerationInfo,
        BaseModel,
        DataModel,
        TStatsSummarization
        ) {

        return BaseView.extend({
            tagName: 'tr',

            moduleId: module.id,

            isExpanded: false,

            events: (function() {
                var events = {};
                events['click td.' + RowExpandCollapse.TOGGLE_CELL_CLASS + ', td.col-accelerate'] = 'toggleCellClickHandler';
                events['click a.edit-permissions-btn'] = function() {
                    /**
                     * Edit the Data Model permissions
                     *
                     * @event DataModelRow#action:editPermissions
                     * @param {string} data model name
                     */
                    this.trigger("action:editPermissions", this.model.dataModel.get("id"));
                };
                events['click a.rebuild-btn'] = function() { this.rebuildAcceleration();};
                events['click a.update-btn'] = function() {this.fetchAccelerationInfo();};
                events['click a.edit-acceleration-btn'] = function() {
                    /**
                     * Edit the Data Model acceleration
                     *
                     * @event DataModelRow#action:editAcceleration
                     * @param {string} data model name
                     */
                    this.trigger("action:editAcceleration",this.model.dataModel.get("id"));
                };
                events['click a.clone-btn'] = function() {
                    /**
                     * Clone a Data Model
                     *
                     * @event DataModelRow#action:cloneDataModel
                     * @param {string} data model name
                     */
                    this.trigger("action:cloneDataModel",this.model.dataModel.get("id"));};
                return events;
            })(),

            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);

                // Create an accelerationInfo model
                this.model.accelerationInfo = new BaseModel();
                this.model.accelerationInfo.on("change", this.debouncedRender, this);

                this.model.dataModel.entry.acl.on("change", function() {
                    this.debouncedRender();
                }, this);
                this.model.dataModel.entry.content.on("change", this.debouncedRender, this);
                this.model.dataModel.entry.content.acceleration.on("change", this.debouncedRender, this);

                var isDataModel = this.model.dataModel.getType() === DataModel.DOCUMENT_TYPES.DATAMODEL;

                // Piece together the items array based on permissions
                var items;
                var subItems0 = [];
                var subItems1 = [];
                var subItems2 = [];

                if (isDataModel) {
                    subItems0.push({label:_("Edit Datasets").t(), value:"editDataModel"});
                } else if (this.model.user.canAccessSplunkDatasetExtensions()) {
                    // Only show the link if the datasets extension app is installed
                    subItems0.push({label:_("Edit Dataset").t(), value:"editDataModel"});
                }

                if (!this.model.dataModel.isAccelerated() && isDataModel) {
                    subItems1.push({label:_("Edit Title or Description").t(), value:"editDataModelTitle"});
                }
                if (this.model.dataModel.canChangePermissions()) {
                    subItems1.push({label:_("Edit Permissions").t(), value:"editPermissions"});
                }
                if (this.model.user.canAccelerateDataModel()) {
                    subItems1.push({label:_("Edit Acceleration").t(), value:"editAcceleration"});
                }
                if(this.model.settings.get("canCreateDataModel") && isDataModel) {
                    subItems2.push({label:_("Clone").t(), value:"cloneDataModel"});
                }
                if (this.model.dataModel.canDelete() && isDataModel) {
                    subItems2.push({label:_("Delete").t(), value:"deleteDataModel"});
                }

                items = [];
                if (subItems0.length > 0)
                    items.push(subItems0);
                if (subItems1.length > 0)
                    items.push(subItems1);
                if (subItems2.length > 0)
                    items.push(subItems2);

                this.children.editDropDownMenu = new DropDownMenu({label:_("Edit").t(),
                                                           items:items,
                                                           dropdownClassName: "dropdown-menu-narrow",
                                                           anchorClassName: "dropdown-toggle",
                                                           className: "dropdown",
                                                           popdownOptions: {attachDialogTo: 'body'}});

                this.children.editDropDownMenu.on("itemClicked", this.editDropDownMenuClickHandler, this);
            },

            /**
             * Listen for a itemClicked event from the Edit dropdown menu and perform the appropriate action
             *
             * @param itemData {Object} value of the clicked item
             */
            editDropDownMenuClickHandler: function(itemData) {
                if (itemData == "editDataModel") {
                    this.trigger("action:" + itemData, this.model.dataModel);
                } else {
                    this.trigger("action:" + itemData, this.model.dataModel.get("id"));
                }
            },

            /**
             * Toggle the expand/collapse state and render
             */
            toggleCellClickHandler: function(e) {
                e.preventDefault();
                this.isExpanded = !this.isExpanded;
                this.debouncedRender();
            },

            /**
             * Helper to fetch the TSIDX summarization
             */
            fetchAccelerationInfo: function() {
                if (this.model.tstatsSummarization)
                    this.model.tstatsSummarization.fetch();
            },

            /**
             * Called when user presses the Rebuild acceleration button
             */
            rebuildAcceleration: function() {
                if (this.model.tstatsSummarization)
                {
                    var resultXHR = this.model.tstatsSummarization.destroy();

                    if (resultXHR) {
                        resultXHR.done(_(function() {
                            this.fetchAccelerationInfo();
                        }).bind(this));
                    }
                }
            },

            // TODO [JCS] Remove
            accelerateCheckboxClickHandler: function() {
                if (this.model.dataModel.entry.content.acceleration.get("enabled")) {
                    this.toggleCellClickHandler();
                }
                else {
                    /**
                     * Open the Data Model acceleration dialog
                     *
                     * @event DataModelRow#action:openAccelerateDialog
                     * @param {string} data model name
                     */
                    this.trigger("action:openAccelerateDialog",this.model.dataModel.get("id"));
                }
            },

            render: function() {
                var content = this.model.dataModel.entry.content;
                var modelName = content.get("modelName");
                var accelerationEnabled = content.acceleration.get("enabled");
                var acceleratePending = !accelerationEnabled;
                var description;
                var displayType = this.model.dataModel.getDatasetDisplayType();
                var editable = true;
                var displayName = content.get("displayName");
                var objectSummary = content.objectSummary;
                var app = this.model.dataModel.entry.acl.get("app");
                var owner = this.model.dataModel.entry.acl.get("owner");
                var sharing = this.model.dataModel.entry.acl.get("sharing");
                // If global, open in the current app, otherwise open in the DataModel's app
                var pivotUrl;
                var editUrl;
                var eventCount = 0;
                var transactionCount = 0;
                var searchCount = 0;
                var objectsString = "";
                var permissionString = splunkDUtils.getPermissionLabel(sharing, owner);

                if (this.model.dataModel.getType() === DataModel.DOCUMENT_TYPES.DATAMODEL) {
                    editUrl = route.data_model_editor(this.model.application.get("root"),
                        this.model.application.get("locale"),
                        this.model.application.get("app"),
                        {data: {model: this.model.dataModel.id}});

                    pivotUrl = route.pivot(this.model.application.get("root"),
                        this.model.application.get("locale"),
                        this.model.application.get("app"),
                        { data: { model: this.model.dataModel.id } });

                    description = content.get("description");

                } else if (this.model.dataModel.getType() === DataModel.DOCUMENT_TYPES.TABLE) {
                    if (!this.model.user.canAccessSplunkDatasetExtensions())
                        editable = false;

                    editUrl = route.table(this.model.application.get("root"),
                        this.model.application.get("locale"),
                        this.model.application.get("app"),
                        { data: { t: this.model.dataModel.id}});

                    pivotUrl = route.pivot(
                        this.model.application.get('root'),
                        this.model.application.get('locale'),
                        this.model.application.get('app'),
                        { data: {
                            dataset: this.model.dataModel.entry.get('name'),
                            type: 'datamodel'
                        }});

                    description = content.get("dataset.description");
                }

                if (objectSummary) {
                    eventCount = objectSummary.get("Event-Based");
                    transactionCount = objectSummary.get("Transaction-Based");
                    searchCount = objectSummary.get("Search-Based");
                }

                if (eventCount > 0)
                    objectsString += splunkUtils.sprintf(i18n.ungettext('1 Event', '%s Events', eventCount), eventCount);

                if (transactionCount > 0) {
                    if (objectsString != "")
                        objectsString += ", ";

                    objectsString += splunkUtils.sprintf(i18n.ungettext('1 Transaction', '%s Transactions',
                                                                transactionCount), transactionCount);
                }

                if (searchCount > 0) {
                    if (objectsString != "")
                        objectsString += ", ";
                    objectsString += splunkUtils.sprintf(i18n.ungettext('1 Search Event', '%s Search Events', searchCount), searchCount);
                }

                if (objectsString == "") {
                    objectsString = "(None)";
                }

                var canCreateDataModel = this.model.settings.get("canCreateDataModel");

                var html = this.compiledTemplate({modelName: modelName,
                    displayName: displayName,
                    description: description,
                    displayType: displayType,
                    editable: editable,
                    canWrite: this.model.dataModel.canWrite(),
                    canChangePerms: this.model.dataModel.canChangePermissions(),
                    canCloneDataModel: this.model.settings.get("canCreateDataModel"),
                    canAccelerate: this.model.dataModel.canAccelerate(),
                    userCanAccelerate: this.model.user.canAccelerateDataModel() && this.model.dataModel.canWrite(),
                    app: app,
                    owner: owner,
                    sharing: splunkDUtils.getSharingLabel(this.model.dataModel.entry.acl.get('sharing')),
                    accelerationEnabled: accelerationEnabled,
                    acceleratePending: acceleratePending,
                    accelerationInfo: this.model.accelerationInfo,
                    pivotUrl: pivotUrl,
                    editUrl: editUrl,
                    isExpanded: this.isExpanded,
                    objectsString: objectsString,
                    permissionString: permissionString,
                    toggleCellClass: RowExpandCollapse.TOGGLE_CELL_CLASS,
                    expandedCellBody: RowExpandCollapse.EXPANDED_CELL_MARKUP,
                    collapsedCellBody: RowExpandCollapse.COLLAPSED_CELL_MARKUP,
                    rowIdAttribute: RowExpandCollapse.ROW_ID_ATTR,
                    sprintf: splunkUtils.sprintf
                });

                this.$el.html(html);

                // Set the row id attribute on the root tag which is a TR
                this.$el.attr(RowExpandCollapse.ROW_ID_ATTR, modelName);

                if (this.isExpanded) {
                    this.$el.addClass(RowExpandCollapse.EXPANDED_ROW_CLASS);

                    // TODO [JCS] Hack together the id until we have a DataModel based acceleration info endpoint
                    var tstatsNamespace = "tstats:DM_" + app + "_" + this.model.dataModel.entry.content.get("modelName");
                    var tStatsId = this.model.dataModel.id.replace("datamodel/model", "admin/summarization");
                    var tStatsUrl = tStatsId.substr(0,tStatsId.lastIndexOf("/")+1);
                    tStatsId = tStatsUrl.concat(tstatsNamespace);

                    if (!this.model.tstatsSummarization) {
                        this.model.tstatsSummarization = new TStatsSummarization({id: tStatsId});
                        this.children.accelerationInfo = new AccelerationInfo({model:this.model.tstatsSummarization});
                    }

                    // TODO [JCS] This should be called only if the DM is accelerated
                    this.model.tstatsSummarization.fetch();
                    this.$(".acceleration-info-placeholder").replaceWith(this.children.accelerationInfo.render().el);
                } else {
                    this.$el.removeClass(RowExpandCollapse.EXPANDED_ROW_CLASS);
                }

                this.$('.edit-dropdown-placeholder').replaceWith(this.children.editDropDownMenu.render().el);

                return this;
            },

            template: '\
                    <% if(isExpanded) { %>\
                        <td class="<%- toggleCellClass %>"><%= expandedCellBody %></td>\
                    <% } else { %>\
                        <td class="<%- toggleCellClass %>"><%= collapsedCellBody %></td>\
                    <% } %>\
                    <td class="col-title">\
                        <% if (canWrite && editable) { %>\
                            <a href="<%- editUrl %>" class="data-model-title"><%- displayName %></a>\
                        <% } else { %>\
                            <span class="data-model-title"><%- displayName %></span>\
                        <% } %>\
                        <% if(isExpanded) { %>\
                            <div class="expanded-info">\
                                <div><%- description %></div>\
                                <h5><%- _("MODEL").t() %></h5>\
                                <dl class="list-dotted">\
                                    <dt><%- _("Datasets").t() %></dt>\
                                    <dd><%- objectsString %> \
                                    <% if (canWrite && editable) { %>\
                                        <a class="edit-btn" href="<%- editUrl %>"><%- _("Edit").t() %></a>\
                                    <% } %>\
                                    </dd>\
                                    <dt><%- _("Permissions").t() %></dt>\
                                    <dd><%- permissionString %>\
                                    <% if (canChangePerms) { %>\
                                        <a class="edit-permissions-btn" href="#"><%- _("Edit").t() %></a>\
                                    <% } %>\
                                    </dd>\
                                 </dl>\
                                 <h5><%- _("ACCELERATION").t() %></h5>\
                                 <% if (canAccelerate) { %>\
                                     <% if (accelerationEnabled) { %>\
                                         <% if (userCanAccelerate) { %>\
                                             <% if (!acceleratePending) { %>\
                                                <a class="rebuild-btn" href="#"><%- _("Rebuild").t() %></a>\
                                                <a class="update-btn" href="#"><%- _("Update").t() %></a>\
                                             <% } %>\
                                             <a class="edit-acceleration-btn" href="#"><%- _("Edit").t() %></a>\
                                         <% } %>\
                                         <% if (acceleratePending) { %>\
                                                <div>Status Not Implemented Yet</div>\
                                            <% } else { %>\
                                                <div class="acceleration-info-placeholder"></div>\
                                            <% } %>\
                                     <% } else { %>\
                                        <span><%- _("Model is not accelerated.").t() %></span>\
                                        <% if (userCanAccelerate) { %>\
                                            <a class="edit-acceleration-btn" href="#"><%- _("Add").t() %></a>\
                                        <% } %>\
                                     <% } %>\
                                 <% } else { %>\
                                    <%- _("You can only accelerate data models that:").t() %>\
                                    <ul>\
                                        <li><%- _("Are shared to other users.").t() %>\
                                        <li><%- _("Contain at least one event-based dataset or one search-based dataset that does not use reporting commands.").t() %>\
                                    </ul>\
                                 <% } %>\
                            </div>\
                        <% } %>\
                    </td>\
                    <td class="col-type">\
                        <%- displayType %>\
                    </td>\
                    <td class="col-accelerate">\
                        <i class="icon-lightning \
                                <% if (accelerationEnabled) { %>\
                                    icon-lightning-selected \
                                <% } %>\
                            "></i>\
                    </td>\
                    <td class="col-actions">\
                        <% if (canWrite) { %>\
                            <span class="edit-dropdown-placeholder"></span>\
                        <% } else if (canCloneDataModel) { %>\
                            <a class="clone-btn" href="#"><%- _("Clone").t() %></a>\
                        <% } %>\
                        <a class="pivot-btn" href="<%- pivotUrl %>"><%- _("Pivot").t() %></a>\
                    </td>\
                    <td class="col-app">\
                        <span class="data-model-app"><%- app %></span>\
                    </td>\
                    <td class="col-owner">\
                        <span class="data-model-owner"><%- owner %></span>\
                    </td>\
                    <td class="col-sharing">\
                        <span class="data-model-sharing"><%- sharing %></span>\
                    </td>\
            '
        });

    });

/**
 * Edit the Data Model
 *
 * @event DataModelRow#action:editDataModel
 * @param {models/services/datamodel/DataModel} data model
 */

/**
 * Edit the Data Model title
 *
 * @event DataModelRow#action:editDataModelTitle
 * @param {string} data model name
 */

/**
 * Delete the Data Model
 *
 * @event DataModelRow#action:deleteDataModel
 * @param {string} data model name
 */
