define([
            'module',
            'jquery',
            'models/Base',
            'views/shared/controls/Control',
            'views/shared/controls/colors/ColorPicker'
        ],
        function(
            module,
            $,
            BaseModel,
            Control,
            ColorPicker
        ) {
    
    return Control.extend({
    
        moduleId: module.id,

        events: {
            'click .color-square': function(e) {
                e.preventDefault();
                var $target = $(e.target);
                this.children.colorPicker = new ColorPicker({
                    model: this.mediatorModel,
                    paletteColors: this.options.paletteColors,
                    shadeColor: function(color) { return color; },
                    onHiddenRemove: true
                });
                this.children.colorPicker.render().appendTo($('body'));
                this.children.colorPicker.show($target);
            }
        },
    
        initialize: function() {
            this.mediatorModel = new BaseModel({
                color: this.model.get(this.options.modelAttribute)
            });
            Control.prototype.initialize.apply(this, arguments);
        },

        startListening: function() {
            Control.prototype.startListening.apply(this, arguments);
            this.listenTo(this.mediatorModel, 'change:color', function() {
                this.model.set(this.options.modelAttribute, this.mediatorModel.get('color'));
            });
        },

        setValueFromModel: function() {
            this.mediatorModel.set('color', this.model.get(this.options.modelAttribute));
            Control.prototype.setValueFromModel.apply(this, arguments);
        },

        render: function() {
            var color = this.model.get(this.options.modelAttribute).replace(/^0x/, '#');
            this.$el.html(this.compiledTemplate({ color: color }));
            return this;
        },

        template: '\
            <a href="#" class="color-square color-square-standalone" style="background-color: <%- color %>;"></a>\
        '
        
    });
    
});