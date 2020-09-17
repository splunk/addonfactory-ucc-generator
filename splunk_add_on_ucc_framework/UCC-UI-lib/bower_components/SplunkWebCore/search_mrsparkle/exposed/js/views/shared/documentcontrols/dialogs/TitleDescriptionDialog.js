define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/shared/Modal',
    'views/shared/controls/ControlGroup',
    'views/shared/FlashMessages'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        Modal,
        ControlGroup,
        FlashMessage
    ) {
    return Modal.extend({
        moduleId: module.id,
        /**
        * @param {Object} options {
        *       model: {
        *           report: <models.Report>
        *       }
        * }
        */
        initialize: function(options) {
            Modal.prototype.initialize.apply(this, arguments);
            var defaults = {
                showSearchField: false
            };

            _.defaults(this.options, defaults);

            this.modelAttribute = 'description';
            
            if (_.isFunction(this.model.report.isDataset) && this.model.report.isDataset()) {
                if (this.model.report.getType() === 'table') {
                    this.modelAttribute = 'dataset.description';
                }
            }

            this.model.inmem = this.model.report.clone();

            this.children.flashMessage = new FlashMessage({ model: this.model.inmem });

            this.children.titleField = new ControlGroup({
                controlType: 'Label',
                controlOptions: {
                    modelAttribute: 'name',
                    model: this.model.inmem.entry
                },
                label: _('Title').t()
            });

            this.children.descriptionField = new ControlGroup({
                controlType: 'Textarea',
                controlOptions: {
                    modelAttribute: this.modelAttribute,
                    model: this.model.inmem.entry.content,
                    placeholder: _('optional').t()
                },
                label: _('Description').t()
            });

            this.on('hidden', function() {
                if (this.model.inmem.get("updated") > this.model.report.get("updated")) {
                    //now we know have updated the clone
                    this.model.report.entry.content.set(this.modelAttribute, this.model.inmem.entry.content.get(this.modelAttribute));
                    this.model.report.trigger('updateCollection');
                }
            }, this);
        },
        events: $.extend({}, Modal.prototype.events, {
            'click .btn-primary': function(e) {
                this.model.inmem.save({}, {
                    success: function(model, response) {
                        this.hide();
                    }.bind(this)
                });

                e.preventDefault();
            }
        }),
        render : function() {
            this.$el.html(Modal.TEMPLATE);

            this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Edit Description").t());

            this.children.flashMessage.render().prependTo(this.$(Modal.BODY_SELECTOR));

            this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);

            this.children.titleField.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
            this.children.descriptionField.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));

            this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
            this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_SAVE);

            return this;
        }
    });
});
