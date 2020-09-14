/**
 * @author jszeto
 * @date 10/25/13
 *
 * Extends ViewStack and adds a TabBar
 *
 * Inputs:
 *
 * tabBarFactory {function} Class of the tabBar. Default value is TabBar
 *
 * Required Template Elements:
 *
 * tab-bar - the element that contains the tab bar
 * tab-content - the element that contains the pane views
 *
 * Example Usage:
 *
 * var panes = [
 *     new SimpleTabbedPane({label:"Tab Won"}),
 *     new SimpleTabbedPane({label:"Tab Too"}),
 *     new SimpleTabbedPane({label:"Tab Tree"})
 *     ];
 * this.tabbedViewStack = new TabbedViewStack({panes:panes, selectedIndex:2});
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/shared/ViewStack',
    'views/shared/tabcontrols/TabBar'
],
    function ($, _, Backbone, module, ViewStack, TabBar) {

        return ViewStack.extend({
            moduleId:module.id,

            initialize:function (options) {
                _(this.options).defaults({tabBarFactory: TabBar, paneParentSelector:".tab-content"});

                ViewStack.prototype.initialize.call(this, options);
                this._tabBarFactory = this.options.tabBarFactory;
                this.createTabs();
            },

            handleSelectedIndexChange: function(newIndex, oldIndex) {
                this.setSelectedIndex(newIndex);
            },

            createTabs: function() {
//                console.log("TabbedViewStack.createTabs",this.panesToString());
                if (this.children.tabBar) {
                    this.children.tabBar.remove();
                    this.children.tabBar.off("change:selectedIndex", this.handleSelectedIndexChange);
                }

                this.children.tabBar = new this._tabBarFactory({data:this.getPanes()});
                this.children.tabBar.on("change:selectedIndex", this.handleSelectedIndexChange, this);
            },

            setTabSelectedIndex: function(newIndex) {
                // NOTE: this is for switching to a tab by javascript, which has the same effect as clicking a tab.
                // The difference between this function and handleSelectedIndexChange() is:
                //  - handleSelectedIndexChange() will only change the index of ViewStack, but doesn't change
                //    the index of tabBar.
                //  - setTabSelectedIndex() will change both the index of tabBar, which triggers 'change:selectedIndex'
                //    event on tabBar, the callback is handleSelectedIndexChange(). So that both index of tabBar and
                //    index of ViewStack will be changed.
                this.children.tabBar.setSelectedIndex(newIndex);
            },

            setPanes: function() {
                ViewStack.prototype.setPanes.apply(this, arguments);

                this.updateTabs();
            },

            addPane: function(addedPane) {
                ViewStack.prototype.addPane.call(this, addedPane);

                this.updateTabs();
            },

            removePaneAt: function(index) {
                ViewStack.prototype.removePaneAt.call(this, index);
                this.updateTabs();
            },

            renderTabs: function() {
//                console.log("TabbedViewStack.renderTabs",this.panesToString());
                // Attach children and render them
                this.$(".tab-bar").append(this.children.tabBar.render().el);
            },

            updateTabs: function() {
                this.createTabs();
                this.children.tabBar.setSelectedIndex(undefined);
                this.children.tabBar.setSelectedIndex(0);
                this.renderTabs();
            },

            render:function () {
//                console.log("TabbedViewStack.render",this.panesToString());
                // Detach children
                this.detachPanes();
                // Use template
                this.$el.html(this.compiledTemplate({}));

                this.renderTabs();
                this.renderPanes();
                return this;
            },

            template: '\
                <div class="tab-bar"></div>\
                <div class="tab-content"></div>\
            '
        });

    });

