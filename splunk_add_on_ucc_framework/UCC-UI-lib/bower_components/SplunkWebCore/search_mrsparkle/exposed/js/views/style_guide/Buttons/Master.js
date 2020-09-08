define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'views/style_guide/Buttons/Basic',
        'views/style_guide/Buttons/Size',
        'views/style_guide/Buttons/Group',
        'views/style_guide/Buttons/Icon',
        'views/style_guide/Buttons/Menu',
        'views/style_guide/Buttons/Drag',
        'contrib/text!views/style_guide/Buttons/Master.html'
    ],
    function(
        _,
        $,
        module,
        BaseView,
        Basic,
        Size,
        Group,
        Icon,
        Menu,
        Drag,
        template
    ) {
        return BaseView.extend({
            moduleId: module.id,
            events: {
                'click #disable-button' : function(){

                }
            },
            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
                this.basic = new Basic();
                this.size = new Size();
                this.group = new Group();
                this.icon = new Icon();
                this.menu = new Menu();
                this.drag = new Drag();
            },

            render: function() {
                this.$el.html(template);
                this.basic.render().appendTo(this.$('#button_basic'));
                this.size.render().appendTo(this.$('#button_size'));
                this.group.render().appendTo(this.$('#button_group'));
                this.icon.render().appendTo(this.$('#button_icon'));
                this.menu.render().appendTo(this.$('#button_menu'));
                this.drag.render().appendTo(this.$('#button_drag'));
                return this;
            }
        });
    }
);
