define(
    [
        'module',
        'jquery',
        'underscore',
        '../Base',
        './Title.pcss'
    ],
    function(module,
             $,
             _,
             BaseDashboardView) {

        return BaseDashboardView.extend({
            moduleId: module.id,
            viewOptions: {
                register: false
            },
            className: 'dashboard-title',
            tagName: 'h2',
            initialize: function(options) {
                BaseDashboardView.prototype.initialize.apply(this, arguments);

                this.listenTo(this.model.view.entry.content, 'change:label', this.render);
                this.listenTo(this.model.page, 'change:hideFilters change:globalFieldsetEmpty', this.render);
            },
            events: {
                'click [data-action=show-filters]': function(e) {
                    e.preventDefault();
                    this.model.controller.trigger('action:showFilters');
                }
            },
            _renderLink: function() {
                var globalFieldsetEmpty = this.model.page.has('globalFieldsetEmpty') ? this.model.page.get('globalFieldsetEmpty') : true;
                var doRenderLink = this.model.page.get('hideFilters') && !globalFieldsetEmpty;

                if(doRenderLink) {
                    var $toggleFiltersLink = $('<a class="show-global-filters" data-action="show-filters" href="#">' + _("Show Filters").t() + '</a>');
                    this.$el.append($toggleFiltersLink);
                }
            },
            render: function() {
                this.$el.empty();

                var label = this.model.view.entry.content.has('label') ? this.model.view.entry.content.get('label') : this.model.view.entry.get('name');
                this.$el[label ? 'removeClass' : 'addClass']('untitled');
                label && this.$el.text(_(label).t());

                this._renderLink();
                return this;
            }
        });
    }
);
