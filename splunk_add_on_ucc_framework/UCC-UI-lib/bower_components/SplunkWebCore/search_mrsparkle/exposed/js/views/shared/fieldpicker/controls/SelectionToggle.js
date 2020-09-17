define(
    [
        'underscore',
        'module',
        'views/Base'
    ],
    function(_, module, Base) {
        return Base.extend({
            moduleId: module.id,
            className: 'selection-toggle btn-group btn-group-radio',
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
            },
            events: {
                'click a[data-mode="select"]': function(e) {
                    e.preventDefault();
                    this.model.trigger('bulkSelect', {select: true});
                },
                'click a[data-mode="deselect"]': function(e) {
                    e.preventDefault();
                    this.model.trigger('bulkSelect', {select: false});
                }
            },
            render: function() {
                this.$el.html(this.compiledTemplate({_:_}));
                return this;
            },
            template: '\
                <a href="#" class="select btn-pill" data-mode="select"><i class="icon-select"></i><%- _("Select All Within Filter").t() %></a>\
                <a href="#" class="deselect btn-pill" data-mode="deselect"><i class="icon-deselect"></i><%- _("Deselect All").t() %></a>\
            '
        });
    }
);
