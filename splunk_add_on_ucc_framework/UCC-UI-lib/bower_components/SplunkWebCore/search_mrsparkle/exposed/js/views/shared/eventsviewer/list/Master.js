define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/delegates/Modalize',
        'views/shared/delegates/TableDock',
        'views/shared/delegates/TableHeadStatic',
        'views/shared/eventsviewer/shared/TableHead',
        'views/shared/eventsviewer/list/body/Master',
        'splunk.util',
        'jquery.resize'
    ],
    function($, _, module, BaseView, Modalize, TableDock, TableHeadStatic, TableHeadView, TableBodyView, util, undefined){
        return BaseView.extend({
            moduleId: module.id,
            /**
             * @param {Object} options {
             *     model: {
             *         result: <models.services.search.job.ResultsV2>,
             *         summary: <model.services.search.job.SummaryV2>,
             *         searchJob: <models.Job>,
             *         report: <models.services.SavedSearch>,
             *         application: <models.Application>
             *     },
             *     collection: {
             *         selectedFields: <collections.SelectedFields>,
             *         workflowActions: <collections.services.data.ui.WorkflowActions>
             *     },
             *     selectableFields: true|false,
             *     headerMode: dock|static|none (default),
             *     headerOffset: integer (only applicable with headerMode=dock),
             *     allowRowExpand: true|false,
             *     allowModalize: true|false,
             *     showWarnings: true|false,
             *     highlightExtractedTime: true|false (caution: will disable segmentation/drilldown)
             */
            className: 'scrolling-table-wrapper',
            initialize: function(){
                BaseView.prototype.initialize.apply(this, arguments);

                this.tableId = this.cid + '-table';

                /*
                * Modalize Delegate: enrichment of view with
                * modalize related logic.
                */
                this.children.modalize = new Modalize({
                    el: this.el, 
                    tbody: '#' + this.tableId + ' > tbody'
                });
                
                /*
                * Based on the state of the report, customize thead columns 
                * to contain contain time. 
                *
                */
                this.children.head = new TableHeadView({
                    model: this.model.report,
                    labels: this.isList() ? ['Time', 'Event']: ['Event'],
                    allowRowExpand: this.options.allowRowExpand,
                    showWarnings: this.options.showWarnings
                });
                
                this.children.body = new TableBodyView({
                    model: { 
                        result: this.model.result,
                        summary: this.model.summary,
                        state: this.model.state,
                        searchJob: this.model.searchJob,
                        report: this.model.report,
                        application: this.model.application
                    },
                    collection: {
                        selectedFields: this.collection.selectedFields,
                        workflowActions: this.collection.workflowActions
                    },
                    selectableFields: this.options.selectableFields,
                    allowRowExpand: this.options.allowRowExpand,
                    showWarnings: this.options.showWarnings,
                    highlightExtractedTime: this.options.highlightExtractedTime,
                    clickFocus: this.options.clickFocus
                });
                
                if (this.options.headerMode === 'dock') {
                    this.children.tableDock = new TableDock({ 
                        el: this.el, 
                        offset: this.options.headerOffset, 
                        defaultLayout: 'fixed'
                    });
                } else if (this.options.headerMode === 'static') {
                    // class below enables vertical scrolling - Consumer must set height or use updateContainerHeight()
                    this.children.staticHead = new TableHeadStatic({
                        el: this.el,
                        scrollContainer: '> .vertical-scrolling-table-wrapper',
                        flexWidthColumn: false
                    });
                }
            },
            activate: function(options) {
                if (this.active) {
                    return BaseView.prototype.activate.apply(this, arguments);
                }
                this.showHideRowNum();
                this.updateTableLabels();

                return BaseView.prototype.activate.apply(this, arguments);
            },
            startListening: function() {
                this.listenTo(this.model.state, 'change:modalizedRow', function(model, value) {
                    if (_.isNumber(value) && this.options.allowModalize) {
                        this.model.state.set('isModalized', true);
                        this.children.modalize.debouncedShow(value);
                        this.children.tableDock && this.children.tableDock.disable();
                        this.children.staticHead && this.children.staticHead.deactivate();
                    } else {
                        this.model.state.set('isModalized', false);
                        this.children.modalize.debouncedCleanup();
                        this.children.tableDock && this.children.tableDock.enable();
                        this.children.staticHead && this.children.staticHead.activate();
                    }
                }); //TODO: extract out to method on the state model for sharing between table/list_raw

                /*
                 * Changes to the selected fields have potential to change the row dimensions. We 
                 * should rerender the modalize mask on any add/remove/reset.
                 */
                this.listenTo(this.collection.selectedFields, 'reset add remove', this.children.modalize.update);

                /*
                 * Again, promiscuous in the sense that we have intimate knowledge of the key structure,
                 * allowing us to fire change that only one observer will acknowledge.
                 */
                this.listenTo(this.children.modalize, 'unmodalize', function(idx) {
                    this.model.state.trigger(idx + '-collapse');
                    this.model.state.set('modalizedRow', false);
                });
                
                /*
                    LOTS OF CALLERS TO DEFER UPDATE TABLE HEAD!....fix me please :(
                */
                this.listenTo(this.model.report.entry.content, 'change:display.events.rowNumbers', function(model, value) {
                    var $table = this.$('table:not(.table-embed)'),
                        hasRowNumbers = util.normalizeBoolean(value);
                        
                    hasRowNumbers ? $table.removeClass('hide-line-num'): $table.addClass('hide-line-num');
                    this.updateTableHead();
                });
                
                this.listenTo(this.model.report.entry.content, 'change:display.events.type', function(model, value) {
                    this.showHideRowNum();
                    this.updateTableHead();
                });
                
                this.listenTo(this.model.report.entry.content, 'change:display.events.list.wrap', function() {
                    this.updateTableHead();
                });
                
                this.listenTo(this.model.result.results, 'reset', function() {
                    if (!this.model.state.get('isModalized')) {
                        this.updateTableHead();
                    }
                });
               
                this.listenTo(this.children.body, 'rows:pre-remove', function() { this.$el.css('minHeight', this.$el.height()); });
                this.listenTo(this.children.body, 'rows:added', function() { this.$el.css('minHeight', ''); });
                this.$el.on('elementResize', function(e) {
                    this.invalidateReflow();
                }.bind(this));
            },
            deactivate: function(options) {
                if (!this.active) {
                    return BaseView.prototype.deactivate.apply(this, arguments);
                }
                
                //once delegates can easily cleanup dom they create we can remove this.
                this.$('.header-table-docked').remove();
                this.$el.off('elementResize');
                BaseView.prototype.deactivate.apply(this, arguments);
                return this;
            },
            isList: function() {
                return (this.model.report.entry.content.get('display.events.type') === 'list');
            },
            showHideRowNum: function() {
                var $table = this.$('#' + this.tableId),
                    hasRowNumbers = util.normalizeBoolean(this.model.report.entry.content.get('display.events.rowNumbers'));

                if(this.isList() && hasRowNumbers) {
                    $table.removeClass('hide-line-num');
                } else if(!this.isList() || !hasRowNumbers){
                    $table.addClass('hide-line-num');
                }
            },
            updateTableLabels: function() {
                var tableHeaders = ['Event'];
                if (this.isList()) {
                    if (this.model.result.results.length && this.model.result.results.at(0).get('_icon')) {
                        tableHeaders = ['Time', 'Icon', 'Event'];
                    } else {
                        tableHeaders = ['Time', 'Event'];
                    }
                }
                this.children.head.updateLabels(tableHeaders);                
            },
            updateTableHead: function() {
                this.updateTableLabels();
                if (this.children.tableDock) {
                    _.defer(this.children.tableDock.update.bind(this.children.tableDock));
                } else if (this.children.staticHead) {
                    // staggered defers to ensure scroll bar UI updates are flushed
                    // before subsequent dependent static head UI updates
                    _.defer(function(){
                        this.updateContainerHeight();
                        _.defer(function(){
                            this.children.staticHead.update();
                        }.bind(this));
                    }.bind(this));
                }
            },
            updateContainerHeight: function(height) {
                // use this during 'static' header mode to update vertical scroll bars.
                // If no height argument set, this maxes out table wrapper height to available window size
                if (height) {
                    this.$('> .vertical-scrolling-table-wrapper').css('height', height);
                } else {
                    this.$('> .vertical-scrolling-table-wrapper').css('max-height', $(window).height() - this.$el.offset().top);
                }
            },
            render: function() {
                this.$el.html(this.compiledTemplate({
                     addstatichead: !!this.children.staticHead,
                     tableId: this.tableId
                }));
                this.children.head.render().appendTo(this.$('#' + this.tableId));
                this.children.body.render().appendTo(this.$('#' + this.tableId));
                this.showHideRowNum();
                return this;
            },
            reflow: function() {
                this.updateTableHead();
                return this;
            },
            remove: function() {
                this.$el.off('elementResize');
                return BaseView.prototype.remove.apply(this, arguments);
            },
            template: '\
                <% if (addstatichead) { %>\
                    <div class="header-table-static"></div>\
                    <div class="vertical-scrolling-table-wrapper">\
                <% } %>\
                <table class="table table-chrome table-row-expanding events-results events-results-table" id="<%= tableId %>"></table>\
                <% if (addstatichead) { %>\
                    </div>\
                <% } %>\
            '
        });
    }
);
