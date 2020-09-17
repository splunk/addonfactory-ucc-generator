// Provides common functions to various detail views
// @author: nmistry
define([
    'underscore',
    'jquery',
    'backbone',
    'module',
    'uri/route',
    'models/managementconsole/DmcBase',
    'models/managementconsole/topology/Instance',
    'views/Base',
    'views/managementconsole/shared/PendingChangesDialog',
    'views/managementconsole/data_inputs/shared/modals/TextConfirmDialog',
    'views/managementconsole/data_inputs/shared/modals/ChangeContextDialog',
    'views/managementconsole/data_inputs/shared/Review',
    'views/managementconsole/shared/Table/Master',
    'contrib/text!./BaseDetailsView.html'
], function (
    _,
    $,
    Backbone,
    module,
    route,
    DmcBase,
    InstanceModel,
    BaseView,
    ChangesDialog,
    TextConfirmDialog,
    ChangeContextDialog,
    Review,
    TableView,
    Template
) {
    return BaseView.extend({
        moduleId: module.id,

        tagName: 'div',

        className: 'base-detail-view',

        config: {},

        template: Template,

        events: {
            'click button.addnew': 'showAddNewDialog'
        },

        initialize: function () {
            BaseView.prototype.initialize.apply(this, arguments);
            this.deferreds = this.options.deferreds || {};
            this.radio = this.options.radio || _.extend({}, Backbone.Events);
            this._viewid = this.options.viewId;
            this._collectionName = 'listing_' + this._viewid;
            this._tableName = 'table_' + this._viewid;

            this.strings = {
                TITLE: this.options.title ||  '',
                DESCRIPTION: this.options.description || '',
                HELPLINK: this.getHelpLink(this.options.helpString),
                BUTTON_CLASS: 'button-'+this.options.viewId,
                BUTTON_TEXT: _('Add New').t(),
                TBL_NAME: _('Name').t(),
                TBL_ACTIONS: _('Actions').t(),
                TBL_CONTEXT: _('Context').t(),
                INPUTS: _('Inputs').t(),
                ACTIONS_EDIT_MENU: _('Edit').t(),
                ACTIONS_EDIT_INPUT: _('Edit Input').t(),
                ACTIONS_EDIT_CONTEXT: _('Edit Context').t(),
                ACTIONS_EDIT_REVERT: _('Revert').t(),
                ACTIONS_DELETE: _('Delete').t(),
                ACTIONS_DISABLE: _('Disable').t(),
                ACTIONS_ENABLE: _('Enable').t(),
                GROUPS_TOOLTIP_HEADER: _('Installed on').t()
            };

            this.EntityModelClass = this.options.ModelKlass;
            this.WizardClass = this.options.WizardKlass;

            // Global table configuration.
            // Please define the column order in your view.
            this.tableConfig = {
                toolbar: [
                    {
                        type: 'totalCounter',
                        label: this.strings.INPUTS
                    },
                    {
                        type: 'textFilter'
                    },
                    {
                        type: 'selectPageCount',
                        className: 'pull-right'
                    }
                ],
                grid: {
                    tableClassName: 'managementconsole-inputs-grid ' + 'grid-' + this._viewid,
                    columns: this.getTableColumns(),
                    sorting: {
                        keyAttr: 'sortKey',
                        dirAttr: 'sortDirection'
                    },
                    rowExpansion: {
                        enabled: true,
                        renderer: this.renderDetailRow,
                        showToggleAll: true,
                        initialState: 'collapsed'
                    }
                }
            };

            if (_.has(this.collection, this._collectionName)) {
                this.children[this._tableName] = new TableView({
                    collection: this.collection[this._collectionName],
                    config: this.tableConfig,
                    radio: this.radio
                });
            }

            // Table interaction listeners
            this.listenTo(this.radio, 'link:editEntity:click', this.showEditDialog);
            this.listenTo(this.radio, 'actions:editEntity:click', this.showEditDialog);
            this.listenTo(this.model.classicurl, 'change:bundle', this.updateBundle);
            this.listenTo(this.radio, 'link:pendingchange:click', this.showPendingDetails);
            this.listenTo(this.radio, 'listingrefresh', this.handleListingRefresh);
            this.listenTo(this.radio, 'actions:delete:click', this.handleDelete);
            this.listenTo(this.radio, 'actions:toggleEnableDisable:click', this.handleEnableDisableToggle);
            this.listenTo(this.radio, 'actions:move:click', this.handleMove);
            this.listenTo(this.radio, 'actions:revert:click', this.handleRevert);
            this.listenTo(this.radio, 'textConfirmDialog:success', this.handleConfirmationDialogSuccess);
            this.listenTo(this.radio, 'wizard:saved', this.handleEntitySaved);
            this.listenTo(this.collection[this._collectionName], 'reset', this.showHideNewButton);
       },

        getHelpLink: function (helpString) {
            if (!_.isEmpty(helpString)) {
                return route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    helpString
                );
            }
            return null;
        },

        showHideNewButton: function () {
            if (this.collection[this._collectionName].canCreate()) {
                this.$('.btn-primary.new-stanza-button').show();
            } else {
                this.$('.btn-primary.new-stanza-button').hide();
            }
        },

        // child classes should extend getTableColumns
        // returns an array for columns
        getTableColumns: function () {
            return [
                {
                    label: this.strings.TBL_ACTIONS,
                    type: 'actions',
                    actions: [
                        {
                            label: this.strings.ACTIONS_EDIT_MENU, links: [
                                { label: this.strings.ACTIONS_EDIT_INPUT, fires: 'editEntity', enabled: _(this.canEdit).bind(this)},
                                { label: this.strings.ACTIONS_EDIT_CONTEXT, fires: 'move', enabled: _(this.canMove).bind(this) },
                                { label: this.strings.ACTIONS_EDIT_REVERT, fires: 'revert', enabled: _(this.canRevert).bind(this) }
                            ]
                        },
                        { label: this.strings.ACTIONS_DELETE, fires: 'delete', enabled: _(this.canDelete).bind(this) },
                        { label: this.strings.ACTIONS_ENABLE, fires: 'toggleEnableDisable', enabled: _(this.canEnable).bind(this) },
                        { label: this.strings.ACTIONS_DISABLE, fires: 'toggleEnableDisable', enabled: _(this.canDisable).bind(this) }
                    ]
                },
                {
                    label: this.strings.TBL_CONTEXT,
                    key: 'model.getBundleName',
                    tooltip: _(this.getRelatedContextTooltip).bind(this),
                    type: 'tooltip'
                },
                {
                    type: 'dmcPendingChange'
                },
                {
                    type: 'enableDisableStatus'
                }
            ];
        },

        getRelatedContextTooltip: function (column, model, count, totalCount) {
            if (!this.model.relatedBundle) return '';
            var bundles = this.model.relatedBundle.getBundleGroups(
                model.getBundle()
            );
            if (!_.isEmpty(bundles)) {
                return [this.strings.GROUPS_TOOLTIP_HEADER + ':'].concat(bundles).join('\n');
            }
            return '';
        },

        handleListingRefresh: function (viewid) {
            if (!this.isActiveView()) return;
            if (_.has(this.collection, this._collectionName)) {
                this.collection[this._collectionName].safeFetch();
            }
        },

        handleDelete: function (data) {
            if (!this.isActiveView()) return;
            var model = this.collection[this._collectionName].at(data.no);
            this.children.tcd = new TextConfirmDialog({
                mode: 'delete',
                model: model,
                radio: this.radio,
                onHiddenRemove: true
            });
            this.children.tcd._viewid = this._viewid;
            $('body').append(this.children.tcd.render().el);
            this.children.tcd.show();
        },

        handleRevert: function (data) {
            if (!this.isActiveView()) return;
            var model = this.collection[this._collectionName].at(data.no);
            this.children.tcd = new TextConfirmDialog({
                mode: 'revert',
                model: model,
                radio: this.radio,
                onHiddenRemove: true
            });
            this.children.tcd._viewid = this._viewid;
            $('body').append(this.children.tcd.render().el);
            this.children.tcd.show();
        },

        handleEnableDisableToggle: function (data) {
            if (!this.isActiveView()) return;
            var model = this.collection[this._collectionName].at(data.no);
            var isEnabled = model.isEnabled();
            this.children.tcd = new TextConfirmDialog({
                mode: isEnabled ? 'disable' : 'enable',
                model: model,
                radio: this.radio,
                onHiddenRemove: true
            });
            this.children.tcd._viewid = this._viewid;
            $('body').append(this.children.tcd.render().el);
            this.children.tcd.show();
        },

        handleMove: function (data) {
            if (!this.isActiveView()) return;
            var model = this.collection[this._collectionName].at(data.no);
            this.children.tcd = new ChangeContextDialog({
                model: {
                    entity: model,
                    classicurl: this.model.classicurl,
                    user: this.model.user
                },
                collection: this.collection,
                radio: this.radio,
                deferreds: this.options.deferreds
            });
            this.children.tcd._viewid = this._viewid;
            $('body').append(this.children.tcd.render().el);
            this.children.tcd.show();
        },

        handleConfirmationDialogSuccess: function (mode) {
            if (!this.isActiveView()) return;
            var viewid = this.children.tcd._viewid;
            this.children.tcd.hide();
            this.children.tcd.remove();
            this.children.tcd = null;
            if (mode === 'delete') {
                this.radio.trigger('tabrefresh');
            }
            this.radio.trigger('listingrefresh', viewid);
        },

        showPendingDetails: function (data) {
            if (!this.isActiveView()) return;
            var model = this.collection[this._collectionName].at(data.no);
            this.collection.changes.fetchData.set({
                type: ['stanza'],
                name: model.getStanzaName(),
                inputName: model.entry.get('name'),
                bundleType: model.getBundleType(),
                bundleId: model.getBundleId(),
                configurationType: 'inputs'
            });
            this.collection.changes.safeFetch();
            this.children.changesDialog = new ChangesDialog({
                onHiddenRemove: true,
                mode: 'input-context',
                collection: {
                    pendingChanges: this.collection.changes
                }
            });
            $('body').append(this.children.changesDialog.render().el);
            this.children.changesDialog.show();
        },

        isActiveView: function () {
            var currentTab = this.model.classicurl.get('tab');
            return currentTab === this._viewid;
        },

        updateBundle: function () {
            var bundle = this.model.classicurl.get('bundle');
            var bundleType = this.model.classicurl.get('bundleType');
            var dfd = $.Deferred();

            if (!this.isActiveView() || _.isUndefined(bundle)) return;

            var bundleDN = DmcBase.getBundleDisplayName(bundle);
            if (bundleType === 'node' && !this.isRelatedBundleAvailable(bundleDN)) {
                this.fetchRelatedBundles(dfd, bundleDN);
            } else {
                dfd.resolve();
            }
            $.when(dfd).done(_(function () {
                window.console.log('Fetching ' + this._collectionName+ ' for ' + bundle);
                this.model.relatedBundle = this.getRelatedBundle(bundleDN);
                this.collection[this._collectionName] && this.collection[this._collectionName].fetchData.set('bundle', bundle);
            }).bind(this));
        },

        isRelatedBundleAvailable: function (bundleDN) {
            return !_.isUndefined(this.getRelatedBundle(bundleDN));
        },

        getRelatedBundle: function (bundleDN) {
            return this.collection.relatedBundles.find(function (bundle) {
                return bundle.entry.get('name') === bundleDN;
            });
        },

        fetchRelatedBundles: function (dfd, bundleDN) {
            var model = new InstanceModel();
            model.entry.set('name', bundleDN);
            model.fetchData.set({relatedBundles: 1}, {silent: true});
            model.fetch()
                .done(_(function () {
                    this.collection.relatedBundles.add(model);
                    dfd.resolve();
                }).bind(this))
                .fail(_(function () {
                    dfd.resolve();
                }).bind(this));
        },

        renderDetailRow: function (model) {
            var review = new Review({
                model: model
            });
            return review.render().el;
        },

        showAddEditDialog: function (entityModel) {
            if (entityModel) {
                this.model.entity = entityModel.clone();
            } else {
                this.model.entity = new this.EntityModelClass();
            }

            this.children.wizard = new this.WizardClass({
                model: this.model,
                // pass the apps,serverclass collection for the context option
                collection: this.collection,
                deferreds: this.deferreds,
                radio: this.radio
            });

            $('body').append(this.children.wizard.render().el);
            this.children.wizard.show();
        },

        showEditDialog: function (data) {
            if (!this.isActiveView()) return;
            var entityModel = this.collection[this._collectionName].at(data.no);
            this.showAddEditDialog(entityModel);
        },

        showAddNewDialog: function (data) {
            if (!this.isActiveView()) return;
            var entityModel = this.collection[this._collectionName].at(data.no);
            this.showAddEditDialog(entityModel);
        },

        handleEntitySaved: function (action) {
            if (!this.isActiveView()) return;
            // reset the wizard
            this.children.wizard.hide();
            this.children.wizard.remove();
            this.children.wizard = void 0;
            if (action === 'created') {
                this.radio.trigger('tabrefresh');
            }
            this.radio.trigger('listingrefresh', this._viewid);

        },

        // RBAC functions
        canEdit: function (column, model, count, totalCounter) {
            return this.model.user.canEditDMCInputs() && model.canEdit();
        },

        canMove: function (column, model, count, totalCounter) {
            return this.model.user.canEditDMCInputs() && model.canMove();
        },

        canRevert: function (column, model, count, totalCounter) {
            return this.model.user.canEditDMCInputs() && model.canRevert();
        },

        canDelete: function (column, model, count, totalCounter) {
            return this.model.user.canEditDMCInputs() && model.canDelete();
        },

        canEnable: function (column, model, count, totalCounter) {
            return this.model.user.canEditDMCInputs() && model.canEnable();
        },

        canDisable: function (column, model, count, totalCounter) {
            return this.model.user.canEditDMCInputs() && model.canDisable();
        },

        render: function () {
            this.el.innerHTML = this.compiledTemplate({
                strings: this.strings
            });
            this.showHideNewButton();
            if (this.children[this._tableName]) {
                this.children[this._tableName].render().replaceContentsOf(this.$('.listing'));
            }
            return this;
        }
  });
});
