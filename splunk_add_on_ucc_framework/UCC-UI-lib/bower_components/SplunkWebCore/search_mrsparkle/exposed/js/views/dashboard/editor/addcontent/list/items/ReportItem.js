define(
    [
        'module',
        'jquery',
        'underscore',
        'views/Base',
        'splunk.util'
    ],
    function(module,
             $,
             _,
             BaseView,
             SplunkUtil) {

        var ReportItem = BaseView.extend({
            moduleId: module.id,
            tagName: 'li',
            className: 'report-item panel-content',
            initialize: function(options) {
                BaseView.prototype.initialize.apply(this, arguments);
                this.id = options.id || _.uniqueId('report_');
                this.listenTo(this.model.sidebarState, 'change:select', this._onItemSelected);
            },
            render: function() {
                var model = {
                    icon: 'icon-' + this._getQualifiedType(),
                    title: _(this.model.report.entry.get('name')).t(),
                    name: _(this.model.report.entry.get('name')).t()
                };
                this.$el.html(this.compiledTemplate(model));
                return this;
            },
            _getQualifiedType: function() {
                var report = this.model.report;
                var general = report.entry.content.get('display.general.type');
                var qualifiedType = general;
                var vsid = report.entry.content.get("vsid");
                var displayview = report.entry.content.get("displayview");
                var hasBeenMigrated = SplunkUtil.normalizeBoolean(report.entry.content.get("display.general.migratedFromViewState"));

                if (vsid && displayview && !hasBeenMigrated) {
                    qualifiedType = null;
                } else {
                    switch (general) {
                        case 'visualizations':
                            var subtype = report.entry.content.get('display.visualizations.charting.chart');
                            if (report.entry.content.get('display.visualizations.type') === "charting") {
                                switch (subtype) {
                                    case 'radialGauge':
                                        qualifiedType = 'gauge-radial';
                                        break;
                                    case 'fillerGauge':
                                        qualifiedType = 'gauge-filler';
                                        break;
                                    case 'markerGauge':
                                        qualifiedType = 'gauge-marker';
                                        break;
                                    default:
                                        qualifiedType = 'chart-' + subtype;
                                        break;
                                }
                            } else if (report.entry.content.get('display.visualizations.type') === "mapping") {
                                qualifiedType = 'location';
                            } else {
                                qualifiedType = 'single-value';
                            }
                            break;
                        case 'events':
                            qualifiedType = 'list';
                            break;
                        case 'statistics':
                            qualifiedType = 'table';
                            break;
                    }
                }
                return qualifiedType;
            },
            events: {
                'click a': 'select'
            },
            select: function(e) {
                e.preventDefault();
                this.trigger('preview', this.model.report);
                this.model.sidebarState.set('select', this.cid);
            },
            _onItemSelected: function() {
                if (this.model.sidebarState.get('select') === this.cid) {
                    this.$el.addClass('selected');
                } else {
                    this.$el.removeClass('selected');
                }
            },
            template: '\
                <a href="#" title="<%- title %>">\
                    <div class="icons"><i class="<%- icon %>"></i></div>\
                    <%- name %>\
                </a>\
            '
        });

        return ReportItem;
    });