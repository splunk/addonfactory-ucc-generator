define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'views/Base',
        'views/shared/reportcontrols/dialogs/embed_dialog/Master'
    ],
    function($, _, Backbone, module, Base, EmbedDialog) {
        return Base.extend({
            moduleId: module.id,
            tagName: 'span',
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
            },
            events: {
                'click a.edit-embed': function(e) {
                    this.children.embedDialog = new EmbedDialog({
                        model: this.model,
                        onHiddenRemove: true
                    });

                    this.children.embedDialog.render().appendTo($("body"));
                    this.children.embedDialog.show();

                    e.preventDefault();
                }
            },
            render: function() {
                this.$el.html(this.compiledTemplate({
                    _: _
                }));
                return this;
            },
            template: '\
                <a class="edit-embed" href="#"><%- _("Edit").t() %></a>\
            '
        });
    }
);
