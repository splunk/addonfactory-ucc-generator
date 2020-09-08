// footer nav
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/shared/controls/Control',
    'jquery.ui.datepicker'
],
function(
    $,
    _,
    Backbone,
    module,
    Control,
    jqueryDatepicker
){
    /**
     * @constructor
     * @memberOf views
     * @name DateControl
     * @extends {views.Control}
     *
     * @param {Object} options
     * @param {models.DateInput} options.DateInput The DateInput.js model to operate on
     * @param {String} [options.inputClassName] Class attribute for the input
     * @param {String} [options.additionalClassNames] Class attribute(s) to add to control
     */
    return Control.extend(/** @lends views.DateControl.prototype */{
        moduleId: module.id,
        tagName: 'span',
        initialize: function() { 
            var defaults = {
                    inputClassName: '',
                    help: 'MM/DD/YYYY'
            };
            _.defaults(this.options, defaults);
            Control.prototype.initialize.call(this, this.options);
        },
        startListening: function() {
            Control.prototype.startListening.apply(this, arguments);
            this.listenTo(this.model, 'change', this.render);
        },
        activate: function(options) {
            options = options || {};
            if (this.active) {
                return Control.prototype.activate.apply(this, arguments);
            }
            
            if (!options.skipSetValueRender) {
                this.render();
            }
            
            return Control.prototype.activate.apply(this, arguments);
        },
        events: {
            'change input[type=text]': function(e) {
                this.setValue(this.$('input').datepicker('getDate'), false);
            }
        },
        updateModel: function(options){
            options = options || {};
            var updateOptions = {
                validate: this.options.validate,
                forceUpdate: this.options.forceUpdate
            };

            $.extend(true, updateOptions, options);

            if (this.model) {
                return this.model.setMonDayYearFromJSDate(this._value, updateOptions);
            }
            return true;
        },

        render: function() {
            if (!this.el.innerHTML) {
                var template = _.template(this.template, {
                    options: this.options
                });

                this.$el.html(template);

                this.$('input').datepicker({
                    defaultDate: this.model.jsDate({includeTime:false})
                });

                var additionalClassNames = this.options.additionalClassNames;
                if(additionalClassNames) {
                    this.$el.addClass(additionalClassNames);
                }
            }

            // SPL-70724, in IE setting the same date will cause the date picker dialog to open again
            // so we first check if they are equal
            var inputDate = this.$('input').datepicker('getDate');
            var modelDate = this.model.jsDate({includeTime:false});

            if(!inputDate || inputDate.getTime() !== modelDate.getTime()) {
                this.$('input').datepicker('setDate',  modelDate);
            }
            this.$('input').blur();

            return this;
        },
        template: '\
            <input type="text" class="mdy-input <%= options.inputClassName %>" value=""/>\
        '
    });
});
