/**
 * @author usaha
 * @date 03/11/13
 *
 * Extends DropDownMenu.  Allows for two labels to be displayed on each row of the drop-down which will be left-aligned and right-aligned respectively.  
 *
 *
 * @param {Object} options
 *              {String} label Label for the anchor button
 *              {String} labelIcon Icon for the anchor button
 *              {String} className CSS class name for the root element (default is "btn-group pull-right")
 *              {String} anchorClassName CSS class name for the anchor (default is "btn")
 *              {Object} items Either an array of primitive item objects or an array of arrrays of primitive item objects.
 *              Use the array of arrays to group subsets of the items visually.
 *
 *              The primitive objects have keys:
 *                             label (textual display),
 *                             value (value to broadcast with the "itemClicked" event)
 *                             icon (icon name to show in menu and button label)
 *                             (ie, {label: 'Foo Bar', value: 'foo', icon: 'bar'}).
 *
 *                       Ex.
 *                       items = [
 *                          [
 *                              {label:"A One", value:"A1"},
 *                              {label:"A Two", value:"A2"}
 *                           ],
 *                          [
 *                              {label:"B One", value:"B1"},
 *                              {label:"B Two", value:"B2"},
 *                              {label:"B Three", value:"B3"},
 *                              {label:"B Four", value:"B4"}
 *                           ],
 *                          [
 *                              {label:"C One", value:"C1"}
 *                          ]
 *                       ]
 *
 *                       Each array of items is visually grouped together
 *
 *              {Backbone.Collection} collection - an collection which contains the selected items in the menu.  Each model of the collection should have a 'name' attribute which 
 *                                                 matches the 'value' attribute of an item in the 'items' array
 */

define(
        [
            'jquery',
            'underscore',
            'backbone', 
            'views/shared/DropDownMenu', 
            'views/shared/delegates/Popdown', 
            'contrib/text!views/deploymentserver/shared/DropDownMenuWithCounts.html',
            'module'
        ],
        function(
            $,
            _,
            Backbone, 
            DropDownMenuView,
            Popdown, 
            dropDownTemplate,
            module
        )
{

    return DropDownMenuView.extend({
        moduleId: module.id,
        DEFAULT_CLASS_NAME: "btn-group",
        DEFAULT_ANCHOR_CLASS_NAME: "btn",
        initialize: function(options) {
            DropDownMenuView.prototype.initialize.apply(this, arguments);
            this.collection.on('add remove reset', this.render, this); 
        },
         template: dropDownTemplate, 
         events: {
            'click li .unselected' : function(e) {
               // DropDownMenuView.prototype.handleItemClick.apply(this, arguments);

                var selectedMachineFilter = new Backbone.Model();
                selectedMachineFilter.set('name', $(e.target).attr('data-value'));
                this.collection.add(selectedMachineFilter); 
            }
        },
        render: function() {

            var html = _(this.template).template({
                options:this.options, 
                collection: this.collection, 
                useNestedArrays: DropDownMenuView.prototype.isArrayofArrays.apply(this, [this.options.items])
            });

            this.$el.html(html);
            this.$(".dropdown-toggle").addClass(this.anchorClassName || this.DEFAULT_ANCHOR_CLASS_NAME);
            this.$(".dropdown-menu").on("click", "ul > li > a", _(DropDownMenuView.prototype.handleItemClick).bind(this));
            this.children.popdown = new Popdown({el: this.el});
            return this;
        }
    });
});
