define(
    [
        'module',
        'jquery',
        'underscore',
        '../Base'
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
            className: 'description',
            tagName: 'p',
            initialize: function(options) {
                BaseDashboardView.prototype.initialize.apply(this, arguments);
                this.listenTo(this.model, 'change:description', this.render);
            },
            render: function() {
                var description = this.model.get('description');
                this.$el[description ? 'removeClass' : 'addClass']('hidden');
                this.$el.text(_(description || '').t());
                return this;
            }
        });
    }
);
