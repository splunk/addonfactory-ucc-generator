define(
    [
        'jquery',
        'underscore',
        'module',
        'views/shared/PopTart',
        'splunk.i18n',
        'models/services/search/IntentionsParser',
        'contrib/text!views/shared/FieldInfo.html',
        './FieldInfo.pcss'
    ],
    function(
        $,
        _,
        module,
        PopTartView,
        i18n,
        IntentionsParser,
        template,
        css
    )
    {
        return PopTartView.extend({
            moduleId: module.id,
            /**
             * @param {Object} options {
             *      model: {
             *          field: <model.services.search.jobs.SummaryV2.fields.field[0]>,
             *          summary: <model.services.search.jobs.SummaryV2>,
             *          report: <models.services.SavedSearch>
             *      },
             *      collection: {
             *          selectedFields: <collections.SelectedFields>
             *      }
             *      selectableFields: true|false
             *      (Optional) keepStatic: <Boolean> (false) If true, view will not be rerendered as model/collection updates.
             * }
             */
            initialize: function() {
                PopTartView.prototype.initialize.apply(this, arguments);
                var defaults = {
                    selectableFields: true,
                    keepStatic: false
                };
                this.options = $.extend(true, defaults, this.options);
                this.model.intentionsParser = new IntentionsParser();
                this.model.intentionsParser.on('change', function() {
                    this.hide();
                    var search = this.model.intentionsParser.fullSearch();
                    if (this.model.intentionsParser.has('visualization')) {
                        this.model.report.entry.content.set({
                            'search': search,
                            'display.general.type': 'visualizations',
                            'display.visualizations.charting.chart': this.model.intentionsParser.get('visualization')
                        });
                    } else {
                        this.model.report.entry.content.set('search', search);
                    }
                    this.model.report.trigger('eventsviewer:drilldown');
                }, this);
                if (!this.options.keepStatic) {
                    this.model.summary.fields.on('reset', this.render, this);
                    this.collection.selectedFields.on('add remove reset', this.render, this);
                    this.model.field.on('change', this.render, this);
                }
            },
            events: {
                'click .unselect': function(e) {
                    this.collection.selectedFields.remove(
                        this.collection.selectedFields.findByName($(e.currentTarget).attr('data-field-name'))
                    );
                    e.preventDefault();
                },
                'click .select': function(e) {
                    var fieldName = $(e.currentTarget).attr('data-field-name');
                    if (!this.collection.selectedFields.findByName(fieldName)) {
                        this.collection.selectedFields.push({'name' : fieldName});
                    }
                    e.preventDefault();
                },
                'click .close': function(e) {
                    this.hide(e);
                    e.preventDefault();
                },
                'click tr.fields-values > td > a[data-field]': function(e) {
                    var $target = $(e.currentTarget),
                        data = $target.data(),
                        field = data.field,
                        report = data.report;
                    this.model.intentionsParser.clear({silent: true});
                    this.model.intentionsParser.set({ 'visualization': data.visualization }, {silent: true});
                    this.model.intentionsParser.fetch({
                        data: {
                            q: this.model.report.entry.content.get('search'),
                            action: report,
                            field: field,
                            app: this.model.application.get('app'),
                            owner: this.model.application.get('owner')
                        }
                    });
                    e.preventDefault();
                },
                'click tr.fields-events > td > a[data-field]': function(e) {
                    var $target = $(e.currentTarget),
                        data = $target.data(),
                        field = data.field,
                        report = data.report;
                    this.model.intentionsParser.clear({silent: true});
                    this.model.intentionsParser.fetch({
                        data: {
                            q: this.model.report.entry.content.get('search'),
                            action: report,
                            field: field,
                            value: '*',
                            app: this.model.application.get('app'),
                            owner: this.model.application.get('owner')
                        }
                    });
                    e.preventDefault();
                },
                'click tr.fields-numeric > td > a[data-field]': function(e) {
                    var $target = $(e.currentTarget),
                        data = $target.data(),
                        field = data.field,
                        report = data.report;
                    this.model.intentionsParser.clear({silent: true});
                    this.model.intentionsParser.set({ 'visualization': data.visualization }, {silent: true});
                    this.model.intentionsParser.fetch({
                        data: {
                            q: this.model.report.entry.content.get('search'),
                            action: report,
                            field: field,
                            app: this.model.application.get('app'),
                            owner: this.model.application.get('owner')
                        }
                    });
                    e.preventDefault();
                },
                'click td.value > a': function(e) {
                    var $target = $(e.currentTarget),
                        data = $target.data();
                    this.model.intentionsParser.clear({silent: true});
                    this.model.intentionsParser.fetch({
                        data: {
                            q: this.model.report.entry.content.get('search'),
                            stripReportsSearch: false,
                            action: data.report,
                            field: data.field,
                            value: data.value,
                            app: this.model.application.get('app'),
                            owner: this.model.application.get('owner')
                        }
                    });
                    e.preventDefault();
                }
            },
            render: function() {
                var html = this.compiledTemplate({
                    field: this.model.field,
                    summary: this.model.summary,
                    selectedFields: this.collection.selectedFields,
                    i18n: i18n,
                    _:_,
                    selectableFields: this.options.selectableFields
                });
                this.$el.html(PopTartView.prototype.template);
                this.$('.popdown-dialog-body').html(html);
                return this;
            },
            template: template
        });
    }
);
