define(function (require, exports, module) {
    var _ = require('underscore');
    var Backbone = require('backbone');
    var console = require('util/console');

    var TitleEditor = Backbone.View.extend({
        tagName: 'input',
        className: 'title-editor',
        initialize: function (options) {
            Backbone.View.prototype.initialize.apply(this, arguments);
            this.attribute = options.attribute || 'title';
            this.placeholder = options.placeholder || _('Untitled').t();
            this.listenTo(this.model, 'change:' + this.attribute, function(title){
                this.trigger('update', title);
            });
        },
        updateFromModel: function () {
            var curVal = this.$el.val();
            var newVal = this.model.get(this.attribute);
            if (curVal != newVal) {
                this.$el.val(_(newVal || '').t());
            }
        },
        updateModel: function () {
            var value = this.$el.val().trim();
            console.log('Update title: ', value);
            this.model.set(this.attribute, value);
        },
        $input: function () {
            return this.$el;
        },
        events: {
            'change': 'updateModel',
            'keyup': function(e) {
                if (e.keyCode == 27) {
                    this.updateFromModel();
                    this.$el.blur();
                } else if(e.keyCode == 13) {
                    this.updateModel();
                    this.$el.blur();
                }
            }
        },
        focus: function() {
            this.$el.focus();
        },
        render: function () {
            this.$el.attr('type', 'text').attr('placeholder', this.placeholder);
            this.updateFromModel();
            return this;
        }
    });

    return TitleEditor;
});