Splunk.Module.JobManager = $.klass(Splunk.Module, {
       
    PAUSE_CLASS: "pause",
    UNPAUSE_CLASS: "unpause",
    FINALIZE_CLASS: "finalize",
    CANCEL_CLASS: "cancel",
    SAVE_CLASS: "save",

    PAUSE_ACTION: "pause",
    UNPAUSE_ACTION: "unpause",
    FINALIZE_ACTION: "finalize",
    CANCEL_ACTION: "cancel",
    SAVE_ACTION: "save",

    /**
     * Endpoint to POST to and create batch changes in jobs
     */
    BATCH_EDIT_ENDPOINT: Splunk.util.make_url('api/search/jobs/control'),
    
    initialize: function($super, container) {
        $super(container);
        this.childEnforcement = Splunk.Module.NEVER_ALLOW;


        // And he said "You shall call this window splunk_job_manager." and it was good.
        // Allows the job link in AccountBar to target the right window if someone opens JobManager directly.
        if (window.name == '') window.name = 'splunk_job_manager';

        this.logger = Splunk.Logger.getLogger("job_manager.js");
        this.messenger = Splunk.Messenger.System.getInstance();
        
        /**
         * Internal reference to the job management's X-Splunk-List-Length
         * header that reports the total number of jobs.
         * Maintaining an internal length allows us to reduce the # or calls
         * we need to make to the pagination endpoint.
         */
        this.length = 0;
       
        /**
         * Stores a reference to the paginator's callback, allowing the job manager
         * to update the pagination when its internal settings change.
         */ 
        this.totalCountCallback = null;

        /**
         * Stores an internal map of which rows have been checked.
         */
        this._checkedMap = {};

        /**
         * Setup the behavior on table;
         */
        this._setupEventHandlers();
        this._buildTableHeaderSorting();
        
        /**
         * Setup layout engine
         */
        this._setupLayoutEngine();

        /**
         * Set the label parameter for retrieving jobs related to a saved search.
         * This is pretty sketchy but was required.
         */
        var search = Splunk.util.queryStringToProp(window.location.search.substring(1));
        if (search['savedSearch']) this.setParam('label', search['savedSearch']);

        // $(document).one('allModulesInHierarchy', function() {this.getResults()}.bind(this));
    },

    /**
     * Get an ancestor Count module if any exist.  This is to allow Job Manager
     * to toggle visibility of the Count module correctly.  See SPL-21956.
     */
    toggleCountModules: function(action) {
        jQuery.each(
            jQuery.map(this.getAncestors(), function(module) {
                if (module.moduleType == 'Splunk.Module.Count') return module;
            }),
            function() {
                this[action]();
            }
        );
    },

    /**
     * Handles all the internal pagination updates and finally updates the table.
     */    
    onContextChange: function() {
        var context = this.getContext();
        var owner = context.get(this.getParam('ownerSetting'));
        if (owner) this.setParam('user', owner);
        
        var namespace = context.get(this.getParam('namespaceSetting'));
        if (namespace) this.setParam('app', namespace);
        
        var jobStatus = context.get(this.getParam('jobStatusSetting'));
        if (jobStatus) this.setParam('jobStatus', jobStatus);

        this.getResults();
    },
    
    /**
     * Generates the parameters used to sort and filter the job listing.
     * Settings in the config file overwrite those in the defaults.
     * @returns Object
     */
    getResultParams: function() {
        var params = {
            'count': this.getParam('count'),
            'offset': this.getParam('offset'),
            'sortKey': this.getParam('sortKey'),
            'sortDir': this.getParam('sortDir'),
            'search': ''
        };
        
        var jobStatus = this.getParam('jobStatus');
        if (jobStatus) params['jobStatus'] = jobStatus;
        
        var user = this.getParam('user');
        if (user) params['user'] = user;
        
        var app = this.getParam('app');
        if (app) params['app'] = app;
        
        var label = this.getParam('label');
        if (label) params['label'] = label;

        var context = this.getContext();
        var namespace = "results";
        for (var name in params) {
            if (context.has(namespace + "." + name)) {
                params[name] = context.get(namespace + "." + name);
            }
        }
        return params;
    },
    
    /**
     * Implemented to handle updating the paginator.
     */ 
    getResultsCompleteHandler: function(xhr) {
        var length = xhr.getResponseHeader('X-Splunk-List-Length');
        var context = this.getContext();

        var callback = context.get("results.totalCountCallback");

        if (this.totalCountCallback == null && typeof callback == 'function') {
            this.totalCountCallback = callback;
        }
        if (length && this.length != length && this.totalCountCallback) {
            this.length = length;
            this.totalCountCallback(length);
        }
        
       var t = setTimeout(this._adjustLayout, 100); //make sure layout is correct after results load, ugly timeout hack is to allow for an order of operations issue with IE
       
    },

    /**
     * Custom getResults method to handle update vs refresh requests.
     */
    getResults: function(callback, sids) {
        if (Splunk._testHarnessMode) return false;
        
        var resultUrl = this.getResultURL();
        var params = this.getResultParams();
        
        if (!params.hasOwnProperty('app') || !params.hasOwnProperty('user')) {
            return;
        }

        if (sids)
            params['sid'] = sids;
            
        var callingModule = this.moduleType;
	
	var successEvent;
	if (callback){
            successEvent = callback.bind(this);
        }
        else{
            successEvent = this.replaceResults.bind(this);
	}
        
	$.ajax({
            type: "GET",
            url: resultUrl,
            data: params,
            beforeSend: function(xhr) {
                xhr.setRequestHeader('X-Splunk-Module', callingModule);
            },
            complete: this.getResultsCompleteHandler.bind(this),
            error: this.getResultsErrorHandler.bind(this),
	    success: successEvent
        });
   },
    
    _updateHTMLFragment: function(html) {
        html.filter('tr').each(this._addJobEventListener.bind(this));
        html.find('input[type=checkbox][name=sid]').each(function(i,elem) {
            if (elem.value in this._checkedMap) elem.checked = this._checkedMap[elem.value];
        }.bind(this));
    },
    
    updateResults: function(html) {
        html = $(html);
        this._updateHTMLFragment(html);
        html.filter('tr.parentRow').each(function(idx, elem) {
            elem = $(elem);
            var matchedRows = this.getJobRows(elem.attr('sid'));
            matchedRows.filter('tr.parentRow').unbind().replaceWith(elem);
        }.bind(this));
        html.filter('tr.childRow').each(function(idx, elem) {
            elem = $(elem);
            var matchedRows = this.getJobRows(elem.attr('sid'));
            matchedRows.filter('tr.childRow').unbind().replaceWith(elem);
        }.bind(this));
    },
    
    replaceResults: function(html) {
        $('h2.jobManagerStatus').hide();

        // Empty string or white space can't be parsed by jQuery
        if (html == '' || /^\s+$/.test(html)) { 
            return this.displayNoResultsFound();
        }

        try {
            html = $(html);
            if (html.length > 0) {
                this._updateHTMLFragment(html);
                $('table.jobManagerGrid tbody').html(html);
                $('table.jobManagerGrid').show();
                this.toggleCountModules('show');
                return;
            } else {
                return this.displayNoResultsFound();
            }
        // Assume a bad selector == zero length response
        } catch (e) {
            return this.displayNoResultsFound();
        }
    },

    /**
     * Hides the main grid of jobs,
     * shoots off a message to let the user know there is nothing to display.
     */
    displayNoResultsFound: function() {
        $('table.jobManagerGrid').hide();
        $('h2.jobManagerStatus.nojobs').show();
        this.toggleCountModules('hide');
    },

    /**
     * Return the array of sids based on checked checkboxes.
     * @returns Array
     */
    getCheckedSids: function() {
        var sids = [];
        $('table.jobManagerGrid input[name=sid]:checked').each(function() {
            sids.push(this.value);
        });
        return sids;
    },

    /**
     * Retrieve the rows currently in the table based on the job's sid.
     * @returns jQuery list object
     */
    getJobRows: function(sid) {
        return $("table.jobManagerGrid tr", this.container).filter(function(index) {
            return $(this).attr('sid') == sid;
        });
    },

    /**
     * Called either when an individual job is acted upon (canceled, paused, etc.)
     * or a group of jobs are acted upon.
     */
    _handleJobStatusChanged: function(event, sids, action) {
        sids = jQuery.makeArray(sids);
        switch(action) {
            case 'cancel':
                //TODO - seems very convoluted to keep offset and count persisted in the sticky/persistable param stuff,  
                var offset = this.getParam('offset');
                var count  = this.getParam('count');
                if (this.isLastPage() && ((this.length - sids.length) <= offset)) {
                    this.setParam('offset', (offset - count));
                }
                this.getResults();
                for(var i=0, j=sids.length; i<j; i++) {
                    if (this._checkedMap[sids[i]]) {
                        delete this._checkedMap[sids[i]];
                    }
                }
                break;
            case 'pause':
            case 'unpause':
            case 'finalize':
            case 'done':
            case 'save':
                this.getResults(this.updateResults, sids);
                break;
            default:
                break;
        }
    },

    isLastPage: function() {
        var length = this.length;
        var offset = this.getParam('offset');
        var count = this.getParam('count');
        return ((offset + count) >= length);
    },
    
    /**
     * Actually preforms the call to the batch job control endpoint.
     */
    _execControl: function(action, sid) {
        var module = this;
        var callback = function (resp) {
            var sids = [];
            var action = null;
            $.each(resp['data'], function(i, item) {
                if (item['response']) {
                    sids.push(item['sid']);
                    if (action == null) action = item['action'];
                }
            });
            module._handleJobStatusChanged(null, sids, action);
        };
        $.post(this.BATCH_EDIT_ENDPOINT, {action: action, sid: sid}, callback, 'json');
    },
    
    /**
     * Applies sorting behavior on the JobManager table.
     * **Using jQuery's native event binding (this == intended event target)
     * overcomes some ie6 compatibility issues, hence the reassociation of
     * this to module.
     */
    _buildTableHeaderSorting: function() {
        var module = this;
        $('table.jobManagerGrid th.sortable', this.container).click(function(event) {
            var elem = $(this);
            var abbr = elem.attr('abbr');
            if (!abbr) return;
            $('table.jobManagerGrid th.sortable[abbr='+module.getParam('sortKey')+']').find('span').removeClass('splSortAsc splSortDesc');
            module.setParam('sortKey', elem.attr('abbr'));
            if (module.getParam('sortDir') == 'desc') {
                module.setParam('sortDir', 'asc');
                elem.find('span').addClass('splSortAsc');
            }
            else {
                module.setParam('sortDir', 'desc');
                elem.find('span').addClass('splSortDesc');
            }
            module.getResults();
        });
    },
    
    /**
     * Attaches the various event handlers that handle the dynamic operations of the ui
     */
    _setupEventHandlers: function() {
        // Ensure the job rows are updated.
        $(document).bind('jobStatusChanged', this._handleJobStatusChanged.bind(this));
        $(document).bind('jobDone', function(event, job) {
            this._handleJobStatusChanged(event, job.getSID(), 'done');
        }.bind(this));

        
        // Batch edit button actions
        $('div.jmBatchActions button', this.container).click(function(event) {
            var elem = null;
            if ($.browser.msie) {
                elem = event.target;
            } else {
                elem = event.currentTarget;
            }
            elem = $(elem);

            if (elem.hasClass(this.PAUSE_CLASS)) {
                this._execControl(this.PAUSE_ACTION, this.getCheckedSids());
            }
            else if (elem.hasClass(this.UNPAUSE_CLASS)) {
                this._execControl(this.UNPAUSE_ACTION, this.getCheckedSids());
            }
            else if (elem.hasClass(this.FINALIZE_CLASS)) {
                this._execControl(this.FINALIZE_ACTION, this.getCheckedSids());
            }
            else if (elem.hasClass(this.CANCEL_CLASS)) {
                var sids = this.getCheckedSids();
                // if (sids.length > 0 && confirm(sprintf(_('Are you sure you want to delete %i job(s)?'), sids.length))) {
                if (sids.length > 0 && confirm(sprintf( ungettext('Are you sure you want to delete %i job?', 'Are you sure you want to delete %i jobs?', sids.length), sids.length))) {
                    this._execControl(this.CANCEL_ACTION, sids);
                }
            }
            else if (elem.hasClass(this.SAVE_CLASS)) {
                this._execControl(this.SAVE_ACTION, this.getCheckedSids());
            }
        }.bind(this));
        
        // Select one
        $('table.jobManagerGrid', this.container).click(function(event) {
            var elem = event.target;
            if (elem.tagName.toUpperCase() == 'INPUT' && elem.type.toUpperCase() == 'CHECKBOX') {
                this._mapInput(elem);
            }
        }.bind(this));
        
        // Select all
        var module = this;
        $('div.jmSelect a.selectAll', this.container).click(function(event) {
            $('table.jobManagerGrid tr.parentRow input').each(function() {
                this.checked = true;
                module._mapInput(this);
            });
        });
        $('div.jmSelect a.selectNone', this.container).click(function(event) {
            $('table.jobManagerGrid tr.parentRow input').each(function() {
                this.checked = false;
                module._mapInput(this);
            });
        });
        
        // fix SPL-43234 - for reload to work in IE 
        $('h2.jobManagerStatus.nojobs a').click(function(event) { 
            window.location.reload(); 
        });
    },

    /**
     * Function provided to a jQuery .each method.
     * Attaches the appropriate event triggers to each job row.
     */
    _addJobEventListener: function(idx, row) {
        var module = this;
        $(row).click(function(event) {
            var sid = $(row).attr('sid');
            if (!sid) return;

            var target = event.target;
            var tmpJob;
            if (target.tagName.toUpperCase() == "A") {
                target = $(target);
                if (target.hasClass('viewJob')) {
                    // Adding in a quick call to touch so that the job doesn't expire inbetween the user
                    // clicking the view link and the view opening.                    
                    tmpJob = new Splunk.Job('*');
                    tmpJob.setSearchId(sid);
                    tmpJob.touch();
                }
                else {

                    var errorHandler = function(xhr, type, error, action) {
                        if (xhr.status == 404) {
                            module.messenger.send('error', 'splunk.job_manager', sprintf(_('Splunk cannot %(action)s this job. It may have expired. Try refreshing this page.'), {'action': action}));
                        }
                        else {
                            module.messenger.send('error', 'splunk.job_manager', sprintf(_('Received unexpected error: %(error)s'), {'error': error}));
                        }
                    };

                    tmpJob = new Splunk.Job('*');
                    tmpJob.setSearchId(sid);

                    if (target.hasClass('cancelJob') && !target.hasClass('cancelJobDisabled')) {
                        tmpJob.cancel(null, function(xhr, type, error, action) {
                            if (xhr.status == 404) {
                                module.messenger.send('error', 'splunk.job_manager', _('Splunk cannot delete this job. It may have expired. Try refreshing this page.'));
                            }
                            else {
                                module.messenger.send('error', 'splunk.job_manager', sprintf(_('Received unexpected error: %(error)s'), {'error': error}));
                            }
                        });
                    }
                    else if(target.hasClass('finalizeJob') && !target.hasClass('finalizeJobDisabled')) {
                        tmpJob.finalize(null, errorHandler);
                    }
                    else if (target.hasClass('pauseJob') && !target.hasClass('pauseJobDisabled')) {
                        tmpJob.pause(null, errorHandler);
                    }
                    else if (target.hasClass('unpauseJob') && !target.hasClass('unpauseJobDisabled')) {
                        tmpJob._isPaused = true;
                        tmpJob.unpause(null, errorHandler);
                    }
                    else if (target.hasClass('saveJob')) {
                        tmpJob.save(null, errorHandler);
                    }
		    else if (target.hasClass('inspectJob')){
			Splunk.window.openJobInspector(sid);
			event.preventDefault();
			event.stopPropagation();
			return false;
		    }
                }
            }
            
            // Allow clicking on a row to check / uncheck the checkbox
            else if (target.tagName.toUpperCase() != 'INPUT'){
                var input = module.getJobRows(sid).find('input');
                if (input.prop('checked')) {
                    input.attr('checked', false);
                }
                else {
                    input.attr('checked', true);
                }
                module._mapInput(input[0]);
            }
        }).hover(function(){
            module._rowOver(this);
        }, function(){
            module._rowOut(this);
        });
         
        $(row).next('tr.childRow').hover(function(){
            module._rowOver(this);
        }, function() {
            module._rowOut(this);
        });
    },
    
    /**
     * Update the styles of the focused row.
     */
    _rowOver: function(orig) {
        if ( $(orig).hasClass('parentRow') ) {
            $(orig).addClass('jmRowHighlight')
                .next('tr.childRow').addClass('jmRowHighlight');
        } else if ( $(orig).hasClass('childRow') ) {
            $(orig).addClass('jmRowHighlight')
                .prev('tr.parentRow').addClass('jmRowHighlight');
        }
    },

    /**
     * Update the styles of the focused row.
     */
    _rowOut: function(orig) {
        if ( $(orig).hasClass('parentRow') ) {
            $(orig).removeClass('jmRowHighlight')
                .next('tr.childRow').removeClass('jmRowHighlight');
        } else if ( $(orig).hasClass('childRow') ) {
            $(orig).removeClass('jmRowHighlight')
                .prev('tr.parentRow').removeClass('jmRowHighlight');
        }
    },
    
    _mapInput: function(elem) {
        if (elem.checked) {
            this._checkedMap[elem.value] = elem.checked;
        }
        else {
            delete this._checkedMap[elem.value];
        }
    },
    /**
     *  Setup layout engine to create fixed header/footer and scrolling job data section SPL-23781
     */
    _setupLayoutEngine: function() {
        var module = this;
        
        // bind adjustment function to new message dispatch event
        $(document).bind('messageClear', this._adjustLayout);

        // bind adjustment function to message cleared event
        $(document).bind('messageUnshift', this._adjustLayout);
        
        // bind adjustment function to window resize
        $(window).resize(function(){
            module._adjustLayout();
        });
        
        //fire off first round of adjustment function to get everything squared up
        this._adjustLayout();
    },
    /* SPL-23781 requires an advanced layout engine.  This function tweaks the layout into shape */
    _adjustLayout: function(){
        // check height of jobs header and make sure results area is positioned with its top up jobsHeader's bottom        
        if ( $('.jobsHeader').height() != $('.jobManagerWrapper').position().top ) {
            $('.jobManagerWrapper').css('top',$('.jobsHeader').height());
        }
        
        // do more extensive layout for IE6
        if ( $.browser.msie && $.browser && $.browser.version == '6.0' ) {
            var h = $('body').height() - $('.jobsHeader').height() - 65;
            
            $('.jobManagerWrapper').height( h )
                .width($('body').width() - 20);
        }
    } 
});
