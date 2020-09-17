define(function(require) {
    var _ = require('underscore'),
        Backbone = require('backbone');

    return Backbone.View.extend({
        initialize: function() {
            this.listenTo(this.model, 'change:description', this.render, this);
            this.listenTo(this.model, 'change:edit', this.render, this);
        },
        render: function() {
            if(this.model.has('description')) {
                var txt = _(this.model.get('description') || '').t(),
                    edit = this.model.get('edit');
                this.$el.text(txt)[ txt && !edit ? 'show' : 'hide' ]();
            }
            return this;
        }
    });

});