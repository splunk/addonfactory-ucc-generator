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
                this.model.entry.acl.on('change:app', this.render, this);
            },
            render: function() {
                this.$el.html(this.compiledTemplate({model: this.model}));
                return this;
            },
            template: '\
                <%- model.entry.acl.get("app") %>\
            '
        });
    }
);
