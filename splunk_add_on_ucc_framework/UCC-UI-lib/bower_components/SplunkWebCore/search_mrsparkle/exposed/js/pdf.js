Splunk.namespace("Splunk.pdf");

/**
 * Splunk.pdf object includes utility functions for accessing the 'pdfgen'
 * rendering engine in splunkd. 
 */

Splunk.pdf = {

    /**
     * is_pdf_available will call availableCallback if the pdfgen endpoint returns non-4XX
     * and will call unavailableCallback otherwise
     * the value of the REST call will be stored for subsequent use
     */
    is_pdf_available: function(availableCallback, unavailableCallback) {
        if (this.pdfIsAvailableSet) {
            if (this.pdfIsAvailable === true && availableCallback) { 
                availableCallback(this.whichPdfEngine); 
            } else if (this.pdfIsAvailable === false && unavailableCallback) { 
                unavailableCallback(); 
            }
            return;
        }
        this.pdfIsAvailable = false;
        this.whichPdfEngine = "none";
        var that = this;
        
        function setIsAvailable(whichPdf, callback) {
            that.pdfIsAvailable = true;
            that.whichPdfEngine = whichPdf;
            that.pdfIsAvailableSet = true;
            if (callback) { callback(that.whichPdfEngine); }
        }
        function setIsUnavailable(callback) {
            that.pdfIsAvailable = false;
            that.pdfIsAvailableSet = false;
            if (callback) { callback(); }
        }

        // check PDFGEN_IS_AVAILABLE flag from web.conf
        if (Splunk.util.getConfigValue('PDFGEN_IS_AVAILABLE', true)) {
            setIsAvailable("pdfgen", availableCallback);
        }
        else {
            setIsUnavailable(unavailableCallback);
        }
    },

    /**
     * get_render_url_for_saved_search returns a URL which will return
     * a PDF representing the <namespace>/<savedSearch> object.
     * If sid is provided, the PDF renderer will use the existing job
     * instead of dispatching a new one.
     */
    get_render_url_for_saved_search: function(savedSearch, namespace, sid, pdfService) {
        var params = {};
        params["input-report"] = savedSearch;
        params["namespace"] = namespace;
        if (sid) {
            params["sid"] = sid;
        }
    
        return Splunk.pdf._get_pdfgen_render_url(params);    
    },

    /**
     * get_render_url_for_current_dashboard returns a URL which will return
     * a PDF representing the current dashboard visible in the browser
     */
    get_render_url_for_current_dashboard: function(pdfService) {
        var params = {};
        params["input-dashboard"] = Splunk.ViewConfig.view.id;
        params["namespace"] = Splunk.ViewConfig.app.id;
       
        var gimps = $('.Gimp');
        for (var i = 0; i < gimps.length; i++) {
            var gimpId = gimps[i].id;
            var gimpModule = Splunk.Globals['ModuleLoader'].getModuleInstanceById(gimpId);

            var search = gimpModule.getContext().get("search");
            if (!search || !search.job) continue;

            var sid = search.job.getSearchId();
            if (!sid) continue;

            params["sid_" + i] = sid;     
        }
        
        return Splunk.pdf._get_pdfgen_render_url(params);    
    },
   
    /**
     * _get_pdfgen_render_url is a 'private' utility function to encapsulate all
     * general behavior related to setting up a pdfgen/render URL
     */ 
    _get_pdfgen_render_url: function(params) {
        return Splunk.util.make_full_url("splunkd/__raw/services/pdfgen/render", params);
    }
};
