define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base'
    ],
    function(_, $, module, Base) {
        return Base.extend({
            moduleId: module.id,
            tagName: 'form',
            className: 'search',
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
                this.model.on('change:filter', this.render, this);
            },
            events: {
                'keyup input': _.debounce(function(e) {
                    var $el = $(e.target);
                    if (e.keyCode == 27) {
                        this.model.set('filter', '');
                        this.render();
                        $el.focus();
                        return;
                    }
                    this.model.set('filter', this.$('input').val());
                  
                }, 500),
                'submit': function(e) {
                    return false;
                }
            },
            render: function() {
                this.$el.html() || this.$el.html('<input type="text" class="input-medium search-query" placeholder="' + _('filter').t() + '"/>');
                this.$('input').attr('value', this.model.get('filter'));
                return this;
            }
        });
    }
);

