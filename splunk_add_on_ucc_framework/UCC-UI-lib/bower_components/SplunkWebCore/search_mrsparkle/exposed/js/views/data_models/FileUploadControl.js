define(['jquery', 'underscore', 'module', 'views/shared/controls/Control', 'splunk.util'], function($, _, module, Control, splunkUtil) {
    /**
     * Text Input with Bootstrap markup
     *
     * @param {Object} options
     *                        {String} modelAttribute The attribute on the model to observe and update on selection
     *                        {Object} model The model to operate on
     *                        {String} inputClassName (Optional) Class attribute for the input
     *                                 use this value to populate the text input
     *                        {String} additionalClassNames (Optional) Class attribute(s) to add to control
     *
     */

    return Control.extend({
        moduleId: module.id,
        tagName:'form',
        className: 'control control-upload',
        initialize: function() {
            var defaults = {
                    inputClassName: ''
            };
            _.defaults(this.options, defaults);

            Control.prototype.initialize.apply(this, arguments);
        },
        events: {
            'change input': function(e) {
                this.$('.filename').text(e.currentTarget.value.split('\\').pop());
                
                if (window.FileReader && window.FileReader.prototype.readAsText) { 
                    // Check if browser supports FileReader 
                    this.handleFileSelect(e); 
                } else {
                    this.handleFileSelect_unsupportedBrowsers(e); 
                }
            }, 
            'focus .fileInput': function(e) {
                this.$('.fileInputContainer').addClass("isFocused"); 
             }, 
            'focusout .fileInput': function(e) {
                this.$('.fileInputContainer').removeClass("isFocused"); 
             }
        },
        disable: function(){
            this.$input.hide();
        },
        enable: function(){
            this.$input.show();
        },
        handleFileSelect_unsupportedBrowsers: function(e) {
           // If browser does not support FileReader, then we cannot access the contents of the file with javascript.  Instead, we must post the file directly to a python endpoint.  The python endpoint will return the contents of the file.  The file input form is submitted inside of an iframe so that When the iframe loads, it will contain the contents of the file. 
           
           var iframe = $("<iframe id='upload_iframe' name='upload_iframe' width='0' height='0' border='0' style='width:0; height:0; border:none; display:none'>");  
             
           // Add to document...
           var $form = $(e.target).closest('form');
           $form.parent().append(iframe);
           var form = $form[0];
             
           // Add event for when iframe loads 
           var that = this;  
           var handleIframeLoaded = function() {
               form.setAttribute("target", "");
               var fileContents = $('#upload_iframe').contents().find('body').html(); 
               that.setValue(fileContents, false); 
           };  
           $('#upload_iframe').load(handleIframeLoaded); 

           // Set properties of form to point to iframe
           form.setAttribute("target", "upload_iframe");
           var action_url = splunkUtil.make_url('manager/system/datamodel/upload'); 
           form.setAttribute("action", action_url);
           form.setAttribute("method", "post");
           form.setAttribute("enctype", "multipart/form-data");
           form.setAttribute("encoding", "multipart/form-data");      
           form.submit(); 
        }, 
        handleFileSelect: function(e) {
                    var files = e.target.files; 
                    if (files.length != 1) return;  //Expecting exactly 1 file to be selected 

                    var f = files[0]; 
                    var reader = new FileReader(); 
                    var that = this; 
                    reader.onload = function(e) {
                        var text = reader.result; 
                        that.setValue(text, false);
                    };
                    reader.readAsText(f); 
        }, 
        render: function() {
            if (!this.el.innerHTML) {
                var template = _.template(this.template, {
                        options: this.options,
                        value: this._value || '', 
                        _:_, 
                        splunk_form_key: splunkUtil.getFormKey()
                    });

                this.$el.html(template);
                this.$input = this.$('input');
            } 

            var additionalClassNames = this.options.additionalClassNames;
            if(additionalClassNames) {
                this.$el.addClass(additionalClassNames); 
            }

            return this;
        },
        template: '\
          <label class="fileInputContainer">\
            <span class="filename uneditable-input"></span><span class="btn btn-file"><%-_("File...").t()%></span>\
            <input class="fileInput" type="file" \
               name="<%- options.modelAttribute || "" %>" \
               class="<%= options.inputClassName %>" \
               value="<%- value %>" \
               <% if(!options.enabled){ %>style="display:none"<%}%>>\
            <input type="hidden" name="splunk_form_key" value="<%=splunk_form_key%>">\
          </label>'
  
    });
});
