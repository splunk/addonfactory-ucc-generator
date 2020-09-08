define(
    [
        'jquery',
        'underscore',
        'module',
        'keyboard/SearchModifier',
        'views/Base',
        'bootstrap.tooltip',
        'splunk.util',
        'util/console',
        'util/keyboard'
    ],
    function($, _, module, KeyboardSearchModifier, BaseView, tooltip, splunkUtil, console, keyboard) {
        return BaseView.extend({
            moduleId: module.id,
            tagName: 'tr',
            className: 'tabbable-table-primary-row',
            attributes: {
                tabindex: -1
            },
            /**
             * @param {Object} options {
             *     model: { 
             *         event: <models.services.search.job.Results.results[i]>,
             *         result: <models.services.search.job.Results>,
             *         searchJob: <models.Job>,
             *         report: <models.services.SavedSearch>,
             *         summary: <model.services.search.job.Summary>,
             *         application: <models.Application>
             *     },
             *     collection: {
             *         selectedFields: <collections.SelectedFields>
             *     },
             *     idx: <integer>,
             *     lineNum: <integer>,
             *     allowRowExpand: true|false,
             *     showWarnings: true|false
             *  }     
             */
            initialize: function(){
                BaseView.prototype.initialize.apply(this, arguments);
                this.$el.addClass((!!(this.options.idx%2))?'even':'odd');
                
                this.keyboardSearchModifier = new KeyboardSearchModifier();
                
                //suite of namespaced keys
                this.rowExpanded = 'r' + this.options.idx;
                this.interaction = 'i' + this.options.idx;
                this.showAllLines = 's' + this.options.idx;
            },
            startListening: function() {
                /*
                 * Our bus for communication from our grandparent regarding clicks on the
                 * modalization mask.
                 */
                this.listenTo(this.model.state, 'change:' + this.rowExpanded, function(model, value, options) {
                    if (!value) {
                        this.collapseState();
                    }
                });
                 
                 /*
                  * Columns in the table are dynamic based on the users 
                  * field selection.
                  */
                this.listenTo(this.collection.selectedFields, 'reset add remove', this.render);

                this.listenTo(this.model.report.entry.content, 'change:display.events.table.drilldown', this.render);

                this.listenTo(this.model.report.entry.content, 'change:display.prefs.events.offset', this.collapseState);
                this.listenTo(this.model.report.entry.content, 'change:display.events.list.wrap', function() {
                    var wrap = splunkUtil.normalizeBoolean(this.model.report.entry.content.get("display.events.list.wrap")),
                        $cells = this.$('a.field-val').parents('td');
                   (wrap) ? $cells.removeClass('no-wrap'):  $cells.addClass('no-wrap');
                });
            },
            events: {
                'click td.expands': function(e) {
                    this.expand();
                },
                'keydown td.expands': function(e) {
                    if (e.which === keyboard.KEYS.ENTER) {
                        this.expand();
                        e.preventDefault();
                    }
                },
                'click td._time-drilldown > a': function(e) {
                    e.preventDefault(); //handeld by the cell.
                },
                'click td._time-drilldown': function(e) {
                    this.timeAndOneValueDrilldown(e);
                },
                'click td.one-value-drilldown > a.field-val': function(e) {
                    e.preventDefault(); //handeld by the cell.
                },
                'click td.one-value-drilldown': function(e) {
                    this.timeAndOneValueDrilldown(e);
                },
                'click td.multi-value-drilldown > a.field-val': function(e) {
                    this.drilldown(e);
                    e.preventDefault();
                },
                // do not listen to keydown td.multi-value-drilldown since the anchor handels it.
                'keydown td:not(.expands, .multi-value-drilldown)': function(e) { 
                    if (e.which === keyboard.KEYS.ENTER) {
                        this.timeAndOneValueDrilldown(e);
                        //added preventDefault for SPL-87936
                        e.preventDefault();
                    }
                },
                'keydown': function(e) {
                    var keyCode = e.which;
                    
                    if (keyCode === keyboard.KEYS.TAB && this.model.state.get('modalizedRow') === this.options.idx) {
                        keyboard.handleCircularTabbing([this.$el, this.$el.next()], e);
                    }
                }
            },
            timeAndOneValueDrilldown: function(e) {
                if (splunkUtil.normalizeBoolean(this.model.report.entry.content.get('display.events.table.drilldown'))){
                    var $target = $(e.currentTarget),
                        $anchor = $target.find('a');
                        this.drilldown(e, { $target: $target, $anchor: $anchor });
                }
            },
            expand: function(options) {
                if (!this.options.allowRowExpand || this.options.isPreviewEvent) {
                    console.warn('Cannot expand row with allowRowExpand=' + this.options.allowRowExpand +
                        ' or isPreviewEvent=' + this.options.isPreviewEvent);
                    return;
                }
                (this.isExpanded()) ? this.collapseState(): this.expandState();
            },
            isExpanded: function() {
                return this.model.state.get(this.rowExpanded);
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
            debouncedRemove: function() {
                this.model.state.set(this.pendingRemove, true);
                BaseView.prototype.debouncedRemove.apply(this, arguments);
                return this;
            },
            drilldown: function(e, options) {
                options = options || {};
                var $target = options.$target || $(e.currentTarget),
                    $anchor = options.$anchor,
                    payload = {
                        $target: $target,
                        $anchor: $anchor,
                        stateModel: this.model.state,
                        event: e,
                        idx: this.options.idx
                    },
                    data = $anchor ? $anchor.data() : $target.data(),
                    timeIso, epoch;
                
                
                
                if (data.timeIso) {
                    timeIso = data.timeIso;
                    epoch = splunkUtil.getEpochTimeFromISO(timeIso);
                    
                    payload = $.extend(true, {
                            data: {
                                'dispatch.earliest_time': epoch,
                                'dispatch.latest_time': '' + (parseFloat(epoch) + 1)
                            },
                            noFetch: true,
                            event: e,
                            _time: timeIso,
                            type: 'time'
                        }, payload);
                } else {
                    payload = $.extend(true, {
                            data: {
                                q: this.model.report.entry.content.get('search'),
                                negate: this.keyboardSearchModifier.isNegation(e),
                                action: 'fieldvalue', 
                                field: data.name,
                                value: $.trim($target.text()),
                                app: this.model.application.get('app'),
                                owner: this.model.application.get('owner')
                            },
                            type: 'fieldvalue'
                        }, payload);
                }
                                
                this.model.state.trigger('drilldown', payload);
            },
            expandState: function() {
                // Ensure no rows are expanded
                var currentlyExpandedRow = this.model.state.get('currentlyExpandedRow');
                if (currentlyExpandedRow) {
                    currentlyExpandedRow.collapseState();
                }
                this.model.state.set('currentlyExpandedRow', this);

                this.model.state.set(this.rowExpanded, true);
                this.model.state.set('modalizedRow', this.options.idx);
                this.toggleArrow(true);
            },
            collapseState: function() {
                // Notify that no rows are expanded
                this.model.state.set('currentlyExpandedRow', null);

                this.model.state.set(this.rowExpanded, false);
                this.model.state.set('modalizedRow', false);
                this.toggleArrow(false);
            },
            toggleArrow: function(open) {
                var $arrowCell = this.$('.expands'),
                    $arrow =  $arrowCell.find('a > i').removeClass('icon-triangle-right-small icon-triangle-down-small');
                $arrow.addClass((open) ? 'icon-triangle-down-small':  'icon-triangle-right-small');
                $arrowCell.attr('rowspan', (open) ? 2: 1);
            },
            render: function() {
                //Destroy previous tooltips
                this.warningTooltip && this.warningTooltip.tooltip('destroy');
                this.previewEventTooltip && this.previewEventTooltip.tooltip('destroy');

                var root = this.el;
                //rows are read only (innerHTML) for ie
                this.$el.find('> td').each(function(key, element) {
                    root.removeChild(element);
                });

                this.$el.append(this.compiledTemplate({
                    $: $,
                    _:_,
                    event: this.model.event,
                    lineNum: this.options.lineNum,
                    expanded: this.model.state.get(this.rowExpanded),
                    drilldown: splunkUtil.normalizeBoolean(this.model.report.entry.content.get('display.events.table.drilldown')),
                    application: this.model.application,
                    selectedFields: this.collection.selectedFields,
                    colorClass: this.model.event.getEventTypeColor(),
                    formattedTime: this.model.event.formattedTime(),
                    allowRowExpand: this.options.allowRowExpand,
                    isPreviewEvent: this.options.isPreviewEvent,
                    showWarnings: this.options.showWarnings,
                    warningTexts: this.model.event.getWarningTexts(),
                    wrap: splunkUtil.normalizeBoolean(this.model.report.entry.content.get('display.events.table.wrap'))
                }));

                // add warnings tooltip only if enabled and there are warnings associated with the event
                if (this.options.showWarnings && !_.isEmpty(this.model.event.getWarningTexts())) {
                    this.warningTooltip = this.$el.find('.tooltip-right').tooltip({
                        animation: false,
                        html: true,
                        container: '.shared-eventsviewer', // assumes knowledge of container class - needed for css scoping
                        placement: 'right'
                    });
                }

                if (this.options.isPreviewEvent) {
                    this.previewEventTooltip = this.$el.find('.expands.disabled').tooltip({
                        animation: false,
                        html: true,
                        container: 'body',
                        title: _('Event information is not available because the events are still being scanned.').t()
                    });
                }

                return this;
            },
            template: '<!--Line breaks intentionally removed to fix obscure IE9 bug with tables and SPL-102688-->' +
                '<% if (allowRowExpand) { %>' +
                    '<td tabindex="0" <%if(expanded) {%>rowspan=2<%}%> class="expands <%- colorClass %><% if (isPreviewEvent) { %> disabled <% } %>">' +
                        '<a><i class="icon-triangle-<%- expanded ? "down" : "right" %>-small"></i></a>' +
                    '</td>' +
                '<% } %>' +
                '<td class="line-num"><span><%- lineNum %></span></td>' +
                '<% if (showWarnings) { %>' +
                    '<td class="col-warnings" tabindex="0">' +
                    '<% if (warningTexts && warningTexts.length > 0) {' +
                        'var warningTextsHTML = _(warningTexts).map(function(warningText) { return "<li>" + _.escape(_(warningText).t()) + "</li>"; }).join("");' +
                        'warningTextsHTML = "<ul class=\'tooltip-warnings\'>" + warningTextsHTML + "</ul>"; %>' +
                        '<i class="icon-alert tooltip-right" data-title="<%= warningTextsHTML%>"></i>' +
                        '<span><%= warningTextsHTML%></span>' +
                    '<% } %>' +
                    '</td>' +
                '<% } %>' +
                '<td class="_time <%= drilldown ? "_time-drilldown" : "" %>" tabindex="0">' +
                    '<% if(drilldown) { %>' +
                        '<a data-time-iso="<%- event.get("_time") %>">' +
                    '<% } else { %>' +
                        '<span data-time-iso="<%- event.get("_time") %>">' +
                    '<% } %>' +
                        '<% if(application.get("locale").indexOf("en") > -1){ %>' +
                             '<span><%- $.trim(formattedTime.slice(0, formattedTime.indexOf(" "))) %></span>' +
                             '<br>' +
                             '<span><%- $.trim(formattedTime.slice(formattedTime.indexOf(" "))) %></span>' +
                        '<% } else { %>' +
                             '<%- formattedTime %>' +
                        '<% } %>' +
                    '<% if(drilldown) { %>  </a>  <% } else { %> </span> <% } %>' +
                '</td>' +
                '<% selectedFields.each(function(model) { %>' +
                    '<% var fields = event.get(model.get("name")); %>' +
                    '<% if (drilldown) { %>' +
                        '<% var isMultiValue = fields && fields.length > 1; %>' +
                        '<td class="<% if(!wrap) { %>no-wrap<% } %> <%= isMultiValue ? "multi-value-drilldown" : ""  %> <%= fields && fields.length == 1 ? "one-value-drilldown" : ""  %>"  tabindex="0">' +
                            '<% _(fields).each(function(field) { %>' +
                                '<a class="field-val" data-name="<%- model.get("name") %>" <% if (isMultiValue) { %>href="#" <% } %>>' +
                                    '<%- field %>' +
                                '</a>' +
                            '<% }) %>' +
                        '</td>' +
                    '<% } else { %>' +
                        '<td class="<% if(!wrap) { %>no-wrap<% } %>"  tabindex="0"><% _(fields).each(function(field) { %><span class="field-val" data-name="<%- model.get("name") %>"><%- field %></span><% }) %></td>' +
                    '<% } %>' +
                '<% }) %>'
        });
    }
);  
