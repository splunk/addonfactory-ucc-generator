define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/shared/controls/SyntheticSelectControl',
        'views/shared/fieldpicker/controls/Extract',
        'views/shared/fieldpicker/controls/Search',
        'views/shared/fieldpicker/controls/SelectionToggle',
        'uri/route'
    ],
    function(_, module, Base, SyntheticSelectControl, Extract, Search, SelectionToggle, route) {
        return Base.extend({
            moduleId: module.id,
            className: 'controls btn-toolbar',
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
                this.enableExtract = _.has(this.options, 'enableExtract') ? this.options.enableExtract : true;
                //select toggle
                this.children.selectionToggle = new SelectionToggle({
                    model: this.model.state
                });

                //coverage
                this.children.coverage = new SyntheticSelectControl({
                    model: this.model.report.entry.content,
                    items: [
                        {value: '0', label: _('All fields').t()},
                        {value: '.01', label: _('Coverage: 1% or more').t()},
                        {value: '.50', label: _('Coverage: 50% or more').t()},
                        {value: '.90', label: _('Coverage: 90% or more').t()},
                        {value: '1', label: _('Coverage: 100%').t()}
                    ],
                    modelAttribute: 'display.prefs.fieldCoverage',
                    className: 'btn-group coverage',
                    toggleClassName: 'btn-pill'
                });

                //search
                this.children.search = new Search({
                    model: this.model.report
                });

                //extract
                this.children.extract = new Extract({
                    model: {
                        searchJob: this.model.searchJob,
                        application: this.model.application
                    }
                });
            },
            startListening: function() {
                this.listenTo(this.model.searchJob, 'change:' + this.model.searchJob.idAttribute, this.updateExtractFieldsLink);
            },
            updateExtractFieldsLink: function() {
                var fieldExtractorHref = route.field_extractor(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    this.model.application.get('app'),
                    { data: { sid: this.model.searchJob.id } }
                );
                this.$('.extract-fields-button').attr('href', fieldExtractorHref);
            },
            render: function() {
                this.children.selectionToggle.render().appendTo(this.$el);
                this.children.coverage.render().appendTo(this.$el);
                this.$el.find('.btn').removeClass('btn'); //FIXME: ghetto remove btn style
                this.children.search.render().appendTo(this.$el);
                if (this.enableExtract) {
                    this.children.extract.render().appendTo(this.$el);
                }
                this.$el.append(_(this.extractFieldsTemplate).template({}));
                this.updateExtractFieldsLink();
                return this;
            },
            extractFieldsTemplate: '\
                <a href="#" class="extract-fields-button pull-right btn-pill">\
                    <i class="icon icon-plus"></i>\
                    <%- _("Extract New Fields").t() %>\
                </a>\
            '
        });
    }
);
