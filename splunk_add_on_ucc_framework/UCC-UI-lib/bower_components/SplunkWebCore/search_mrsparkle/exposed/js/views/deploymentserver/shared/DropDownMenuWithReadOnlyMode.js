/**
 * @author jszeto
 * @date 10/16/12
 *
 * Simple Menu control that displays a button as the anchor and a popdown with a list of links. Differs from
 * SyntheticSelectControl since it does not provide selection support.
 *
 * When an item is clicked, the control triggers an "itemClicked" event with the value of the clicked item.
 *
 * @param {Object} options
 *              {String} label Label for the anchor button
 *              {String} labelIcon Icon for the anchor button
 *              {String} className CSS class name for the root element (default is "btn-group pull-right")
 *              {String} anchorClassName CSS class name for the anchor (default is "btn")
 *              {String} dropdownClassName CSS class name for the drop-down menu (default is "")
 *              {Object} items An array of primitive objects having keys:
 *                             label (textual display),
 *                             value (value to broadcast with the "itemClicked" event)
 *                             icon (icon name to show in menu and button label)
 *                             (ie, {label: 'Foo Bar', value: 'foo', icon: 'bar'}).
 */
// TODO [JCS] Add comments and documentation

define(
        [
            'jquery',
            'underscore',
            'views/shared/DropDownMenu',
            'views/shared/delegates/Popdown',
            'module'
        ],
        function(
            $,
            _,
            DropDownMenuView,  
            Popdown, 
            module
        )
{

    return DropDownMenuView.extend({
        moduleId: module.id,
        DEFAULT_CLASS_NAME: "btn-group pull-right",
        DEFAULT_ANCHOR_CLASS_NAME: "btn",
        initialize: function(options) {
            DropDownMenuView.prototype.initialize.call(this, options);
        },
        render: function() {
            if (this.options.isReadOnly) {
                //Read-only mode: disable click logic
                var html = _(this.read_only_template).template({options:this.options});
                this.$el.html(html);
                return this; 
            }

            return DropDownMenuView.prototype.render.call(this);
        },
        template: '\
            <a class="dropdown-toggle" href="#">\
                <% if (options.labelIcon) { %> \
                    <i class="icon-<%- options.labelIcon %> icon-large"></i>\
                <% } %>\
                <span class="link-label"><%- options.label %></span><span class="caret"></span>\
            </a>\
            <div class="dropdown-menu <%- options.dropdownClassName || \'\' %>">\
                <div class="arrow"></div>\
                <ul>\
                <% _(options.items).each(function(object, i) { %>\
                    <li>\
                        <a href="#" data-value="<%- object.value %>" data-item-index="<%- i %>" >\
                            <% if (object.icon) { %> \
                                <i class="icon-<%- object.icon %> icon-large"></i>\
                            <% } %>\
                            <%- object.label %>\
                        </a>\
                    </li>\
                <% }) %>\
                </ul>\
            </div>\
        ', 
        read_only_template: '\
                <span class="link-label"><%- options.label %></span><span class="caret"></span>\
        ' 
    });
});
