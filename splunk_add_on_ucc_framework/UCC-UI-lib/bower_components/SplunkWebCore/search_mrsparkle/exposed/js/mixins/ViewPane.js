/**
 * @author jszeto
 * @date 10/24/13
 *
 * Mixin for allowing a View to be a child of a ViewStack. You can use the mixin in the following way:
 *
 * var MyViewPane = BaseView.extend({
 *
 *     initialize: function(options) {
 *         BaseView.prototype.initialize.call(this, options);
 *         this.viewPaneInitialize(options);
 *     }
 *  });
 *
 * _.extend(MyViewPane.prototype, ViewPane);
 *
 *  return MyViewPane;
 *
 * Inputs:
 *
 * label {string} the string to display for the pane,
 * selected {boolean} true if the pane is in the selected state
 * enabled {boolean} if false, then the pane will be displayed in the disabled state
 *
 * @fires ViewPane#change:selected
 * @fires ViewPane#change:enabled
 * @fires ViewPane#change:label
 */
define(['underscore'], function(_) {
    return {
        _label: "",
        _selected: false,
        _enabled: true,
        _setTabClassName: undefined,

        /**
         * Call this function if your options dictionary has attributes for label, selected or enabled
         * @param options
         */
        viewPaneInitialize: function(options){

            if (!_(options.label).isUndefined())
                this.setLabel(options.label);
            if (!_(options.selected).isUndefined())
                this.setSelected(options.selected);
            if (!_(options.enabled).isUndefined())
                this.setEnabled(options.enabled);
            if (!_(options.tabClassName).isUndefined())
                this._setTabClassName = options.tabClassName;
        },
        setSelected: function(value) {
            if (this._selected != value) {
                this._selected = value;
                /**
                 * The pane's selected property has changed
                 *
                 * @event TabbedPane#change:selected
                 * @param {boolean} true if the pane is in the selected state
                 */
                this.trigger("change:selected", this._selected);
            }
        },
        getSelected: function() {
            return this._selected;
        },
        setEnabled: function(value) {
            if (this._enabled != value) {
                this._enabled = value;
                /**
                 * The pane's enabled property has changed
                 *
                 * @event TabbedPane#change:enabled
                 * @param {boolean} true if the pane is in the enabled state
                 */
                this.trigger("change:enabled", this._enabled);
            }
        },
        getEnabled: function() {
            return this._enabled;
        },

        setLabel: function(value) {
            if (this._label != value) {
                var oldLabel = this._label;
                this._label = value;
                /**
                 * The pane's label property has changed
                 *
                 * @event TabbedPane#change:label
                 * @param {string} the new value of the label
                 * @param {string} the old value of the label
                 */
                this.trigger("change:label", this._label, oldLabel);
            }
        },
        getLabel: function() {
            return this._label;
        },
        getTabClassName: function() {
            return this._setTabClassName;
        },
        toString: function() {
            return this._label;
        }

    };
});

