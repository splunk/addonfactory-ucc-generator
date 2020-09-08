define(
    [
        'underscore',
        'module',
        'views/Base'
    ],
    function(_, module, Base) {
        return Base.extend({
            tagName: 'a',
            attributes: {
                "href": "#"
            },
            moduleId: module.id,
            className: 'close-report btn-pill',
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
            },
            events: {
                'click': function(e) {
                    e.preventDefault();
                    this.model.report.trigger('close');
                }
            },
            render: function() {
                this.$el.html(_('Close').t());
                return this;
            }
        });
    }
);