define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/shared/add_data/input_forms/sourceselector/Master',
    'views/shared/Modal'
],
function(
    $,
    _,
    Backbone,
    module,
    SourceSelector,
    Modal
){
    return Modal.extend({
        moduleId: module.id,
        className: Modal.CLASS_NAME + " " + Modal.CLASS_MODAL_WIDE,
        initialize: function(options) {
            Modal.prototype.initialize.call(this, arguments);

            this.children.sourceSelector = new SourceSelector({
                model: this.model,
                collection: this.collection,
                deferreds: this.deferreds,
                browserType: this.options.browserType,
                urlArgsOverride: this.options.urlArgsOverride
            });
            
            this.$el.removeClass('fade');
        },
        events: $.extend({}, Modal.prototype.events, {
            'click .btn-primary': function(e) {
                this.hide();
                var selectedNode = this.children.sourceSelector.getSelectedNode();
                this.model.sourceModel.set({
                    input: selectedNode.id,
                    selectedNodeHasChildren: selectedNode.hasSubNodes
                });
            }
        }),
        render: function() {
            this.$el.html(Modal.TEMPLATE);
            this.$(Modal.BODY_SELECTOR).show();
            this.$(Modal.BODY_SELECTOR).removeClass('modal-body-scrolling').append(this.children.sourceSelector.render().el);
            this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Select source").t());
            this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
            this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn btn-primary modal-btn-primary">'+_('Select').t()+'</a>');
            return this;
        }
    });
});
