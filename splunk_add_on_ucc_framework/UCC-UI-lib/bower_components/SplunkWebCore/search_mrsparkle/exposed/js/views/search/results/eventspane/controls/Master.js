define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/search/results/eventspane/controls/ShowField',
        'views/shared/controls/SyntheticSelectControl',
        'views/shared/controls/ControlGroup',
        'views/shared/SearchResultsPaginator',
        'views/shared/delegates/Popdown',
        'views/shared/delegates/Dock',
        'views/shared/vizcontrols/format/Master',
        'views/shared/eventsviewer/viz_editor_schema',
        'splunk.util',
        'helpers/user_agent',
        './Master.pcss'
    ],
    function(
        _,
        module,
        Base,
        ShowField,
        SyntheticSelectControl,
        ControlGroup,
        SearchResultsPaginator,
        Popdown,
        Dock,
        FormatControls,
        eventsEditorSchema,
        splunkUtil,
        userAgent,
        css
    ) {
        return Base.extend({
            moduleId: module.id,
            /**
             * @param {Object} options {
             *     model: {
             *         report: <models.services.SavedSearch>,
             *         timeline: <model.services.search.job.TimelineV2>,
             *         searchJob: <models.Job>,
             *     },
             *     showDrilldown: true (default) | false,
             *     disableDock: true | false (default)
             * }
             */
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);

                _.defaults(this.options, {
                    showDrilldown: true,
                    disableDock: false
                });

                this.children.showField = new ShowField({
                    model: {
                        content: this.model.report.entry.content,
                        state: this.model.state
                    }
                });

                this.children.count = new SyntheticSelectControl({
                        modelAttribute: 'display.prefs.events.count',
                        model: this.model.report.entry.content,
                        items: [
                            { value: '10',  label: _('10 Per Page').t()  },
                            { value: '20',  label: _('20 Per Page').t()  },
                            { value: '50',  label: _('50 Per Page').t()  }
                        ],
                        save: false,
                        elastic: true,
                        menuWidth: "narrow",
                        toggleClassName: 'btn-pill',
                        popdownOptions: {attachDialogTo:'body'}
                });

                this.children.tabletype = new SyntheticSelectControl({
                        modelAttribute: 'display.events.type',
                        model: this.model.report.entry.content,
                        items: [
                            { label: _('Raw').t(),  value: 'raw'  },
                            { label: _('List').t(), value: 'list' },
                            { label: _('Table').t(), value: 'table' }
                        ],
                        menuWidth: "narrow",
                        save: false,
                        elastic: true,
                        className: 'btn-group',
                        toggleClassName: 'btn-pill',
                        popdownOptions: {attachDialogTo:'body'}
                });

                this.children.eventsResultsPaginator = new SearchResultsPaginator({
                    model: {
                        state: this.model.report.entry.content,
                        searchJob: this.model.searchJob,
                        timeline: this.model.timeline
                    },
                    offsetKey: 'display.prefs.events.offset',
                    countKey: 'display.prefs.events.count'
                });

                var excludedEventAttributes = ['display.events.type', 'display.prefs.events.count'];
                if (!this.options.showDrilldown) {
                    excludedEventAttributes.push('display.events.raw.drilldown',
                        'display.events.list.drilldown', 'display.events.table.drilldown');
                }
                this.children.eventsFormat = new FormatControls({
                    model: {
                        report: this.model.report
                    },
                    formatterDescription: eventsEditorSchema,
                    excludeAttributes: excludedEventAttributes
                });
            },
            startListening: function() {
                this.listenTo(this.model.state, 'change:isModalized', function(model, value) {
                    this.children.tableDock && this.children.tableDock[(value) ? 'disable': 'enable']();
                });
                this.listenTo(this.model.searchJob.entry.content, 'change:statusBuckets', this.visibility);
                this.listenTo(this.model.report.entry.content, 'change:display.page.search.showFields', this.visibility);
            },
            activate: function(options) {
                if (this.active) {
                    return Base.prototype.activate.apply(this, arguments);
                }
                this.visibility();
                return Base.prototype.activate.apply(this, arguments);
            },
            deactivate: function(options) {
                if (!this.active) {
                    return Base.prototype.deactivate.apply(this, arguments);
                }
                Base.prototype.deactivate.apply(this, arguments);
                //once delegates can easily cleanup DOM they create we can remove this.
                this.$('.events-controls-inner').removeClass('affix-top');

                this.children.tableDock && this.children.tableDock.enable();
                return this;
            },
            events: {
                'click .events-controls-inner.disabled': function(e) {
                    this.model.state.trigger('unmodalize');
                    e.preventDefault();
                }
            },
            visibility: function() {
                var $showField = this.children.showField.$el;
                if (this.model.searchJob.entry.content.get('statusBuckets') > 0 && !splunkUtil.normalizeBoolean(this.model.report.entry.content.get('display.page.search.showFields'))) {
                    $showField.show();
                } else {
                    $showField.hide();
                }
            },
            render: function() {
                this.$el.html(this.compiledTemplate({
                    _: _
                }));
                this.visibility();
                this.children.tabletype.render().prependTo(this.$('.events-controls-inner'));
                this.children.showField.render().prependTo(this.$('.events-controls-inner'));
                this.children.count.render().appendTo(this.$('.events-controls-inner'));
                this.children.eventsFormat.render().appendTo(this.$('.format-events'));
                this.children.eventsResultsPaginator.render().appendTo(this.$('.events-controls-inner'));
                // added element for overlay
                this.$('.events-controls-inner').append('<div class="events-controls-inner-cover"/>');

                if (!this.options.disableDock) {
                    this.children.tableDock = new Dock({
                        el: this.el,
                        affix: '.events-controls-inner'
                    });
                }
            },
            template: '\
                <div class="events-controls-inner">\
                    <div class="btn-group format-events"></div>\
                </div>\
            '
        });
    }
);
