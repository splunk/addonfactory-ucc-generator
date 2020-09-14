define([
            'underscore',
            'module',
            'collections/Base',
            'models/Base',
            'views/Base',
            'views/shared/jobstatus/Count',
            './SelectPageCount',
            'views/shared/SearchResultsPaginator',
            'views/shared/jobstatus/Spinner',
            'views/shared/controls/TextControl',
            './SelectSampleSize',
            'views/shared/controls/ControlGroup',
            'views/shared/controls/SyntheticSelectControl',
            'views/shared/controls/SyntheticRadioControl',
            'util/field_extractor_utils',
            'util/keyboard'
        ],
        function(
            _,
            module,
            BaseCollection,
            BaseModel,
            BaseView,
            Count,
            SelectPageCount,
            SearchResultsPaginator,
            Spinner,
            TextControl,
            SelectSampleSize,
            ControlGroup,
            SyntheticSelectControl,
            SyntheticRadioControl,
            fieldExtractorUtils,
            keyboardUtils
        ) {

    return BaseView.extend({

        moduleId: module.id,
        className: 'match-results-control-bar',

        events: {
            'click .apply-filter-button': function(e) {
                e.preventDefault();
                this.model.state.set(this.model.filterMediator.pick('filter'));
            },
            'keypress .filter-input': function(e) {
                if(e.which === keyboardUtils.KEYS.ENTER) {
                    this.model.state.set(this.model.filterMediator.pick('filter'));
                }
            }
        },

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.children.count = new Count({ model: this.model.searchJob });
            this.children.spinner = new Spinner({ model: this.model.searchJob });
            this.children.searchFilter = new ControlGroup({
                label: _("Original search included:").t(),
                controlType: 'SyntheticCheckbox',
                className: 'control-group',
                controlOptions: {
                    modelAttribute: 'useSearchFilter',
                    model: this.model.state,
                    save: false
                },
                tooltip: _('You came here from search and your last search string has been applied to the preview results. Turn it off if you might need more specific field definitions.').t()
            });
            this.children.pageCount = new SelectPageCount({ model: this.model.page });
            if(this.options.paginator) {
                this.children.paginator = this.options.paginator;
            }
            else {
                this.children.paginator = new SearchResultsPaginator({
                    model: {
                        state: this.model.paginatorState,
                        searchJob: this.model.searchJob,
                        results: this.model.results
                    },
                    collection: new BaseCollection(),
                    mode: this.options.reportType
                });
            }

            this.model.filterMediator = new BaseModel(this.model.state.pick('filter'));
            this.children.filterInput = new TextControl({
                model: this.model.filterMediator,
                modelAttribute: 'filter',
                placeholder: _('filter').t(),
                className: 'control filter-input-control input-append',
                inputClassName: 'filter-input',
                updateOnKeyUp: true
            });
            this.listenTo(this.model.filterMediator, 'change:filter', this.refreshFilterControl);
            this.listenTo(this.model.state, 'change:filter', this.refreshFilterControl);
            this.children.selectSampleSize = new SelectSampleSize({
                model: this.model.state,
                modelAttribute: 'sampleSize'
            });
            this.children.selectClustering = new SyntheticSelectControl({
                model: this.model.state,
                modelAttribute: 'clustering',
                toggleClassName: 'btn',
                menuWidth: 'narrow',
                items: [
                    {
                        label: _('All events').t(),
                        value: fieldExtractorUtils.CLUSTERING_NONE
                    },
                    {
                        label: _('Diverse events').t(),
                        value: fieldExtractorUtils.CLUSTERING_DIVERSE
                    },
                    {
                        label: _('Rare events').t(),
                        value: fieldExtractorUtils.CLUSTERING_OUTLIERS
                    }
                ]
            });
            if(this.options.showMatchControl) {
                this.children.selectMatch = new SyntheticRadioControl({
                    model: this.model.state,
                    modelAttribute: 'eventsView',
                    items: [
                        {
                            label: _('All Events').t(),
                            value: fieldExtractorUtils.VIEW_ALL_EVENTS
                        },
                        {
                            label: _('Matches').t(),
                            value: fieldExtractorUtils.VIEW_MATCHING_EVENTS
                        },
                        {
                            label: _('Non-Matches').t(),
                            value: fieldExtractorUtils.VIEW_NON_MATCHING_EVENTS
                        }
                    ]
                });
            }
        },

        render: function() {
            _(this.children).invoke('detach');
            this.$el.html(this.compiledTemplate({}));

            this.children.pageCount.render().appendTo(this.$('.page-count-container'));
            this.children.paginator.render().appendTo(this.$('.pagination-container'));
            this.children.spinner.render().appendTo(this.$('.spinner-container'));
            this.children.count.render().appendTo(this.$('.count-container'));

            var $controlsRow = this.$('.controls-row');
            this.children.filterInput.render().appendTo($controlsRow);
            this.children.filterInput.$el.append(
                '<a href="#" class="apply-filter-button btn btn-primary">' + _('Apply').t() + '</a>'
            );
            this.children.selectSampleSize.render().appendTo($controlsRow);
            this.children.selectClustering.render().appendTo($controlsRow);
            if(this.children.selectMatch) {
                this.children.selectMatch.render().appendTo($controlsRow);
            }
            if (this.model.state.has('useSearchFilter') &&
                this.model.state.get('hasSid') &&
                (this.model.state.get('mode') === fieldExtractorUtils.SELECT_SAMPLE_MODE ||
                 this.model.state.get('mode') === fieldExtractorUtils.SELECT_FIELDS_MODE ||
                 this.model.state.get('mode') === fieldExtractorUtils.VALIDATE_FIELDS_MODE)) {
                var $searchFilterRow = this.$('.search-filter-container');
                this.children.searchFilter.render().appendTo($searchFilterRow);
            }
            this.refreshFilterControl();

            return this;
        },

        refreshFilterControl: function() {
            var activeFilter = this.model.state.get('filter'),
                filterIsDirty = activeFilter !== this.model.filterMediator.get('filter'),
                $applyFilterButton = this.$('.apply-filter-button'),
                $filterInput = this.$('.filter-input');

            if(filterIsDirty) {
                $applyFilterButton.removeClass('disabled');
            }
            else {
                $applyFilterButton.addClass('disabled');
            }
            if(filterIsDirty || activeFilter) {
                $filterInput.addClass('active');
            }
            else {
                $filterInput.removeClass('active');
            }
        },

        template: '\
            <div class="job-status-row">\
                <div class="spinner-container"></div>\
                <div class="count-container"></div>\
                <div class="pagination-container pull-right"></div>\
                <div class="page-count-container pull-right"></div>\
                <div class="search-filter-container pull-right"></div>\
            </div>\
            <div class="controls-row"></div>\
        '

    });

});