/**
 * @author leo
 * @date 04/7/2014
 *
 * @description This component displays a textfield with a Browse button next to it, which brings
 * a popup with a treeview for selecting an item from some structure like filesystem.
 */

define(
    [
        'jquery',
        'underscore',
        'views/shared/controls/TextControl',
        'views/shared/add_data/input_forms/SourceSelectorDialog',
        'module'
    ],
    function (
        $,
        _,
        TextControl,
        SourceSelectorDialog,
        module
        ) {

        return TextControl.extend({
            moduleId: module.id,
            className: 'control input-append',
            initialize: function () {
            
                 TextControl.prototype.initialize.apply(this, arguments);
                 
                 // showSourceSelectorDialog always sets input attribute, so need to remap to correct value;
                 this.options.model.on('change:input', function(val) {
                     this.options.model.set(this.options.modelAttribute, val.get('input') );
                 },this);
                 
            },
            events: $.extend({}, TextControl.prototype.events, {'click .btn' : 'showSourceSelectorDialog'}),
            showSourceSelectorDialog: function(){

                    if(!this.children.sourceSelectorDialog){
                        this.children.sourceSelectorDialog = new SourceSelectorDialog({
                            model: {
                                sourceModel: this.options.model,
                                application: this.options.applicationModel
                            },
                            browserType: this.options.browserType,
                            urlArgsOverride: this.options.urlArgsOverride
                        });
                        $('body').append(this.children.sourceSelectorDialog.render().el);
                    }
                    this.children.sourceSelectorDialog.show();

            },
            template: TextControl.prototype.template +
            '<button class="btn" id="browseBtn"><%= _("Browse").t() %></button>'
        });
    }
);
