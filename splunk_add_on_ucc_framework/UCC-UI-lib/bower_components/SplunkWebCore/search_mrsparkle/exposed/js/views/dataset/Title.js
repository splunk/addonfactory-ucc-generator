define(
    [
        'views/Base',
        'module'
    ],
    function(
        BaseView,
        module
    ) {
        return BaseView.extend({
            moduleId: module.id,

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
            },

            startListening: function() {
                this.listenTo(this.model.dataset.entry, 'change:name', this.debouncedRender);
                this.listenTo(this.model.dataset.entry.content, 'change:dataset.description', this.debouncedRender);
            },

            render: function() {
                this.$el.html(this.compiledTemplate({
                    name: this.model.dataset.getFormattedName(),
                    description: this.model.dataset.getDescription()
                }));

                return this;
            },

            template: '\
                <h2 class="section-title">\
                    <%- name %>\
                </h2>\
                <% if (description) { %>\
                    <p class="section-description">\
                        <%- description %>\
                    </p>\
                <% } %>\
            '
        });
    }
);