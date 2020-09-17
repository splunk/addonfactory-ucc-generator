/**
 * @author lbudchenko
 * @date 8/18/15
 *
 * Additional filters for sourcetypes manager page
 */
define([
        'jquery',
        'underscore',
        'backbone',
        'module',
        'views/Base',
        'views/shared/controls/SyntheticSelectControl',
        'views/shared/controls/SyntheticCheckboxControl'
    ],
    function (
        $,
        _,
        Backbone,
        module,
        BaseView,
        SyntheticSelectControl,
        SyntheticCheckboxControl
    ) {

        return BaseView.extend({
            moduleId: module.id,

            initialize: function (options) {
                BaseView.prototype.initialize.call(this, options);

                this.children.categorySelect = new SyntheticSelectControl({
                    label: _('Category').t()+': ',
                    model: this.model.metadata,
                    modelAttribute: 'category',
                    toggleClassName: 'btn-pill',
                    menuWidth: 'wide',
                    items: [],
                    popdownOptions: {
                        detachDialog: true
                    }
                });

                this.children.pulldownToggle = new SyntheticCheckboxControl({
                    label: _('Show only popular').t(),
                    model: this.model.metadata,
                    modelAttribute: 'pulldown',
                    additionalClassNames: 'pulldown-toggle'
                });

                this.setCategoryItems();
            },

            setCategoryItems: function(){
                var items = [[{label: "All", value: ""}], this.collection.sourcetypesCategories.getCategories()];
                this.children.categorySelect.setItems(items);
            },

            render: function () {
                this.children.pulldownToggle.render().appendTo(this.$el);
                this.children.categorySelect.render().appendTo(this.$el);

                return this;
            }
        });
    });

