Splunk.Module.ViewstateAdapter = $.klass(Splunk.Module, {
    
    // define the sets of viewstate <-> settingsMap mapping to auto-import
    // from a viewstate set
    // the format is:
    //      {<module_name>: {<module_param_name>: <settings_map_key>}}
    //
    // NOTE: each module can have more than one param_name
    viewstateKeys: {
        'chart': {
            'AxisScaleFormatter':   {'default': 'charting.secondaryAxis.scale'},
            //'ChartTitleFormatter':  {'default': 'chartTitle'},
            'ChartTypeFormatter':   {'default': 'charting.chart'},
            'LegendFormatter':      {'default': 'charting.legend.placement'},
            'LineMarkerFormatter':  {'default': 'charting.chart.showMarkers'},
            'NullValueFormatter':   {'default': 'charting.chart.nullValueMode'},
            'StackModeFormatter':   {'default': 'charting.chart.stackMode'},
            'SplitModeFormatter':   {'default': 'charting.layout.splitSeries'},
            'XAxisTitleFormatter':  {'default': 'charting.primaryAxisTitle.text'},
            'YAxisRangeMinimumFormatter': {'default': 'charting.secondaryAxis.minimumNumber'},
            'YAxisRangeMaximumFormatter': {'default': 'charting.secondaryAxis.maximumNumber'},
            'YAxisTitleFormatter':  {'default': 'charting.secondaryAxisTitle.text'}
        },
        'table': {
            'Count':        {'count': 'results.count', 'default' : 'results.count'},
            'DataOverlay':  {'dataOverlayMode': 'results.dataOverlayMode', 'default' : 'results.dataOverlayMode'},
            'MaxLines':     {'maxLines': 'results.maxLines', 'default' : 'results.maxLines'},
            'RowNumbers':   {'displayRowNumbers': 'results.displayRowNumbers', 'default' : 'results.displayRowNumbers'},
            'Segmentation': {'segmentation': 'results.segmentation', 'default' : 'results.segmentation'},
            'SoftWrap':     {'enable': 'results.softWrap'}   // this is the only one now that doesnt have a default
        }
    },

    deprecationMap : {
        'Count':         {'count' : 'default'},
        'MaxLines':      {'maxLines' : 'default'},
        'RowNumbers':    {'displayRowNumbers' : 'default'},
        'Segmentation':  {'segmentation' : 'default'}
    },
    
    initialize: function($super, container) {
        $super(container);
        this.logger = Splunk.Logger.getLogger('ViewstateAdapter.js');
        this.hide(this.HIDDEN_MODULE_KEY);
    },
    
    
    getModifiedContext: function() {
        var context = this.getContext();
        if (!Splunk.Module.loadParams) {
            return context;
        }
        
        //var currentViewstateSet = this.getParam('viewstateSet');
        var currentViewstateSet = this.viewstateKeys['chart'];
        $.extend(currentViewstateSet, this.viewstateKeys['table']);
        
        
        var suppressionList = (this._params.suppressionList instanceof Array) ? this._params.suppressionList : [];

        //make a regular expression used for suffix matching (eg., charting.chart in charting.chart, count in results.count) 
        //used for testing against 'settings_map_key' in the viewStateKeys data structure (e.g., {<module_name>: {<module_param_name>: <settings_map_key>}}) 
        var re = "";
        for (var i=0; i<suppressionList.length; i++) {
            if (re) {
                re += "|";
            }
            //escape
            re += suppressionList[i].replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        }
        suppressRE = (re) ? new RegExp("(" + re + ")$", "") : null;
        
        // loop through all of the viewstate params in the current view and
        // pull out any that match the current viewstate set; automatically
        // inject those settings into the outgoing settingsMap.
        var x;
        var p = this.getParam('proxyParams');
        for (module in p) {
            if (p.hasOwnProperty(module)) {
                for (key in p[module]) {
                    if (p[module].hasOwnProperty(key)) {
                        if (currentViewstateSet.hasOwnProperty(module)
                            && currentViewstateSet[module].hasOwnProperty(key)) {
                                this.logger.debug('ViewstateAdapter - checking module=' + module + ' key=' + key + ' value=' + p[module][key]);
                                
                                var contextKey = currentViewstateSet[module][key];
                                var contextValue = p[module][key];
                                // if this module has a deprecated key,  and it's the key we're currently iterating on.
                                if (this.deprecationMap.hasOwnProperty(module) && this.deprecationMap[module].hasOwnProperty(key)) {
                                    // AND the config ALSO has the newer key,  then we ignore this old deprecated key.
                                    if (p[module].hasOwnProperty(this.deprecationMap[module][key]))  {
                                        continue;
                                    }
                                }
                                //if contextKey in suppression rules do not update the context.
                                if (suppressRE && suppressRE.test(contextKey)) {
                                    this.logger.info('Dropping addition of viewstate setting in context:', contextKey);
                                    continue;
                                }
                                context.set(contextKey, contextValue);
                        }
                    }
                }
            }
        }
        return context;
    }

});
