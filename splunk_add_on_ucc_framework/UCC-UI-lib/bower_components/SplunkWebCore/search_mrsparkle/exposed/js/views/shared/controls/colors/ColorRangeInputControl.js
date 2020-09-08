define([
        'jquery',
        'underscore',
        'module',
        'backbone',
        'views/shared/controls/Control'
    ],
    function(
        $,
        _,
        module,
        Backbone,
        Control
        ) {

        return Control.extend({
            className: 'color-range-input-control',
            moduleId: module.id,

            initialize: function() {
                Control.prototype.initialize.apply(this, arguments);
            },

            events: {
                'keyup .input-value': function(e) {
                    e.preventDefault();
                    if (!this._handleInputChange) {
                        this._handleInputChange = _.debounce(function(e) {
                            var $target = $(e.currentTarget),
                                value = $.trim($target.val());
                            if (!isNaN(value) && value !== "") {
                                value = parseFloat(value);
                            }
                            this.model.set('value', value);
                        },300);
                    }
                    this._handleInputChange.apply(this, arguments);
                }
            },

            render: function() {
                if (!this.$el.html()) {
                    this.$el.html(this.compiledTemplate({
                        label: this.options.label,
                        customClass: this.options.customClass || 'color-control-right-col'
                    }));
                }
                this.$('.input-value').val(this.model.get('value'));
                return this;
            },

            template: '\
                <div class="control-group <%- customClass %>">\
                    <label class="control-label input-label">\
                        <span><%- label %></span>\
                    </label>\
                    <div class="controls input-value-container">\
                        <input class="input-value" type="text">\
                    </div>\
                </div>\
            '
        });

    });