define(
    [
        'jquery',
        'underscore',
        'module',
        'models/datasets/Column',
        'collections/services/data/TransformsLookups',
        'views/table/commandeditor/editorforms/Base',
        'views/table/commandeditor/editorforms/join/JoinOn',
        'views/table/commandeditor/listpicker/Control',
        'views/shared/controls/ControlGroup'
    ],
    function(
        $,
        _,
        module,
        ColumnModel,
        DatasetsCollection,
        BaseEditorView,
        JoinOnView,
        ListOverlayControl,
        ControlGroup
    ) {
        return BaseEditorView.extend({
            moduleId: module.id,
            className: BaseEditorView.CLASS_NAME + ' commandeditor-form-join',

            initialize: function() {
                BaseEditorView.prototype.initialize.apply(this, arguments);

                if (_.isEmpty(this.collection)) {
                    this.collection = {};
                }
                this.collection.datasets = new DatasetsCollection();
            },

            startListening: function(options) {
                BaseEditorView.prototype.startListening.apply(this, arguments);
                this.listenTo(this.model.command, 'change:fullDatasetToJoinPath', function() {
                    this.model.command.unset('fieldsToAdd');
                    this.model.command.requiredColumns.each(function(requiredColumn) {
                        requiredColumn.unset('columnToJoinWith');
                    }, this);
                    this.addJoinAndFieldsControls();
                });
            },

            activate: function(options) {
                if (this.active) {
                    return BaseEditorView.prototype.activate.apply(this, arguments);
                }

                this.fetchDatasets();

                return BaseEditorView.prototype.activate.apply(this, arguments);
            },

            deactivate: function(options) {
                if (!this.active) {
                    return BaseEditorView.prototype.deactivate.apply(this, arguments);
                }
                BaseEditorView.prototype.deactivate.apply(this, arguments);

                this.collection.datasets.fetchAbort();

                return this;
            },

            fetchDatasets: function() {
                var datasetsFetchDeferred = this.collection.datasets.fetch({
                    data: {
                        app: this.model.application.get('app'),
                        owner: '-',
                        sort_mode: ['natural', 'natural'],
                        count: 100
                    }
                });

                $.when(datasetsFetchDeferred).then(function() {
                    if (this.active) {
                        this.setUpDatasetList();
                    }
                }.bind(this));
            },

            setUpDatasetList: function() {
                var items = this.collection.datasets.map(function(dataset) {
                        return {
                            value: dataset.get('id'),
                            label: dataset.entry.get('name')
                        };
                    }, this);

                if (this.children.datasetControlGroup) {
                    this.children.datasetControlGroup.deactivate({ deep: true }).remove();
                    delete this.children.datasetControlGroup;
                }

                this.children.datasetControlGroup = new ControlGroup({
                    label: _('Lookup').t(),
                    controlType: 'ListOverlay',
                    controlTypes: {'ListOverlay': ListOverlayControl},
                    size: 'small',
                    controlOptions: {
                        model: this.model.command,
                        modelAttribute: 'fullDatasetToJoinPath',
                        placeholder: _('Select a lookup...').t(),
                        listOptions: {
                            selectMessage: _('Select a lookup to join...').t(),
                            items: items
                        },
                        toggleClassName: 'btn-overlay-toggle'
                    }
                });

                this.children.datasetControlGroup.activate({ deep: true }).render().prependTo(this.$('.dataset-control'));

                if (this.model.command.get('fullDatasetToJoinPath')) {
                    this.addJoinAndFieldsControls();
                }
            },

            addJoinAndFieldsControls: function() {
                var availableFieldsFromChosenDataset = this.getFieldsFromChosenDataset();

                this.addJoinControl(availableFieldsFromChosenDataset);
                this.addFieldsControl(availableFieldsFromChosenDataset);
            },

            addJoinControl: function(availableFieldsFromChosenDataset) {
                if (this.children.joinOn) {
                    this.children.joinOn.deactivate({ deep: true }).remove();
                    delete this.children.joinOn;
                }

                this.children.joinOn = new JoinOnView({
                    model: {
                        command: this.model.command,
                        commandPristine: this.model.commandPristine,
                        table: this.model.table
                    },
                    availableFieldsFromChosenDataset: availableFieldsFromChosenDataset,
                    tableItems: this.getFieldPickerItems()
                });

                this.children.joinOn.activate({ deep: true }).render().insertAfter(this.$('.dataset-control'));
            },

            addFieldsControl: function(availableFieldsFromChosenDataset) {
                if (this.children.fieldsControlGroup) {
                    this.children.fieldsControlGroup.deactivate({ deep: true }).remove();
                    delete this.children.fieldsControlGroup;
                }

                this.children.fieldsControlGroup = new ControlGroup({
                    label: _('Fields').t(),
                    controlType: 'ListOverlay',
                    controlTypes: {'ListOverlay': ListOverlayControl},
                    size: 'small',
                    controlOptions: {
                        model: this.model.command,
                        modelAttribute: 'fieldsToAdd',
                        placeholder: _('Select fields to add...').t(),
                        listOptions: {
                            items: availableFieldsFromChosenDataset,
                            multiselect: true,
                            required: true,
                            multiselectMessage: _('Select fields to add...').t()
                        },
                        toggleClassName: 'btn-overlay-toggle'
                    }
                });

                this.children.fieldsControlGroup.activate({ deep: true }).render().prependTo(this.$('.fields-control'));
            },

            getFieldsFromChosenDataset: function() {
                var chosenDatasetModel = this.collection.datasets.get(this.model.command.get('fullDatasetToJoinPath')),
                    fieldsArray = chosenDatasetModel.entry.content.toObject('fields_array');

                return _.map(fieldsArray, function(field) {
                    return { value: field };
                }, this);
            },

            handleApply: function(options) {
                var chosenDatasetModel = this.collection.datasets.get(this.model.command.get('fullDatasetToJoinPath'));

                this.addNewFields();
                // Kind of weird, but the SPL doesn't take in the fully qualified URL, instead opting for just the
                // name. But we want the control to work on the full path. Normalize here.
                this.model.command.set('datasetNameToJoin', chosenDatasetModel.entry.get('name'));

                BaseEditorView.prototype.handleApply.apply(this, arguments);
            },

            render: function() {
                if (!this.$el.html()) {
                    $(BaseEditorView.COMMANDEDITOR_SECTION).appendTo(this.$el);
                    this.$(BaseEditorView.COMMANDEDITOR_SECTION_SELECTOR).html(this.compiledTemplate({
                        _: _
                    }));
                    
                    this.appendButtons();
                }

                return this;
            },

            template: '\
                <div class="commandeditor-section-padded">\
                    <div class="dataset-control"></div>\
                    <div class="fields-control"></div>\
                </div>\
            '
        });
    }
);
