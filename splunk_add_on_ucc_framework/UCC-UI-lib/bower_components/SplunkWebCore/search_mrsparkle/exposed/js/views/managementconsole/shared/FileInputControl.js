/**
 * File input control allows the user to upload single file. It relies on the FileReader API to
 * read the input file as a string.
 *
 * Events:
 * 'fileSelected': triggered when a file is uploaded
 */

define([
    'jquery',
    'underscore',
    'backbone',
    'views/shared/controls/Control'
], function(
    $,
    _,
    Backbone,
    Control
) {

    /**
     * @constructor
     * @name FileInputControl
     * @extends {views.Control}
     *
     * @param {Object} options
     * @param {String} options.modelAttribute The attribute on the model to observe and update on selection
     * @param {Backbone.Model} options.model The model to operate on
     * @param {String} [options.label] Label for control
     * @param {String} [options.maxFileSize] Max file size allowed
     * @param {String} [options.fileNameModelAttribute] Model attribute where filename will be written
     */
    return Control.extend({
        tagName: 'form',
        events: {
            'change input': 'inputChanged'
        },

        /**
         * Fired when a change event happens on the input control
         */
        inputChanged: function(e) {

            /**
             * Verify if the FileReader api exists and the readAsText is available before
             * we start fetching the file
             */
            if (FileReader && FileReader.prototype.readAsText) {
                this._setFileContentFromReader(e);
            } else  {
                throw Error('Cannot upload file');
            }
        },

        _setFileContentFromReader: function(ev) {
            var file = ev.target.files[0],
                that = this,
                reader = null;

            if (file) {
                //Notify any listeners about the file size
                this.trigger("fileSelected", file.size);
                if (this.options.maxFileSize && file.size > this.options.maxFileSize) {
                    return;
                }

                if (this.options.fileNameModelAttribute) {
                    this.model.set(this.options.fileNameModelAttribute, file.name);
                }

                reader = new FileReader();
                // on load will be called after the text is read. We call setValue on the control
                // with the text so that the modalAttribute is updated with the right content.
                reader.onload = function(e) {
                    var text = reader.result;
                    that.setValue(text, false);
                };
                reader.readAsText(file);
            }
        },

        hide: function() {
          this.$el.hide();
        },

        show: function() {
          this.$el.show();
        },

        render: function() {

            // need to check this to make sure we do not render the control multiple times. setValue
            // on control triggers a render in which case we do not need to render
            if (!this.el.innerHTML) {
                this.$el.html(this.compiledTemplate({
                    name: this.options.modelAttribute,
                    label: this.options.label
                }));
            }

            return this;
        },

        template: '\
            <div class="file-input-control">\
                <label class="control-label"><%- label %></label>\
                <div class="controls">\
                    <input class="control" type="file" name="<%- name %>"/>\
                </div>\
            </div>'
    });

});