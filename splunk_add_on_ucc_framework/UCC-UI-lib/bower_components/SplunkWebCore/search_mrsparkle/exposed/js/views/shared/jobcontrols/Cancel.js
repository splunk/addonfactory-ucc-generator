define(['underscore', 'module', 'views/Base', 'bootstrap.tooltip'], function(_, module, BaseView /* bootstrap tooltip */) {
    return BaseView.extend({
        moduleId: module.id,
        className: 'cancel btn-pill btn-square',
        tagName: 'a',
        attributes: {
            "href": "#"
        },
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.$el.tooltip({animation:false, title:_('Delete').t(), container: 'body'});
        },
        events: {
            'click': function(e) {
                e.preventDefault();
                
                if (!this.isActive()) {
                	return true;
                } 
                
                this.model.destroy();
                this.model.clear();
            }
        },
        isActive: function() {
            return !this.model.isNew() && !this.model.isDone();
        },
        render: function() {
            this.$el.html('<i class="icon-trash"></i><span class="hide-text">' + _("Cancel").t() + '</span>');
            return this;
        }
    });
});
