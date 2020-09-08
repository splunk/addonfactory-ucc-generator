define(['module',
        'jquery',
        'underscore',
        'backbone'],
    function(module,
             $,
             _,
             Backbone) {

        var TitleEditor = Backbone.View.extend({
            moduleId: module.id,
            tagName: 'input',
            className: 'title-editor label-editor',
            initialize: function(options) {
                Backbone.View.prototype.initialize.apply(this, arguments);
                this.tokenEnabled = options.tokens !== false;
                this.attribute = options.attribute || 'title';
                this.placeholder = options.placeholder || _('Untitled').t();
                this.listenTo(this.model, 'change:' + this.attribute, function() {
                    this._updateFromModel();
                });
                this._updateModel = _.debounce(this._updateModel.bind(this), 50);
            },
            _updateFromModel: function() {
                var curVal = this.$el.val();
                var newVal = this.model.get(this.attribute, {tokens: this.tokenEnabled});
                if (curVal != newVal) {
                    this.$el.val(_(newVal || '').t());
                }
            },
            _updateModel: function() {
                var value = this.$el.val();
                var curVal = this.model.get(this.attribute, {tokens: this.tokenEnabled});
                if (curVal != value) {
                    this.model.set(this.attribute, value, {tokens: this.tokenEnabled});
                    this.trigger('change:title', value);
                }
            },
            events: {
                'change': '_updateModel',
                'keydown': function(e) {
                    if (e.keyCode == 27 || e.keyCode == 13) {
                        e.preventDefault();
                        this.blur();
                    } else {
                        this._updateModel();
                    }
                }
            },
            blur: function() {
                this._updateModel();
                this.$el.blur();
            },
            focus: function() {
                this.$el.focus();
            },
            render: function() {
                this.$el.attr('type', 'text').attr('placeholder', this.placeholder);
                this._updateFromModel();
                return this;
            }
        });

        return TitleEditor;
    }
);