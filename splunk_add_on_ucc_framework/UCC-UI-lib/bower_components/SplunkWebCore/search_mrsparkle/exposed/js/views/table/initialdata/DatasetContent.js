define(
    [
        'underscore',
        'jquery',
        'module',
        'models/datasets/PolymorphicDataset',
        'collections/datasets/Datasets',
        'views/table/initialdata/BaseContent',
        'views/table/commandeditor/listpicker/Overlay',
        'views/table/initialdata/DatasetInfo',
        'views/shared/controls/ControlGroup'
    ],
    function(
        _,
        $,
        module,
        PolymorphicDatasetModel,
        DatasetsCollection,
        BaseContentView,
        ListPickerOverlay,
        DatasetInfoView,
        ControlGroup
    ) {
        return BaseContentView.extend({
            moduleId: module.id,
            className: 'dataset-content',

            PAGE_COUNT: 50,

            initialize: function() {
                BaseContentView.prototype.initialize.apply(this, arguments);

                this.collection = this.collection || {};
                this.collection.datasets = new DatasetsCollection();
                this.model.state.set('count', this.PAGE_COUNT, { silent: true });

                // If entering Initial Data with Dataset already selected, it must be an Extend operation
                if (this.model.command && this.model.command.get('selectedDatasetName') && !this.model.state.get('datasetOperationType')) {
                    this.model.state.set('datasetOperationType', DatasetsCollection.OPERATION.EXTEND);
                }

                this.children.operationTypeRadio = new ControlGroup({
                    controlOptions: {
                        model: this.model.state,
                        modelAttribute: 'datasetOperationType',
                        items: [
                            {
                                label: _('Clone').t(),
                                value: DatasetsCollection.OPERATION.CLONE,
                                tooltip: _('Only table datasets can be cloned.').t()
                            },
                            {
                                label: _('Extend').t(),
                                value: DatasetsCollection.OPERATION.EXTEND,
                                tooltip: _('All dataset types can be extended.').t()
                            }
                        ],
                        showAsButtonGroup: false
                    },
                    controlType: 'SyntheticRadio',
                    label: _('Select a method:').t(),
                    additionalClassNames: 'extend-clone-radio-wrapper',
                    controlClass: 'extend-clone-radio'
                });
            },

            events: $.extend({}, BaseContentView.prototype.events, {
                'click .dataset-picker': function(e) {
                    e.preventDefault();
                    this.openDatasetPicker();
                },
                'mouseover .list-picker-list > li > a': function(e) {
                    e.preventDefault();
                    this.handleDatasetHover(e);
                }
            }),

            activate: function(options) {
                options = options || {};

                if (this.active) {
                    return BaseContentView.prototype.activate.apply(this, arguments);
                }

                if (this.model.state.get('datasetOperationType')) {
                    this.initializeDatasets(options);
                }

                return BaseContentView.prototype.activate.call(this, options);
            },

            startListening: function(options) {
                BaseContentView.prototype.startListening.apply(this, arguments);

                this.listenTo(this.model.state, 'change:offset', _.debounce(function() {
                    this.fetchDatasets(); // for pagination
                }.bind(this), 0), this);

                this.listenTo(this.model.state, 'change:datasetOperationType', this.handleOperationTypeChange);
            },

            handleOperationTypeChange: function(model, value, options) {
                options = options || {};
                if (!options.unset) {
                    this.fetchAndInitializeDatasets(options);
                    if (options.openDatasetPicker !== false) {
                        this.openDatasetPicker({ operationTypeChanged: true });
                    }
                }
            },

            fetchAndInitializeDatasets: function(options) {
                options = options || {};
                delete this.datasetsFetchDeferred;

                this.initializeDatasets(options);
            },

            initializeDatasets: function(options) {
                options = options || {};
                // If we don't have the deferred, or the deferred failed, or this is the initial table only fetch, we need to fetch the available datasets
                if (!this.datasetsFetchDeferred || (this.datasetsFetchDeferred.state() !== 'resolved')) {
                    this.fetchDatasets({onlyTables: this.model.state.get('datasetOperationType') === DatasetsCollection.OPERATION.CLONE});
                }

                // If we don't have a selectedDataset, that means that we're here for the first time or we're reopening
                // initial data after picking something previously. We need to create the selectedDataset object, but that
                // requires an async AST fetch, so we need to let BaseContent's activate know to wait until that's done
                // before handleSearchChange or handleColumnsChange get called.
                if (!this.model.command.selectedDataset) {
                    options.waitDeferred = this.createSelectedDataset();
                }
            },

            // This is how we fetch the available datasets for the picker.
            fetchDatasets: function(options) {
                options = options || {};
                var data = {
                    app: this.model.application.get('app'),
                    owner: this.model.application.get('owner'),
                    sort_mode: ['natural', 'natural'],
                    count: this.PAGE_COUNT,
                    offset: this.model.state.get('offset')
                };
                if (options.onlyTables) {
                    data.search = DatasetsCollection.TABLES_ONLY_SEARCH_STRING;
                }

                this.datasetsFetchDeferred = this.collection.datasets.fetch({
                    data: data
                });
            },

            createSelectedDataset: function() {
                var astDeferred = this.fetchBasesearchTableAST(),
                    doneDeferred = $.Deferred(),
                    fromPayloads,
                    selectedDatasetObject,
                    selectedDataset;

                $.when(astDeferred).then(function() {
                    fromPayloads = this.model.basesearchTableAST.getFromCommandObjectPayloads();
                    selectedDatasetObject = fromPayloads.length && fromPayloads[fromPayloads.length - 1];

                    if (selectedDatasetObject && selectedDatasetObject.eai) {
                        selectedDataset = new PolymorphicDatasetModel(selectedDatasetObject.eai, { parse: true });
                        this.model.command.resetSelectedDataset(selectedDataset);
                    } else {
                        this.model.command.clearSelectedDataset();
                    }

                    doneDeferred.resolve();
                }.bind(this));

                return doneDeferred;
            },

            openDatasetPicker: function(options) {
                options = options || {};

                var selectedValues;

                // If clone/extend has toggled and a selectedDataset is already present, dataset listpicker
                // should allow the user to choose any dataset from the list - even one that was previously selected.
                if (!options.operationTypeChanged && this.model.command.selectedDataset) {
                    selectedValues = [this.model.command.selectedDataset.id];
                }

                if (this.children.datasetList) {
                    this.children.datasetList.deactivate({ deep: true }).remove();
                }

                this.children.datasetList = new ListPickerOverlay({
                    collection: {
                        items: this.collection.datasets
                    },
                    model: {
                        state: this.model.state
                    },
                    paginatorType: ListPickerOverlay.PAGINATOR_TYPES.SPLUNKD_COLLECTION,
                    selectMessage: _('Select a dataset...').t(),
                    selectedValues: selectedValues,
                    deferred: this.datasetsFetchDeferred,
                    required: false
                });

                this.children.datasetList.activate({ deep: true }).render().appendTo(this.$el);
                this.children.datasetList.slideIn();

                this.listenTo(this.children.datasetList, 'selectionDidChange', this.handleDatasetSelection);
                this.listenTo(this.children.datasetList, 'listPickerBackSelected', function() { this.handleDatasetCancellation(options); });
            },

            handleDatasetCancellation: function(options) {
                options = options || {};
                // User has toggled operation type (clone/extend), which has opened the dataset picker overlay, but has
                // backed out of it. Restore the previous operation type with a restorePrevious flag preventing dataset picker from reopening.
                if (options.operationTypeChanged && this.model.command.get('selectedDatasetName')) {
                    if (this.model.state.get('datasetOperationType') === DatasetsCollection.OPERATION.CLONE) {
                        this.model.state.set('datasetOperationType', DatasetsCollection.OPERATION.EXTEND, { openDatasetPicker: false });
                    } else {
                        this.model.state.set('datasetOperationType', DatasetsCollection.OPERATION.CLONE, { openDatasetPicker: false });
                    }
                    delete options.operationTypeChanged;
                }
            },

            // This gets called when the user makes a selection
            handleDatasetSelection: function() {
                var selectedDataset = this.collection.datasets.get(this.children.datasetList.getSelectedValue());
                this.model.command.resetSelectedDataset(selectedDataset);
                this.collection.columns.reset(this.model.command.columns.toJSON());

                // A new selection has been made, so we have to blow away the old one
                this.removeFieldsPicker();
                this.renderDatasetName();
                this.handleSearchChange();
                this.model.state.trigger('updateBaseSPL');
                this.showDoneButton();
            },

            handleSearchChange: function() {
                var options = {
                    skipFieldsFetch: this.model.command.selectedDataset && this.model.command.selectedDataset.isFixedFields()
                };

                BaseContentView.prototype.handleSearchChange.call(this, options);
            },

            renderDatasetName: function() {
                this.$('.chosen-dataset').remove();
                
                $(this.compiledTemplate({
                    _: _,
                    datasetName: this.model.command.get('selectedDatasetDisplayName')
                })).insertAfter(this.$(".extend-clone-radio-wrapper"));
            },

            handleDatasetHover: function(e) {
                var $target = $(e.currentTarget),
                    datasetId = $target.data('value'),
                    datasetModel = this.collection.datasets.get(datasetId);

                this.removeDatasetInfo();

                if (!$target.hasClass('disabled') && datasetModel) {
                    this.children.datasetInfo = new DatasetInfoView({
                        model: {
                            dataset: datasetModel,
                            application: this.model.application,
                            searchJob: this.model.searchJob,
                            user: this.model.user,
                            appLocal: this.model.appLocal,
                            serverInfo: this.model.serverInfo
                        },
                        collection: {
                            roles: this.collection.roles
                        },
                        direction: 'right',
                        onHiddenRemove: true
                    });

                    this.children.datasetInfo.activate({deep: true}).render().appendTo($('body'));
                    this.children.datasetInfo.show($target, {
                        $onOpenFocus: $target
                    });
                    // Push the margin out past the scroll bar (this is set inline from the modal, so we override after rendering)
                    this.children.datasetInfo.$el.css('margin-left', this.calculateMarginWithScrollbar($target.closest('ul'), this.children.datasetInfo.$el) + 'px');
                }
            },

            calculateMarginWithScrollbar: function($target, $container) {
                // Measure the difference to get the scrollbar size
                var scrollWidth = $target.outerWidth() - $target.get(0).clientWidth,
                    // Find the arrow div and get its width (we want the arrow to start at the end of the scrollbar)
                    arrowLength = $container.children('.arrow').outerWidth();
                return scrollWidth + arrowLength;
            },

            removeDatasetInfo: function() {
                if (this.children.datasetInfo) {
                    this.children.datasetInfo.deactivate({ deep: true }).remove();
                }
            },

            render: function() {
                this.children.operationTypeRadio.render().prependTo(this.$el);
                
                if (this.model.command.get('selectedDatasetDisplayName')) {
                    this.renderDatasetName();
                }

                this.appendDoneButton();
                this.hideDoneButton();

                return this;
            },

            template: '\
                <div class="chosen-dataset">\
                    <div class="dataset-label">\
                        <%= _("Dataset:").t() %>\
                    </div>\
                    <a href="#" class="dataset-picker">\
                        <span class="dataset-name"><%- datasetName %></span>\
                        <icon class="icon-chevron-right"></icon>\
                    </a>\
                </div>\
            '
        });
    }
);