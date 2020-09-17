/**
 * @author jszeto
 * @date 10/24/13
 *
 * Displays a set of Tabs. It takes either an array of TabBases, a collection or an array of Views with the ViewPane mixin.
 * TabbedViewStack creates a TabBar from its ViewPanes. Most users should just use a TabbedViewStack unless you are doing
 * something unusual or specialized.
 *
 * Inputs:
 *
 * selectedIndex {number} index of the selected tab. Default is -1 which means nothing is selected
 * data {array or Collection} can be one of the following:
 *      {array} of view instances with the ViewPane mixin. TabBar will use the label, selected and enabled properties of the pane
 *      {array} of TabBase instances to be displayed in the tab bar
 *      {Collection} of models with the following attributes
 *          label {string} the string to display in the tab,
 *          selected {boolean} true if the tab is in the selected state
 *          enabled {boolean} if false, then the tab will be displayed in the disabled state
 * tabFactory {function} Class of the tabs to create if data is not an array of TabBase instances. Default value is TabBase
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base',
    'views/shared/tabcontrols/TabBase'
],
    function (
        $,
        _,
        Backbone,
        module,
        BaseView,
        TabBase
        ) {

        return BaseView.extend({
            moduleId: module.id,
            _tabs: undefined,
            _data: undefined,
            _selectedIndex: -1,
            tagName: 'ul',
            className: 'nav nav-tabs main-tabs', 
            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);

                _(this.options).defaults({tabFactory: TabBase});
                this._tabFactory = this.options.tabFactory;

                if (!_(this.options.data).isUndefined()) {
                    this.setData(this.options.data);
                }
            },

            setData: function(value) {
                if (value instanceof Backbone.Collection) {
                    this._data = value;
                    // Handle collection case
                } else if (_(value).isArray()) {
                    this._data = value.slice();
                    // Get the first element of the array and inspect its type
                    if (value.length > 0) {
                        var firstElement = value[0];
                        if (firstElement instanceof TabBase) {
                            this.setupTabs(value);
                        } else if (firstElement instanceof BaseView &&
                            typeof firstElement["viewPaneInitialize"] === 'function') {
                            var tabs = this.createTabsFromTabbedPane(value);
                            this.setupTabs(tabs);
                        } else {
                            throw new Error("Data must be set to an array of TabBases or ViewPanes");
                        }
                    }
                }
            },

            getData: function() {
                return this._data;
            },

            setupTabs: function(tabs) {
                // Remove the existing tabs, if present
                if (!_(this._tabs).isUndefined()) {
                    _(this._tabs).each(function(tab) {
                        this.stopListening(tab);
                        tab.remove();
                    }, this);
                }

                this._tabs = tabs;
                this.children.tabs = tabs;
                var newIndex = 0;//this._tabs.length - 1;

                _(this.children.tabs).each(function(tab, i) {
                    this.listenTo(tab, "tabClick", this.handleTabClick);
                    // Set the last
                    if (tab.getSelected())
                        newIndex = i;
                }, this);

                this.setSelectedIndex(newIndex);

                this.debouncedRender();
            },

            getTabs: function() {
                return this._tabs;
            },

            setSelectedIndex: function(value) {
                if (value != this._selectedIndex) {
                    var oldSelectedIndex = this._selectedIndex;
                    this._selectedIndex = value;
                    _(this._tabs).each(function(tab, i) {
                        tab.setSelected(i == this._selectedIndex);
                    }, this);
                    /**
                     * SelectedIndex has changed
                     *
                     * @event TabBar#change:selectedIndex
                     * @param {number} the new selectedIndex
                     * @param {number} the old selectedIndex
                     */
                    this.trigger("change:selectedIndex", this._selectedIndex, oldSelectedIndex);
                }
            },

            getSelectedIndex: function() {
                return this._selectedIndex;
            },

            // TODO [JCS] Figure out where to stopListening to the tab
            // Helper function
            createTabsFromTabbedPane: function(panes) {
                var tabs = [];
                _(panes).each(function(pane) {
                    var tabOptions = {label: pane.getLabel(),
                        selected: pane.getSelected(),
                        enabled: pane.getEnabled()};

                    if (typeof pane["getTabClassName"] === 'function') {
                        tabOptions.tabClassName = pane.getTabClassName();
                    }
                    // Create a new TabBase for each pane and initialize it with the pane's values
                    var tab = new this._tabFactory(tabOptions);

                    // Whenever the pane's values change, update the tab
                    tab.listenTo(pane, "change:label", function(newValue, oldValue) {
                        this.setLabel(newValue);
                    });
                    tab.listenTo(pane, "change:selected", function(selected) {
                        this.setSelected(selected);
                    });
                    tab.listenTo(pane, "change:enabled", function(enabled) {
                        this.setEnabled(enabled);
                    });

                    tabs.push(tab);
                }, this);

                return tabs;
            },

            // Handle clicks on individual tabs and change the selectedIndex
            handleTabClick: function(tab) {
                this.setSelectedIndex( _(this._tabs).indexOf(tab));
            },

            render: function() {
                // Detach tabs so we don't lose DOM events
                _(this.children.tabs).each(function(tab) {
                    tab.detach();
                }, this);


                // Append each tab
                _(this.children.tabs).each(function(tab) {
                    this.$el.append(tab.render().el);
                }, this);

                return this;
            }
        });

    });

