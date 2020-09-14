define(
    [
        'underscore',
        'backbone',
        'jquery',
        'module',
        'models/services/search/jobs/Result',
        'models/services/search/jobs/Summary',
        'views/Base',
        'views/search/results/eventspane/fieldsviewer/List',
        'views/shared/fieldpicker/Master',
        'views/shared/delegates/Dock',
        './Master.pcss'
    ],
    function(_, Backbone, $, module, ResultV2Model, SummaryModel, Base, ListView, PickerView, Dock, css) {
        return Base.extend({
            moduleId: module.id,
            /**
             * @param {Object} options {
             *     model: {
             *          summary: <model.services.search.job.SummaryV2>,
             *          searchJob: <models.Job>,
             *          report: <models.services.SavedSearch>,
             *          application: <models.Application>
             *     },
             *     collections: {
             *         selectedFields: <collections.SelectedFields>
             *     }
             * }
             */
            initialize: function(){
                Base.prototype.initialize.apply(this, arguments);
                this.children.list = new ListView({
                    model: {
                        report: this.model.report,
                        searchJob: this.model.searchJob,
                        application: this.model.application,
                        summary: this.model.summary
                    },
                    collection: {
                        selectedFields: this.collection.selectedFields
                    }
                });
            },
            startListening: function() {
                this.listenTo(this.model.summary.fields, 'reset', function() {
                    var $toggle = this.$('.all');
                    this.model.summary.fields.length ? $toggle.show() : $toggle.hide();
                });
                this.listenTo(this.model.summary, 'change:fieldPickerOpen', function() {
                    if (!this.model.summary.get('fieldPickerOpen')){
                        this.children.picker && this.children.picker.remove();
                    }
                });
            },
            deactivate: function(options) {
                if (!this.active) {
                    return Base.prototype.deactivate.apply(this, arguments);
                }
                Base.prototype.deactivate.apply(this, arguments);
                //once delegates can easily cleanup DOM they create we can remove this.
                this.$('.fields-controls-inner').removeClass('affix-top');
                return this;
            },
            events: {
                'click a.remove': function(e) {
                    this.model.report.entry.content.set('display.page.search.showFields', "0");
                    e.preventDefault();
                },
                'click a.all, a.additional-fields': function(e) {
                    this.children.picker && this.children.picker.remove();

                    var fieldPickerSummary   = new SummaryModel({id: this.model.summary.id}),
                        clonedSelectedFields = this.collection.selectedFields.deepClone(),
                        clonedReport         = this.model.report.clone();

                    //TODO: consolidate
                    this.model.summary.set({ 'fieldPickerOpen': true });
                    this.model.state.set('fieldpicker', true);

                    var fetchFieldPickerSummary = function() {
                        fieldPickerSummary.safeFetch({
                            data: {
                                min_freq: clonedReport.entry.content.get('display.prefs.fieldCoverage'),
                                earliest_time: clonedReport.entry.content.get('display.events.timelineEarliestTime'),
                                latest_time: clonedReport.entry.content.get('display.events.timelineLatestTime'),
                                search: clonedReport.entry.content.get('display.prefs.fieldFilter')
                            }
                        });
                    }.bind(this);

                    this.listenTo(this.model.searchJob, 'jobProgress', fetchFieldPickerSummary);
                    this.listenTo(clonedReport.entry.content, 'change:display.prefs.fieldFilter change:display.prefs.fieldCoverage', fetchFieldPickerSummary);

                    this.listenTo(clonedReport.entry.content, 'change:search', function() {
                        this.children.picker.hide();
                    });

                    fetchFieldPickerSummary();

                    this.children.picker = new PickerView({
                        model: {
                            report: clonedReport,
                            searchJob: this.model.searchJob,
                            application: this.model.application,
                            summary: fieldPickerSummary
                        },
                        collection: {
                            selectedFields: clonedSelectedFields
                        }
                    });

                    $('body').append(this.children.picker.render().el);
                    this.children.picker.show();
                    this.children.list.sleep();

                    this.children.picker.on('hidden', function() {
                        this.children.list.wake();

                        this.collection.selectedFields.reset(clonedSelectedFields.toJSON());
                        clonedReport.entry.content.set('display.events.fields', this.collection.selectedFields.valuesToJSONString());
                        this.model.report.setFromSplunkD(clonedReport.toSplunkD());

                        //TODO: consolidate
                        this.model.summary.set({ 'fieldPickerOpen': false });
                        this.model.state.unset('fieldpicker');

                        this.stopListening(this.model.searchJob, 'jobProgress', fetchFieldPickerSummary);
                        this.stopListening(clonedReport.entry.content, 'change:display.prefs.fieldFilter change:display.prefs.fieldCoverage', fetchFieldPickerSummary);
                        this.stopListening(clonedReport.entry.content, 'change:search');
                    }, this);

                    e.preventDefault();
                }
            },
            render: function() {
                this.children.tableDock && this.children.tableDock.remove();
                this.el.innerHTML = this.compiledTemplate({
                    _: _
                });
                this.children.list.render().appendTo(this.$el);
                this.children.tableDock = new Dock({ el: this.$('.fields-controls')[0], affix: '.fields-controls-inner' });
                return this;
            },
            template: '\
                    <div class="fields-controls">\
                    <div class="fields-controls-inner">\
                    <a href="#" class="remove btn-pill"><i class="icon-chevron-left icon-no-underline"></i><span><%- _("Hide Fields").t() %></span></a>\
                    <a href="#" class="all btn-pill"><i class="icon-list icon-no-underline icon-large"></i><span><%- _("All Fields").t() %></span></a>\
                    </div>\
                    </div>\
            '
        });
    }
);
