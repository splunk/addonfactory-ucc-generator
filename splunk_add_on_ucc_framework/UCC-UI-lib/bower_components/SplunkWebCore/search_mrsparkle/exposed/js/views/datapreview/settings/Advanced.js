define(
[
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base',
    'views/datapreview/settings/AdvancedFields',
    'views/datapreview/settings/CopyToClipboardDialog',
    'contrib/text!views/datapreview/settings/Advanced.html'
],
function(
    $,
    _,
    Backbone,
    module,
    BaseView,
    AdvancedFieldsView,
    CopyToClipboardDialog,
    advancedTemplate
){
    return BaseView.extend({
        moduleId: module.id,
        template: advancedTemplate,
        initialize: function(){
            BaseView.prototype.initialize.apply(this, arguments);
            var self = this;
            this.intermediateModel = new Backbone.Model();

            this.children.advancedFieldsView = new AdvancedFieldsView({
                model: this.intermediateModel,
                staticItems: ['CHARSET'],
                hideEmpty: true,
                silent: !_.isUndefined(this.options.updateSilent) ? this.options.updateSilent : true
            });

            this.model.sourcetypeModel.entry.content.on('change', function(sourcetypeModel, options){
                if(options && options.setby === 'intermediateevent'){
                    return;
                }
                self.setIntermediateModel.call(self);
            });
            
            this.intermediateModel.on('change', function(intermediateModel, options){
                if(options && options.setby === 'intermediateevent'){
                    return;
                }
                self.model.sourcetypeModel.entry.content.set(self.intermediateModel.changedAttributes(), {setby: 'intermediateevent'});
            });

            this.setIntermediateModel();

        },
        setSourcetypeModel: function(){
            this.model.sourcetypeModel.entry.content.set(this.intermediateModel.attributes, {setby: 'intermediateevent'});
        },
        setIntermediateModel: function(){
            this.intermediateModel.clear({silent: true});
            // get dynamic set of explicit props
            var explicitProps = this.model.sourcetypeModel.getExplicitProps();
            // add static items, but don't overwrite default with empty props
            if (this.model.sourcetypeModel.entry.content.get('CHARSET')) {
                explicitProps['CHARSET'] = this.model.sourcetypeModel.entry.content.get('CHARSET');
            }
            this.intermediateModel.set(explicitProps, {setby: 'intermediateevent'});
        },
        events: {
            //If user clicks "copy to clipboard", initialize copyToClipboardDialog
            //to display a modal with the sourcetype name stanza and props.conf name/value pairs in a text field
            'click .copyToClipboard' : function(e) {
                e.preventDefault();
                this.children.clipboardDialog = new CopyToClipboardDialog({
                        model: {
                            intermediateModel: this.intermediateModel,
                            sourcetypeModel: this.model.sourcetypeModel
                        },
                        onHiddenRemove: true
                    });
                this.children.clipboardDialog.render().appendTo($("body"));
                this.children.clipboardDialog.show();
            },
            'click .applySettings' : function(e) {
                e.preventDefault();
                this.setSourcetypeModel();
            }
        },
        render: function() {
            this.$el.html(this.compiledTemplate({_:_}));
            
            if (this.children.advancedFieldsView) {
                this.children.advancedFieldsView.detach();
            }
            
            this.$('.advanced').append(this.children.advancedFieldsView.render().el);

            return this;
        }
    });
});
