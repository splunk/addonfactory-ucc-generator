define(
    [
        'jquery',
        'module',
        'underscore',
        'splunk.util',
        'jquery.ui.draggable',
        'views/Base',
        'views/shared/delegates/Modalize',
        'views/shared/delegates/TableDock',
        'views/shared/delegates/TableHeadStatic',
        'views/shared/eventsviewer/table/TableHead',
        'views/shared/eventsviewer/table/body/Master',
        'jquery.resize'
    ],
    function($, module, _, util, jquery_ui_draggable, BaseView, Modalize, TableDock, TableHeadStatic, TableHeadView, TableBodyView, resize){
        return BaseView.extend({
            moduleId: module.id,
            /**
             * @param {Object} options {
             *     model: {
             *         result: <models.services.search.job.ResultsV2>,
             *         summary: <model.services.search.job.SummaryV2>,
             *         searchJob: <models.Job>,
             *         report: <models.services.SavedSearch>,
             *         application: <models.Application>,
             *         state: <models.BaseV2> (optional)
             *     },
             *     collection: {
             *         selectedFields: <collections.SelectedFields>
             *         workflowActions: <collections.services.data.ui.WorkflowActions> 
             *     },
             *     selectableFields: true|false,
             *     sortableFields: true|false (default true),
             *     headerMode: dock|static|none (default),
             *     headerOffset: integer (only applicable with headerMode=dock),
             *     allowRowExpand: true|false,
             *     allowModalize: true|false,
             *     showWarnings: true|false
             */
            className: 'scrolling-table-wrapper',
            initialize: function(){
                BaseView.prototype.initialize.apply(this, arguments);
                
                _.defaults(this.options, {sortableFields: true});
                
                this.tableId = this.cid + '-table';

                this.drag = {};
                
                this.collection.intersectedFields = this.collection.selectedFields.deepClone();                

                this.children.modalize = new Modalize({
                    el: this.el,
                    tbody: '#' + this.tableId + ' > tbody',
                    secondaryRowSelector: '.field-row'
                });
                this.children.head = new TableHeadView({
                    model: {
                        report: this.model.report,
                        searchJob: this.model.searchJob
                    },
                    collection: { 
                        intersectedFields: this.collection.intersectedFields,
                        selectedFields: this.collection.selectedFields
                    },
                    selectableFields: this.options.selectableFields,
                    sortableFields: this.options.sortableFields,
                    allowRowExpand: this.options.allowRowExpand,
                    showWarnings: this.options.showWarnings,
                    isRealTime: this.model.searchJob.entry.content.get('isRealTimeSearch')
                });

                this.children.body = new TableBodyView({
                    model: {
                        result: this.model.result,
                        state: this.model.state,
                        summary: this.model.summary,
                        searchJob: this.model.searchJob,
                        report: this.model.report,
                        application: this.model.application
                    },
                    collection: { 
                        workflowActions: this.collection.workflowActions,
                        intersectedFields: this.collection.intersectedFields,
                        selectedFields: this.collection.selectedFields
                    },
                    selectableFields: this.options.selectableFields,
                    allowRowExpand: this.options.allowRowExpand,
                    showWarnings: this.options.showWarnings
                });

                  
                if (this.options.headerMode==='dock') {
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
            startListening: function() {
                this.$el.on('elementResize', function(e) {
                    this.invalidateReflow();
                }.bind(this));
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
                });

                /*
                * Again, promiscuous in the sense that we have intimate knowledge of the key,
                * allowing us to fire change that only one observer will acknowledge
                */
                this.listenTo(this.children.modalize, 'unmodalize', function(idx) {
                    this.model.state.set('modalizedRow', false);
                    this.model.state.set('r'+idx, false);
                    this.updateIntersectedFields();
                });

                this.listenTo(this.model.state, 'init-draggable', this.initDraggable);
               
                this.listenTo(this.collection.selectedFields, 'reset', function(collection, options) {
                    this.onSelectedFieldsChange(undefined, collection, options);
                });

                this.listenTo(this.collection.selectedFields, 'add remove', this.onSelectedFieldsChange());

                this.listenTo(this.model.result.results, 'reset', function() {
                    if (!this.model.state.get('isModalized')) {
                        this.updateIntersectedFields();
                    }
                });

                this.listenTo(this.model.report.entry.content, 'change:display.events.rowNumbers', this.showHideRowNum);
                
                this.listenTo(this.model.report.entry.content, 'change:display.events.table.wrap', this.updateTableHead);

                this.listenTo(this.model.report.entry.content, 'change:display.page.search.showFields', this.updateTableHead);
                
                if (this.options.selectableFields && this.children.tableDock) {
                    this.listenTo(this.children.tableDock, 'updated', this.initDraggable);
                }
                
                this.listenTo(this.children.body, 'rows:pre-remove', function() { this.$el.css('minHeight', this.$el.height()); });
                this.listenTo(this.children.body, 'rows:added', function() { 
                    this.$el.css('minHeight', '');
                    this.updateTableHead(); 
                });
            },
            activate: function(options) {
                options = options || {};
                options.startListening = false;
                if (this.active) {
                    return BaseView.prototype.activate.apply(this, arguments);
                }
                this.stopListening();
                this.startListening();
                this.updateIntersectedFields();
                this.showHideRowNum();
                return BaseView.prototype.activate.call(this, options);
            },
            deactivate: function(options) {
                if (!this.active) {
                    return BaseView.prototype.deactivate.apply(this, arguments);
                }
                
                //once delegates can easily cleanup dom they create we can remove this.
                this.$('.header-table-docked').remove();

                BaseView.prototype.deactivate.apply(this, arguments);
                $(this.$el).off('elementResize');
                return this;
            },
            onSelectedFieldsChange: function (model, collection, options) {
                if (this.model.state.get('isModalized')) {
                    return;
                }
                if (model && (model.get('name') === this.model.report.entry.content.get('display.events.table.sortColumn'))) {
                    this.model.report.entry.content.set({
                        'display.events.table.sortColumn': '',
                        'display.events.table.sortDirection': ''
                    }); 
                }
                this.updateIntersectedFields();
                this.children.modalize.debouncedCleanup();
            },
            updateIntersectedFields: function() {
                var fields = [], models = [];
                if(!!this.model.result.results.length){
                    _.each(_(this.collection.selectedFields.pluck('name')).intersection(this.model.result.fields.pluck('name')), function(value) {
                        models.push({name: value});
                    });
                    this.collection.intersectedFields.reset(models); 
                }
            },
            showHideRowNum: function() {
                var $table = this.$('#' + this.tableId),
                    hasRowNumbers = util.normalizeBoolean(this.model.report.entry.content.get('display.events.rowNumbers'));

                if (hasRowNumbers) {
                    $table.removeClass('hide-line-num');
                } else {
                    $table.addClass('hide-line-num');
                }
            },
            remove: function() {
                BaseView.prototype.remove.apply(this, arguments);
                $(this.$el).off('elementResize');
            },
            reflow: function() {
                if (this.isAddedToDocument() && this.children.head.$el.is(':visible')) {
                    this.updateTableHead();
                }
            },
            style: function() {
                var maxWidth=this.$el.width();
                return '#' + this.tableId + " .table-expanded{max-width:" + (maxWidth ? maxWidth - 80 : 500) + "px}";
            },
            render: function() {
                this.$el.html(this.compiledTemplate({
                     hidelinenums: !util.normalizeBoolean(this.model.report.entry.content.get("display.events.rowNumbers")),
                     addstatichead: !!this.children.staticHead,
                     tableId: this.tableId
                }));
                this.children.head.render().appendTo(this.$('#' + this.tableId));
                this.children.body.render().appendTo(this.$('#' + this.tableId));
                return this;
            },
            initDraggable: function() {
                if (this.options.selectableFields) {
                    this.drag.$theads = this.$el.find('.reorderable');
                    //TO DO!!!!!!!!
                    //1) Needs to add draggables to the dockable header;
                    //2) Needs to get called after table header, body and header dock are fully rendered;
                    this.drag.$theads.draggable({
                        helper: this.dragHelper.bind(this),
                        start: this.startDrag.bind(this),
                        stop: this.stopDrag.bind(this),
                        drag: this.dragged.bind(this), 
                        containment: this.el,
                        distance: 5,
                        scroll: true
                    });
                }
            },
            updateTableHead: function() {
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
            dragHelper: function(e, ui) {
                this.drag.$th = $(e.currentTarget).addClass('moving');
                this.drag.thOffsetTop = this.drag.$th.offset().top;
                this.drag.containerLeft = this.$el.position().left;
                this.drag.$insertionCursor = this.$('.table-insertion-cursor');
                    
                this.drag.$insertionCursor.show();
                this.drag.$helper = $("<div class='reorderable-helper'><span class='reorderable-label'>" + this.drag.$th.text() + "</span></div>").appendTo(this.$el);
                this.drag.$helper.width(this.drag.$th.width());
                this.drag.$helper.css('marginRight', -this.drag.$th.width() + 'px');
                this.findInsertionPoints();
                return this.drag.$helper[0];
            },
            findInsertionPoints: function() {
                this.drag.insertionPoints = [];
                var $headers = this.$('#' + this.tableId + ' > thead > tr > th.reorderable');
                var originalEl = $headers.filter('[data-name="' + this.drag.$th.data('name') + '"]')[0]; //this compensates for the possibility of dragging the docked clone
                var originalIndex = this.drag.originalIndex = $headers.index(originalEl);
                
                $headers.each(function(index, el) {
                    var $el = $(el),
                        left = $el.position().left + this.$el.scrollLeft(); 
                        
                    if (index < originalIndex ) { 
                        this.drag.insertionPoints.push({left: left, index: index});
                    } else if (index == originalIndex ) { 
                        this.drag.insertionPoints.push({left: left, index: index});
                        this.drag.insertionPoints.push({left:left + $el.outerWidth(), index: index});
                    } else {
                        this.drag.insertionPoints.push({left:left + $el.outerWidth(), index: index});
                    }
                }.bind(this));
            },
            findClosestInsertion: function(e, ui) {
                if(ui.helper.offset().top - this.drag.thOffsetTop > 100) {
                    return -1;
                } else {
                    var closest = -1,
                        closestDistance = 10000000,
                        cursorLeft = (e.pageX - this.drag.containerLeft) + this.$el.scrollLeft();
                        
                        $.each(this.drag.insertionPoints, function name(index, point) {
                            var distance = Math.abs(point.left - cursorLeft);
                            if (distance < closestDistance) {
                                closest = point;
                                closestDistance = distance;
                            }   
                        });
                   return closest;
                }
            },
            startDrag: function(e, ui){
                    //TO DO!!!!!!!!
                    //need to stop rendering;
            }, 
            stopDrag: function(e, ui){
                var closest = this.findClosestInsertion(e, ui),
                    movingModel = this.collection.selectedFields.findWhere({'name': this.drag.$th.data().name});
                if (closest == -1) {
                    this.collection.selectedFields.remove(movingModel);
                } else if (closest.index !== this.drag.originalIndex) {
                    this.collection.selectedFields.remove(movingModel, {silent: true});
                    this.collection.selectedFields.add(movingModel, {at: closest.index});
                }
                this.drag.$th.removeClass('moving');
                this.drag.$insertionCursor.hide();
            },
            dragged: function(e, ui) {
                var closest = this.findClosestInsertion(e, ui);
                if (closest === -1) { 
                    this.drag.$insertionCursor.hide();
                    ui.helper.addClass("reorderable-remove");
                } else {
                    this.drag.$insertionCursor.show().css('left', closest.left);
                    ui.helper.removeClass("reorderable-remove");
                }
            },
            template: '\
                <% if (addstatichead) { %>\
                    <div class="header-table-static"></div>\
                    <div class="vertical-scrolling-table-wrapper">\
                <% } %>\
                <table class="table table-chrome table-striped <% if(hidelinenums){ %> hide-line-num <% } %> table-row-expanding events-results events-results-table" id="<%= tableId %>"></table>\
                <% if (addstatichead) { %>\
                    </div>\
                <% } %>\
                <div class="table-insertion-cursor"></div>\
            '
        });
    }
);
