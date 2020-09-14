define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'controllers/BaseManagerPageController',
    'collections/managementconsole/Outputs',
    'models/managementconsole/Output',
    'models/managementconsole/DMCContextualFetchData',
    './GridRow',
    './ActionCell',
    './AddEditDialog',
    'views/managementconsole/shared/NewButtons',
    'views/managementconsole/data_inputs/shared/modals/TextConfirmDialog',
    'views/shared/pcss/basemanager.pcss',
    'views/managementconsole/shared.pcss',
    './PageController.pcss'
], function PageController(
    $,
    _,
    Backbone,
    module,
    BaseController,
    OutputCollection,
    OutputModel,
    FetchDataModel,
    GridRow,
    ActionCell,
    AddEditDialog,
    NewButtons,
    TextConfirmDialog,
    cssBaseManager,
    cssShared
) {
    return BaseController.extend({
        moduleId: module.id,

        initialize: function initialize(options) {
            this.collection = this.collection || {};
            this.model = this.model || {};
            this.deferreds = this.deferreds || {};

            this.model.controller = new Backbone.Model();

            options.entitiesPlural = _('Output Groups').t();
            options.entitySingular = _('Output Group').t();
            options.noEntitiesMessage = _('No output groups found').t();
            options.header = {
                pageTitle: _('Output Groups').t(),
                pageDesc: _('The output group identifies a set of receivers. It also specifies how the forwarder sends data to those receivers.').t()
            };
            options.model = this.model;
            options.collection = this.collection;
            options.entitiesCollectionClass = OutputCollection;
            options.entityModelClass = OutputModel;
            options.entityFetchDataClass = FetchDataModel;
            options.grid = {
                showAppFilter: false,
                showOwnerFilter: false,
                showSharingColumn: false,
                showStatusColumn: true,
                disableStatusColumnSort: true
            };
            options.customViews = {
                NewButtons: NewButtons,
                GridRow: GridRow,
                ActionCell: ActionCell,
                AddEditDialog: AddEditDialog
            };
            options.actions = {
                confirmEnableDisable: true
            };
            BaseController.prototype.initialize.call(this, options);

            this.listenTo(this.model.controller, 'revertEntity', this.onRevertEntity);
        },

        onRevertEntity: function (entityModel) {
            this.children.tcd = new TextConfirmDialog({
                mode: 'revert',
                model: entityModel,
                radio: this.model.controller,
                onHiddenRemove: true
            });
            this.listenTo(this.model.controller, 'textConfirmDialog:success', this.onRevertEntitySuccess);
            this.listenTo(this.children.tcd, 'hidden', this.stopRevertListeners);
            this.children.tcd.render().appendTo($('body'));
            this.children.tcd.show();
        },

        onRevertEntitySuccess: function () {
            this.stopRevertListeners();
            this.fetchEntitiesCollection();
            this.children.tcd.remove();
        },

        stopRevertListeners: function () {
            this.stopListening(this.model.controller, 'textConfirmDialog:success', this.onRevertEntitySuccess);
            this.stopListening(this.children.tcd, 'hidden', this.onRevertEntitySuccess);
        }
    });
});
