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
 */
// TODO [JCS] Add comments and documentation

define(
        [
            'jquery',
            'underscore',
            'views/Base',
            'views/shared/delegates/Popdown',
            'util/keyboard',
            'module'
        ],
        function(
            $,
            _,
            BaseView,
            Popdown,
            keyboardUtils,
            module
        )
{

    return BaseView.extend({
        moduleId: module.id,
        DEFAULT_CLASS_NAME: "btn-group pull-right",
        DEFAULT_ANCHOR_CLASS_NAME: "btn",
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            options = options || {};
            this.enabled = true;
            this.$el.addClass(options.hasOwnProperty('className') ? options.className : this.DEFAULT_CLASS_NAME);
            this.anchorClassName = options.hasOwnProperty('anchorClassName') ? options.anchorClassName : this.DEFAULT_ANCHOR_CLASS_NAME;
            this.options.popdownOptions = $.extend(true, { el: this.el , attachDialogTo: 'body'}, this.options.popdownOptions);
        },
        setItems: function(items) {
            this.options.items = items;
            // only render if view has already been rendered
            if (this.$el.html()) {
                this.debouncedRender();
            }
        },
        enable: function() {
            this.enabled = true;
            this.$('.dropdown-toggle').removeClass('disabled');
        },
        disable: function() {
            this.enabled = false;
            this.$('.dropdown-toggle').addClass('disabled');
        },
        render: function() {
            if (this.children.popdown)
                this.children.popdown.remove();

            var html = _(this.template).template({options:this.options,
                                                  useNestedArrays: this.isArrayofArrays(this.options.items)});
            this.$el.html(html);
            this.$(".dropdown-toggle").addClass(this.enabled ? this.anchorClassName : this.anchorClassName + ' disabled');
            // store a reference to the menu container now in case the popdown appends it to the body
            this.$dropdownMenu = this.$(".dropdown-menu");
            this.$dropdownMenu.on("click", "ul > li > a:not(.disabled)", _(this.handleItemClick).bind(this));
            this.$dropdownMenu.on("keydown", _(function(e) {
                // 508: When escape is pressed, close the drop-down menu but stop the event propagation in case the
                // menu is inside another popdown or modal.
                if(e.which === keyboardUtils.KEYS.ESCAPE) {
                    this.children.popdown.hide(e);
                    e.stopPropagation();
                }
            }).bind(this));

            this.children.popdown = new Popdown(this.options.popdownOptions);
            // 508 FTW: focus the first non-disabled item when the menu is shown
            this.children.popdown.on('shown', function() {
                this.$dropdownMenu.find('a[data-value]:not(.disabled)').first().focus();
            }, this);
            // More 508 FTW: focus the activator when the popdown is closed
            // But only if the popdown is closed by an explicit user action
            // (e.g. not because the toggle was scrolled out of the visible area)
            this.children.popdown.on('hidden', function(e) {
                if (e) {
                    this.$('.dropdown-toggle').focus();
                }
            }, this);
            return this;
        },
        isArrayofArrays: function(items) {
            if (_(items).isArray() && items.length > 0 && _(items[0]).isArray()) {
                return true;
            }
            return false;
        },
        handleItemClick: function(e) {
            e.preventDefault();
            var $target = $(e.currentTarget),
                itemValue = $target.attr('data-value'),
                itemIndex = parseInt($target.attr('data-item-index'), 10);

            if (this.isArrayofArrays(this.options.items)) {
                var itemsArrayIndex = parseInt($target.attr('data-items-array-index'), 10);
                this.trigger("itemClicked", itemValue, this.options.items[itemsArrayIndex][itemIndex]);
            } else {
                this.trigger("itemClicked", itemValue, this.options.items[itemIndex]);
            }
        },

        template: '\
            <a class="dropdown-toggle" href="#">\
                <% if (options.labelIcon) { %><i class="icon-<%- options.labelIcon %> icon-large"></i><% } %><span class="link-label"><%- options.label %></span><span class="caret"></span>\
            </a>\
            <div class="dropdown-menu <%- options.dropdownClassName || \'\' %>">\
                <div class="arrow"></div>\
                <% if (useNestedArrays) { %>\
                    <% _(options.items).each(function(itemsChild, i) { %>\
                    <ul>\
                        <% _(itemsChild).each(function(object, j) { %>\
                            <li>\
                                <a href="#" data-value="<%- object.value %>" data-items-array-index="<%- i %>" data-item-index="<%- j %>" \
                                    <% if(object.enabled === false) {%>\
                                        class="disabled"\
                                    <% } %>\
                                >\
                                    <% if (object.icon) { %> \
                                        <i class="icon-<%- object.icon %> icon-large"></i>\
                                    <% } %>\
                                    <%- object.label %>\
                                </a>\
                            </li>\
                        <% }) %>\
                    </ul>\
                    <% }) %>\
                <% } else { %>\
                    <ul>\
                        <% _(options.items).each(function(object, k) { %>\
                            <li>\
                                <a href="#" data-value="<%- object.value %>" data-item-index="<%- k %>" \
                                    <% if(object.enabled === false) {%>\
                                        class="disabled"\
                                    <% } %>\
                                    >\
                                    <% if (object.icon) { %> \
                                        <i class="icon-<%- object.icon %> icon-large"></i>\
                                    <% } %>\
                                    <%- object.label %>\
                                </a>\
                            </li>\
                        <% }) %>\
                    </ul>\
               <% } %>\
            </div>\
        '
    });
});
