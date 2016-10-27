/*global define,window */
define([
    'jquery',
    'lodash',
    'views/shared/controls/Control',
    'splunk.util'
], function(
    $,
    _,
    Control,
    splunkUtil
) {
    /**
     * Text Input with Bootstrap markup
     *
     * @param {Object} options
     *                 {String} modelAttribute The attribute on the model to observe and update on selection
     *                 {Object} model The model to operate on
     *                 {String} inputClassName (Optional) Class attribute for the input
     *                          use this value to populate the text input
     *                 {String} additionalClassNames (Optional) Class attribute(s) to add to control
     *
     */

    return Control.extend({
        tagName: 'form',
        className: 'control control-upload',
        initialize: function() {
            var defaults = {
                inputClassName: ''
            };
            _.defaults(this.options, defaults);

            Control.prototype.initialize.apply(this, arguments);
            this._isLoaded = false;
        },
        events: {
            'click .upload-file-button': function(e) {
                e.preventDefault();
                this.$('.inputReference').click();
            },
            'change input': function(e) {
                this.$('.filename b').first().text(e.currentTarget.value.split('\\').pop());

                if (window.FileReader && window.FileReader.prototype.readAsText) {
                    // Check if browser supports FileReader
                    this.handleFileSelect(e);
                }
            },
            'focus .fileInput': function() {
                this.$('.fileInputContainer').addClass("isFocused");
            },
            'focusout .fileInput': function() {
                this.$('.fileInputContainer').removeClass("isFocused");
            }
        },
        disable: function() {
            this.$input.hide();
        },
        enable: function() {
            this.$input.show();
        },
        handleFileSelect: function(e) {
            var files, f, reader, that;
            files = e.target.files;
            if (files.length !== 1) {
                return; //Expecting exactly 1 file to be selected
            }

            f = files[0];
            if (_.isFunction( this.options.validator)){
                if (!this.options.validator(f)){
                    this._isLoaded = false;
                    this.trigger("invalid");
                    return;
                }
            }
            reader = new window.FileReader();
            that = this;
            reader.onload = function() {
                var text = reader.result;
                that.setValue(text, false);
                that._isLoaded = true;
                that.trigger("loaded");
            };
            reader.readAsText(f);
        },
        render: function() {
            var template, additionalClassNames;
            if (!this.el.innerHTML) {
                template = _.template(this.template)({
                    options: this.options,
                    value: this._value || '',
                    _: _,
                    splunk_form_key: splunkUtil.getFormKey()
                });

                this.$el.html(template);
                this.$input = this.$('input');
            }

            additionalClassNames = this.options.additionalClassNames;
            if (additionalClassNames) {
                this.$el.addClass(additionalClassNames);
            }

            return this;
        },
        isLoaded: function(){
            return this._isLoaded;
        },
        template: [
            '<div">',
            '<input type="hidden" name="splunk_form_key" value="<%= splunk_form_key %>">',
            '<p class="filename">Selected File: <b>No File Selected</b></p>',
            '<a href="#" class="btn upload-file-button"><%- options.text || "Choose a File to Upload..." %></a>',
            '<input type="file" name="<%- options.modelAttribute || "" %>" class="inputReference <%= options.inputClassName %>" value="<%- value %>" style="display:none;"/>',
            '</div>'
        ].join('')
    });
});
