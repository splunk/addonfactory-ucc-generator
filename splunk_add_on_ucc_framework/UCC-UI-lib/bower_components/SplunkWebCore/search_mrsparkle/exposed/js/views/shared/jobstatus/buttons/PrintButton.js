define(
    [
        'underscore',
        'module',
        'views/Base',
        'helpers/Printer',
        'bootstrap.tooltip'
    ],
    function(_, module, Base, Printer) {
        return Base.extend({
            moduleId: module.id,
            className: 'print btn-pill btn-square',
            tagName: 'a',
            attributes: {
                "href": "#"
            },
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
                this.$el.html('<i class="icon-print"></i><span class="hide-text">' + _("Print").t() + '</span>');
                this.$el.tooltip({animation:false, title:_('Print').t(), container: this.$el});
            },
            events: {
                'click': function(e) {
                    Printer.printPage();
                    return false;
                }
            },
            render: function() {
                return this;
            }
        });
    }
);
