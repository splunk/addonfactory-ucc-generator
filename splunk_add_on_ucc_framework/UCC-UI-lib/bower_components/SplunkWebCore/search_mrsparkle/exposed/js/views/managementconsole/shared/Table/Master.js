// Table Components Master file.
// allows user to pass in a configuration
// and a collection and it will display the table
// @author: nmistry
define([
    'underscore',
    'jquery',
    'backbone',
    'views/Base',
    'module',
    'splunk.util',
    './tools/TotalCounterTool',
    './tools/TextFilterTool',
    './tools/SelectPageCountTool',
    './tools/BulkEditTool',
    './tools/ToggleAllTool',
    './GridController',
    'views/shared/CollectionPaginator',
    'contrib/text!./Master.html',
    './Master.pcss'
], function TableController(
    _,
    $,
    Backbone,
    BaseView,
    module,
    splunkUtil,
    TotalCounterTool,
    TextFilterTool,
    SelectPageCountTool,
    BulkEditTool,
    ToggleAllTool,
    Grid,
    Paginator,
    Template
) {
    var strings = {
        LOADING: _('Loading ...').t(),
        // Message to be displayed when the collection has no models
        NO_RESULTS: _('There are no configurations of this type.').t(),
        // Message to be displayed when the collection has no matching results
        NO_MATCHING_RESULTS_TPL: _('No results found matching "%s".').t()
    };
    var messageSelectors = {
        LOADING: '.table-messages .loading',
        NORESULTS: '.table-messages .create-prompt',
        NOMATCHINGRESULTS: '.table-messages .no-result',
        ERROR: '.table-messages .error-msg'
    };
    var TableMaster = BaseView.extend({
        moduleId: module.id,
        tagName: 'div',
        className: '',
        template: Template,
        events: {},
        toolbarItems: {},
        configDefaults: {
            // toolbar properties
            toolbar: [],
            // grid properties
            grid: {}
        },

        initialize: function () {
            BaseView.prototype.initialize.apply(this, arguments);
            // allow the user to customize no collection messages.
            this.strings = {
                loading: this.options.loadingText || strings.LOADING,
                noResults: this.options.noResultsText || strings.NO_RESULTS,
                noMatchingResultsTPL: this.options.noMatchingResultsTPL || strings.NO_MATCHING_RESULTS_TPL,
                noMatchingResults: this.options.noMatchingResultsTPL || strings.NO_MATCHING_RESULTS_TPL,
                errorMsg: ''
            };
            // extend grid defaults from the Grid class
            this.configDefaults.grid = $.extend(true, {}, this.configDefaults.grid, Grid.gridDefaults);
            // merge user's configuration with default configuration
            this.config = $.extend(true, {}, this.configDefaults, this.options.config);
            // Radio event bus will be used to communicate amongst the components.
            // If the user is interested in table interactions, he should pass in a Radio.
            this.radio = this.options.radio || _.extend({}, Backbone.Events);

            // If bulkedit is enabled &
            // bulkedit tool is not added, then add one.
            if (
                this.config.grid.bulkEdit.enabled &&
                _.isEmpty(_.where(this.config.toolbar, {type: 'bulkEdit'}))
            ) {
                this.config.toolbar.push({
                    type: 'bulkEdit',
                    links: this.config.grid.bulkEdit.links,
                    singular: this.config.grid.bulkEdit.singular || '',
                    plural: this.config.grid.bulkEdit.plural || ''
                });
            }

            // If rowExpansion is enabled & showToggleAll add toggleAll tool
            if (
                this.config.grid.rowExpansion.enabled === true
                && this.config.grid.rowExpansion.showToggleAll === true
            ) {
                this.config.toolbar.push({
                    type: 'toggleAll',
                    initialState: this.config.grid.rowExpansion.initialState || 'collapsed'
                });
            }
            // Initialize the tools in the toolbar
            _.each(this.config.toolbar, function initializeToolbarComponents(item) {
                // cannot use _.has because the initialize functions are mixed
                // into Table.prototype.
                if (
                    _.has(this.toolbarItems, item.type) &&
                    this.toolbarItems[item.type] in this &&
                    _.isFunction(this[this.toolbarItems[item.type]])
                ) {
                    this[this.toolbarItems[item.type]].apply(this, [item]);
                }
            }, this);

            // Initiailize the paginator
            // User cannot disable the paginator.
            this.children.paginator = new Paginator({
                collection: this.collection
            });


            // Initialize the grid
            this.children.grid = new Grid({
                collection: this.collection,
                config: this.config.grid,
                radio: this.radio
            });

            //this.collection.fetch();
            this.messages = [];
            if (this.collection.isEmpty()) {
                this.messages.push(messageSelectors.NORESULTS);
            }
            if (this.options.showLoading) {
                this.listenTo(this.collection, 'request', this.handleRequest);
            }
            this.listenTo(this.collection, 'reset', this.handleReset);
            this.listenTo(this.collection, 'error', this.handleError);
        },
        // When the collection is updated,
        // the Table component needs to redrawn.
        handleReset: function () {
            // currently there is only one filter, textfilter
            // but most tables have more than one filters.
            // NMTODO: extend possibility to handle multiple filters.
            if (this.collection.isEmpty()) {
                var textfilter = _.isUndefined(this.children.textFilter) ? '' : this.children.textFilter.getValue();
                if (_.isEmpty(textfilter)) {
                    this.messages.push(messageSelectors.NORESULTS);
                } else {
                    this.strings.noMatchingResults = splunkUtil.sprintf(this.strings.noMatchingResultsTPL, textfilter);
                    this.messages.push(messageSelectors.NOMATCHINGRESULTS);
                }
            }
            // reset the bulk edit menu
            this.radio.trigger('select:click', {selected: []});
            this.render();
        },

        // when a request to the server is on the fly
        // display loading message
        handleRequest: function () {
            this.messages.push(messageSelectors.LOADING);
            this.render();
        },

        // where something goes wrong with the request
        // try your best to extract error message
        handleError: function () {
            this.strings.errorMsg = this.collection.getSyncErrorMessage();
            this.messages.push(messageSelectors.ERROR);
            this.render();
        },

        render: function () {
            // Draw the layout.
            this.el.innerHTML = this.compiledTemplate({
                strings: this.strings
            });
            // display message or the table
            if (_.isEmpty(this.messages)) {
                this.renderTable();
            } else {
                var selector = _.first(this.messages);
                this.$(selector).show();
                if (selector === messageSelectors.NOMATCHINGRESULTS) {
                    this.renderTable(true);
                }
                // reset messages
                this.messages = [];
            }
            return this;
        },

        renderTable: function (shouldHideTable) {
            shouldHideTable = shouldHideTable || false;

            // Initialize user configured tools
            _.each(this.config.toolbar, function renderToolbarComponents(item) {
                if (_.has(this.children, item.type)) {
                    if (item.attachTo) {
                        this.children[item.type].render().$el.appendTo(this.$(item.attachTo));
                    }
                    this.children[item.type].$el.addClass('tool');
                    if (item.className) {
                        this.children[item.type].$el.addClass(item.className);
                    }
                }
            }, this);
            if (!shouldHideTable) {
                this.children.paginator.render().appendTo(this.$('.paginator'));
                this.children.grid.render().replaceContentsOf(this.$('.table-grid'));
            }
        }
    });

    // Register various tools
    TableMaster.prototype = $.extend(true, {}, TableMaster.prototype, TotalCounterTool);
    TableMaster.prototype = $.extend(true, {}, TableMaster.prototype, TextFilterTool);
    TableMaster.prototype = $.extend(true, {}, TableMaster.prototype, SelectPageCountTool);
    TableMaster.prototype = $.extend(true, {}, TableMaster.prototype, BulkEditTool);
    TableMaster.prototype = $.extend(true, {}, TableMaster.prototype, ToggleAllTool);

    return TableMaster;
});
