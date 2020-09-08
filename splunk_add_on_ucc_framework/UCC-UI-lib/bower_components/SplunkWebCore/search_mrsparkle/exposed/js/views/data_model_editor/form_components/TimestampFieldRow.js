define([
            'module',
            'views/Base',
            'views/shared/controls/SyntheticCheckboxControl'
        ],
        function(
            module,
            BaseView,
            SyntheticCheckboxControl
        ) {

    return BaseView.extend({

        tagName: 'tr',
        moduleId: module.id,

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.children.checkBoxSelected = new SyntheticCheckboxControl({
                model: this.model,
                modelAttribute: 'selected'
            });
            this.listenTo(this.model, 'change', this.debouncedRender);
        },

        render: function() {
            this.children.checkBoxSelected.detach();
            this.$el.html(this.compiledTemplate({
                fieldName: this.model.get('fieldName'),
                selected: this.model.get('selected')
            }));
            this.children.checkBoxSelected.render().appendTo(this.$('.col-checkbox'));
            return this;
        },

        template: '\
            <td></td>\
            <td class="col-checkbox"></td>\
            <td class="col-description"><%- fieldName %></td>\
            <td class="col-rename">\
                <% if(selected) { %>\
                    <span class="uneditable-property"><%- fieldName %></span>\
                <% } %>\
            </td>\
            <td class="col-type">\
                <% if(selected) { %>\
                    <span class="uneditable-property"><%- _("Time, Required").t() %></span>\
                <% } %>\
            </td>\
        '

    });

});