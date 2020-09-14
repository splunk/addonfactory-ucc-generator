/**
 * @author jszeto
 * @date 2/27/13
 *
 * Subclass for adding or editing a Search Object
 *
 * Inputs:
 *      model
 *          objectModel {models/services/datamodel/private/Objects} - The object model being edited
 *          dataModel {models/services/datamodel/DataModel} - The data model that owns the object model
 *          serverInfo {models/services/server/ServerInfo}
 */
define([
    'jquery',
    'underscore',
    'views/data_model_editor/form_views/DataModelAddEditForm',
    'views/shared/controls/ControlGroup',
    'views/shared/controls/TextControl',
    'views/shared/delegates/PairedTextControls',
    'views/shared/searchbar/Master',
    'helpers/FlashMessagesHelper',
    'models/Base',
    'models/services/datamodel/DataModel',
    'splunk.util',
    'util/datamodel/form_utils',
    'module'
],
    function(
        $,
        _,
        DataModelAddEditForm,
        ControlGroup,
        TextControl,
        PairedTextControls,
        SearchBarView,
        FlashMessagesHelper,
        BaseModel,
        DataModel,
        splunkUtils,
        dataModelFormUtils,
        module
        )
    {
        return DataModelAddEditForm.extend({
            className: 'view-add-edit-search-object',
            moduleId: module.id,
            searchJob: undefined,
            saving: false,

            /**
             * @constructor
             * @param options {Object}
             *            type {String} [child|event] Whether the object inherits from BaseEvent (event) or another Object (child)
             */

            initialize: function(options) {
                DataModelAddEditForm.prototype.initialize.call(this, options);

                this.type = options.type;

                if (this.operation == "add")
                {
                    // Create a new Object model with a temporary displayName.
                    var newObject = {objectName:"", displayName:"", parentName:"BaseSearch"};
                    if (this.parentObjectName != "")
                        newObject.parentName = this.parentObjectName;
                    this.model.objectModel = this.model.dataModel.addObject(newObject);
                }
                else
                {
                    this.model.objectModel = this.model.dataModel.objectByName(this.objectName);
                }

                if (_(this.model.objectModel).isUndefined()) {
                    this.addObjectError(this.objectName);
                    return;
                }

                this.model.searchModel = new BaseModel({search: this.model.objectModel.get("baseSearch")});

                this.textDisplayNameControl = new TextControl({modelAttribute: 'displayName',
                    model: this.model.objectModel,
                    save: false});

                this.textObjectNameControl = new TextControl({modelAttribute: 'objectName',
                    model: this.model.objectModel,
                    save: false});

                // Delegate that copies the input from the source to the destination TextControl
                this.pairedTextControls = new PairedTextControls({sourceDelegate: this.textDisplayNameControl,
                    destDelegate: this.textObjectNameControl,
                    transformFunction: dataModelFormUtils.normalizeForID});

                this.children.textDisplayName = new ControlGroup({
                    controls : this.textDisplayNameControl,
                    label: _('Dataset Name').t()
                });

                this.children.textObjectName = new ControlGroup({
                    controls : this.textObjectNameControl,
                    label: _('Dataset ID').t(),
                    tooltip: _('The ID is used in the data model search command. Cannot be changed later.').t(),
                    help: _('Can only contain letters, numbers and underscores.').t()
                });

                // Create a search bar for the user to enter the search string
                this.children.searchBar = new SearchBarView({model: {state: this.model.searchModel,
                                                                     application: this.model.application,
                                                                     user: this.model.user},
                                                             collection: {searchBNFs: this.collection.searchBNFs},
                                                             showTimeRangePicker: false});

                this.model.searchModel.on("change:search applied", this.searchBarChange, this);
                this.flashMessagesHelper.register(this.model.objectModel);
            },
            /**
             * Called by both save and preview to perform validation on the models
             * @return {boolean}
             */
            performLocalValidation: function() {
                var displayName = this.model.objectModel.get("displayName");
                var objectName = this.model.objectModel.get("objectName");
                var attrs = {};

                if (this.operation == "add") {
                    attrs = {objectName: objectName, parentName: DataModel.BASE_SEARCH};
                }

                attrs.displayName = displayName;

                // Force the searchModel to flush text input value to the model
                this.saving = true;
                this.children.searchBar.submit();
                this.saving = false;

                attrs.baseSearch = this.getSearchValue();
                return this.model.objectModel.set(attrs, {validate:true});
            },

            /**
             * Returns the trimmed search string
             */
            getSearchValue: function() {
                var result = this.model.searchModel.get("search");
                if (_(result).isUndefined())
                    return "";
                else
                    return splunkUtils.trim(result);
            },
            
            /**
             *  Called when the searchBar value has changed
             */
            searchBarChange: function() {
                // Don't trigger preview if we are in the middle of saving (since we call submit to get
                // the searchBar to save to the model)
                if (!this.saving)
                    this.debouncedPreview();
            },
            /**
             * Tells the view to provisionally save the inputs into the dataModel.
             */
            _handlePreview: function() {
                return this.getSearchValue();
            },

            debouncedPreview: function() {
                if (!this._debouncedPreview) {
                    this._debouncedPreview = _.debounce(this.preview, 0);
                }
                this._debouncedPreview.apply(this, arguments);
            },

            renderEditor: function($container) {
                var html = _(this.editorTemplate).template({
                    type: this.type,
                    operation: this.operation
                });
                $container.html(html);

                if (this.operation == "add") {
                    this.children.textDisplayName.render().appendTo(this.$(".display-name-placeholder"));
                    this.children.textObjectName.render().appendTo(this.$(".object-name-placeholder"));
                }

                this.children.searchBar.render().appendTo(this.$(".search-bar-placeholder"));return this;
            },

            editorTemplate: '\
                <div class="steps-wrapper">\
                    <div class="display-name-placeholder"></div>\
                    <div class="object-name-placeholder"></div>\
                    <div class="search-bar-placeholder">\
                    <label class="control-label"><%- _("Search String").t() %></label>\
                    </div>\
                </div>\
            '
        });

    });

