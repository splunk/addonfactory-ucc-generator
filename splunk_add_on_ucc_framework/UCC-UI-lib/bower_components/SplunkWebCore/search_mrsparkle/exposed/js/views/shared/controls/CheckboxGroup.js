define([
            'jquery',
            'underscore',
            'module',
            'backbone',
            'views/shared/controls/Control',
            'views/shared/controls/SyntheticCheckboxControl',
            'util/general_utils'
        ],
        function(
            $,
            _,
            module,
            Backbone,
            Control,
            SyntheticCheckboxControl,
            util
        ) {
        /**
         * @constructor
         * @memberOf views
         * @name CheckboxGroup
         * @description Synthetic Checkbox Group Control 
         * @extends {views.Control}
         *
         * @param {Object} options
         * @param {Backbone.Model} options.model The model to operate on
         * @param {String} options.modelAttribute The attribute on the model to observe and update
         * on selection
         * @param {Object[]} options.items An array of one-level deep data structures, for example
         *
         *     {label: 'Foo Bar', value: 'foo', icon: 'bar', className: 'foo'}
         *     
         *     @param {String} options.items[].label textual display
         *     @param {Any} options.items[].value value to store in the model
         * @param {String} [options.additionalClassNames] Class attribute(s) to add to control
         */
        return Control.extend(/** @lends views.CheckboxGroup.prototype */{
            className: 'control checkbox-group',
            moduleId: module.id,
            initialize: function(options) {
                this._checkboxes = [];
                this._selections = new Backbone.Model();
                _.each(options.items, function(value){
                    var syntheticCheckboxControl = new SyntheticCheckboxControl({
                        model: this._selections,
                        modelAttribute: value.value,
                        label: _($.trim(value.label) || value.value || '').t()
                    });
                    this._checkboxes.push(syntheticCheckboxControl);
                }, this );
                this.listenTo(this._selections, "change", this._updateValue);
                this.listenTo(this.model, 'change:' + options.modelAttribute, this.updateDomVal);
                this.updateDomVal();
                Control.prototype.initialize.apply(this, arguments);
            },
            _updateValue: function(model, change, options) {
                // Must copy array so we always get a change event
                var val = util.asArray(this.model.get(this.options.modelAttribute)).slice(0);
                _(model.changed).each(function(v, k) {
                   if (!v) {
                       val = _(val).without(k);
                   } else if (val.indexOf(k) < 0) {
                       val.push(k);
                   }
                });
                this.model.set(this.options.modelAttribute, val);
            },
            enable: function(){
                this._enabled = true;
                _.each(this._checkboxes, function(checkbox) {
                    checkbox.enable();
                }, this);
            },
            disable: function(){
                this._enabled = false;
                _.each(this._checkboxes, function(checkbox) {
                    checkbox.disable();
                }, this);
            },
            render: function(){
                _.each(this._checkboxes, function(checkbox) {
                    checkbox.render().appendTo(this.$el);
                }, this);
                return this;
            },
            updateDomVal: function() {
                var oldSelections = this._selections.toJSON();
                var newSelections = {};
                _(oldSelections).each(function(value, key) {
                    newSelections[key] = 0;
                });
                _.each(util.asArray(this.model.get(this.options.modelAttribute)), function(val) {
                    newSelections[val] = 1;
                },this);
                this._selections.set(newSelections);
            },
            remove: function(){
                _.each(this._checkboxes, function(checkbox) {
                    checkbox.remove();
                });
                this._checkboxes = [];
                Control.prototype.remove.call(this);
            }
        });
});
