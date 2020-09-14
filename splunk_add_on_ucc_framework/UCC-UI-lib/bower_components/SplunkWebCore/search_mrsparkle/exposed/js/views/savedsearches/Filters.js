/**
 * @author claral
 * @date 10/28/2016
 *
 * Report/alert filter for saved searches manager page.
 */
define([
        'jquery',
        'underscore',
        'backbone',
        'module',
        'views/Base',
        'views/shared/controls/SyntheticSelectControl'
    ],
    function (
        $,
        _,
        Backbone,
        module,
        BaseView,
        SyntheticSelectControl
    ) {

        return BaseView.extend({
            moduleId: module.id,

            initialize: function (options) {
                BaseView.prototype.initialize.call(this, options);

                this.children.itemTypeSelect = new SyntheticSelectControl({
                    label: _('Type: ').t(),
                    model: this.model.metadata,
                    modelAttribute: 'itemType',
                    toggleClassName: 'btn-pill',
                    menuWidth: 'narrow',
                    items: [],
                    popdownOptions: {
                        detachDialog: true
                    }
                });

                this.setItemTypes();
            },

            setItemTypes: function(){
                var items = [{label: _('All').t(), value: ''},
                             {label: _('Reports').t(), value: 'reports'},
                             {label: _('Alerts').t(), value: 'alerts'}];
                this.children.itemTypeSelect.setItems(items);
            },

            render: function () {
                this.children.itemTypeSelect.render().appendTo(this.$el);

                return this;
            }
        });
    });

