define([
    'underscore',
    'module',
    'views/dashboard/Base',
    'views/shared/delegates/Popdown'
], function(_,
            module,
            BaseView,
            Popdown) {

    var ElementControls = BaseView.extend({
        viewOptions: {
            register: false
        },
        moduleId: module.id,
        className: 'dashboard-element-controls',
        initialize: function(options) {
            BaseView.prototype.initialize.apply(this, arguments);
            this.manager = options.manager;
            this.settings = options.settings;
        },
        events: {
            'click a.action-change-title': function(e) {
                e.preventDefault();
                this.model.elementState.trigger('edit:title');
                this.children.popdown.hide();
            }
        },
        getTemplateArgs: function() {},
        render: function() {
            this.$el.html(this.compiledTemplate(_.extend({
                iconClass: this.getIconClass()
            }, this.getTemplateArgs())));
            this.children.popdown = new Popdown({el: this.el, mode: 'dialog'});
            return this;
        }
    });
    return ElementControls;
});
