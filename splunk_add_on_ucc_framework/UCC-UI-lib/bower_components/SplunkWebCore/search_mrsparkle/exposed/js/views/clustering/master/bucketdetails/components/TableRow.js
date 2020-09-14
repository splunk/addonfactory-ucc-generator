/**
 * Created by ykou on 5/15/14.
 */
define(
    [
        'jquery',
        'underscore',
        'backbone',
        'views/Base',
        'module',
        './ActionMenu'
    ],
    function(
        $,
        _,
        Backbone,
        BaseView,
        module,
        ActionMenu
    )
    {
        /**
         * this.options.rowData: an array of data, which would be columns in that row
         */
        return BaseView.extend({
            moduleId: module.id,
            tagName: 'tr',
            className: 'table-row',
            
            events: {
                'click .action-menu': function(e) {
                    if (this.children.actionMenu && this.children.actionMenu.shown) {
                        this.children.actionMenu.hide();
                        e.preventDefault();
                        return;
                    }

                    this.children.actionMenu = new ActionMenu({
                        model: this.model,
                        onHiddenRemove: true
                    });
                    $('body').append(this.children.actionMenu.render().el);
                    this.children.actionMenu.show( $(e.currentTarget));
                }
            },
            
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.$el = $('<tr>');
            },
            
            render: function() {
                _.each(this.options.rowData, function(element, index, array) {
                    var cell = null;
                    if (this.options.rowType == 'head') {
                        cell = $('<th>').append(element);
                    }
                    else {
                        cell = $('<td>').append(element);
                    }
                    this.$el.append(cell);
                }.bind(this));
                return this;
            }
        });
    }
);