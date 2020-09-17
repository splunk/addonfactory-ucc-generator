define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/shared/controls/Control',
    'views/shared/delegates/Popdown',
    'views/shared/FindInput',
    'util/math_utils',
    'util/string_utils',
    'util/keyboard',
    'helpers/user_agent',
    'bootstrap.tooltip'
],
function(
    $,
    _,
    Backbone,
    module,
    Control,
    Popdown,
    InputView,
    math_utils,
    string_utils,
    keyboard_utils,
    userAgent,
    tooltip
){
    /**
     * @constructor
     * @memberOf views
     * @name SyntheticSelectControl
     * @description Synthetic Select dropdown a-la Bootstrap
     * @extends {views.Control}
     *
     * @param {Object} options
     * @param {Backbone.Model} options.model The model to operate on
     * @param {String} options.modelAttribute The attribute on the model to observe and update on
     * selection
     * @param {Object[]} options.items An array of elements and/or subarrays, where:
     * - An element is an object with keys described below (e.g. value & label)
     *    - An element typically represent a menu item
     *    - An element can be just a menu header, commonly used with menu item groupings (see below)
     *    - An element can represent a submenu if it contains `children` array of elements (nested
     * format)
     * - A subarray is a group of elements
     *    - A subarray represents a grouping of menu items with an divider and an optional menu
     * header
     *
     * Simple Example:
     *
     *     [{label: 'Foo Bar', value: 'foo', icon: 'bar'}]
     *
     * Complex example:
     *
     *     var items = [
     *         [
     *             {value: "item1", label: "Menu item with desc", description: "Click here!"},
     *             {value: "item2", label: "Menu item"},
     *             {label: "Sub menu", children: [
     *                 {value: "item3", label: "Action one"},
     *                 {value: "item4", label: "Action two"}
     *             ]},
     *         ],
     *         [
     *             {label: "Menu group header"},
     *             {value: "item5", label: "Another menu item"},
     *             {value: "item6"}
     *         ],
     *         [
     *             {label: "Submenu in a group", children: [
     *                 {label: "Cool submenu header"},
     *                 {value: "item7", label: "More action", description: "foo"},
     *                 {value: "item8", label: "Yet another action", description: "bar"},
     *             ]}
     *         ]
     *     ];
     *
     * @param {String} [options.items[].label = options.items[].value] textual display
     * @param {Any} [options.items[].value] value to store in model - if none specified, element is
     * considered a menu header instead of menu item
     * @param {String} [options.items[].icon] icon name to show in menu and button label
     * @param {String} [options.items[].iconURL] URL of icon to show in menu and button label
     * @param {Boolean} [options.items[].enabled = true] whether to enable the selection
     * @param {String} [options.items[].description] additional text
     * @param {Object[]} [options.items[].children] an array of item elements for submenus
     * @param {String} [options.prompt] String to display if the value is undefined. If prompt is
     * undefined, then the control will just display the first item. Default value is undefined
     * @param {String} [options.help] Html to display in the bottom help section
     * @param {String} [options.label] Html to display as the button label
     * @param {String} [options.toggleClassName] Class attribute to add to the parent element
     * @param {String} [options.menuClassName] Class attribute to add to the dialog element
     * @param {String} [options.menuWidth] narrow, normal, or wide
     * @param {String} [options.additionalClassNames] Class attribute(s) to add to control
     * @param {String} [options.iconClassName] Class attribute(s) to add to icon
     * @param {String} [options.iconURLClassName] Class attribute(s) to add to iconURL
     * @param {Boolean} [options.nearestValue] if true: try to select the nearest value from items
     * for the value of the modelAttribute
     * @param {String} [options.descriptionPosition = right] [top|right|bottom] Position of the
     * element's description text relative to the item's label
     * @param {Number} [options.maxLabelLength] maximum label length
     * @param {Object} [options.stateModel] state for FindInput, if this exists show
     * input-container element
     * @param {Object} [options.rawSearch] rawSearch for FindInput, must be present if
     * stateModel is present
     * @param {String} [options.size] size of the control and it's text, currently only supports 'default' and 'small'.
     * @param {boolean} [options.useLabelAsTitle] if true the title of the dropdown toggle will
     * be set to the label. Defaluts to false.
     */
    return Control.extend(/** @lends views.SyntheticSelectControl.prototype */{
        moduleId: module.id,
        className: 'control btn-group',
        items: undefined,
        selectedItem: undefined,
        renderList: true,
        listenersAdded: false,
        initialize: function() {
            var defaults = {
                toggleClassName: '' ,
                menuClassName: '',
                iconClassName: 'icon-large',
                iconURLClassName: 'icon-large',
                descriptionPosition: 'right',
                label: '',
                popdownOptions: {el: this.el},
                html: '',
                nearestValue: false,
                prompt: undefined,
                // optional method to customize item label formatting
                formatLabel : function(item) {
                    // By default label displayed is item.label.
                    // If none specified this defaults to item.value.
                    return item.label || item.value;
                },
                useLabelAsTitle: false
            };

            _.defaults(this.options, defaults);
            _.defaults(this.options.popdownOptions, defaults.popdownOptions);
            // our own expando property
            this.options.expando = 'ssc-' + this.cid;
            // store structure in this.items
            this.setItems(this.options.items, {skipRender: true});

            this.children.inputView = new InputView({
                model: this.options.stateModel,
                rawSearch: this.options.rawSearch
            });
            this.inputViewRendered = false;

            // compile sub template (main template already compiled in constructor)
            this.compiledSubTemplate = this.compileTemplate(this.subTemplate);

            Control.prototype.initialize.apply(this, arguments);
        },

        activate: function(options) {
            options = options || {};
            if (this.active) {
                return Control.prototype.activate.apply(this, arguments);
            }
            this.renderList = true;
            return Control.prototype.activate.apply(this, arguments);
        },

        // override setValue to keep _value and selectedItem in sync by definition
        _setValue: function(value, render, suppressEvent) {
            var oldValue = this._value;
            value = this.normalizeValue(value);
            this._value = value;

            if (_.isUndefined(this._value) || !this.items || !this.items.length) {
                this.selectedItem = undefined;
            } else if (this.options.nearestValue) {
                var nearestObject = math_utils.nearestMatchAndIndexInArray(this._value, this.valuesAsInts);
                if (!_.isUndefined(nearestObject.index)) {
                    var nearestItem = this.itemsMap[nearestObject.index];
                    this.selectedItem = this.findItem(nearestItem.value);
                }
            } else {
                this.selectedItem = this.findItem(this._value);
            }

            // trigger change event
            if (!suppressEvent) {
                this.trigger('change', value, oldValue, this);
            }

            // if render requested or undefined, render anyway.
            if (render !== false) {
                this.render();
            }

            return this;
        },

        /**
         * This is a parametrized recursive algorithm to traverse
         * @items hierarchy and execute a base function @baseFn at
         * each leaf item. If baseFn returns a truthy value, this
         * signals that the required leaf operation is complete, and
         * traversal is terminated.
         */
        _recursiveTreeTraversal: function(items, baseFn) {
            var item, args, found, i, len;
            for (i = 0, len = items.length; i < len; i++) {
                item = items[i];
                // recursive case 1: array (i.e. grouped items)
                if (_.isArray(item)) {
                    // recursive call using current arguments with items=item
                    args = Array.prototype.slice.call(arguments, 1);
                    args.unshift(item);
                    found = this._recursiveTreeTraversal.apply(this, args);
                }
                // recursive case 2: children array (i.e. nested sub menu)
                else if (item.children) {
                    // recursive call using current arguments with items=item.children
                    args = Array.prototype.slice.call(arguments, 1);
                    args.unshift(item.children);
                    found = this._recursiveTreeTraversal.apply(this, args);
                }
                // base case for leaf items
                else if (_(item).has('value')) {
                    // call baseFn using current arguments without items or baseFn
                    args = Array.prototype.slice.call(arguments, 2);
                    args.unshift(item);
                    found = baseFn.apply(this, args);
                }
                if (found) { return found; }
            }
            return false;
        },

        getFirstItem: function() {
            return this._recursiveTreeTraversal(this.items, function(item){
                return item;
            });
        },

        // keeping this for backward compatibility but this is a not a proper naming
        // and not required, since item is now part of the view state.
        findItem: function(value) {
            // if no value set, default to selected item
            if (_.isUndefined(value)) {
                return this.selectedItem;
            }
            return this._recursiveTreeTraversal(this.items, function(item, value) {
                if (_.isEqual(item.value, value)) {
                    return item;
                }
            }, value);
        },

        _mapItemsToIndices: function() {
            // internal map of item index to item object
            this.itemsMap = [];
            this._recursiveTreeTraversal(this.items, function(item, memo) {
                // each item gets a unique index
                // note that expando is a random key to avoid collisions
                item[this.options.expando] = memo.length;
                memo.push(item);
            }.bind(this), this.itemsMap);
        },

        _mapItemsToValues: function() {
            this.valuesAsInts = [];
            this._recursiveTreeTraversal(this.items, function(item, memo) {
                var convertedToInt = parseInt(item.value, 10);
                if (_.isNaN(convertedToInt)) {
                    throw new Error('You cannot use the nearestValue option with a SyntheticSelect control that has values other than ints!');
                }
                memo.push(convertedToInt);
            }, this.valuesAsInts);
        },

        setItems: function(items, options) {
            this.items = items;
            // flag to re-render popdown
            this.renderList = true;
            // build local map
            if (this.items && this.items.length) {
                this._mapItemsToIndices();
                if (this.options.nearestValue) {
                    this._mapItemsToValues();
                }
            }
            // In case the items change affects the currently selected item, re-run the _setValue routine
            // but don't cause a render or a change event.
            this._setValue(this._value, false, true);
            if (options) {
                this.alreadyShown = !!options.alreadyShown;
                if (options.skipRender) {
                    return;
                }
            }
            this.debouncedRender();
        },

        stopListening: function() {
            if (arguments.length === 0) {
                $(window).off('.' + this.cid);
                this.$menu && this.$menu.off('.' + this.cid);
            }
            Control.prototype.stopListening.apply(this, arguments);
        },
        show: function(){
            this.$menu.find(".icon-check:visible").closest('a').focus();
            this.$menu.on('click.' + this.cid, 'a', this.click.bind(this));
            if (!this.listenersAdded){
                $(window).on('keydown.' + this.cid, this.keydown.bind(this));
                this.trigger('popdownShown');
                this.listenersAdded = true;
            }
            if (this.options.stateModel) {
                this.$menu.find('.input-container .search-query').focus();
            }
        },
        hide: function(){
            this.listenersAdded = false;
            $(window).off('.' + this.cid);
            this.$menu.off('.' + this.cid);
            this.trigger('popdownHidden');
        },
        disable: function(){
            this.options.enabled = false;
            this.$('a.dropdown-toggle').addClass('disabled');
        },
        enable: function(){
            this.options.enabled = true;
            this.$('a.dropdown-toggle').removeClass('disabled');
        },
        tooltip: function(options){
            this.$('a.dropdown-toggle').tooltip(options);
        },
        click: function(e) {
            var $currentTarget = $(e.currentTarget);
            if (!$currentTarget.hasClass('disabled') &&
                !$currentTarget.is('.submenu-label') &&
                !$currentTarget.is('.search-query-clear') &&
                !$currentTarget.is('.control-clear')) {
                var itemIdx = $currentTarget.data('item-idx'),
                    item = this.itemsMap[itemIdx];
                this.setValue(item.value, true);
                this.$(".dropdown-toggle").focus();
            }
            e.preventDefault();
        },
        keydown: function (e) {
            if ((e.shiftKey && e.which !== keyboard_utils.KEYS['TAB']) || e.ctrlKey || e.metaKey || e.altKey) {
                return true;
            }

            if (!this.options.stateModel && e.keyCode === keyboard_utils.KEYS['ESCAPE']) {
                this.$('.dropdown-toggle').focus();
                e.preventDefault();
                e.stopPropagation();
                return;
            }

            var $focused = $(':focus');
            // if dropdown toggle in focus, only handle DOWN key - leave rest for lovely Popdown
            if ($focused.is('.dropdown-toggle')) {
                if (e.keyCode === keyboard_utils.KEYS['DOWN_ARROW']) {
                    this.$menu.find('a:eq(0)').focus();
                }
                e.preventDefault();
                e.stopPropagation();
                return;
            }

            // if dropdown menu item in focus, respond to UP/DOWN/<letter/digit> keys
            // TODO: support all dropdown-menu (i.e. submenu with LEFT/RIGHT keys)
            var $menu = $focused.closest('.dropdown-menu').find('ul.dropdown-menu-main'),
                $items = $menu.find('> li a:visible'),
                index = -1, handled = false;

            if (!$items.length) return true;

            index = $items.index($focused);
            if (e.keyCode === keyboard_utils.KEYS['DOWN_ARROW']) {
                if (index < $items.length - 1) {
                    $items.eq(index + 1).focus();
                } else {
                    $items.eq(0).focus();
                }
                handled = true;
            } else if (e.keyCode === keyboard_utils.KEYS['UP_ARROW']) {
                if (index === 0) {
                    this.$(".dropdown-toggle").focus();
                } else if (index === -1) {
                    $items.eq($items.length - 1).focus();
                } else {
                    $items.eq(index - 1).focus();
                }
                handled = true;
            } else if (e.keyCode === keyboard_utils.KEYS['TAB']) {
                if (e.shiftKey) {
                    if (index > 0) {
                        return true;
                    }
                    $items.eq($items.length - 1).focus();
                    handled = true;
                } else {
                    if (index < $items.length - 1) {
                        return true;
                    }
                    $items.eq(0).focus();
                    handled = true;
                }
            } else if (!this.options.stateModel &&
                (((e.keyCode >= 48) && (e.keyCode <= 57))  || //number
                ((e.keyCode >= 65) && (e.keyCode <= 90))  || //uppercase letter
                ((e.keyCode >= 97) && (e.keyCode <= 122)) || //lowercase letter
                ((e.keyCode >= 128) && (e.keyCode <= 165)))   //extended letter
            ) {
                var keyChar = String.fromCharCode(e.keyCode).toLowerCase();
                $items.each(function() {
                    var $option = $(this),
                        firstChar = $option.text().replace(/^\s\s*/, '').substring(0, 1).toLowerCase();

                    if (keyChar == firstChar) {
                        $option.focus();
                        handled = true;
                        return false; // break out of each() loops
                    }
                });
            }

            if (handled) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }

            return true;
        },
        render: function() {
            var selectedItem = this.selectedItem;

            if (!this.items || !this.items.length) {
                return this;
            }

            // if no item selected
            if (!selectedItem) {
                // if we have a prompt then display prompt as label
                if (!_(this.options.prompt).isUndefined()) {
                    selectedItem = {
                        label: this.options.prompt,
                        value: undefined
                    };
                // otherwise default to first item of list
                } else {
                    selectedItem = this.getFirstItem();
                }
            }

            if (this.renderList) {
                if (this.children.inputView) {
                    this.children.inputView.detach();
                }

                var template = this.compiledTemplate({
                    items: this.items,
                    selectedItem: selectedItem,
                    options: this.options,
                    menuWidthClass: (this.options.menuWidth && this.options.menuWidth != "normal" ? "dropdown-menu-" + this.options.menuWidth : ''),
                    subTemplate: this.compiledSubTemplate,
                    hasInput: this.options.stateModel
                });
                this.$el.html(template);

                if (!this.inputViewRendered) {
                    this.children.inputView.render();
                    this.inputViewRendered = true;
                }

                this.children.inputView.appendTo(this.$('.input-container'));

                this.$menu =  this.$('> .dropdown-menu');

                if (this.options.stateModel) {
                    this.$menu.find('.input-container .search-query').focus();
                }

                // menu has submenus if any of its items has children
                var hasSubMenus = !!(_.find(_.flatten(this.items, true), function(item) {
                    return _.has(item, 'children');
                }));
                if (hasSubMenus) {
                    // ensure sub menu flyouts are not hidden
                    this.$menu.find('> ul').css({
                        'overflow': 'visible',
                        'max-height': 'none'
                    });
                }

                if (this.children.popdown) {
                    //this.children.popdown.detach();
                    this.children.popdown.remove();
                    this.stopListening(this.children.popdown);
                    delete this.children.popdown;
                }

                this.children.popdown = new Popdown($.extend(true, {}, this.options.popdownOptions));
                this.listenTo(this.children.popdown, "shown", this.show);
                this.listenTo(this.children.popdown, "hidden", this.hide);
                if (this.alreadyShown) {
                    this.children.popdown.show();
                }

                this.renderList = false;
            }

            var additionalClassNames = this.options.additionalClassNames;
            if(additionalClassNames) {
                this.$el.addClass(additionalClassNames);
            }
            // TODO: this is not required if Popdown view supports successive rendering as it should
            // Hide or show the checkmarks
            this.$menu.find('a.synthetic-select').each(function(i, el) {
                // using attr() instead of data() since latter attempts to deduce the type
                // and automatically convert value from string to a JavaScript type value
                var $el = $(el),
                    itemIdx = $el.data('item-idx'),
                    item = this.itemsMap[itemIdx];
                $el.find('.icon-check')[(selectedItem && _.isEqual(item.value, selectedItem.value)) ? 'show' : 'hide']();
            }.bind(this));

            // TODO: this is not required if Popdown view supports successive rendering as it should
            //Update the toggle label
            if (selectedItem) {
                if (selectedItem.label || selectedItem.value) {
                    var formattedLabel = _(this.options.label).t() + " " +
                        _(selectedItem.label || selectedItem.value).t();
                    if (this.options.maxLabelLength && this.options.maxLabelLength > 3) {
                        formattedLabel = string_utils.truncateTrailingString(
                            formattedLabel, this.options.maxLabelLength);
                    }
                    var $dropdownToggle = this.$(".dropdown-toggle");
                    if (this.options.useLabelAsTitle) {
                        $dropdownToggle.attr('title', formattedLabel);
                    }

                    if (userAgent.isIE11()) {
                        // IE11 bug SPL-114438 and SPL-114756
                        $dropdownToggle.find('.link-label')[0].innerText = formattedLabel;
                    } else {
                        $dropdownToggle.find('.link-label').text(formattedLabel);
                    }
                }
                if (selectedItem.icon) {
                    this.$(".dropdown-toggle > i").attr('class',  "icon-" + selectedItem.icon);
                }
            }

            return this;
        },
        // NOTE: the "data-item-value" attribute of each list item is exposed for testing only
        subTemplate: '\
            <% if (_.isArray(item)) { %>\
                <% if (index > 0) { %> <li role="presentation" class="divider"></li> <% } %>\
                <% _.each(item, function(subItem, subIndex, list) { %>\
                    <%= subTemplate({item: subItem, index: subIndex, options: options, subTemplate: subTemplate}) %>\
                <% }); %>\
            <% } else if (item.children) { %>\
                <li class="dropdown-submenu">\
                    <a href="#" class="submenu-label"><%- options.formatLabel(item) %></a>\
                    <ul class="dropdown-menu">\
                        <% _.each(item.children, function(subItem, subIndex, list) { %>\
                            <%= subTemplate({item: subItem, index: subIndex, options: options, subTemplate: subTemplate}) %>\
                        <% }); %>\
                    </ul>\
                </li>\
            <% } else if (!_.has(item, "value")) { %>\
                <li role="presentation" class="dropdown-header"><%- options.formatLabel(item) %></li>\
            <% } else { %>\
                <li><a class="synthetic-select <%- item.enabled === false ? \"disabled\" : \"\"%>" href="#" data-item-idx="<%- item[options.expando] %>" data-item-value="<%- item.value %>">\
                    <i class="icon-check" style="display:none"></i>\
                    <% if (item.icon) { %> <i class="icon-<%-item.icon%> <%-options.iconClassName %>"></i><% } %>\
                    <% if (item.iconURL) { %> <img class="<%-options.iconURLClassName %>" src="<%-item.iconURL%>" alt="icon"><% } %>\
                    <% if (item.description && (options.descriptionPosition == "top")) { %> <span class="link-description"><%- item.description %></span><% } %>\
                    <span class="link-label"><%- options.formatLabel(item) %></span>\
                    <% if (item.description && (options.descriptionPosition == "right")) { %> <span class="link-description"><%- item.description %></span><% } %>\
                    <% if (item.description && (options.descriptionPosition == "bottom")) { %> <span class="link-description-below"><%- item.description %></span><% } %>\
                </a></li>\
            <% } %>\
        ',
        template: '\
            <% var label = options.label + " " + selectedItem && options.formatLabel(selectedItem); %>\
            <a class="dropdown-toggle <%- options.toggleClassName %>" href="#" <% if (options.useLabelAsTitle) { %>title="<%- label %>"<% } %>>\
                <i class="<%- (selectedItem && selectedItem.icon) ? "icon-" + selectedItem.icon : ""%> icon-large"></i>\
                <span class="link-label"><%- label %></span><span class="caret"></span>\
            </a>\
            <div class="dropdown-menu dropdown-menu-selectable dropdown-menu-<%- options.size %> <%- options.menuClassName %> <%- menuWidthClass %> ">\
                <div class="arrow"></div>\
                <% if (hasInput) { %>\
                    <div class="input-container"></div>\
                    <div role="presentation" class="divider"></div>\
                <% } %>\
                <ul class="dropdown-menu-main">\
                <% _.each(items, function(item, index, list) { %>\
                <%= subTemplate({item: item, index: index, options: options, subTemplate: subTemplate}) %>\
                <% }); %>\
                </ul>\
                <div class="dropdown-footer"></div>\
            </div>\
        '
    });
});
