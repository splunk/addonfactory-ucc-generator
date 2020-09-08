define([
    'underscore',
    'jquery',
    'module',
    'views/Base',
    'views/shared/add_data/input_forms/sourceselector/SourceSelector',
    'views/shared/FlashMessages'
],
function(
    _,
    $,
    module,
    Base,
    SourceSelector,
    FlashMessages
){	
    return Base.extend({
        moduleId: module.id,
        initialize: function(options) {
            Base.prototype.initialize.apply(this, arguments);

            this.children.flashMessages = new FlashMessages();

            this.children.selector = new SourceSelector({
                model: this.model,
                collection: this.collection,
                deferreds: this.options.deferreds,
                browserType: this.options.browserType,
                urlArgsOverride: this.options.urlArgsOverride,
                flashMsgHelper: this.children.flashMessages.flashMsgHelper
            });


        },
        getSelection: function(){
            return this.getSelectedNode().id;
        },
        getSelectedNode: function(){
            return this.children.selector.getSelectedNode();
        },
        render: function() {
            this.$el
                .append(this.children.selector.render().el)
                .append(this.children.flashMessages.render().el);
            
            return this;
        }
    });
});
