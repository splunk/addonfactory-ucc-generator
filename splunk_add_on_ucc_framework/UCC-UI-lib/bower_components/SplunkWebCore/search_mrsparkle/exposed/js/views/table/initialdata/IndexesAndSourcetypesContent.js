define(
    [
        'underscore',
        'jquery',
        'module',
        'collections/services/data/Indexes',
        'models/search/Job',
        'models/datasets/Result',
        'views/table/initialdata/BaseContent',
        'views/table/commandeditor/listpicker/Overlay',
        'views/table/initialdata/IndexAndSourcetypesRow',
        'util/time'
    ],
    function(
        _,
        $,
        module,
        IndexesCollection,
        JobModel,
        ResultModel,
        BaseContentView,
        ListPickerOverlay,
        IndexAndSourcetypesRowView,
        timeUtils
    ) {
        var INDEX_SEARCH = '| eventcount summarize=f index=_* index=* | where count>0 | stats count by index',
            SOURCETYPE_SEARCH = ' type=sourcetypes | search totalCount > 0 | table sourcetype totalCount recentTime | fieldformat totalCount=tostring(totalCount, "commas") | fieldformat recentTime=strftime(recentTime, "' + timeUtils.ISO_PATTERN + '")';

        return BaseContentView.extend({
            moduleId: module.id,
            className: 'indexes-and-sourcetypes-content',

            PAGE_COUNT: 50,

            initialize: function() {
                BaseContentView.prototype.initialize.apply(this, arguments);

                this.children.indexAndSourcetypesRows = {};
            },

            events: $.extend({}, BaseContentView.prototype.events, {
                'click .add-index-and-sourcetypes': function(e) {
                    e.preventDefault();
                    this.openIndexPicker();
                }
            }),

            activate: function(options) {
                if (this.active) {
                    return BaseContentView.prototype.activate.apply(this, arguments);
                }

                // If we don't have the deferred, or the deferred failed, we need to fetch the available indexes
                if (!this.indexesJobDoneDeferred || this.indexesJobDoneDeferred.state() !== 'resolved') {
                    this.fetchIndexes();
                // Otherwise, we have indexes to show the user, so if there are no editorValues selected, we'll open
                // the index picker to start the user off.
                } else if (this.model.command.editorValues.length === 0) {
                    this.openIndexPicker();
                }

                // It's also possible that we don't have a fields picker, but have selectedEditorValues.
                // In that case, we need to start the job that eventually renders the fields picker.
                if (!this.children.fieldsPicker && this.model.command.editorValues.length) {
                    this.fetchFieldsForPicker();
                }

                return BaseContentView.prototype.activate.apply(this, arguments);
            },

            startListening: function(options) {
                BaseContentView.prototype.startListening.apply(this, arguments);

                this.listenTo(this.model.command.editorValues, 'add remove', function() {
                    var options = {
                        includeIndex: this.hasMultipleIndexes(),
                        includeSourcetype: this.hasMultipleSourcetypes()
                    };
                    this.handleSearchChange(options);
                    this.model.state.trigger('updateBaseSPL');
                });
                this.listenTo(this.model.command.editorValues, 'remove', function() {
                    if (!this.model.command.editorValues.length) {
                        this.openIndexPicker();
                    }
                });
                // Have to re-listen to this trigger since the listenTo in createIndexAndSourcetypesRow
                // isn't preserved if this view is deactivated at any time.
                _.each(this.children.indexAndSourcetypesRows, function(row) {
                    // Deactivate listener if it exists already
                    row.off('removeIndexAndSourcetypesRow', null, this);
                    this.listenTo(row, 'removeIndexAndSourcetypesRow', function(options) {
                        this.removeIndexAndSourcetypesRow(options.cid);
                    });
                }, this);
            },

            hasMultipleIndexes: function() {
                return (_.uniq(this.model.command.editorValues.pluck('index')).length > 1);
            },

            hasMultipleSourcetypes: function() {
                var allSourcetypes = this.model.command.editorValues.pluck('sourcetypes');
                return (_.uniq(_.flatten(allSourcetypes)).length > 1);
            },

            // Here we fetch all indexes by running a meta data search job.
            fetchIndexes: function() {
                var resultPreviewCount;

                this.indexesJobDeferred = $.Deferred();
                this.indexesJobDoneDeferred = $.Deferred();

                this.model.indexesJob = JobModel.createMetaDataSearch(
                    INDEX_SEARCH,
                    this.indexesJobDeferred,
                    this.model.application,
                    undefined,
                    {
                        earliest_time: '',
                        latest_time: '',
                        max_count: ''
                    }
                );
                this.model.indexesResult = new ResultModel();
                this.model.indexesResult.fetchData.set({ count: this.PAGE_COUNT }, { silent: true });

                // Open the picker if we have no selected editorValues already
                if (!this.model.command.editorValues.length) {
                    this.openIndexPicker();
                }

                $.when(this.indexesJobDeferred).then(function() {
                    this.model.indexesJob.registerJobProgressLinksChild(
                        JobModel.RESULTS_PREVIEW,
                        this.model.indexesResult,
                        function() {
                            if (this.model.indexesJob.isDone()) {
                                resultPreviewCount = this.model.indexesJob.entry.content.get("resultPreviewCount");

                                if (_.isNumber(resultPreviewCount) && (resultPreviewCount > 0)) {
                                    this.model.indexesResult.safeFetch();
                                } else {
                                    this.indexesJobDoneDeferred.resolve();
                                }
                            }
                        }.bind(this)
                    );
                    this.model.indexesJob.startPolling();
                }.bind(this));

                this.listenTo(this.model.indexesResult, 'sync', function() {
                    this.indexesJobDoneDeferred.resolve();
                });
            },

            // Once the user picks an index, we need to find all the sourcetypes for that index by running
            // another meta data search job.
            fetchSourcetypes: function(selectedIndex) {
                var metadataSearchString = '| metadata ',
                    resultPreviewCount,
                    indexSearchComponent = _.isArray(selectedIndex) ?
                        'index="' + selectedIndex.join('" OR index="') + '"' :
                        'index="' + selectedIndex + '"';

                this.sourcetypesJobDeferred = $.Deferred();
                this.sourcetypesJobDoneDeferred = $.Deferred();

                metadataSearchString += indexSearchComponent;
                this.model.sourcetypesJob = JobModel.createMetaDataSearch(
                    metadataSearchString + SOURCETYPE_SEARCH,
                    this.sourcetypesJobDeferred,
                    this.model.application,
                    undefined,
                    {
                        earliest_time: '',
                        latest_time: '',
                        max_count: ''
                    }
                );
                this.model.sourcetypesResult = new ResultModel();
                this.model.sourcetypesResult.fetchData.set({ count: this.PAGE_COUNT }, { silent: true });

                this.openSourcetypePicker(selectedIndex);

                $.when(this.sourcetypesJobDeferred).then(function() {
                    this.model.sourcetypesJob.registerJobProgressLinksChild(
                        JobModel.RESULTS_PREVIEW,
                        this.model.sourcetypesResult,
                        function() {
                            if (this.model.sourcetypesJob.isDone()) {
                                resultPreviewCount = this.model.sourcetypesJob.entry.content.get("resultPreviewCount");
                                if (_.isNumber(resultPreviewCount) && (resultPreviewCount > 0)) {
                                    this.model.sourcetypesResult.safeFetch();
                                } else {
                                    this.sourcetypesJobDoneDeferred.resolve();
                                }
                            }
                        }.bind(this)
                    );
                    this.model.sourcetypesJob.startPolling();
                }.bind(this));

                this.listenTo(this.model.sourcetypesResult, 'sync', function() {
                    this.sourcetypesJobDoneDeferred.resolve();
                });
            },

            openIndexPicker: function() {
                var staticIndexItems = [
                    { label: _('all indexes').t(), value: '*', isItalics: true }
                ];

                if (this.children.indexList) {
                    this.children.indexList.deactivate({ deep: true }).remove();
                }

                this.children.indexList = new ListPickerOverlay({
                    model: {
                        results: this.model.indexesResult,
                        searchJob: this.model.indexesJob,
                        state: this.model.indexesResult.fetchData
                    },
                    paginatorType: ListPickerOverlay.PAGINATOR_TYPES.SEARCH_RESULTS,
                    fieldAttribute: 'index',
                    staticItems: staticIndexItems,
                    selectMessage: _('Select an index...').t(),
                    deferred: this.indexesJobDoneDeferred,
                    // It's only required if the user doesn't have at least 1 selected sourcetype already
                    required: !this.model.command.editorValues.length,
                    slideOutOnChange: false
                });

                this.children.indexList.activate({ deep: true }).render().appendTo(this.$el);
                this.children.indexList.slideIn();

                this.listenTo(this.children.indexList, 'selectionDidChange selectionDidNotChange', this.handleIndexSelection);
            },

            openSourcetypePicker: function(selectedIndex) {
                var selectedSourcetypes = _(this.model.command.editorValues.where({ index: selectedIndex }))
                        .map(function(indexesAndSourcetypeModel) {
                            return indexesAndSourcetypeModel.get('sourcetype');
                        });

                if (this.children.sourcetypeList) {
                    this.children.sourcetypeList.deactivate({deep: true}).remove();
                }

                this.children.sourcetypeList = new ListPickerOverlay({
                    model: {
                        results: this.model.sourcetypesResult,
                        searchJob: this.model.sourcetypesJob,
                        state: this.model.sourcetypesResult.fetchData
                    },
                    paginatorType: ListPickerOverlay.PAGINATOR_TYPES.SEARCH_RESULTS,
                    fieldAttribute: 'sourcetype',
                    multiselectMessage: _('Select one or more source types...').t(),
                    deferred: this.sourcetypesJobDoneDeferred,
                    selectedValues: selectedSourcetypes,
                    required: false,
                    multiselect: true
                });

                this.children.sourcetypeList.activate({ deep: true }).render().appendTo(this.$el);
                this.children.sourcetypeList.slideIn();

                this.listenTo(this.children.sourcetypeList, 'selectionDidChange', this.handleSourcetypesSelection);
            },

            handleIndexSelection: function() {
                var selectedIndex = this.getIndexFromPicker();
                this.fetchSourcetypes(selectedIndex);
            },

            handleSourcetypesSelection: function() {
                var selectedSourcetypes = this.children.sourcetypeList.getSelectedValues(),
                    selectedIndex = this.getIndexFromPicker(),
                    selectedIndexAndSourcetypesObj = {
                        index: selectedIndex,
                        sourcetypes: selectedSourcetypes
                    },
                    newSourcetypeModel;

                this.model.command.editorValues.add(selectedIndexAndSourcetypesObj);
                newSourcetypeModel = this.model.command.editorValues.last();

                // Now that the user has picked an index and sourcetypes, we can add an index and sourcetypes row
                this.createIndexAndSourcetypesRow(newSourcetypeModel);
                this.children.indexAndSourcetypesRows[newSourcetypeModel.cid].activate({ deep: true }).render().appendTo(this.$('.index-and-sourcetypes-rows'));

                this.children.indexList.hide();
            },

            getIndexFromPicker: function() {
                var selectedIndex = this.children.indexList.getSelectedValue();

                // Weird case, but if the user picks 'all indexes', then we want to search index=* or index=_*
                if (selectedIndex === '*') {
                    selectedIndex = ['*', '_*'];
                }
                return selectedIndex;
            },

            createIndexAndSourcetypesRow: function(indexAndSourcetypesModel) {
                // Namespace this row by its cid for easy lookup later
                var newRow = this.children.indexAndSourcetypesRows[indexAndSourcetypesModel.cid] = new IndexAndSourcetypesRowView({
                    model: {
                        editorValue: indexAndSourcetypesModel
                    }
                });

                this.listenTo(newRow, 'removeIndexAndSourcetypesRow', function(options) {
                    this.removeIndexAndSourcetypesRow(options.cid);
                });
            },

            removeIndexAndSourcetypesRow: function(cid) {
                var modelToRemove = this.model.command.editorValues.get(cid);
                this.model.command.editorValues.remove(modelToRemove);
                this.children.indexAndSourcetypesRows[cid].remove();
                delete this.children.indexAndSourcetypesRows[cid];
            },

            render: function() {
                this.$el.prepend(this.compiledTemplate({
                    _: _
                }));

                this.model.command.editorValues.each(function(indexAndSourcetypesModel) {
                    this.createIndexAndSourcetypesRow(indexAndSourcetypesModel);
                    this.children.indexAndSourcetypesRows[indexAndSourcetypesModel.cid].activate({ deep: true }).render().appendTo(this.$('.index-and-sourcetypes-rows'));
                }, this);

                this.appendDoneButton();

                return this;
            },

            template: '\
                <div class="index-and-sourcetypes-rows"></div>\
                <a href="#" class="add-index-and-sourcetypes">\
                    <i class="icon-plus"></i>\
                    <%= _("Add an index and one or more source types...").t() %>\
                </a>\
            '
        });
    }
);