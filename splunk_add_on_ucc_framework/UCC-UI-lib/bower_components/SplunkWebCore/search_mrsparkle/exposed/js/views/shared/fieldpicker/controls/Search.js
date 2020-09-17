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
                this.activate();
                this.set = _.debounce(function() {
                    this.model.entry.content.set('display.prefs.fieldFilter', this.$('input').val());
                }.bind(this), 250);
            },
            startListening: function() {
                this.listenTo(this.model.entry.content, 'change:display.prefs.fieldFilter', this.render);
            },
            events: {
                'keyup input': function(e) {
                    e.preventDefault();
                    var $el = $(e.target);
                    if (e.keyCode == 27) {
                        this.clear();
                    } else {
                        this.set();
                    }
                    this.updateClear();
                },
                'click .clear': function(e) {
                    this.clear();
                    this.updateClear();
                    e.preventDefault();
                },
                'submit': function(e) {
                    e.preventDefault();
                }
            },
            clear: function() {
                this.model.entry.content.set('display.prefs.fieldFilter', '');
                this.render();
                this.$input.focus();
            },
            updateClear: function() {
                this.$clear[this.$input.val() ? 'show' : 'hide']();
            },
            render: function() {
                this.$el.html() || this.$el.html(this.compiledTemplate());
                this.$clear = this.$('.clear');
                this.$input = this.$('input');
                this.$input.val(this.model.entry.content.get('display.prefs.fieldFilter'));
                this.updateClear();
                return this;
            },
            template: '<input type="text" class="input-medium search-query text-clear" placeholder="filter">\
                <a href="#" class="clear" style="display: none;"><i class="icon-x-circle"></i></a>'
        });
    }
);
