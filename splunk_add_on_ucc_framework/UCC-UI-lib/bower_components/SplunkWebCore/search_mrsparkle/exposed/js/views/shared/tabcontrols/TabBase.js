/**
 * @author jszeto
 * @date 10/24/13
 * 
 * Base class that displays an individual tab of a TabBar. 
 * 
 * Inputs:
 * 
 * label {string} the string to display in the tab,
 * selected {boolean} true if the tab is in the selected state
 * enabled {boolean} if false, then the tab will be displayed in the disabled state
 *
 * Required Template:
 * tab-label - the element that displays the label of the tab
 *
 * @fires TabBase#tabClick
 */
define(['underscore', 'module', 'views/Base'], function(_, module, BaseView) {
    return BaseView.extend({
        tagName: 'li',
        moduleId: module.id,

        _label: "",
        _selected: false,
        _enabled: true,

        initialize: function(){
            BaseView.prototype.initialize.apply(this, arguments);

            if (!_(this.options.tabClassName).isUndefined())
                this.$el.addClass(this.options.tabClassName);
            if (!_(this.options.label).isUndefined())
                this.setLabel(this.options.label);
            if (!_(this.options.selected).isUndefined())
                this.setSelected(this.options.selected);
            if (!_(this.options.enabled).isUndefined())
                this.setEnabled(this.options.enabled);
        },
        events: {
            'click': function(e){
                /**
                 * Tab has been clicked
                 *
                 * @event TabBase#tabClick
                 * @param {TabBase} the tab that has been clicked
                 */
                this.trigger("tabClick", this);
                e.preventDefault();
            }
        },
        setSelected: function(value) {
            if (this._selected != value) {
                this._selected = value;
                if (this._selected) {
                    this.$el.addClass("active");
                    this.$el.addClass("adjustTabColoringMargin");
                }
                else{
                    this.$el.removeClass("active");
                    this.$el.removeClass("adjustTabColoringMargin");
                }
            }
        },
        getSelected: function() {
            return this._selected;
        },
        setEnabled: function(value) {
            if (this._enabled != value) {
                this._enabled = value;
                if (this._enabled)
                    this.$el.removeClass("disabled");
                else
                    this.$el.addClass("disabled");
            }
        },
        getEnabled: function() {
            return this._enabled;
        },

        setLabel: function(value) {
            if (this._label != value) {
                this._label = value;
                this.debouncedRender();
            }
        },

        getLabel: function() {
            return this._label;
        },

        render: function() {
            this.$el.html(this.compiledTemplate());
            this.$(".tab-label").text(this.getLabel());
            return this;
        },
        template:'\
            <a href="#" class="tab-label"></a>\
        '
    });
});
