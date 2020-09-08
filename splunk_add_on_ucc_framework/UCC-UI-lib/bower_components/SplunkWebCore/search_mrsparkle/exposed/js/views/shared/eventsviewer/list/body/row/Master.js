define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'views/Base',
        'views/shared/eventsviewer/list/body/row/SelectedFields',
        'views/shared/eventsviewer/shared/EventFields',
        'views/shared/eventsviewer/shared/RawField',
        'bootstrap.tooltip',
        'splunk.util',
        'util/console',
        'util/keyboard'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        BaseView,
        SelectedFieldsView,
        EventFieldsView,
        RawField,
        tooltip,
        splunkUtil,
        console,
        keyboard
    ){
        return BaseView.extend({
            moduleId: module.id,
            tagName: 'tr',
            className: 'tabbable-list-row',
            attributes: {
                tabindex: -1
            },
            /**
             * @param {Object} options {
             *      model: {
             *         event: <models.services.search.job.ResultsV2.results[i]>,
             *         result: <models.services.search.job.ResultsV2>,
             *         state: <models.Base>,
             *         summary: <models.services.searchjob.SummaryV2>,
             *         report: <models.services.SavedSearch>,
             *         searchJob: <models.Job>,
             *         application: <models.Application>
             *     },
             *     collection: {
             *         selectedFields: <collections.SelectedFields>,
             *         workflowActions: <collections.services.data.ui.WorkflowActions>
             *     },
             *     selectableFields: true|false,
             *     idx: <integer>,
             *     lineNum: <integer>,
             *     allowRowExpand: true|false,
             *     showWarnings: true|false,
             *     highlightExtractedTime: true|false (caution: will disable segmentation/drilldown)
             */
            initialize: function(){
                BaseView.prototype.initialize.apply(this, arguments);
                
                this.interaction = 'i' + this.options.idx;
                this.rowExpanded = 'r' + this.options.idx;
                this.showAllLines = 's' + this.options.idx;
                this.isPreviewEvent = this.model.event.isPreviewEvent();
                
                this.model.state.unset(this.showAllLines);

                this.children.raw = new RawField({
                    model: {
                        event: this.model.event,
                        state: this.model.state,
                        result: this.model.result,
                        report: this.model.report,
                        searchJob: this.model.searchJob,
                        application: this.model.application
                    },
                    idx: this.options.idx,
                    highlightExtractedTime: this.options.highlightExtractedTime,
                    clickFocus: this.options.clickFocus
                });

                this.children.selectedFields = new SelectedFieldsView({
                    model: {
                        event: this.model.event,
                        state: this.model.state,
                        result: this.model.result,
                        summary: this.model.summary,
                        application: this.model.application,
                        report: this.model.report,
                        searchJob: this.model.searchJob
                    },
                    collection: {
                        selectedFields: this.collection.selectedFields,
                        workflowActions: this.collection.workflowActions
                    },
                    rowExpanded: this.rowExpanded,
                    selectableFields: this.options.selectableFields,
                    idx: this.options.idx,
                    clickFocus: this.options.clickFocus
                });
            },
            startListening: function() {
                this.listenTo(this.model.state, this.interaction, function() {
                    this.model.state.set('modalizedRow', this.options.idx);
                });
                
                /*
                 * Our bus for communication from our grandparent regarding clicks on the
                 * modalization mask.
                 */
                this.listenTo(this.model.state, this.options.idx + '-collapse', function(model, value, options) {
                    if (this.isExpanded()) {
                        this.collapseState();
                    }
                });

                this.listenTo(this.model.state, 'change:' + this.showAllLines, function(model, value, options) {
                    this.eventFetch();
                    this.model.state.set('modalizedRow', this.options.idx);
                });

                //on change of the search string we should unmodalize
                this.listenTo(this.model.state, 'intentions-fetch', this.collapseState);
                
                this.listenTo(this.model.report.entry.content, 'change:display.events.type', this.manageListRawState);

                this.listenTo(this.model.state, this.options.idx + '-allLinesCollapse', this.scrollToRow);

                this.listenTo(this.model.state, this.options.idx + '-jsonCollapse', this.scrollToRow);
            },
            manageListRawState: function() {
                if (this.isList()) {
                    if (this.model.event.get('_icon')) {
                        this.$('td.col-icon').show();
                    }
                    this.$('td._time').show();
                    if (!this.children.selectedFields.active) {
                        this.children.selectedFields.activate().$el.show(); 
                    } else {
                        this.children.selectedFields.$el.show(); 
                    }
                } else {
                    this.children.selectedFields.deactivate().$el.hide(); 
                    this.$('td._time').hide();
                    this.$('td.col-icon').hide();
                }
            },
            events: {
                'click td.expands': function(e) {
                    this.expand();
                    e.preventDefault();
                },
                'click td._time': function(e) {
                    this.drilldown($(e.currentTarget), e);
                    e.preventDefault();
                },
                'keydown td.expands': function(e) {
                    if (e.which === keyboard.KEYS.ENTER) {
                        this.expand();
                        e.preventDefault();
                    }
                },
                'keydown td._time': function(e) {
                    if (e.which === keyboard.KEYS.ENTER) {
                        this.drilldown($(e.currentTarget), e);
                        /**
                         * SPL-87936
                         * ---------
                         * On keydown, the _time accelerator PopTart opens,
                         * and simultaneously, focus is given to the close
                         * button, which is an anchor tag. Then, on keyup,
                         * FF/IE interperets it as a click event on the
                         * currently active element (now the close button),
                         * and therefore immediately closes the PopTart.
                         * This e.preventDefault() ensures that FF/IE does
                         * not interperet a click event on the PopTart's
                         * close button as soon as it's opened.
                         */
                        e.preventDefault();
                    }
                },
                'keydown': function(e) {
                    var keyCode = e.which;

                    if (keyCode === keyboard.KEYS.TAB && this.model.state.get('modalizedRow') === this.options.idx) {
                        keyboard.handleCircularTabbing(this.$el, e);
                    }
                }
            },
            drilldown: function($target, e) {
                var $anchor = $target.find('span.formated-time'),
                    data = $anchor.data(),
                    timeIso, epoch;
                
                if (data.timeIso) {
                    timeIso = data.timeIso;
                    epoch = splunkUtil.getEpochTimeFromISO(timeIso);
                    this.model.state.trigger('drilldown', {
                        noFetch: true, 
                        data: {
                            'dispatch.earliest_time': epoch,
                            'dispatch.latest_time': '' + (parseFloat(epoch) + 1)
                        },
                        event: e,
                        _time: timeIso,
                        idx: this.options.idx,
                        type: "time",
                        $target: $target,
                        $anchor: $anchor,
                        stateModel: this.model.state
                    });                    
                }                
            },
            eventFieldsFactory: function() {
                this.children.eventFields = new EventFieldsView({
                    model: {
                        event: this.model.event,
                        state: this.model.state,
                        result: this.model.result,
                        summary: this.model.summary,
                        application: this.model.application,
                        report: this.model.report,
                        searchJob: this.model.searchJob
                    },
                    collection: {
                        selectedFields: this.collection.selectedFields,
                        workflowActions: this.collection.workflowActions
                    },
                    selectableFields: this.options.selectableFields,
                    allowRowExpand: this.options.allowRowExpand,
                    idx: this.options.idx,
                    swappingKey: this.swappingKey,
                    showAllLines: this.showAllLines,
                    clickFocus: this.options.clickFocus
                });
                //remove and put into another function
                this.children.eventFields.render().insertAfter(this.$('.event').find(this.children.raw.el));
            },
            expand: function(options) {
                if (!this.options.allowRowExpand || this.isPreviewEvent) {
                    console.warn('Cannot expand row with allowRowExpand=' + this.options.allowRowExpand + 
                        ' or isPreviewEvent=' + this.options.isPreviewEvent);
                    return;
                }
                if (!this.children.eventFields) {
                    this.eventFieldsFactory();
                }
                (this.isExpanded()) ? this.collapseState(): this.expandState();
            },
            eventFetch: function(showAll) {
                var postProcessSearch = '',
                    sortingSearch = this.model.report.getSortingSearch();
                if (this.model.report.entry.content.get('display.general.search.type') === 'postprocess') {
                    postProcessSearch = (this.model.report.entry.content.get('display.general.search.postProcessSearch') || '') + (sortingSearch || '');
                }
                this.model.event.set(this.model.event.idAttribute, this.model.searchJob.entry.links.get('events'));
                this.model.event.fetch({
                    data: $.extend(true, this.model.application.toJSON(), {
                        isRt: this.model.searchJob.isRealtime(),
                        search: postProcessSearch || sortingSearch,
                        earliest_time: this.model.report.entry.content.get('display.events.timelineEarliestTime'),
                        latest_time: this.model.report.entry.content.get('display.events.timelineLatestTime'),
                        segmentation:  this.model.report.entry.content.get('display.events.list.drilldown'),
                        max_lines: this.model.state.get(this.showAllLines) ? 0: this.model.report.getNearestMaxlines(),
                        offset: this.model.result.offset(this.options.idx) || 0,
                        oid: this.model.application.get('oid')
                    })     
                });
            },
            remove: function() {
                // destroy element's tooltip if any
                if (this.warningTooltip && this.warningTooltip.length > 0) {
                    this.warningTooltip.tooltip('destroy');
                }
                if (this.previewEventTooltip && this.previewEventTooltip.length > 0) {
                    this.previewEventTooltip.tooltip('destroy');
                }
                return BaseView.prototype.remove.apply(this, arguments);
            },
            isExpanded: function() {
                return this.model.state.get(this.rowExpanded);
            },
            expandState: function() {
                // Ensure no rows are expanded
                var currentlyExpandedRow = this.model.state.get('currentlyExpandedRow');
                if (currentlyExpandedRow) {
                    currentlyExpandedRow.collapseState();
                }
                this.model.state.set('currentlyExpandedRow', this);

                this.eventFetch();
                this.model.state.set(this.rowExpanded, true);
                this.model.state.set('modalizedRow', this.options.idx);
                this.children.eventFields && this.children.eventFields.activate().$el.show();
                this.isList() && this.children.selectedFields.$el.hide();
                this.toggleArrow(true);
            },
            collapseState: function() {
                // Notify that no rows are expanded
                this.model.state.set('currentlyExpandedRow', null);

                this.model.state.set(this.rowExpanded, false);
                this.model.state.set('modalizedRow', false);
                this.children.eventFields && this.children.eventFields.deactivate().$el.hide();
                this.scrollToRow();
                this.isList() && this.children.selectedFields.activate().$el.show();
                this.toggleArrow(false);
            },
            scrollToRow: function() {
                var eventControlsHeight = $('.events-controls-inner').innerHeight(),
                    // Sometimes one of the two tableheads has a height of 0, so we'll grab the nonzero one
                    tableHeadHeight = $($('.shared-eventsviewer-shared-tablehead')[0]).height() ?
                        $($('.shared-eventsviewer-shared-tablehead')[0]).height() :
                        $($('.shared-eventsviewer-shared-tablehead')[1]).height(),
                    visibleTop = $(window).scrollTop() + eventControlsHeight + tableHeadHeight,
                    visibleBottom = visibleTop + $(window).height(),
                    rowTop = this.$el.offset().top;

                if (rowTop < visibleTop || rowTop > visibleBottom) {
                    $('html, body').animate({
                        scrollTop: rowTop - eventControlsHeight - tableHeadHeight
                    }, 350);
                }
            },
            isList: function() {
                return (this.model.report.entry.content.get('display.events.type') === 'list');
            },
            toggleArrow: function(open) {
                var $arrow =  this.$('td.expands > a > i').removeClass('icon-triangle-right-small icon-triangle-down-small');
                $arrow.addClass((open) ? 'icon-triangle-down-small':  'icon-triangle-right-small');
            },
            render: function() {
                //Destroy previous tooltips
                this.warningTooltip && this.warningTooltip.tooltip('destroy');
                this.previewEventTooltip && this.previewEventTooltip.tooltip('destroy');

                var isList = this.isList();

                this.$el.html(this.compiledTemplate({
                    $: $,
                    event: this.model.event,
                    iconPath: this.model.event.getIconPath(this.model.application.get('root'), this.model.application.get('locale')),
                    lineNum: this.options.lineNum,
                    application: this.model.application, //ghetto and inconsistent 
                    expanded: this.isExpanded(),
                    isList: isList,
                    formattedTime: this.model.event.formattedTime(),
                    colorClass: this.model.event.getEventTypeColor(),
                    allowRowExpand: this.options.allowRowExpand, //misuse by data model
                    isPreviewEvent: this.isPreviewEvent,
                    showWarnings: this.options.showWarnings,
                    warningTexts: this.model.event.getWarningTexts()
                }));

                // add warnings tooltip only if enabled and there are warnings associated with the event
                if (this.options.showWarnings && !_.isEmpty(this.model.event.getWarningTexts())) {
                    this.warningTooltip = this.$el.find('.tooltip-right').tooltip({
                        animation: false,
                        html: true,
                        container: 'body',
                        placement: 'right'
                    });
                }

                if (this.isPreviewEvent) {
                    this.previewEventTooltip = this.$el.find('.expands.disabled').tooltip({
                        animation: false,
                        container: 'body',
                        title: _('Event information is not available because the events are still being scanned.').t()
                    });
                }

                this.children.raw.render().appendTo(this.$('.event'));
                this.children.selectedFields.render().appendTo(this.$('.event'));

                if (!isList) {
                    this.children.selectedFields.deactivate().$el.hide();
                }

                return this;
            },
            template: '<!--Line breaks intentionally removed to fix obscure IE9 bug with tables-->' +
                '<% if (allowRowExpand) { %>' +
                '<td tabindex="0" class="expands <%- colorClass %> <% if (isPreviewEvent) { %> disabled <% } %>">' +
                    '<a><i class="icon-triangle-<%- expanded ? "down" : "right" %>-small"></i></a>' +
                '</td>' +
                '<% } %>' +
                '<td class="line-num"><span><%- lineNum %></span></td>' +
                '<% if (showWarnings) { %>' +
                    '<td class="col-warnings" tabindex="0">' +
                    '<% if (warningTexts && warningTexts.length > 0) {' +
                        'var warningTextsHTML = _(warningTexts).map(function(warningText) { return "<li>" + _.escape(_(warningText).t()) + "</li>"; }).join("");' +
                        'warningTextsHTML = "<ul class=' +'tooltip-warnings events-viewer-tooltip' +'>" + warningTextsHTML + "</ul>"; %>' +
                        '<i class="icon-alert tooltip-right" data-title="<%= warningTextsHTML%>"></i>' +
                        '<span><%= warningTextsHTML%></span>' +
                    '<% } %>' +
                    '</td>' +
                '<% } %>' +
                '<td class="_time" <% if (!isList) { %> style="display:none" <%}%> tabindex="0">' +
                    '<span class="formated-time" data-time-iso="<%- event.get("_time") %>">' +
                    '<% if(application.get("locale").indexOf("en") > -1){ %>' +
                         '<span><%- $.trim(formattedTime.slice(0, formattedTime.indexOf(" "))) %></span>' +
                         '<br>' +
                         '<span><%- $.trim(formattedTime.slice(formattedTime.indexOf(" "))) %></span>' +
                    '<% } else { %>' +
                         '<%- formattedTime %>' +
                    '<% } %>' +
                    '</span>' +
                '</td>' +
                '<td class="col-icon" <% if (!isList || !iconPath) { %> style="display:none" <%}%> tabindex="0">' +
                   '<em class="icon"><img src="<%= iconPath %>"/></em>' +
                '</td>' +
                '<td class="event"></td>'
        });
    }
);
