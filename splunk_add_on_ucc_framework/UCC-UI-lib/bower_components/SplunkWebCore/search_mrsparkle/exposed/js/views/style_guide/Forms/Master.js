define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'views/style_guide/Forms/Append',
        'views/style_guide/Forms/Help',
        'views/style_guide/Forms/Input',
        'views/style_guide/Forms/Vertical',
        'views/style_guide/Forms/OptionalFields',
        'views/style_guide/Forms/Section',
        'views/style_guide/Forms/Search',
        'views/style_guide/Forms/Wizard',
        'contrib/text!views/style_guide/Forms/Master.html'
    ],
    function(
        _,
        $,
        module,
        BaseView,
        Append,
        Help,
        Input,
        Vertical,
        Optional,
        Section,
        Search,
        Wizard,
        template
    ) {
        return BaseView.extend({
            moduleId: module.id,
            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
                this.children.append = new Append();
                this.children.help = new Help();
                this.children.input = new Input();
                this.children.vertical = new Vertical();
                this.children.optional = new Optional();
                this.children.section = new Section();
                this.children.search = new Search();
                this.children.wizard = new Wizard();
            },

            render: function() {
                this.$el.html(template);
                this.children.append.render().appendTo(this.$('#form_append'));
                this.children.help.render().appendTo(this.$('#form_help'));
                this.children.input.render().appendTo(this.$('#form_input'));
                this.children.vertical.render().appendTo(this.$('#form_vertical'));
                this.children.optional.render().appendTo(this.$('#form_optional'));
                this.children.section.render().appendTo(this.$('#form_section'));
                this.children.search.render().appendTo(this.$('#form_search'));
                this.children.wizard.render().appendTo(this.$('#form_wizard'));
                return this;
            }
        });
    }
);
