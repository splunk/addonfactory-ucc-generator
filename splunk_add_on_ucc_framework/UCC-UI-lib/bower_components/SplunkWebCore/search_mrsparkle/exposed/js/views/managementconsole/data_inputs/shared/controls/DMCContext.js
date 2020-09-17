// Reusable context control
// @author: nmistry
define([
    'underscore',
    'jquery',
    'backbone',
    'module',
    'views/shared/controls/Control',
    'views/shared/controls/ControlGroup',
    'views/shared/controls/SyntheticSelectControl',
    'views/shared/controls/SearchableDropdown',
    './DMCContext.pcss'
], function (
    _,
    $,
    Backbone,
    module,
    Control,
    ControlGroup,
    SyntheticSelect,
    SearchableDropdown
) {
    /*
     * Use case:
     *  User need to specify map the configuration to possible context
     *  like forwarders, apps, server classes. We can add more as we go.
     *
     * Features:
     *  - displays radio buttons for all possible contextType
     *  - upon selecting contextType we show the possible selection options
     *  - persist the values (contextType and context) in the passed in model
     *  - you can call getValue and it will return the context information.
     *
     *  Usage:
     *    Required:
     *      @param (BackboneModel) model: this is where the information will be persisted
     *      @param (string) modelTypeAttribute: model attribute where contextType should be stored
     *      @param (string) modelAttribute: model attribute where context should be stored
     *      @param (object) collection: collection object which includes 'serverclasses' and 'apps' backbone collection
     *      @param (object) deferreds: object containing deferreds for 'serverclasses' and 'apps'
     */

    var strings = {
        NO_FORWARDERS_LABEL: _('No forwarders').t(),
        GLOBAL_LABEL: _('All').t(),
        All_LABEL: _('All forwarders').t(),
        SC_LABEL: _('Server Class').t(),
        APP_LABEL: _('App').t(),
        NODE_LABEL: _('Instance').t(),
        BUNDLE_TYPE_LABEL: _('Choose context').t(),
        BUNDLE_CONTEXT_TOOLTIP: _('The context describes where configuration changes apply. It can be all forwarders, a server class, or an app.').t(),
        SSC_LABEL: _('Select a server class').t(),
        SSC_ERROR_LABEL: _('Error downloading list of server classes').t(),
        SA_LABEL: _('Select an App').t(),
        SA_ERROR_LABEL: _('Error downloading list of apps').t(),
        SN_LABEL: _('Select an Instance').t(),
        SN_ERROR_LABEL: _('Error downloading list of Instances').t(),
        LOADING: _('Loading ... ').t(),
        ENTITY: _('Context: ').t()
    };
    var bundleType = {
        NO_FORWARDERS: 'none',
        GLOBAL: '-',
        FORWARDERS: 'builtin',
        SERVERCLASS: 'custom',
        APPS: 'app',
        NODES: 'node'
    };
    var bundle = {
        'none': '',
        '-': '-',
        builtin: '__forwarders'
    };
    var modes = {
        FILTER: 'filter',
        SELECTOR: 'selector'
    };
    var DEFAULT_FILTER_BUNDLE_TYPES = [
        bundleType.GLOBAL,
        bundleType.FORWARDERS,
        bundleType.SERVERCLASS,
        bundleType.APPS,
        bundleType.NODES
    ];
    var DEFAULT_SELECTOR_BUNDLE_TYPES = [
        bundleType.FORWARDERS,
        bundleType.SERVERCLASS,
        bundleType.APPS
    ];

    return Control.extend({
        moduleId: module.Id,

        className: 'dmc-context-group form-horizontal',

        initialize: function () {
            Control.prototype.initialize.apply(this, arguments);
            this.deferreds = this.options.deferreds || {};
            this.modelTypeAttribute = this.options.modelTypeAttribute || '';
            this.modelAttribute = this.options.modelAttribute || '';
            this.mode = this.options.mode || modes.SELECTOR;

            this.availableBundleTypeItems = [];
            this.availableBundleTypeItems.push({ label: strings.NO_FORWARDERS_LABEL, value: bundleType.NO_FORWARDERS });
            this.availableBundleTypeItems.push({ label: strings.GLOBAL_LABEL, value: bundleType.GLOBAL });
            if (!this.options.hideAllForwarders) {
                this.availableBundleTypeItems.push({ label: strings.All_LABEL, value: bundleType.FORWARDERS });
            }

            // in filter mode show them as links
            // & set default bundleTypes
            if (this.mode === 'filter') {
                this.toggleClassName = 'btn-pill';
                this.options.bundleTypes = this.options.bundleTypes || DEFAULT_FILTER_BUNDLE_TYPES;
            } else {
                this.toggleClassName = 'btn';
                this.options.bundleTypes = this.options.bundleTypes || DEFAULT_SELECTOR_BUNDLE_TYPES;
            }

            // check if server class is available
            if (this.isVisibleServerClasses()) {
                this.initializeServerClasses();
            }

            // check if apps are available
            if (this.isVisibleApps()) {
                this.initializeApps();
            }

            // check if nodes are available
            if (this.isVisibleNodes()) {
                this.initializeNodes();
            }

            // now we know what items are available, extract the available selected items
            this.selectedItems = _.filter(this.availableBundleTypeItems, function (obj) {
                return _.contains(this.options.bundleTypes, obj.value);
            }, this);

            this.initializeBundleTypes();
            this._valueType = this.model.get(this.modelTypeAttribute);
            this._value = this.model.get(this.modelAttribute);

            this.listenTo(this.model, 'change:' + this.modelTypeAttribute, this.handleModelTypeUpdate);
            this.listenTo(this.model, 'change:' + this.modelAttribute, this.handleModelAttrUpdate);
        },

        isVisibleServerClasses: function () {
            return this.collection.serverclasses && this.deferreds.serverclasses && !(!this.collection.serverclasses.canCreate() && this.mode === modes.SELECTOR);
        },

        initializeServerClasses: function () {
            this.availableBundleTypeItems.push({ label: strings.SC_LABEL, value: bundleType.SERVERCLASS });
            if (this.options.multiSelectServerClass) {
                this.children.serverclasses = new ControlGroup({
                    controlType: 'MultiInput',
                    controlClass: 'serverclass control-group btn-group secondary',
                    controlOptions: {
                        model: this.model,
                        modelAttribute: this.modelAttribute,
                        placeholder: strings.SSC_LABEL,
                        data: []
                    }
                });
            } else {
                this.children.serverclasses = new SyntheticSelect({
                    className: 'serverclass control-group btn-group secondary',
                    model: this.model,
                    modelAttribute: this.modelAttribute,
                    items: [
                        { label: strings.LOADING, value: '' }
                    ],
                    toggleClassName: this.toggleClassName,
                    popdownOptions: { detachDialog: true },
                    prompt: strings.SSC_LABEL
                });
            }
            this.deferreds.serverclasses.done(_(this.updateServerClasses).bind(this));
            this.deferreds.serverclasses.fail(_(this.handleServerClassesFetchFailure).bind(this));
        },

        isVisibleApps: function () {
            return this.collection.apps && this.deferreds.apps && !(!this.collection.apps.canCreate() && this.mode === modes.SELECTOR);
        },

        initializeApps: function () {
            this.availableBundleTypeItems.push({ label: strings.APP_LABEL, value: bundleType.APPS });
            this.children.apps = new SyntheticSelect({
                className: 'apps control-group btn-group secondary',
                model: this.model,
                modelAttribute: this.modelAttribute,
                items: [
                    { label: strings.LOADING, value: '' }
                ],
                toggleClassName: this.toggleClassName,
                popdownOptions: { detachDialog: true },
                prompt: strings.SA_LABEL
            });

            this.deferreds.apps.done(_(this.updateApps).bind(this));
            this.deferreds.apps.fail(_(this.handleAppsFetchFailure).bind(this));
        },

        isVisibleNodes: function () {
            return this.collection.nodes && this.deferreds.nodes && this.mode !== modes.SELECTOR;
        },

        initializeNodes: function () {
            this.availableBundleTypeItems.push({ label: strings.NODE_LABEL, value: bundleType.NODES });
            this.children.nodes = new SearchableDropdown({
                className: 'nodes control-group btn-group secondary',
                model: this.model,
                modelAttribute: this.modelAttribute,
                collection: this.collection.nodes,
                prompt: strings.SN_LABEL,
                toggleClassName: this.toggleClassName,
                convertCollectionToItems: this._convertCollectionToItems,
                getData: this.getSearchDataForNodes
            });

            this.deferreds.nodes.done(_(this.updateNodes).bind(this));
            this.deferreds.nodes.fail(_(this.handleNodesFetchFailure).bind(this));
        },

        initializeBundleTypes: function () {
            this._setSelectedBundleType();

            if (this.mode === 'filter') {
                this.children.bundleType = new SyntheticSelect({
                    className: 'bundleType control-group btn-group',
                    model: this.model,
                    modelAttribute: this.modelTypeAttribute,
                    toggleClassName: this.toggleClassName,
                    items: this.selectedItems,
                    label: this.options.label || strings.ENTITY
                });
            } else {
                this.children.bundleType = new ControlGroup({
                    className: 'bundleType control-group',
                    controlType: 'SyntheticRadio',
                    controlOptions: {
                        model: this.model,
                        modelAttribute: this.modelTypeAttribute,
                        items: this.selectedItems
                    },
                    label: this.options.label || strings.BUNDLE_TYPE_LABEL,
                    tooltip: strings.BUNDLE_CONTEXT_TOOLTIP
                });
            }

        },
        
        getSearchDataForNodes: function (search, count) {
            // NMTODO: should merge query and not overwrite
            return {
                count: count,
                query: JSON.stringify({
                    '$and': [
                        {topology: 'forwarder:member'},
                        {clientName: {'$regex': search, '$options': 'i'}}
                    ]
                })
            };
        },

        _setSelectedBundleType: function () {
            // set a default when not provided
            var typeValue = this.model.get(this.modelTypeAttribute);
            // if typeValue is not available unset it
            if (!_.isEmpty(typeValue) && _.isEmpty(_.where(this.selectedItems, { value: typeValue }))) {
                typeValue = void 0;
            }
            // if typevalue is empty, select the first available type
            if (_.isEmpty(typeValue)) {
                var firstOption = _.first(this.selectedItems);
                this.model.set(this.modelTypeAttribute, firstOption.value, { silent: true });
                this.model.set(this.modelAttribute, bundle[firstOption.value], { silent: true });
            }
        },

        _convertCollectionToMultiSelectItems: function (collection) {
            var items = [];
            collection.each(function updateItems(model) {
                var name = model.getDisplayName();
                var bundleValue = model.getBundleName();
                if (!_.isUndefined(name) && !_.isUndefined(bundleValue)) {
                    items.push(
                        {id: bundleValue, text: name}
                    );
                }
            });
            return items;
        },

        _convertCollectionToItems: function (collection) {
            var items = [];
            collection.each(function updateItems(model) {
                var name = model.getDisplayName();
                var bundleValue = model.getBundleName();
                var enabled = !_.isEmpty(bundleValue);
                if (!_.isEmpty(name)) {
                    items.push(
                        {label: name, value: bundleValue, enabled: enabled}
                    );
                }
            });
            return items;
        },

        handleModelTypeUpdate: function (model, value, option) {
            this._valueType = value;
            switch (value) {
                case bundleType.NO_FORWARDERS:
                    this.model.set(this.modelAttribute, bundle[bundleType.NO_FORWARDERS]);
                    break;
                case bundleType.GLOBAL:
                    this.model.set(this.modelAttribute, bundle[bundleType.GLOBAL]);
                    break;
                case bundleType.FORWARDERS:
                    this.model.set(this.modelAttribute, bundle[bundleType.FORWARDERS]);
                    break;
                case bundleType.SERVERCLASS:
                    if (this.options.multiSelectServerClass) {
                        var currentModelAttVal = this.model.get(this.modelAttribute);
                        if (currentModelAttVal === bundle[bundleType.FORWARDERS] || currentModelAttVal === bundle[bundleType.NO_FORWARDERS]) {
                            this.model.set(this.modelAttribute, '');
                        }
                    } else {
                        this.model.set(this.modelAttribute, void 0);
                    }
                    break;
                case bundleType.APPS:
                case bundleType.NODES:
                    this.model.set(this.modelAttribute, void 0);
                    break;

            }
            this.updateVisibility();

        },

        handleModelAttrUpdate: function (model, value, option) {
            this._value = value;
        },

        updateServerClasses: function () {
            var items = [];
            if (this.options.multiSelectServerClass) {
                items = this._convertCollectionToMultiSelectItems(this.collection.serverclasses);
                this.children.serverclasses.children.child0.options.data = items;
            } else {
                items = _.union(items, this._convertCollectionToItems(this.collection.serverclasses));
                this.children.serverclasses.setItems(items);
            }
        },

        handleServerClassesFetchFailure: function () {
            var items = [{label: strings.SSC_ERROR_LABEL, value: ''}];
            if (this.options.multiSelectServerClass) {
                this.children.serverclasses.children.child0.options.autoCompleteFields = [];
            } else {
                this.children.serverclasses.setItems(items);
                this.children.serverclasses.disable();
            }
        },

        updateApps: function () {
            var items = [];
            items = _.union(items, this._convertCollectionToItems(this.collection.apps));
            this.children.apps.setItems(items);
        },

        handleAppsFetchFailure: function () {
            var items = [{label: strings.SA_ERROR_LABEL, value: ''}];
            this.children.apps.setItems(items);
            this.children.apps.disable();
        },

        updateNodes: function () {
            var items = [];
            items = _.union(items, this._convertCollectionToItems(this.collection.nodes));
            this.children.nodes.setItems(items);
        },

        handleNodesFetchFailure: function () {
            var items = [{label: strings.SN_ERROR_LABEL, value: ''}];
            this.children.nodes.setItems(items);
            this.children.nodes.disable();
        },

        updateVisibility: function () {
            this.children.serverclasses && this.children.serverclasses.$el.hide();
            this.children.apps && this.children.apps.$el.hide();
            this.children.nodes && this.children.nodes.$el.hide();

            switch (this._valueType) {
                default:
                    break;
                case bundleType.SERVERCLASS:
                    this.children.serverclasses && this.children.serverclasses.$el.show();
                    break;
                case bundleType.APPS:
                    this.children.apps && this.children.apps.$el.show();
                    break;
                case bundleType.NODES:
                    if (this.mode === modes.FILTER) {
                        this.children.nodes && this.children.nodes.$el.show();
                    }
                    break;
            }
        },

        render: function () {
            if (!this.el.innerHTML) {
                this.$el.addClass(this.mode);
                this.$el.append(this.children.bundleType.render().el);
                if (this.children.serverclasses) {
                    this.$el.append(this.children.serverclasses.render().el);
                    if (!this.children.serverclasses.options.enabled) {
                        this.children.apps.disable();
                    }
                }
                if (this.children.apps) {
                    this.$el.append(this.children.apps.render().el);
                    if (!this.children.apps.options.enabled) {
                        this.children.apps.disable();
                    }
                }
                if (this.children.nodes) {
                    this.$el.append(this.children.nodes.render().el);
                }
            }
            this.updateVisibility();
            return this;
        }
    }, {
        BUNDLETYPES: bundleType
    });
});
