define(['underscore', 'views/Base', 'module'], function(_, BaseView, module) {
    return BaseView.extend({
        moduleId: module.id,
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
        },
        startListening: function() {
            this.listenTo(this.model.entry, 'change:name', this.debouncedRender);
            this.listenTo(this.model.entry.content, 'change:description', this.debouncedRender);
        },
        render: function() {
            this.$el.html(this.compiledTemplate({model: this.model}));
            return this;
        },
        template: '\
            <h2 class="section-title"><%- model.entry.get("name") %></h2>\
            <% if(model.entry.content.get("description")) { %>\
                <p class="section-description">\
                    <%- model.entry.content.get("description") %>\
                </p>\
            <% } %>\
        '
    });
});
