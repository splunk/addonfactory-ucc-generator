define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/shared/controls/TextControl'
    ],
    function(
        _,
        module,
        BaseView,
        TextControl
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'split-new-field-row',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.children.nameInput = new TextControl({
                    modelAttribute: 'name',
                    model: this.model,
                    updateOnKeyUp: true
                });
            },

            events: {
                'click .commandeditor-group-remove': function(e) {
                    e.preventDefault();
                    this.trigger('removeRow', { cid: this.model.cid });
                }
            },

            render: function() {
                this.$el.html(this.compiledTemplate({}));

                this.children.nameInput.render().appendTo(this.$el);

                return this;
            },

            template: '\
                <a class="commandeditor-group-remove"><i class="icon-x"></i></a>\
            '
        });
    }
);