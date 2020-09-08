define(function(require) {
    var _ = require('underscore'),
            $ = require('jquery'),
            Backbone = require('backbone');

    var DashboardTitle = Backbone.View.extend({
        initialize: function() {
            this.model.on('change:edit change:label', this.render, this);
        },
        render: function() {
            if(!this.model.has('label')) {
                this.model.set({ label: this.$el.text() }, { silent: true });
            }
            this.$('.edit-label').remove();
            this.$el.text(_(this.model.get('label')).t());
            if(this.model.get('edit')) {
                $('<span class="edit-label">' + _("Edit").t() + ': </span>').prependTo(this.$el);
            }
            return this;
        }
    });

    return DashboardTitle;

});