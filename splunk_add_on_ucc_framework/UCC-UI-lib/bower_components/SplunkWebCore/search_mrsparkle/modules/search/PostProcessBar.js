//put Module in the namespace if it isnt already there.
Splunk.namespace("Module.FieldSearch");

/* The FieldSearch provides a query input area along with a submit button. 
 * In this version, the initial DOM elements are added to the container.
 * In the render() method, in the interest of encapsulation and to enable a
 * simple override of render() overrides to change the appearance.
 */
Splunk.Module.PostProcessBar = $.klass(Splunk.Module.FieldSearch, {
    
    /*
     * overriding initialize to set up references and event handlers.
     */
    initialize: function($super, container) {
        $super(container);
        this.childEnforcement = Splunk.Module.ALWAYS_REQUIRE;
        
        this.logger = Splunk.Logger.getLogger("search_field.js");
        this.fieldName = false;

        this.maxSearchBarHeightMultiple = 4; // awesomely long name to hold the max number of lines for textarea resizing

        this._attachEventHandlers();
          
        // the library we use for resizing fights with jsunit in a weird way.
        if (!Splunk._testHarnessMode) {
            this._makeTextareaResizable();
        }
    },

    _attachEventHandlers: function() {
        this.input = $('textarea', this.container);
        // provide a fallback for unit tests.
        if (this.input.length==0) {
            this.input = $('<textarea>').appendTo(this.container);
        }

        this.input.bind("keypress", this._onKeyDown.bind(this));
    },

    _makeTextareaResizable: function() {
        /* get the lineheight of the textarea, used for resizing calcs later */

        var temp = this.input.css('lineHeight') || "1.4em";
        this.lineheight = parseInt(temp.substr(0,(temp.length-2)),10);

        var maxHeight = this.maxSearchBarHeightMultiple * this.lineheight;
               
        this.input.resizable({
            minHeight: 21,
            maxHeight: maxHeight,
            autoHide: true,
            handles: "s",
            grid: [0,this.lineheight],
            helper: "searchFieldGhost",
            stop: function(e, ui){
                // grid doesn't work pixel-perfect, this adjusts the result to the nearest multiple of the line-height
                var adjustedHeight = Math.round(parseInt(ui.element.css('height'), 10)/this.lineheight)*this.lineheight;
                ui.element.css({
                    width:'auto',
                    height: adjustedHeight
                })
                .children('textarea').css({
                    width:'100%',
                    height: adjustedHeight
                });
            }.bind(this)
        })
        .css('width','100%')
        .parent('div').css('width','auto');
    },
   
    applyContext: function($super,context) {},
   
    _getUserEnteredSearch: function() {
        return this.input.attr('value') || '';
    },

    /**
     * Necessitated by the need to resurrect jobs, sometimes search bars
     * may need to have their terms explicitly set.
     */
    setSearchTerm: function(terms) {
        this.input.attr('value', terms);
    },

    onContextChange: function() {
        var context = this.getContext();
        var search  = context.get("search");
        this.setSearchTerm(search.getPostProcess() || '');
    },

    /*
     *  Note:  Although getModifiedContext often just adds an intention,
     * sometimes it may also replace the Job instance.
     */
    getModifiedContext: function() {
        // pass through if the job has a search id
        var context = this.getContext();
        var search  = context.get("search");
        var searchTermStr = this._getUserEnteredSearch();
        this.logger.info('getModifiedContext - got search=', searchTermStr);
        if (searchTermStr) {   
            search.setPostProcess(searchTermStr);
            context.set("search", search);
        }
       
        return context;
    },
    _onFormSubmit: function($super, event) {
        this.baseContext = null;
        return $super(event);
    },
    _onKeyDown: function(evt) {
        var keyCode  = evt.keyCode;
        if (keyCode == this.keys['ENTER']) {
            if ( evt.ctrlKey || evt.shiftKey ) { //ctrl-enter|shift-enter adds line to the textarea
                this.growTextarea();
            } else {

                // SPL-19367
                // TODO: this is a temp workaround to hiding the autocomplete after an enter key
                this.input.blur();
                this.input.focus();
                // END TODO
                
                evt.preventDefault();
                this._onFormSubmit();
                return false;
            }
        }
    },
    /* Function to grow the textarea by one unit (multiple of the lineheight). */
    growTextarea: function() {
        var maxHeight = this.maxSearchBarHeightMultiple * this.lineheight;

        if ( this.input.height() < maxHeight ) {       
            var oldHeight = this.input.height();
            var newHeight = parseInt(oldHeight,10) + parseInt(this.lineheight,10);
           
            this.input.height(newHeight);
            this.input.parent('div').height(newHeight);
        }
    }
});
