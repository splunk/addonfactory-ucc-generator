/**
 * @author jszeto
 * @date 10/25/13
 *
 * A ViewStack is a view that has multiple views stacked on top of each other. Only one view is visible at a time.
 * Setting the selectedIndex changes the visible view.
 *
 * Inputs:
 *
 * panes {array} an array of Views that have the ViewPane mixin
 * selectedIndex {number} index in the panes of the selected view. Default is undefined which means nothing is selected
 * paneParentSelector {string} selector to find the parent for all of the panes, if omitted the view root element is used
 *
 * Example Usage:
 *
 * var panes = [
 *     new SimpleTabbedPane({label:"Tab Won"}),
 *     new SimpleTabbedPane({label:"Tab Too"}),
 *     new SimpleTabbedPane({label:"Tab Tree"})
 *     ];
 * this.viewStack = new ViewStack({panes:panes, selectedIndex:2});
 *
 * @fires ViewStack#change:panes
 * @fires ViewStack#change:selectedIndex
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base'
],
    function ($, _, Backbone, module, BaseView) {

        return BaseView.extend({
            moduleId:module.id,
            _selectedIndex: undefined,

            initialize:function (options) {
//                console.log("ViewStack.initialize");
                BaseView.prototype.initialize.call(this, options);

                _(this.options).defaults({panes:[], paneParentSelector:null});

                this._setPanes(this.options.panes);

                if (!_(this.options.selectedIndex).isUndefined())
                    this.setSelectedIndex(this.options.selectedIndex);

            },

            _setPanes: function(panes) {
//                console.log("ViewStack._setPanes",this.panesToString());
                _(this._panes).each(function(pane) {
                    pane.detach();
                }, this);

                this.children.panes = this._panes = panes.slice();
            },

            setPanes: function(panes) {
//                console.log("ViewStack.setPanes",this.panesToString());
                this._setPanes(panes);

                // Reapply the selectedIndex now what we have new panes
                var selectedIndex = this._selectedIndex;
                this._selectedIndex = undefined;
                this.setSelectedIndex(selectedIndex);
                /**
                 * Panes have changed
                 *
                 * @event ViewStack#change:panes
                 * @param {array} the new panes
                 */
                this.trigger("change:panes",this._panes);
                this.debouncedRender();
            },


            getPanes: function() {
                return this._panes;
            },

            getLength: function() {
                return this.getPanes().length;
            },

            addPane: function(addedPane) {
//                console.log("ViewStack.addPane",addedPane.getLabel(),this.panesToString());
                // make sure the pane isn't already added
                _(this._panes).each(function(pane) {
                    if (pane === addedPane)
                        throw new Error("The added pane is already a child of the ViewStack.");
                }, this);

                this._panes.push(addedPane);
                var paneParent = this.$(this.options.paneParentSelector);
                paneParent.append(addedPane.render().el);
            },

            removePane: function(removedPane) {
                var foundPane = _(this._panes).find(function(pane) {
                    return pane === removedPane;
                }, this);

                if (foundPane) {
                    var foundIndex = this._panes.indexOf(foundPane);
                    this._panes.splice(foundIndex, 1);
                    foundPane.remove();
                }
            },

            removePaneAt: function(index) {
//                console.log("ViewStack.removePaneAt",index,this.panesToString());
                if (index >= 0 && index < this._panes.length) {
                    var removedPane = this._panes[index];
                    this._panes.splice(index, 1);
                    removedPane.remove();
                }
            },


            setSelectedIndex: function(value) {
//                console.log("ViewStack.setSelectedIndex old",this._selectedIndex,"new",value,this.panesToString());
                if (value != this._selectedIndex) {
                    var oldSelectedIndex = this._selectedIndex;
                    this._selectedIndex = value;
                    _(this._panes).each(function(pane, i) {
                        if (i == this._selectedIndex) {
                            this.callOptionalPaneMethod(pane, 'setSelected', true);
                            pane.$el.show();
                        } else {
                            this.callOptionalPaneMethod(pane, 'setSelected', false);
                            pane.$el.hide();
                        }
                    }, this);
                    /**
                     * SelectedIndex has changed
                     *
                     * @event ViewStack#change:selectedIndex
                     * @param {number} the new selectedIndex
                     * @param {number} the old selectedIndex
                     */
                    this.trigger("change:selectedIndex", this._selectedIndex, oldSelectedIndex);
                }
            },

            getSelectedIndex: function() {
                return this._selectedIndex;
            },

            setSelectedView: function(view) {
                var index = _(this.getPanes()).indexOf(view);
                if(index === -1) {
                    throw new Error('The view cannot be selected because it is not a child of the ViewStack');
                }
                this.setSelectedIndex(index);
            },

            getSelectedView: function() {
                return this.getPanes()[this.getSelectedIndex()];
            },

            detachPanes: function() {
//                console.log("ViewStack.detachPanes",this.panesToString());
                _(this._panes).each(function(pane) {
                    pane.detach();
                }, this);
            },

            renderPanes: function() {
//                console.log("ViewStack.renderPanes",this.panesToString());
                // Use template
                //this.$el.html(this.compiledTemplate({}));

                // Attach children and render them
                _(this.children.panes).each(function(pane) {
                    var paneParentSelector = this.options.paneParentSelector;
                    var $paneParent = paneParentSelector ? this.$(paneParentSelector) : this.$el;
                    pane.render().appendTo($paneParent);
                }, this);
            },

            render:function () {
//                console.log("ViewStack.render");
                this.detachPanes();
                this.renderPanes();
                return this;
            },

            panesToString: function() {
                var output = "panes [";

                if (this._panes)
                    output += this._panes.join(",");

                return output + "]";
            },

            callOptionalPaneMethod: function(paneView, methodName) {
                if(_.isFunction(paneView[methodName])) {
                    paneView[methodName].apply(paneView, [].slice.call(arguments, 2));
                }
            }

        });

    });

