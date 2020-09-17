define(
    [
        'underscore',
        'module',
        'views/Base'
    ],
    function(_, module, Base) {
        return Base.extend({
            moduleId: module.id,
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
            },
            render: function() {
                this.$el.html(this.compiledTemplate({
                    _: _
                }));
                return this;
            },
            template:  '\
                <div class="alert alert-info">\
                    <i class="icon-alert"></i>\
                        <%- _("This alert is disabled.").t() %>\
                </div>\
            '
        });
    }
);