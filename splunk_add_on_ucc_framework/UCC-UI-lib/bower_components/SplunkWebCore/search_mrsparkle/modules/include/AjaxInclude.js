/**
 * A simple wrapper for embedding content via XHR within the module framework. Emulates iframe click behavior (page not refreshed) and binds an ajaxForm handler to all forms.
 * 
 * @author Doc Yes
 */
Splunk.Module.AjaxInclude = $.klass(Splunk.Module, {
    CONTENT_CLASS_NAME: "content",
    UI_EVENT_TYPES: ["click", "keydown"],
    /**
     * Can you kick it, yes you can!
     */
    initialize: function($super, container){
        $super(container);
        this.logger = Splunk.Logger.getLogger("Splunk.Module.AjaxInclude");
        this.container.append($('<div class="'+this.CONTENT_CLASS_NAME+'"></div>'));
        this.content = $("." + this.CONTENT_CLASS_NAME, this.container);
        this.focus = this._params.focus || null;
        this.data = this._params.data || {};
        this.hrefRegExp = new RegExp(this._params.hrefpattern, this._params.hrefattributes || "");
        this.request(this._params.method, Splunk.util.make_url(this._params.endpoint));
        this.data = {};
        this.container.bind(this.UI_EVENT_TYPES.join(" "), this.onUIEvent.bind(this));
    },
    /**
     * Apply form element focus to the first forms valid form element.
     *  
     */
    autoFormFocus: function(){
        var d = this.container[0];
        var forms = $("forms");
        for(var i=0; i<forms.length; i++){
            var el = forms[i][0].elements;
            for(var j=0; j<el.length; j++){
                if(el[j].type!="hidden" && el[j].nodeName!="BUTTON"){
                    var target = el[j];
                    setTimeout(function(){target.focus();}, 1);
                    return;
                }
            }
        }
    },
    /**
     * Apply focus to a form element.
     * 
     */
    applyFormFocus: function(){
        if(this.focus){
            $(this.focus, this.container).focus();
        }else{
            this.autoFormFocus();
        }
    },
    /**
     * Prepares a form to be submitted via AJAX by adding all of the necessary event listeners and behavior. 
     * 
     */
    enableXHRForm: function(){
        $("form", this.container).ajaxForm({
            success: this.onRequestSuccess.bind(this),
            error: this.onRequestError.bind(this),
            target: this.content
        });
    },
    /**
     * Check if an anchor element is XHR safe or not based on a complex set of rules.
     * 
     * @param {Object} element jQuery element reference.
     * @type Boolean
     * @return true if the anchor element is XHR safe or false if it is not.
     */
    isAnchorXHRSafe: function(element){
        var onclick = (element.attr("onclick") || "");//undefined if not set
        return (element.attr("rel")!=="popup" && onclick.length===0 && element.attr("target").length===0 && element.attr("href").search(this.hrefRegExp)!=-1)?true:false;
    },
    /**
     * Replicate clicks within an IFrame, do not refresh parent document. 
     * 
     * @param {Object} event The DOM event triggered.
     * @type Boolean
     * @return Cancel (false) or enable (true) the propagation of this event.
     */
    onIFrameReplicator: function(event){
        this.request("GET", event.target.href);
        return false;
    },
    /**
     * Handle context changes. See $super for implementation details.
     *
     * @param {Object} settings An object literal containing various types for values.
     */
    onContextChange: function($super){
        // TODO - check on whether any thing in the framework was previously able to set the 'hide' and 'focus' keys. If so, determine appropriate context namespace.
        var hideKey = "UNCLEAR_WHO_SETS_THIS_KEY.hide";
        var focusKey = "UNCLEAR_WHO_SETS_THIS_KEY.focus";
        if (context.has(hideKey)){
            this.container[0].style.display = (context.get(hideKey)===true)?"none":"";
        }
        if (context.has(focusKey)){
            this.focus = context.get(focusKey);
            this.applyFormFocus();
        }
    },
    /**
     * Triggered when the endpoint has failed loading.
     *
     * @param {Object} XMLHttpRequest The XMLHttpRequest object.
     * @param {String} textStatus Describes the type of error that occurred.
     * @param {Error} (Optional) error An exception object.
     */
    onRequestError: function(xhr, textStatus, error){
        this.logger.error(sprintf(_("Could not load endpoint %(textStatus)s"), {textStatus: textStatus}));
    },
    /**
     * Triggered when the endpoint has completely loaded.
     *
     * @param {Object} data The data returned from the server, formatted according to the 'dataType' parameter.
     * @param {String} textStatus Describing the type of success of the request.
     */
    onRequestSuccess: function(data, textStatus){
        this.logger.info("onEndpointComplete", textStatus);
        this.content = $(Splunk.util.turboInnerHTML(this.content[0], data));
        this.enableXHRForm();
        this.applyFormFocus();
    },
    /**
     * Top level UI event listener and dispatcher.
     *
     * @param {Object} event A jQuery event.
     * @return Control the cancellation of events triggered.
     * @type Boolean
     * @return Cancel (false) or enable (true) the propagation of this event.
     */
    onUIEvent: function(event){
        var eventType = event.type;
        var eventTarget = $(event.target);
        if((eventType==="click" || eventType==="keydown") && eventTarget.is("a") && this.isAnchorXHRSafe(eventTarget)){
            return this.onIFrameReplicator(event);
        }else{
            return true;
        }
    },    
    /**
     * Makes an HTTP request to a specified endpoint with appropriate handlers.
     * 
     * @param {String} method The HTTP request method, one of GET or POST.
     * @param {String} endpoint The HTTP resource URI.
     */
    request: function(method, endpoint){
        $.ajax({
            type: method,
            url: endpoint,
            data: this.data,
            dataType: "html",
            async: false,
            error: this.onRequestError.bind(this),
            success: this.onRequestSuccess.bind(this)
        });
    }
});
