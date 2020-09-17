define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'models/services/search/IntentionsParser'
    ],
    function(
        $,
        _,
        module,
        BaseView,
        IntentionsParser
    )
    {
        return BaseView.extend({
            moduleId: module.id,
            tagName: 'tr',
            className: 'more-info selected',
            /**
             * @param {Object} options {
             *      model:
             *         field: <model.services.search.job.SummaryV2.field>,
             *         summary: <model.services.search.job.SummaryV2>,
             *         searchJob: <models.Job>,
             *         report: <models.services.SavedSearch>,
             *         application: <models.Application>
             *     },
             *     expandedField: <fieldname_of_expanded_row>,
             *     index: <index_of_the_row> 
             * }
             */
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.$el.addClass((this.options.index % 2) ? 'odd' : 'even');
                this.model.intentionsParser = new IntentionsParser();
                this.rowExpanded = 'rowExpanded' + this.options.index;
                this.activate();
            },
            startListening: function() {
                this.listenTo(this.model.intentionsParser, 'change', function() {
                    var search = this.model.intentionsParser.fullSearch();
                    if(this.model.intentionsParser.has('visualization')) {
                        this.model.report.entry.content.set({
                            'search': search, 
                            'display.general.type': 'visualizations',
                            'display.visualizations.charting.chart': this.model.intentionsParser.get('visualization')
                        });
                    } else {
                        this.model.report.entry.content.set('search', search);
                    }
                    this.model.report.trigger('eventsviewer:drilldown');
                });
                this.listenTo(this.model.state, 'change:'+ this.rowExpanded, function() {
                    this.render();
                    this.model.state.get(this.rowExpanded) ?
                            this.$el.show():
                            this.$el.hide();
                });
            },
            activate: function(options) {
                if (this.active) {
                    return BaseView.prototype.activate.apply(this, arguments);
                }
                (this.options.expandedField === this.model.field.get('name')) ?
                    this.$el.css('display', ''):
                    this.$el.css('display', 'none');

                return BaseView.prototype.activate.apply(this, arguments);
            },
            events: {
                'click .report-accelerators > a[data-field]': function(e) {
                    var $target = $(e.currentTarget),
                        data = $target.data();
                    this.model.intentionsParser.clear({silent: true});
                    this.model.intentionsParser.set({ 'visualization': data.visualization }, {silent: true});
                    this.model.intentionsParser.fetch({
                        data: {
                            q: this.model.report.entry.content.get('search'),
                            action: data.report,
                            field: data.field,
                            app: this.model.application.get('app'),
                            owner: this.model.application.get('owner')
                        }
                    });
                    e.preventDefault();
                },
                'click .report-accelerators-events > a[data-field]': function(e) {
                    var $target = $(e.currentTarget),
                        data = $target.data();
                    this.model.intentionsParser.clear({silent: true});
                    this.model.intentionsParser.fetch({
                        data: {
                            q: this.model.report.entry.content.get('search'),
                            action: data.report,
                            field: data.field,
                            value: data.fieldValue,
                            app: this.model.application.get('app'),
                            owner: this.model.application.get('owner')
                        }

                    });
                    e.preventDefault();
                },
                'click td.col-value > a[data-field]': function(e) {
                    var data = $(e.currentTarget).data();
                    this.model.intentionsParser.clear({silent: true});
                    this.model.intentionsParser.fetch({
                        data: {
                            q: this.model.report.entry.content.get('search'),
                            stripReportsSearch: false,
                            action: 'fieldvalue', 
                            field: data.field,
                            value: data.fieldValue,
                            app: this.model.application.get('app'),
                            owner: this.model.application.get('owner')
                        }

                    });
                    e.preventDefault();
                 }

            },
            render: function() {               
                this.$el.html(this.compiledTemplate({
                     field: this.model.field,
                     summary: this.model.summary,
                     isExpanded: this.model.state.get(this.rowExpanded),
                     _:_
                }));
                return this;
            },
            template: '\
                    <% if (!isExpanded) { %>\
                        <td colspan="6">&nbsp;</td>\
                    <% } else { %>\
                        <td class=" col-select">&nbsp;</td>\
                        <td class="end-group" colspan="2" style="vertical-align:top;">\
                            <h5 class="report-heading"><%- _("Reports").t() %></h5>\
                            <div class="report-accelerators">\
                                <a href="#" data-visualization="bar" data-report="top" data-field="<%- field.get("name") %>"><%- _("Top values").t() %></a><br />\
                                <a href="#" data-visualization="line" data-report="topbytime" data-field="<%- field.get("name") %>"><%- _("Top values by time").t() %></a><br />\
                                <a href="#" data-visualization="line" data-report="rare" data-field="<%- field.get("name") %>"><%- _("Rare values").t() %></a>\
                            </div>\
                            <% if (field.isNumeric()) { %>\
                            <div class="report-accelerators">\
                                <a href="#" data-visualization="line" data-report="avgbytime" data-field="<%- field.get("name") %>"><%- _("Average over time").t() %></a><br />\
                                <a href="#" data-visualization="line" data-report="maxbytime" data-field="<%- field.get("name") %>"><%- _("Maximum value over time").t() %></a><br />\
                                <a href="#" data-visualization="line" data-report="minbytime" data-field="<%- field.get("name") %>"><%- _("Minimum value time").t() %></a>\
                            </div>\
                            <% } %>\
                            <div class="report-accelerators-events">\
                                <a href="#" data-report="fieldvalue" data-field="<%- field.get("name") %>" data-field-value="*"><%- _("Events with this field").t() %></a>\
                            </div>\
                            <table class="table table-embed stats-table-embedded table-dotted">\
                                <thead>\
                                    <tr>\
                                    <% if (field.get("modes").length >= 10) { %>\
                                        <td class="col-value"><strong><%- _("Top 10 Values").t() %></strong></td>\
                                    <% } else { %>\
                                        <td class="col-value"><strong><%- _("Values").t() %></strong></td>\
                                    <% } %>\
                                        <td class="col-count"><%- _("Count").t() %></td>\
                                        <td class="col-percent">%</td>\
                                        <td class="col-graph"></td>\
                                    </tr>\
                                </thead>\
                                <tbody>\
                                    <% _.each(field.get("modes"), function(mode){ %>\
                                        <% var modeFrequency = mode.count/field.get("count"); %>\
                                        <tr>\
                                            <td class="col-value"><a href="#" data-report="events" data-field="<%- field.get("name") %>" data-field-value="<%-(mode.value + "")%>"><%-(mode.value + "")%></a></td>\
                                            <td class="col-count"><%-format_decimal(mode.count || -1)%></td>\
                                            <td class="col-percent"><%-format_percent(modeFrequency)%></td>\
                                            <td class="col-graph">\
                                                <div style="width:<%-Math.round(modeFrequency * 100)%>%;" class="graph-bar"></div>\
                                            </td>\
                                        </tr>\
                                    <% }); %>\
                                </tbody>\
                                <tfoot></tfoot>\
                            </table>\
                        </td>\
                        <td class="col-distribution end-group" style="text-align:center; vertical-align:top;"></td>\
                        <td>\
                            <% if (field.isNumeric()) { %>\
                                <table class="table table-embed">\
                                    <tr>\
                                        <td class="col-label"><%- _("Avg").t() %>:</td>\
                                        <td class="col-val numeric"><%- field.get("mean") %></td>\
                                    </tr>\
                                    <tr>\
                                        <td class="col-label"><%- _("Min").t() %>:</td>\
                                        <td class="col-val numeric"><%- field.get("min") %></td>\
                                    </tr>\
                                    <tr>\
                                        <td class="col-label"><%- _("Max").t() %>:</td>\
                                        <td class="col-val numeric"><%- field.get("max") %></td>\
                                    </tr>\
                                    <tr>\
                                        <td class="col-label"><%- _("Std").t() %>&nbsp;<%- _("Dev").t() %>:</td>\
                                        <td class="col-val numeric"><%- field.get("stdev") %></td>\
                                    </tr>\
                                </table>\
                            <% } %>\
                        </td>\
                <% } %>\
            '
        });
    }
);
