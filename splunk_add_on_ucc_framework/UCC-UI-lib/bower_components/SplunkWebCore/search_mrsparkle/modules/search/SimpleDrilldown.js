//put Module in the namespace if it isnt already there.
Splunk.namespace("Module");

Splunk.Module.SimpleDrilldown = $.klass(Splunk.Module, {
    initialize: function($super, container){
        $super(container);

        // read links from params
        var links = this.getParam("links", {});
        if (typeof links === 'string') {
            try {
                links = JSON.parse(links);
            } catch(e) {
                console.error('Unable to parse links parameter of SimpleDrilldown module');
            }
        }
        this.links = links;
    },
    
    /*
     * Replace tokens with actual values
     */
    _inflateLink: function(link, context) {
        var tokens = Splunk.util.discoverReplacementTokens(link);
        for (var i=0; i<tokens.length; i++) {
            var rawKey = tokens[i];
            var parsedKey = this._parseKey(rawKey);
            var key = parsedKey.key;
            link = link.replace("$" + rawKey + "$", "$" + key + "$");
            if (!context.hasOwnProperty(key)) {
                console.warn('No matches for drilldown interpolation variable found: '+key);
                continue;
            }
            var replacer = new RegExp("\\$" + Splunk.util.escapeRegex(key) + "\\$");
            link = Splunk.util.replaceTokens(link, replacer, this.escapeValue(context[key], parsedKey.searchEscape));
        }
        return link;
    },
   
    /**
     * Take a keys value and parse out the key literal and if it has
     * the special '|s' splunk search escape filter.
     *
     * @param {String} value The actual token key name (ie., $click.value$ or $click.value|s'
     * @type {Object}
     * @return The {String} key stripped of any escape (ie., "click.value|s" -> "click.value') and if the key value should be search escaped; {Bool} searchEscape
     */ 
    _parseKey: function(value) {
        //value|s 
        var _value = value,
            searchEscapeRex = /(\s)*\|(\s)*s(\s)*$/,
            index = _value.search(searchEscapeRex),
            meta = {
                key: value,
                searchEscape: false
            };
        if (index!=-1) {
            meta.key = _value.substring(0, index);
            meta.searchEscape = true;
        }
        return meta;
    },

    /**
     * Takes a token value and safely escapes.
     *
     * @param {String} value The value to escape
     * @param {Bool} searchEscape Pass the value through the Splunk.util.SearchEscape method.
     * @type {String}
     * @return The escaped valie.
     */
    escapeValue: function(value, searchEscape) {
        var _value = (typeof(value)==='undefined' ? '':(value+'')).replace(/\\/g,"\\\\");
        if (searchEscape) {
            _value = Splunk.util.searchEscape(_value);
        }
        return encodeURIComponent(_value);
    },

    /*
     * Query Table module's DOM for cell values in the same row as the selected cell
     */
    _getTableRowValues: function(currentCell) {
        var row = {};
        if (!currentCell) {
            return null;
        }
        
        var cells = $(currentCell.context).parent().children(':not(.pos)');
        for (var i=0; i<cells.length; i++) {
            var $cell = $(cells[i]);
            var field = null;
            if ($cell.attr('field')) {
                field = $cell.attr('field');
            } else if ($cell.attr('starttime')) {
                field = '_time';
            }
            
            if (field) {
                row['row.'+field] = $cell.text();
            }
        }
        return row;
    },
    
    /*
     * Returns a dictionary of variables for link interpolation
     */
    _getLinkContext: function(context) {
        var linkContext = {};
        var click = context.getAll('click');

        for (var k in context.getAll('')) {
            // get all string vars from the context
            if (typeof context.get(k) !== 'object' && typeof context.get(k) !== 'function') {
                linkContext[k] = context.get(k); 
            }
        }
        
        if (click.hasOwnProperty('element')) { 
            // If it's a table, collect values from the current row
            linkContext = $.extend(linkContext, this._getTableRowValues(click.element));
        }
        if (click.hasOwnProperty('rowContext')) {
            // If it's a chart, the row context will be included in the click event
            linkContext = $.extend(linkContext, click.rowContext);
        }
        
        var formValues = context.getAll('form');
        if (!$.isEmptyObject(formValues)) {
            var l;
            for (l in formValues) {
                // any tokens used on the form
                linkContext['form.'+l] = formValues[l]; 
            }
        }

        var search = context.get('search');
        var range = search.getTimeRange();
        if (range) {
            if (range.getEarliestTimeTerms()) {
                linkContext["earliest"] = range.getEarliestTimeTerms();
            }
            if (range.getLatestTimeTerms()) {
                linkContext["latest"] = range.getLatestTimeTerms();
            }
            if (range.isAllTime()) {
                linkContext["earliest"] = 0;
            }
        }
        
        return linkContext;
    },

    /*
     * Check if ViewRedirector module is specified and return its popup state
     */
    _viewRedirectorPopupState: function() {
        for(var i=0; i<this._children.length; i++) {
            if(this._children[i].moduleType == 'Splunk.Module.ViewRedirector') {
                return Splunk.util.normalizeBoolean(this._children[i]._params['popup']);
            }
        }
        return false;
    }, 
    
    /*
     * Redirects to the link in same or new window depending on whether ctrl is pressed
     */
    _redirectToUrl: function(link, click) {
        if (!link || link.length==0) {
            return;
        }
        var openInPopup = click.modifierKey || this._viewRedirectorPopupState() || false;
        if (openInPopup) {
            window.open(link, '_blank');
        } else {
            window.document.location = link;
        }
    },
    
    /*
     * Main function. Gets context, finds proper link, inflates it and redirects.
     */
    pushContextToChildren: function($super, explicitContext) {
        // read context
        var context = this.getContext();
        var click = context.getAll('click');
        var linkContext = this._getLinkContext(context);
        
        // determine which link to use and replace tokens with values
        var link = null;              
        if (click.name2 in this.links) {
            link = this._inflateLink(this.links[click.name2], linkContext);
        } else if ('*' in this.links) {
            link = this._inflateLink(this.links['*'], linkContext);
        } else {
            // can't drill here
            return;
        }
        
        this._redirectToUrl(link, click);
    }
});
