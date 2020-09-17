define(function(require, exports, module) {
    var _ = require('underscore');
    var BaseMultiChoiceView = require("./basemultichoiceview");
    var BaseDropdownViewMixin = require("./basedropdownviewmixin");

    // See http://ricostacruz.com/backbone-patterns/#mixins for
    // this mixin pattern.
    /**
     * @constructor
     * @memberOf splunkjs.mvc
     * @name MultiDropdownView
     * @description The **MultiDropdown** view displays a dropdown list with a 
     * set of choices. The list can be bound to a search manager, but can also 
     * be used as a standard HTML dropdown list that emits change events. The 
     * **MultiDropdown** view returns one or more values in an array.
     * @extends splunkjs.mvc.BaseMultiChoiceView
     * @mixes splunkjs.mvc.BaseDropdownViewMixin
     *
     * @param {Object} options 
     * @param {String} options.id - The unique ID for this control. 
     * @param {Boolean} [options.allowCustomValues=false] - Indicates whether to allow custom values to be entered. 
     * @param {Object[]} [options.choices=[ ]] -  A static dictionary of choices for the 
     * dropdown list. If bound to a `managerid`, the static choices specified 
     * here are prepended to the dynamic choices from the search.</br>
     * For example:
     *
     *     var mychoices = [
     *         {label:"text1", value: "value1"},
     *         {label:"text2", value: "value2"},
     *         {label:"text3", value: "value3"}
     *     ];
     *
     * @param {String[]} [options.default] - The value of the choices that are selected by
     * default. Multiple default choices can only be set in JavaScript as an array.
     * @param {Boolean} [options.disabled=false] - Indicates whether to disable the view.
     * @param {String} [options.initialValue] - The initial value of the input. 
     * If **default** is specified, it overrides this value. 
     * @param {String} [options.labelField] -  The UI label to display for each choice.
     * @param {String} [options.managerid=null] - The ID of the search manager to bind 
     * this control to.
     * @param {Object} [options.settings] - The properties of the view. 
     * @param {String} [options.value] - The value of the current choice.
     * @param {String} [options.valueField] -  The value or search field for each choice.
     * @param {Number} [options.width=200] - The width of the view, in pixels.
     *
     * @example
     * require([
     *     "splunkjs/mvc/searchmanager",
     *     "splunkjs/mvc/multidropdownview",
     *     "splunkjs/mvc/simplexml/ready!"
     * ], function(SearchManager, MultiDropdownView) {
     *         
     *     // Instantiate components
     *     new MultiDropdownView({
     *         id: "example-multidropdown",
     *         managerid: "example-search",
     *         default: "main",
     *         labelField: "index",
     *         valueField: "index",
     *         el: $("#mymultidropdownview")
     *     }).render();
     * 
     *     new SearchManager({
     *         id: "example-search",
     *         search: "| eventcount summarize=false index=* index=_* | dedup index | fields index" 
     *     });
     * 
     * });
     */
    var MultiDropdownView = BaseMultiChoiceView.extend(/** @lends splunkjs.mvc.MultiDropdownView.prototype */
        _.extend({}, BaseDropdownViewMixin, {
            moduleId: module.id,
            
            className: "splunk-multidropdown splunk-choice-input",
            selectRoot: '<input type="hidden" />',
            valueIsList: true,
            
            initialize: function() {
                this.options = _.extend({}, BaseMultiChoiceView.prototype.options, this.options);
                BaseMultiChoiceView.prototype.initialize.apply(this, arguments);
                this.settings.on("change:width", _.debounce(this.render, 0), this);
            },
            remove: function() {
                BaseDropdownViewMixin.remove.apply(this, arguments);
                BaseMultiChoiceView.prototype.remove.apply(this, arguments);
            }
        })
    );

    return MultiDropdownView;
});
