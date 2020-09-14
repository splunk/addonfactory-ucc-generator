/**
 * @author sfishel, jszeto
 *
 * Master view for the "data_model_editor" page.  Used to perform edit operations on a single data model.
 *
 * Renders a selectable list of objects and an editor for the properties of the selected object.
 *
 * Child Views:
 *
 *     objectEditor - a "views/data_model_editor/ObjectEditor" view
 *
 * Custom Events:
 *
 *     action:addObject - triggered when the user should be navigated to the add object interface
 *     action:editCalculations - triggered when the user should be navigated to the edit calculations interface, arguments:
 *         objectName {String} - the objectName of the object being edited
 *         calcId {String} - the cid of the calculation model to be edited
 *         mode {String} - the mode of the edit operation, "edit" or "add"
 */

define([
            'jquery',
            'underscore',
            'views/Base',
            './ObjectEditor',
            'views/shared/DropDownMenu',
            'views/shared/FlashMessages',
            'views/data_model_manager/DataModelActionController',
            'models/services/datamodel/DataModel',
            'uri/route',
            'util/splunkd_utils',
            'models/ACLReadOnly',
            'module',
            'views/shared/pcss/data-enrichment.pcss',
            './DataModelEditor.pcss'
        ],
        function (
            $,
            _,
            BaseView,
            ObjectEditor,
            DropDownMenu,
            FlashMessagesView,
            DataModelActionController,
            DataModel,
            route,
            splunkDUtils,
            ACLReadOnlyModel,
            module,
            cssDataEnrichment,
            css
        ) {

    var CONSTS = {
        ALL_OBJECT_ITEMS : [{label:_("Root Event").t(), value:"event"},
            {label:_("Root Transaction").t(), value:"transaction"},
            {label:_("Root Search").t(), value:"search"},
            {label: _("Child").t(), value:"child"}],
        INITIAL_OBJECT_ITEMS : [{label:_("Root Event").t(), value:"event"},
            {label:_("Root Search").t(), value:"search"}],
        EDIT_ACCELERATED_MODEL_ID : "__EDIT_ACCELERATED_MODEL_ID__"
    };

    return BaseView.extend({

        className: 'data-model-editor',
        moduleId: module.id,


        events: {
            'click .object': function(e) {
                e.preventDefault();
                var objectName = $(e.currentTarget).attr('data-objid');
                this.model.setting.set({ selectedObject: objectName });
            }
        },

        dataModelChangeHandler: function() {
            this.updateSelection();
            this.debouncedRender();
        },

        dataModelObjectsChangeHandler: function() {
            this.children.addObject.setItems(this.getEventItems());
            this.dataModelChangeHandler();
        },
        /**
         * @constructor
         * @param options {Object} {
         *     model: {
         *         dataModel <models/services/datamodel/DataModel> - the data model to be edited
         *         setting: {Model} - a model whose "selectedObject" field is used to track which object is being edited
         *                            // TODO do we need to pass this in from above or could it be managed internally?
         *     }
         * }
         */

        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);

            var pageRouter = route.getContextualPageRouter(this.model.application);

            this._previousSelectedObject = "";

            //////////////////////////////////////////////////////////////////
            // SUBVIEWS
            //////////////////////////////////////////////////////////////////

            // Setup the Flash Messages
            this.children.flashMessagesView = new FlashMessagesView({model:this.model.dataModel});

            this.children.objectEditor = new ObjectEditor({collection:this.collection,
                                                           model: {application: this.model.application,
                                                                   dataModel: this.model.dataModel},
                                                           flashMessagesView: this.children.flashMessagesView});

            this.children.addObject = new DropDownMenu({label:_("Add Dataset").t(),
                items:this.getEventItems(),
                dropdownClassName: 'dropdown-menu-narrow'});

            var subItems1 = [];
            var subItems2 = [];
            var items = [];

            if (!this.model.dataModel.isAccelerated()) {
                subItems1.push({label:_("Edit Title or Description").t(), value:"editDataModelTitle"});
            }

            if (this.model.dataModel.canChangePermissions()) {
                subItems1.push({label:_("Edit Permissions").t(), value:"editPermissions"});
            }
            if (this.model.user.canAccelerateDataModel()) {
                subItems1.push({label:_("Edit Acceleration").t(), value:"editAcceleration"});
            }
            if (this.model.setting.get("canCreateDataModel")) {
                subItems2.push({label:_("Clone").t(), value:"cloneDataModel"});
            }

            if (this.model.dataModel.canDelete()) {
                subItems2.push({label:_("Delete").t(), value:"deleteDataModel"});
            }

            if (subItems1.length > 0)
                items.push(subItems1);
            if (subItems2.length > 0)
                items.push(subItems2);

            if (items.length > 0) {
                // Dropdown menu that displays edit actions for this DataModel
                this.children.editObject = new DropDownMenu({label:_("Edit").t(),
                    items: items,
                           dropdownClassName: "dropdown-menu-narrow",
                           className: 'btn-combo create-drop-down',
                           popdownOptions: { attachDialogTo: 'body' }
                   });

                // Proxy events from editObjects to dataModelController
                this.children.editObject.on("all", function() {
                    var eventType = "action:" + arguments[1];
                    // If we are deleting a DataModel, we pass in the model we are deleting
                    if (eventType == "action:deleteDataModel") {
                        this.children.dataModelController.trigger("action:deleteDataModel", this.model.dataModel);
                    } else {
                        this.children.dataModelController.trigger(eventType, this.model.dataModel.id);
                    }
                }, this);
            }

            // Helper controller to handle edit actions from editObject
            this.children.dataModelController = new DataModelActionController({
                model: {
                    application: this.model.application,
                    user: this.model.user
                },
                collection: {
                    apps: this.collection.apps,
                    vix: this.collection.vix,
                    archives: this.collection.archives
                }
            });
            this.children.dataModelController.on("action:fetchDataModel", function() {
                this.trigger("action:fetchModel");
            }, this);
            this.children.dataModelController.on("action:updateDataModel", function(modelName, accelerationChanges, contentChanges) {
                    var dataModel = this.model.dataModel;

                    if (accelerationChanges) {
                        dataModel.entry.content.acceleration.set(accelerationChanges);
                    }
                    if (contentChanges) {
                        dataModel.entry.content.set(contentChanges);
                    }
            }, this);
            this.children.dataModelController.on("action:deletedDataModel", function() {
                window.location = pageRouter.data_model_manager();
            }, this);
            this.children.dataModelController.on("action:clonedDataModel", function(modelName) {
                window.location = pageRouter.data_model_editor({ data: { model: modelName } });
            }, this);
            this.children.dataModelController.on("action:dataModelPermissionsChange", function(modelName, model) {
                // When permissions have changed, make sure to flush the state of the updated model to our data model (SPL-80411).
                this.model.dataModel.setFromSplunkD(model.toSplunkD());
                this.updateDynamicLinks();
                this.trigger("action:dataModelPermissionsChange", modelName);
            }, this);

            //////////////////////////////////////////////////////////////////
            // EVENT LISTENERS
            //////////////////////////////////////////////////////////////////

            // TODO [JCS] Consider limiting the scope of what gets re-renderered when the model changes
            this.model.dataModel.entry.content.on('change associatedChange add remove reset', this.dataModelChangeHandler, this);
            this.model.dataModel.entry.content.objects.on('change associatedChange add remove reset', this.dataModelObjectsChangeHandler, this);
            this.model.setting.on('change:selectedObject', this.updateSelection, this);

            this.children.objectEditor.on('action:overrideInherited', function(fieldName, calculationID) {
                var selectedObjectName = this.model.setting.get('selectedObject');
                this.trigger('action:overrideInherited', fieldName, selectedObjectName, calculationID);
            }, this);

            this.children.objectEditor.on('action:editCalculation', function(calculationID) {
                var objectName = this.model.setting.get('selectedObject');
                var selectedObject = this.model.dataModel.objectByName(objectName);
                var calculation = selectedObject.getCalculation(calculationID);
                var calculationType = calculation.get("calculationType");

                this.trigger('action:editCalculation', calculationType, objectName, calculationID);
            }, this);

            this.children.objectEditor.on('action:editAttribute', function(fieldName) {
                var objectName = this.model.setting.get('selectedObject');
                var selectedObject = this.model.dataModel.objectByName(objectName);

                this.trigger('action:editAttribute', "field", objectName, fieldName);
            }, this);

            this.children.objectEditor.on('action:addCalculation', function(calculationType) {
                var parentObjectName = this.model.setting.get('selectedObject');
                this.trigger('action:addCalculation', calculationType, parentObjectName);
            }, this);

            this.children.objectEditor.on('action:editObject', function(objectType, parentName, objectName) {
                this.trigger("action:editObject", objectType, parentName, objectName);
            }, this);

            this.children.objectEditor.on('action:saveModel', function() {
                this.trigger("action:saveModel");
            }, this);

            this.children.objectEditor.on('action:fetchDataModel', function() {
                this.trigger("action:fetchModel");
            }, this);

            this.children.objectEditor.on('action:removeObject', function(objectModel) {
                this.trigger("action:removeObject", objectModel);
            }, this);

            /**
             * Listen for a itemClicked event from the AddObject dropdown menu and trigger an
             * "action:addObject" event (data_model_editor_page is the listener) with the type of object to add
             * and the parent object's name
             *
             * @param itemData {Object} value of the clicked item [event|transaction|child]
             */
            this.children.addObject.on("itemClicked", function(itemData) {
                this.trigger('action:addObject', itemData, this.model.setting.get('selectedObject'));
            }, this);
        },
        render: function() {
            // Get all of the sorted root trees
            var rootObjects = this.model.dataModel.entry.content.objects.getRootObjects();
            var eventsHtml = '<div class="content-group">';
            var transactionsHtml = '<div class="content-group">';
            var searchesHtml = '<div class="content-group">';
            var eventsCount = 0;
            var transactionsCount = 0;
            var searchesCount = 0;


            this.children.objectEditor.detach();
            this.children.addObject.$el.detach();

            if (this.model.dataModel.isAccelerated()) {
                this.children.flashMessagesView.flashMsgHelper.addGeneralMessage(CONSTS.EDIT_ACCELERATED_MODEL_ID,
                    { type: splunkDUtils.WARNING,
                        html: _("This Data Model cannot be edited because it is accelerated. " +
                                "Disable acceleration in order to edit the Data Model.").t()});

            } else {
                this.children.flashMessagesView.flashMsgHelper.removeGeneralMessage(CONSTS.EDIT_ACCELERATED_MODEL_ID);
            }

            // Generate the html for each section [Events/Transactions/Groups]
            // Each object is of type models/services/datamodel/private/Object
            _(rootObjects).each(function(object) {
                var parentName = object.get("parentName");
                if (parentName == DataModel.BASE_EVENT) {
                    eventsHtml += this.renderObjectTree(object);
                    eventsCount++;
                } else if (parentName == DataModel.BASE_TRANSACTION) {
                    transactionsHtml += this.renderObjectTree(object);
                    transactionsCount++;
                } else if (parentName == DataModel.BASE_SEARCH) {
                    searchesHtml += this.renderObjectTree(object);
                    searchesCount++;
                }
            }, this);

            eventsHtml += '</div>';
            transactionsHtml += '</div>';
            searchesHtml += '</div>';

            var pageRouter = route.getContextualPageRouter(this.model.application);
            var dataManagerUrl = pageRouter.data_model_manager();

            var docUrl = route.docHelp(
                this.model.application.get("root"),
                this.model.application.get("locale"),
                'learnmore.datamodel.about'
            );


            var html = _(this.template).template({
                displayName: this.model.dataModel.entry.content.get("displayName"),
                modelName: this.model.dataModel.entry.content.get("modelName"),
                docUrl: docUrl,
                eventsHtml: eventsHtml,
                transactionsHtml: transactionsHtml,
                searchesHtml: searchesHtml,
                showEvents: eventsCount,
                showSearches: searchesCount,
                canDownloadDataModel: this.model.setting.get("canCreateDataModel"),
                showTransactions: transactionsCount,
                dataManagerUrl: dataManagerUrl,
                selected: this.model.setting.get('selectedObject')
            });

            this.$el.html(html);
            // TODO [JCS] Look into doing a replaceWith instead of an append
            if (!this.model.dataModel.isAccelerated()) {
                this.$('.add-button-holder').append(this.children.addObject.render().el);
            }

            if (this.children.editObject)
                this.$('.edit-button-holder').replaceWith(this.children.editObject.render().el);
            else
                this.$('.edit-button-holder').remove();
            this.$('.object-editor-wrapper').append(this.children.objectEditor.el);
            this.$('.flash-messages-placeholder').append(this.children.flashMessagesView.render().el);

            this.updateSelection();
            this.updateDynamicLinks();

            return this;
        },

        // Helper render function that takes a Data Model object root node, walks down the tree and generates
        // nested divs that represent the tree.
        renderObjectTree: function(objectNode) {
            // TODO [JCS] Investigate using _.memoize
            var linkHtml = _(this.objectLinkTemplate).template({objectName: objectNode.get("objectName"),
                                                                displayName : objectNode.get("displayName")});
            var html = linkHtml;

            if (objectNode.children) {
                var childrenLength = objectNode.children.length;
                if (childrenLength) {
                    html += '<div class="content-group">';
                    _(objectNode.children).each(function(object) {
                        html += this.renderObjectTree(object);
                    }, this);
                    html += '</div>';
                }
            }

            return html;
        },
        updateDynamicLinks: function() {
            var pageRouter = route.getContextualPageRouter(this.model.application);
            var pivotUrl = pageRouter.pivot({ data: { model: this.model.dataModel.id } });
            this.$('.pivot-model').attr('href', pivotUrl);
            this.updateDownloadLink();
        },
        updateDownloadLink: function() {
            if (!this.model.setting.get("canCreateDataModel")) return;

            // Download URL

            var acl = new ACLReadOnlyModel($.extend(true, {}, this.model.dataModel.entry.acl.toJSON()));
            var app_and_owner = {};
            app_and_owner = $.extend(app_and_owner, {
                app: acl.get("app") || undefined,
                owner: acl.get("owner") || undefined,
                sharing: acl.get("sharing") || undefined
            });

            var downloadUrl = 'data/models/' + this.model.dataModel.entry.content.get("modelName") + '/download';
            downloadUrl = splunkDUtils.fullpath(downloadUrl, app_and_owner);

            this.$('.download-button').attr('href', downloadUrl);
        },
        updateSelection: function() {
            var selected = this.model.setting.get('selectedObject');

            this.$('.object').removeClass('selected');

            if(selected) {
                this.$('.object[data-objid="' + selected + '"]').addClass('selected');
            }

            if (selected == this._previousSelectedObject) {
                return;
            }

            this.children.objectEditor.setModel(this.model.dataModel.objectByName(selected));
            this._previousSelectedObject = selected;
        },

        getEventItems: function() {
            if (this.model.dataModel.entry.content.objects &&
                this.model.dataModel.entry.content.objects.length == 0) {
                return CONSTS.INITIAL_OBJECT_ITEMS;
            } else {
                return CONSTS.ALL_OBJECT_ITEMS;
            }
        },

        triggerAction: function(actionName) {
            if(actionName === 'acceleration' && this.model.user.canAccelerateDataModel()) {
                this.children.dataModelController.trigger('action:editAcceleration', this.model.dataModel.id);
            }
            else if(actionName === 'permissions' && this.model.dataModel.canChangePermissions()) {
                this.children.dataModelController.trigger('action:editPermissions', this.model.dataModel.id);
            }
        },

        // Template for an Object link
        objectLinkTemplate: '<a href="#" class="object" data-objid="<%- objectName %>"><%- displayName %></a>',

        template: '\
            <div class="section-padded section-header">\
                <div class="header-button-holder pull-right">\
                    <div class="btn-group">\
                        <span class="edit-button-holder btn"><%- _("Edit Placeholder").t() %></span>\
                        <% if (canDownloadDataModel) { %>\
                            <a href="#" class="download-button btn" target="_blank" download="<%-modelName%>.json"><%- _("Download").t() %></a>\
                        <% } %>\
                        <a href="#" class="pivot-model btn"><%- _("Pivot").t() %></a>\
                        <a href="<%- docUrl %>" target="_blank" class="help-link btn"><%- _("Documentation").t() %> <i class="icon-external"></i></a>\
                    </div>\
                </div>\
                <h2 class="section-title"><%- displayName %></h2>\
                <p><%- modelName %></p>\
                <a href="<%- dataManagerUrl %>"><i class="icon-chevron-left icon-no-underline"></i><span><%- _("All Data Models").t() %></span></a>\
                <div class="flash-messages-placeholder"></div>\
            </div>\
            <div class="section-wrapper">\
                <div class="divider-gradient"></div>\
                <div class="object-list sidebar">\
                    <div class="object-list-header">\
                        <h3 class="title"><%- _("Datasets").t() %></h3>\
                        <div class="add-button-holder">\
                        </div>\
                    </div>\
                    <% if(showEvents) { %>\
                        <h6 class="object-group-header"><%- _("Events").t() %></h6>\
                        <%= eventsHtml %>\
                    <% } %>\
                    <% if(showSearches) { %>\
                        <h6 class="object-group-header"><%- _("Searches").t() %></h6>\
                        <%= searchesHtml %>\
                    <% } %>\
                    <% if(showTransactions) { %>\
                        <h6 class="object-group-header"><%- _("Transactions").t() %></h6>\
                        <%= transactionsHtml %>\
                    <% } %>\
                </div>\
                <div class="object-editor-placeholder"></div>\
                <div class="object-editor-wrapper "></div>\
            </div>\
        '
    }, CONSTS);

});
