define(
    [
        'underscore',
        'jquery',
        'module',
        'views/shared/PopTart'
    ],
    function(
        _,
        $,
        module,
        PopTart
    ) {
        return PopTart.extend({
            moduleId: module.id,
            className: 'drilldown-poptart popdown-dialog',
            initialize: function() {
                PopTart.prototype.initialize.apply(this, arguments);
            },
            events: _.extend({}, PopTart.prototype.events, {
                'click .close': function(e) {
                    this.hide(e); 
                    e.preventDefault();
                }
            }),
            render: function() {
                this.$el.html(PopTart.prototype.template);
                this.$('.popdown-dialog-body').html(_.template(this.bodyTemplate, {
                    _:_,
                    header: this.options.header
                }));
                return this;
            },
            bodyTemplate: '\
                <a href="#" class="close"><i class="icon-close"></i></a>\
                <h2 class="drilldown-poptart-header"><%- header %></h2>\
                <div class="divider"></div>\
                <div class="drilldown-poptart-body"></div>\
            '
        });
    }
);
