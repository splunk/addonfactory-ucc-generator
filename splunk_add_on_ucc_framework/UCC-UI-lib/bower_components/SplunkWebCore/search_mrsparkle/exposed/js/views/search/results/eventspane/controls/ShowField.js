define(
    [
        'underscore',
        'module',
        'views/Base'
    ],
    function(_, module, BaseView) {
        /**
         * @param {Object} options {
         *     model: <models.services.SavedSearch.entry.content>,
         * }
         */
        return BaseView.extend({
            moduleId: module.id,
            tagName: 'a',
            className: 'btn-pill pull-left',
            attributes: {
                'href': '#'
            },
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
            },
            events: {
                'click': function(e) {
                    this.model.content.set('display.page.search.showFields', "1");
                    e.preventDefault();
                }
            },
            render: function() {
                this.el.innerHTML = '<i class="icon-chevron-right icon-no-underline"></i><span>' + _('Show Fields').t() + '</span>';
                return this;
            }
        });
    }
);
