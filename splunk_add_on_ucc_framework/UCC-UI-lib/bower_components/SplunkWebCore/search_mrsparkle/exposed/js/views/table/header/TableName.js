define(
    [
        'underscore',
        'module',
        'views/Base'
    ],
    function(
        _,
        module,
        BaseView
    ) {
        return BaseView.extend({
            moduleId: module.id,

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
            },
            
            startListening: function() {
                this.listenTo(this.model.table, 'sync', this.render);
            },
            
            activate: function(options) {
                if (this.active) {
                    return BaseView.prototype.activate.apply(this, arguments);
                }
                
                this.render();
                
                return BaseView.prototype.activate.apply(this, arguments);
            },

            render: function() {
                var tableName = this.model.table.entry.get('name'),
                    tableDisplayName = this.model.table.entry.content.get('displayName');

                if (tableName === undefined || tableName === '_new') {
                    tableDisplayName = _('New Table Dataset').t();
                }

                this.$el.attr('title', tableDisplayName);

                this.$el.html(this.compiledTemplate({
                    tableDisplayName: tableDisplayName
                }));
            },

            template: '\
                <h1><%- tableDisplayName %></h1>\
            '
        });
    }
);