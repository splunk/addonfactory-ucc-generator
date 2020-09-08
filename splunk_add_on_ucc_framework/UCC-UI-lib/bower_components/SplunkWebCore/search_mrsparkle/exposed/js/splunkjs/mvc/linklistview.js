define(function(require, exports, module) {

    var _ = require('underscore');
    var $ = require('jquery');
    var BaseChoiceView = require("./basechoiceview");
    var LinkList = require("views/shared/controls/LinkList");
    var Backbone = require('backbone');

    require("css!../css/linklist.css");

    /**
     * Displays a list of links.
     * the value of this control is the value of the single link 
     * selected, or undefined if no link is selected.
     */

    /**
     * @constructor
     * @memberOf splunkjs.mvc
     * @name LinkListView
     * @description The **LinkList** view displays a horizontal list with a set 
     * of choices. The list can be bound to a search manager, but can also be 
     * used as a clickable list that emits change events.
     * @extends splunkjs.mvc.BaseChoiceView
     *
     * @param {Object} options 
     * @param {String} options.id - The unique ID for this control. 
     * @param {Object[]} [options.choices=[ ]] -  A static dictionary of options for the 
     * link list. If bound to a `managerid`, the static choices specified here 
     * prepended to the dynamic choices from the search.</br>
     * For example:
     *
     *     var mychoices = [
     *         {label:"text1", value: "value1"},
     *         {label:"text2", value: "value2"},
     *         {label:"text3", value: "value3"}
     *     ];
     *
     * @param {String} [options.default] - The default choice.
     * @param {Boolean} [options.disabled=false] - Indicates whether to disable the view.
     * @param {String} [options.initialValue] - The initial value of the input. 
     * If **default** is specified, it overrides this value. 
     * @param {String} [options.labelField] -  The UI label to display for each choice.
     * @param {String} [options.managerid=null] - The ID of the search manager to bind 
     * this control to.
     * @param {Boolean} [options.selectFirstChoice=false] - Indicates whether to use the
     * first available choice when the user has not made a selection. If the 
     * **default** property has been set, that value is used instead.
     * @param {Object} [options.settings] - The properties of the view. 
     * @param {String} [options.value] - The value of the current choice.
     * @param {String} [options.valueField] -  The value or search field for each choice.
     *
     * @example
     * require([
     *     "splunkjs/mvc",
     *     "splunkjs/mvc/searchmanager",
     *     "splunkjs/mvc/linklistview",
     *     "splunkjs/mvc/simplexml/ready!"
     * ], function(
     *     mvc,
     *     SearchManager, 
     *     LinkListView
     * ) {
     *         
     *     // Use this search to populate the link list with index names
     *     new SearchManager({
     *         id: "example-search",
     *         search: "| eventcount summarize=false index=* index=_* | dedup index | fields index",
     *     });
     * 
     *     var myLinkListView = new LinkListView ({
     *         id: "linklist1",
     *         selectFirstChoice: false,
     *         searchWhenChanged: true,
     *         managerid: "example-search",
     *         value: mvc.tokenSafe("$mychoice$"),
     *         default: "main",
     *         labelField: "index",
     *         valueField: "index",
     *         el: $("#mylinklist")
     *     }).render();
     * 
     *     // Fired when the list value changes
     *     myLinkListView.on("change", function(e) {
     *         // Displays the value of the list in the console
     *         console.log(myLinkListView.settings.get("value"));
     *     });
     * 
     * });
     */
    return BaseChoiceView.extend({
        moduleId: module.id,
        className: "splunk-linklist splunk-choice-input",
        
        options: {
            valueField: "",
            labelField: "",
            "default": undefined,
            "choices": [],
            selectFirstChoice: false,
            disabled: false,
            value: undefined
        },

        events: {
            "click a": "onDomChange"
        },

        initialize: function() {
            this.options = _.extend({}, BaseChoiceView.prototype.options, this.options);
            this._selections = new Backbone.Model();
            this.listenTo(this._selections, "change:value", this._updateValue, this);
            BaseChoiceView.prototype.initialize.apply(this, arguments);
        },

       _updateValue: function(model, change, options) {
           this.val(this._selections.get('value'));
       },

        _domVal: function() {
            return this.$('.active').data('value');
        },

        _disable: function(state) {
            if (state){
                this._linkList.disable();
            } else {
                this._linkList.enable();
            }
        },

        onDomChange: function(e) {
            e.preventDefault();
            if(this.settings.get('disabled')) {
                return;
            }
            var val = $(e.target).data('value');
            this.onUserInput();
            this.val(val + '');
        },

        updateDomVal: function(value) {
            this._linkList.setValue(value);
        },
        
        createView: function() {
            this.$el.empty();
            return $("<fieldset class='splunk-linklist-choices'/>").appendTo(this.el);
        },

        updateView: function(viz, data) {
            viz.empty();

            // if there is no data, we don't want to just render a message,
            // because that will look odd. instead, we render a single radio
            // that will subsequently get disabled (in BaseChoiceView), plus
            // the message.
            if (this._linkList){
                this._linkList.remove();
            }

            if (!data || data.length === 0) {
                data = [{value: "", label: _("N/A").t()}];
            }

            this._linkList = new LinkList({
                model: this._selections,
                modelAttribute: 'value',
                items: $.extend(true, [], data)
            });

            this._linkList.render().appendTo(viz);
            this.updateDomVal(this.settings.get('value'));

            return this;
        }
    });
});
