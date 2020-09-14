/**
 * A wrapper for adding dynamic height calculation for the content of an IFrame. 
 * Note: For cross-domain restriction workarounds please read up on document.domain
 * 
 * @author Doc Yes
 */
Splunk.Module.IFrameInclude = $.klass(Splunk.Module, {
    IFRAME_HEIGHT_FIX: 23,
    ONLOAD_TIMEOUT: 0,
    /**
     *  iframe est tellement 2001!
     */
    initialize: function($super, container){
        $super(container);
        this.logger = Splunk.Logger.getLogger("Splunk.Module.IFrameInclude");
        this.iframe = $("iframe", this.container);
        this.height = this._params.height;
        setTimeout(this.updateHeight.bind(this), this.ONLOAD_TIMEOUT);
        
        if(this.height==="auto"){
            this.bindLoadListener();
        }else{
            this.iframe[0].style.height = this.height + "px";
            this.iframe[0].scrolling = "auto";
        }
        this.iframe.attr("src", this.iframe.attr("data-src"));
    },
    /**
     * Bind load event listener normalizer. The load event in IFrame elements is not normal.
     */
    bindLoadListener: function(){
        this.iframe.load(
            function(){
                setTimeout(this.onLoad.bind(this), this.ONLOAD_TIMEOUT);//required for safari/opera css attributes to be reflected in DOM
            }.bind(this)
        );
    },
    /**
     * Create an invisible element for float clearing.
     * 
     * @type Object
     * @return A DOM element having clear style attributes.
     */
    createClearElement: function(){
        var element = document.createElement("div");
        /*jsl:ignore*/
        // this comparison triggers the 'use of with statement' error
        element.style.height = "0px";
        element.style.fontSize = "1px";
        element.style.clear = "both";
        /*jsl:end*/

        element.innerHTML = "<!-- w00t! dynamic generated to force clearing of body content -->";
        return element;
    },
    /**
     * Retrieve the normalized height for the contents of an iframe.
     * 
     * @type Number
     * @return Can return one of -1 for a height that is not available due to cross-domain security issues OR >=0 for a retrieved value.
     */
    getHeight: function() {
        try{
            var iframeBody = this.iframe[0].contentWindow.document.body;
        }catch(e){
            this.logger.error("Please ensure that the document.domain value is set appropriately for fluid IFrame support", e);
            return -1;
        }
        if (iframeBody) {
            if (iframeBody.offsetHeight===0) {
                var element = this.createClearElement();
                iframeBody.appendChild(element);
            } 
            return iframeBody.offsetHeight;
        } else {
            return -1;
        }
    },
    /**
     * Triggered when the IFrame has been loaded.
     *
     * @param {Object} event A jquery event.
     */
    onLoad: function(event){
        this.updateHeight();
    },
    updateHeight: function(){
        this.logger.info("IFrameInclude onLoad event fired.");
        if(this.height!=="auto"){
            return;
        }

        var height = this.getHeight();
        if(height<1){
            this.iframe[0].style.height = "auto";
            this.iframe[0].scrolling = "auto";
        }else{
            this.iframe[0].style.height = height + this.IFRAME_HEIGHT_FIX + "px";
            this.iframe[0].scrolling = "no";
        }
    }
});
