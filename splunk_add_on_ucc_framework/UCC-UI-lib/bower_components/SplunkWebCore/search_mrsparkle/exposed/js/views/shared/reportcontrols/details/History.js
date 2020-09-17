define(
    [
        'module',
        'views/Base'
    ],
    function(module, Base) {
        return Base.extend({
            moduleId: module.id,
            tagName: 'span',
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
                this.model.entry.on('change:updated', this.render, this);

            },
            render: function() {
                this.$el.html(this.compiledTemplate({model: this.model}));
                return this;
            },
            template: '\
                Created June 18, 2010. Modified <%- model.entry.get("updated") %>.\
            '
        });
    }
);
