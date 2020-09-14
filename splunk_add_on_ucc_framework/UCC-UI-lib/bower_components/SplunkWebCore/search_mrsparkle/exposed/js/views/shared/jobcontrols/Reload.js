define(
    [
        'underscore',
        'module',
        'views/Base',
        'bootstrap.tooltip'
    ],
    function(_, module, Base) {
        return Base.extend({
            moduleId: module.id,
            className: 'reload btn-pill btn-square',
            tagName: 'a',
            attributes: {
                "href": "#"
            },
            initialize: function() {
                var attachTooltipTo = this.options.attachTooltipTo || this.$el;
                Base.prototype.initialize.apply(this, arguments);
                this.$el.html('<i class="icon-rotate-counter"></i><span class="hide-text">' + _('Reload').t() + '</span>');
                this.$el.tooltip({animation:false, title:_('Reload').t(), container: attachTooltipTo});
            },
            events: {
                'click': function(e) {
                    e.preventDefault();
                    if (this.isActive()) {
                        this.model.trigger('reload');
                    }
                    this.$el.blur().tooltip('show');
                }
            },
            isActive: function() {
                return this.model.isDone();
            },
            render: function() {
                return this;
            },
            remove: function() {
                this.$el.blur().tooltip('destroy');
                return Base.prototype.remove.apply(this, arguments);
            }
        });
    }
);
