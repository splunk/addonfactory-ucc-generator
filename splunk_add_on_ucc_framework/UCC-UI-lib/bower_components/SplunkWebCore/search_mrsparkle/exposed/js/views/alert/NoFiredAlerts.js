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
                    <i class="icon-info-circle"></i>\
                        <%- _("There are no fired events for this alert.").t() %>\
                </div>\
            '
        });
    }
);
