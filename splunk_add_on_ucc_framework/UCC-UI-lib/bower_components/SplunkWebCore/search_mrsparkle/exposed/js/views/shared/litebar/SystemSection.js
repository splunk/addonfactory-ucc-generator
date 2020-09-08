define([
    'jquery',
    'underscore',
    'module',
    'views/Base',
    'views/shared/Icon',
    'contrib/text!views/shared/litebar/SystemSection.html',
    './SystemSection.pcssm'
],
function(
    $,
    _,
    module,
    BaseView,
    IconView,
    systemMenuSectionTemplate,
    css
){
    return BaseView.extend({
        moduleId: module.id,
        template: systemMenuSectionTemplate,
        css: css,
        attributes: {
            'data-accordion-role': 'group'
        },
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            var itemsArray = this.model.get('items');
            itemsArray.sort(function(a,b){
                return parseInt(a.get('order'), 10) - parseInt(b.get('order'), 10);
            });
            this.children.icon = new IconView({icon: 'chevronRight'});
            this.children.icon.$el.attr('data-accordion-role', 'toggle-icon');
        },
        render: function() {
            var html = this.compiledTemplate({
                model: this.model,
                groupTitle: this.model.get('label'),
                css: this.css
            });
            this.$el.html(html);
            this.$('[data-accordion-role=toggle]').prepend(this.children.icon.render().el);
            return this;
        }
    });
});
