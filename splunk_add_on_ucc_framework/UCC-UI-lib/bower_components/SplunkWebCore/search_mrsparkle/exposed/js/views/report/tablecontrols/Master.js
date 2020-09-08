define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/report/tablecontrols/ResultsCount',
        'views/shared/controls/SyntheticSelectControl',
        'views/shared/SearchResultsPaginator',
        'views/shared/delegates/Dock'
    ],
    function(_, module, Base, ResultsCount, SyntheticSelectControl, SearchResultsPaginator, Dock) {
        return Base.extend({
            moduleId: module.id,
            tagName: 'div',
            className: 'table-caption',
             /**
             * @param {Object} options {
             *      model: {
             *          report: <models.Report>,
             *          searchJob: <models.services.search.Job>,
             *          state: <models.Base>
             *      },
             *      mode: events || results || results_preview,
             *      countKey: attr to change count on
             *      offsetKey: attr to change offset on
             * }
             */
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);

                this.children.resultsCount = new ResultsCount({
                    model: {
                        searchJob: this.model.searchJob
                    }
                });
                var items = [
                    {value: '10', label: _('10 per page').t()},
                    {value: '20', label: _('20 per page').t()},
                    {value: '50', label: _('50 per page').t()}
                ];
                if(this.options.mode !== 'events') {
                    items.push({value: '100', label: _('100 per page').t()});
                }
                this.children.count = new SyntheticSelectControl({
                    menuWidth: "narrow",
                    className: "btn-group pull-left",
                    items: items,
                    model: this.model.report.entry.content,
                    modelAttribute: this.options.countKey,
                    toggleClassName: 'btn-pill'
                });

                this.children.searchResultsPaginator = new SearchResultsPaginator({
                    mode: this.options.mode,
                    model: {
                        state: this.model.report.entry.content,
                        searchJob: this.model.searchJob
                    },
                    countKey: this.options.countKey,
                    offsetKey: this.options.offsetKey
                });
            },
            startListening: function() {
                this.listenTo(this.model.state, 'change:isModalized', function(model, value) {
                    this.children.dock[(value) ? 'disable': 'enable']();
                });
            },
            events: {
                'click .table-caption-inner.disabled': function(e) {
                    this.model.state.trigger('unmodalize');
                    this.model.state.set('isModalized', false);
                    e.preventDefault();
                }
            },
            render: function() {
                this.$el.html(this.template);
                if (this.options.mode === 'results' || this.options.mode === 'results_preview') {
                    this.children.resultsCount.render().appendTo(this.$('.table-caption-inner'));
                }
                var $tableCaptionInner = this.$('.table-caption-inner');
                this.children.count.render().appendTo($tableCaptionInner);
                this.children.searchResultsPaginator.render().appendTo($tableCaptionInner);
                
                // added element for overlay
                this.$('.table-caption-inner').append('<div class="table-caption-inner-cover"/>');
                
                this.children.dock = new Dock({ el: this.el, affix: '.table-caption-inner' });
                return this;
            },
            template: '\
                <div class="table-caption-inner"></div>\
            '
        });
    }
);
