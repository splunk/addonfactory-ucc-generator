define(
    [
        'underscore',
        'module',
        'views/shared/controls/TextControl'
    ],
    function(_, module, TextControl) {
        return TextControl.extend({
            moduleId: module.id,
            startListening: function() {
                if (this.model) {
                    this.listenTo(this.model, 'change:'+this.options.modelAttribute, function(model, value, options) {
                        this.setValueFromModel(options.render);
                    });
                }
            },
            setValue: function(value, render, options){
                options = options || {};
                options.render = render;

                var returnValue = this._setValue(value, render, options.silent);
                if (this.options.updateModel) {
                    this.updateModel(options);
                }
                return returnValue;
            }
        });
    }
);
