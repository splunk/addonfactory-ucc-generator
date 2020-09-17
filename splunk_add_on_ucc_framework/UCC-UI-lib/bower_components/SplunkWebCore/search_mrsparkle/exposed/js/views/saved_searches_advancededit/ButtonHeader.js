define(
    [
        'underscore',
        'jquery',
        'backbone',
        'module',
        'views/Base'
    ],
    function(
        _,
        $,
        Backbone,
        module,
        Base
    ){
        return Base.extend({
            moduleId: module.id,

            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
            },

            events: {
                'click .btn.save-button': function(e) {
                    e.preventDefault();
                    if (!this.options.editable) {
                        return;
                    }

                    this.model.editModel.save({},{
                        success: function() {
                            this.model.state.trigger('BackToList');
                        }.bind(this)
                    });
                },
                'click .btn.cancel-button': function(e) {
                    e.preventDefault();
                    this.model.state.trigger('BackToList');
                }
            },

            render: function() {
                this.$el.html(this.compiledTemplate({
                    editable: this.options.editable
                }));
                return this;
            },

            template: '\
                <div class="header-buttons">\
                    <a href="#" class="btn btn-secondary cancel-button"><%- _("Cancel").t() %></a>\
                    <% if (editable) { %>\
                        <a href="#" class="btn btn-primary save-button"><%- _("Save").t() %></a>\
                    <% } %>\
                </div>\
            '
        });
    }
);