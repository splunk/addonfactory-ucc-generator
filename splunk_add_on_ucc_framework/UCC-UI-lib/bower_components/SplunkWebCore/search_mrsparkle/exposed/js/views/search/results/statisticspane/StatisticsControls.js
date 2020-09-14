define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/shared/controls/ControlGroup',
        'views/shared/controls/SyntheticSelectControl',
        'views/shared/SearchResultsPaginator',
        'views/shared/delegates/Popdown',
        'views/shared/delegates/Dock',
        'views/shared/vizcontrols/Master',
        'splunk.util',
        './StatisticsControls.pcss'
    ],
    function(
        _,
        module,
        Base,
        ControlGroup,
        SyntheticSelectControl,
        SearchResultsPaginator,
        Popdown,
        Dock,
        StatisticsFormat,
        splunkUtils,
        css
    ) {
        /**
         * View Hierarchy:
         *
         * SyntheticSelect (Count)
         *
         * ControlGroup (Drilldown)
         * ControlGroup (Row Numbers)
         * ControlGroup (Wrap Results)
         * ControlGroup (Data Overlay)
         *
         * SyntheticSelect (Preview)
         *
         * SearchResultsPaginator
         */
        return Base.extend({
            moduleId: module.id,
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);

                //child views
                this.children.count = new SyntheticSelectControl({
                    menuWidth: "narrow",
                    className: "btn-group pull-left",
                    items: [
                        {value: '10', label: _('10 Per Page').t()},
                        {value: '20', label: _('20 Per Page').t()},
                        {value: '50', label: _('50 Per Page').t()},
                        {value: '100', label: _('100 Per Page').t()}
                    ],
                    model: this.model.report.entry.content,
                    modelAttribute: 'display.prefs.statistics.count',
                    toggleClassName: 'btn-pill'
                });

                this.children.preview = new SyntheticSelectControl({
                    menuWidth: "narrow",
                    className: "btn-group pull-left",
                    items: [
                        {value: '1', label: _('Preview').t()},
                        {value: '0', label: _('No Preview').t()}
                    ],
                    model: this.model.report.entry.content,
                    modelAttribute: 'display.general.enablePreview',
                    toggleClassName: 'btn-pill'
                });

                this.children.searchResultsPaginator = new SearchResultsPaginator({
                    mode: 'results_preview',
                    model: {
                        state: this.model.report.entry.content,
                        timeline: this.model.timeline,
                        searchJob: this.model.searchJob
                    },
                    offsetKey: 'display.prefs.statistics.offset',
                    countKey: 'display.prefs.statistics.count'
                });

                this.children.format = new StatisticsFormat({
                    vizTypes: ['statistics'],
                    bindToChangeOfSearch: false,
                    excludeAttributes: ['display.prefs.statistics.count'],
                    model: {
                        report: this.model.report,
                        application: this.model.application,
                        user: this.model.user
                    }
                });
                this.children.format.$el.addClass('popdown pull-left');
            },
            startListening: function() {
                this.listenTo(this.model.report.entry.content, "change:display.general.enablePreview", function(){
                    if (!this.model.searchJob.isDone()) {
                        if (splunkUtils.normalizeBoolean(this.model.report.entry.content.get("display.general.enablePreview"))) {
                            this.children.searchResultsPaginator.$el.show();
                        } else {
                            this.children.searchResultsPaginator.$el.hide();
                        }
                    }
                });

                this.listenTo(this.model.searchJob.entry.content, "change:dispatchState", function() {
                    if (this.model.searchJob.isDone()) {
                        this.children.searchResultsPaginator.$el.show();
                    }
                });
                this.listenTo(this.model.state, 'change:isModalized', function(model, value) {
                    this.children.tableDock && this.children.tableDock[(value) ? 'disable': 'enable']();
                });

                this.listenTo(this.model.searchJob.entry.content, "change:isRealTimeSearch", function() {
                    this.previewVisibility();
                });
            },
            events: {
                'click .statistics-controls-inner.disabled': function(e) {
                    this.model.state.set('isModalized', false);
                    e.preventDefault();
                }
            },
            previewVisibility: function() {
                if (this.model.searchJob.isRealtime()) {
                    // In real-time, preview is essentially forced on, so get rid of the toggle switch
                    // and show the pagination controls (in case they were hidden before)
                    this.children.preview.$el.hide();
                    this.children.searchResultsPaginator.$el.show();
                } else {
                    this.children.preview.$el.show();
                }
            },
            activate: function(options) {
                if (this.active) {
                    return Base.prototype.activate.apply(this, arguments);
                }

                if (this.model.searchJob.entry.acl.canWrite()) {
                    this.children.preview.$el.show();
                } else {
                    this.children.preview.$el.hide();
                }

                this.previewVisibility();

                return Base.prototype.activate.apply(this, arguments);
            },
            deactivate: function(options) {
                if (!this.active) {
                    return Base.prototype.deactivate.apply(this, arguments);
                }
                Base.prototype.deactivate.apply(this, arguments);

                return this;
            },
            render: function() {
                this.$el.html(this.compiledTemplate());
                this.children.count.render().prependTo(this.$('.statistics-controls-inner'));
                this.children.format.render().appendTo(this.$('.statistics-controls-inner'));
                this.children.preview.render().appendTo(this.$('.statistics-controls-inner'));
                this.children.searchResultsPaginator.render().appendTo(this.$('.statistics-controls-inner'));
                // added element for overlay
                this.$('.statistics-controls-inner').append('<div class="statistics-controls-inner-cover"/>');
                this.children.tableDock = new Dock({ el: this.el, affix: '.statistics-controls-inner' });
                return this;
            },
            template: '\
                <div class="statistics-controls-inner"></div>\
            '
        });
    }
);
