Splunk.Module.LinkList = $.klass(Splunk.Module.DispatchingModule, {

    SORT_BY:  'labelField',
    SORT_DIR: 'asc',

    initialize: function($super, container) {
        this.logger    = Splunk.Logger.getLogger("link_list.js");
        $super(container);

        
        this._params['outputMode'] = this._params['outputMode'] || 'li';

        // Sorting dir and key get set separately just be cause they change
        // frequently and are not really representative of the values in the
        // _params dictionary.
        this.sortBy = this._params['initialSort'] || this._params[this.SORT_BY];
        this.sortDir = this._params['initialSortDir'] || this.SORT_DIR;

        this.initSortControls();
    },
    onBeforeJobDispatched: function(search) {
        // link lists need at least one status bucket or else they'll have no fields at all.
        search.setMinimumStatusBuckets(1);
    },

    getResultURL: function(params) {
        var context = this.getContext();
        var search  = context.get("search");
        uri = Splunk.util.make_url('lists/jobs', search.job.getSearchId(), 'results');
        if (params) uri += '?' + jQuery.param(params);
        return uri;
    },

    getResultParams: function() {
        var context = this.getContext();
        var params = {
            output_mode: this._params['outputMode'],
            fields: [],
            sort_key: this.sortBy,
            sort_dir: this.sortDir,
            count:  context.get('results.count'),
            offset: context.get('results.offset')
        };

        if (this._params['labelField']) params['fields'].push({'label': this._params['labelField']});
        if (this._params['valueField']) params['fields'].push({'label': this._params['valueField']});

        for (var i=0, j=params['fields'].length; i<j; i++) {
            params['fields'][i] = JSON.stringify(params['fields'][i]);
        }
        return params;
    },

    getResultsErrorHandler: function(xhr, msg, e) {
        if (xhr.status == 404) {
            // Handle either having a Search object or accessing a listObject from a listClass
            var message = '';
            if (this.baseContext) {
                message = sprintf(_('Link List cannot find the search.'));
            } else {
                message = sprintf(_('Link List cannot find the list object "%(listObject)s" for the list class "%(listClass)s".'), this._params);
            }
            this.resultsContainer.html(message);
        }
    },

    onJobDone: function() {
        this.getResults();
    },

    onContextChange: function() {
        if (!this.isPageLoadComplete() || this.haveResultParamsChanged()) { 
            this.getResults();
        }
    },

    renderResults: function(results) {
        $('div.LinkList.list', this.container).html(results);
        this.toggleSortBy();
        this.applyLinks();
    },

    

    /**
     * Apply links
     */
    applyLinks: function() {
        var selector = '.LinkList.list li';

        // Add label links
        // If labelFieldSearch is available => sends a new search to a specific target.
        if (this._params['labelFieldSearch'] && this._params['labelFieldTarget']) {
            var evens = selector + ' span:even';
            $(evens, this.container).wrapInner('<a href="#"></a>');
            $(evens, this.container).click(function(event) {
                this.sendSearchToView(event, 'label');
            }.bind(this));
        }

        // Add value links
        if (this._params['valueFieldSearch'] && this._params['valueFieldTarget']) {
            var odds = selector + ' span:odd';
            $(odds, this.container).wrapInner('<a href="#"></a>');
            $(odds, this.container).click(function(event) {
                this.sendSearchToView(event, 'value');
            }.bind(this));
        }

    },

    sendSearchToView: function(event, field) {
        var target = event.target;
        if (target.tagName.toUpperCase() == 'A') {
            var context = this.getContext();
            var search  = context.get("search");
            search.abandonJob();
            search.setBaseSearch(this._params[field + 'FieldSearch']);
            var intention = {
                "name": "addterm",
                "arg": {}
            };
            intention['arg'][this._params[field + 'Field']] = $(target).text().replace(/(\r\n|\n|\r)/gm,"");
            search.addIntention(intention);
            search.sendToView(this._params[field + 'FieldTarget']);
            event.preventDefault();
        }
        return false;
    },

    /**
     * Sorting behavior
     */
    toggleSortBy: function() {
        if ($('div.LinkList li', this.container).length > 0) {
            $('div.LinkList.sortControls', this.container).show();
        } else {
            $('div.LinkList.sortControls', this.container).hide();
        }
    },

    initSortControls: function() {
        var module = this;
        function sortBy(dir, field) {
            module.sortDir = dir;
            module.sortBy = module._params[field];
            module.getResults();
        }

        var labelFieldSort = $('span.labelFieldSortDir', this.container);
        var valueFieldSort = $('span.valueFieldSortDir', this.container);

        // Setup the sort control labels
        if (this._params['labelField'] == this.sortBy) {
            labelFieldSort.html(' (' + this.sortDir + ')');
        } else if (this._params['valueField'] == this.sortBy) {
            valueFieldSort.html(' (' + this.sortDir + ')');
        }

        var sortLabelAsc = function() {
            sortBy('asc', 'labelField');
            valueFieldSort.html('');
            labelFieldSort.html(' (asc)');
        };

        var sortLabelDesc = function() {
            sortBy('desc', 'labelField');
            valueFieldSort.html('');
            labelFieldSort.html(' (desc)');
        };

        var sortValueAsc = function() {
            sortBy('asc', 'valueField');
            labelFieldSort.html('');
            valueFieldSort.html(' (asc)');
        };

        var sortValueDesc = function() {
            sortBy('desc', 'valueField');
            labelFieldSort.html('');
            valueFieldSort.html(' (desc)');
        };

        // Setup the toggle functions in the right order given the initial settings
        if (this.sortBy == this._params['labelField'] && this.sortDir == 'asc') {
            $('div.LinkList.sortControls a.labelFieldSort', this.container).toggle(sortLabelDesc, sortLabelAsc);
        } else {
            $('div.LinkList.sortControls a.labelFieldSort', this.container).toggle(sortLabelAsc, sortLabelDesc);
        }

        if (this.sortBy == this._params['valueField'] && this.sortDir == 'asc') {
            $('div.LinkList.sortControls a.valueFieldSort', this.container).toggle(sortValueDesc, sortValueAsc);
        } else {
            $('div.LinkList.sortControls a.valueFieldSort', this.container).toggle(sortValueAsc, sortValueDesc);
        }
    }
});

