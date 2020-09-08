define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'views/shared/controls/ControlGroup'
    ],
    function(
        _,
        $,
        module,
        BaseView,
        ControlGroup
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'commandeditor-group',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                
                this.children.oldValue = new ControlGroup({
                    controlType: 'Text',
                    label: _('Current value').t(),
                    size: 'small',
                    controlOptions: {
                        model: this.model.editorValue,
                        modelAttribute: 'oldValue',
                        updateOnKeyUp: true
                    }
                });
                
                this.children.newValue = new ControlGroup({
                    controlType: 'Text',
                    label: _('New value').t(),
                    size: 'small',
                    controlOptions: {
                        model: this.model.editorValue,
                        modelAttribute: 'newValue',
                        updateOnKeyUp: true
                    }
                });
            },
            
            events: {
                'click .commandeditor-group-remove': function(e) {
                    e.preventDefault();
                    this.collection.editorValues.remove(this.model.editorValue);
                }
            },
            
            render: function() {
                var shouldShowRemove = this.collection.editorValues.length > 1;
                
                if (shouldShowRemove) {
                    this.$el.html(this.compiledTemplate());
                }
                
                this.children.oldValue.render().appendTo(this.$el);
                this.children.newValue.render().appendTo(this.$el);
                
                return this;
            },
            
            template: '<a href="#" class="commandeditor-group-remove"><i class="icon-x" /></a>'
        });
    }
);