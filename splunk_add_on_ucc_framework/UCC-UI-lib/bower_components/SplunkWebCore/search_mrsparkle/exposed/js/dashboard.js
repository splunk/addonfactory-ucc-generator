//we listen to the jobResurrected event (triggered in Splunk.Search.resurrect())
//and because it passes the containing group title of the module resurrecting the job, 
//we are able to map the job.getCreateTime() values into 'last refreshed:' header for each panel.

Splunk.DashboardManager = $.klass({
    dateDict : {},
    NOW_REFRESHED_TIME : _("<b>real-time</b>"),
    TODAY_REFRESHED_TIME : _("today at %(timeText)s."),
    GENERIC_REFRESHED_TIME : _("<b>%(dateText)s ago</b>"),
    FULL_REFRESHED_TIME : _("refreshed: %(dateText)s"),
    DISPLAY_REFLOW_EVENT: 'Splunk.Events.REDRAW',
    PANEL_DROP_EVENT: 'Splunk.Events.PANEL_DROP',
    windowWidth: $(window).width(),
//  windowHeight: $(window).height(),

    initialize: function() {
        // handlers to keep the last refreshed headers updated.
        $(document).bind('jobResurrected', this.onJobExists.bind(this));
        $(document).bind('jobDispatched',  this.onJobExists.bind(this));
        $(document).bind('jobProgress',    this.onJobProgress.bind(this));

        var that = this;

        // setup the headers to auto-truncate long titles
        this.titleHeaders = $('.layoutCell .splHeader h2');
        this.handlePanelResize();

        var timeoutID = null;

        $(window).bind('resize', function() {
            if ( $(window).width() != that.windowWidth /*|| $(window).height() != that.windowHeight*/ ) {
                that.windowWidth = $(window).width();
//              that.windowHeight = $(window).height();

                if ( timeoutID )
                    window.clearTimeout(that.timeoutID);

                timeoutID = window.setTimeout(function(){
                    $(window).trigger("real_resize");
                }, 100);
            }
        });

        $(window).bind('real_resize', this.handlePanelResize.bind(this));
//      $(document).bind('Splunk.Events.REDRAW', this.handlePanelResize.bind(this));
        $(document).bind('allModulesLoaded', this.handlePanelResize.bind(this));
        $(document).bind('jobDone', function(){
            if(!this.editMode) {
                setTimeout(this.equalizeHeights, 500);
            }
        }.bind(this));

        // custom event fired by chart modules when they are resized manually by the user
        $(document).bind('ChartManualResize', this.handlePanelResize.bind(this));

        $(document).bind('RefreshPage', this.softRefresh.bind(this));
//      $(window).bind('resize', function(){DebugUtils.trace("window.resize invoked")});
//      $(window).bind('real_resize', function(){DebugUtils.trace("window.real_resize invoked")});
//      $(document).bind('Splunk.Events.REDRAW', function(){DebugUtils.trace("Splunk.Events.REDRAW invoked")});
//      $(document).bind('allModulesLoaded', function(){DebugUtils.trace("allModulesLoaded invoked")});
//      $(document).bind('jobDone', function(){DebugUtils.trace("jobDone invoked")});
//      $(document).bind('ChartManualResize', function(){DebugUtils.trace("ChartManualResize invoked")});


        $(document).bind('PrintStart', this.insertPageBreakers.bind(this));
        $(document).bind('PrintEnd', this.removePageBreakers.bind(this));

        this.searchIdToGroupNames = {};
        this.panelRowsSelector = 'div.layoutRow[class*="panel_row"]';
//      this.panelRowsSelector = 'div.layoutRow[class="panel_row*"]';
        this.$panelRows = $(this.panelRowsSelector);

        this.$isAwesomeBrowser = ! ($.browser.msie && $.browser.version < 9);

        // DebugUtils.trace( this.panelRowsSelector);
        
        //do equal heights
        this.equalizeHeights();

        var dragAndDropEnabled = false;
        if ( Splunk.ViewConfig && ! ($.browser.msie && $.browser.version == 6) && 0 == $(".FlashWrapperContainer").length ) {
            dragAndDropEnabled = (Splunk.ViewConfig.view.nativeObjectMode == "SimpleDashboard") && Splunk.ViewConfig.view.canWrite && ! Splunk.ViewConfig.view.hasRowGrouping;
        }
        
        this.editMode = false;
        $(document).bind('Splunk.Module.DashboardTitleBar.editMode', function(event, enabled){
            var $paneledit = $('.paneledit');

            if (enabled) {
                $paneledit.show();
                if(dragAndDropEnabled) {
                    that.dragAndDropControllerInit();
                    that.editMode = true;
                }
            } else {
                $paneledit.hide();
                if(dragAndDropEnabled) {
                    that.dragAndDropControllerDestroy();
                    that.editMode = false;
                }
            }
        }.bind(this));

        that.panelEditInit();

        //setup panel editor and focus model
        this.messenger = Splunk.Messenger.System.getInstance();
    },

    /**
     * Reloads the existing page preserving old search jobs if they are present via the
     * fragment identifier.
     * 
     * @param {String} excludeGimpId (Optional) An optional gimpId to exclude form the soft-refresh (forces job refresh)
     */
    softRefresh: function(excludeGimpId) {
        var frag = {}; //Splunk.util.queryStringToProp(Splunk.util.getHash());
        var gimps = $('.Gimp');
        for (var i = 0; i < gimps.length; i++) {
            var gimpId = gimps[i].id;
            if (gimpId==excludeGimpId) {
                continue;
            }
            var gimpModule = Splunk.Globals['ModuleLoader'].getModuleInstanceById(gimpId);
            var search = gimpModule.getContext().get("search");

            if (!search || !search.job) continue;

            var sid = search.job.getSearchId();

            if (!sid) continue;

            var meta = gimpModule.container.closest('.dashboardCell').find('.paneledit').attr("data-sequence");
            frag['panel_' + meta + ".sid"] = sid;
            search.job.setAsAutoCancellable(false);
        }

        frag['edit'] = 1;
        window.location.hash = Splunk.util.propToQueryString(frag);
        window.location.reload();
    },

    // iterate on all the panels besides the one clicked on, and remove the menu.
    // since this is a draggable object, the events are not propagating to the top and document.click is never triggered.
    // we could manually trigger a dummy event, or a doc.click event, besides IE is garbage and it is throwing a weird error when we do so.
    menusGC: function(orig){
        var that = this;
        $('.paneledit').each(function(){
            if (this != orig){
                that.hideMenu(this.actionsMenu);
            }
        });
    },
    
    hideMenu: function(menu){
        if (menu) {
            menu.getMenu().remove();
            menu = null;
        }
    },
    
    panelEditInit: function() {
        var that = this;
        
        $('.paneledit').click(function(event) {
            
            that.menusGC(this);
            
            // since events are not being propagated, we have to manually hide our menu item if it is in a visible mode.
            if (this.actionsMenu && this.actionsMenu.getMenu().is(':visible')) {
                that.hideMenu(this.actionsMenu);
                event.stopImmediatePropagation();
                return false; 
            }
            
            // remove the previous menu, since our id could have been changed.
            that.hideMenu(this.actionsMenu);
            
            var meta = $(this);//.parent();

            var sequence = meta.attr('data-sequence');
            var intersectX = meta.attr('data-intersect-x');
            var intersectY = meta.attr('data-intersect-y');
            var dashboardId = meta.attr('data-dashboard-id');
            var app = meta.attr('data-app');
            var panelType = meta.attr('data-paneltype');
            var id = $($('.Gimp')[sequence]).attr('id');

            var gimpModule = Splunk.Globals['ModuleLoader'].getModuleInstanceById(id);
            //shallow object of k/v pairs adapted for panel editor
            var panelSettings = gimpModule.getPanelSettings(panelType, 'options.');


            panelSettings.id = dashboardId;
            panelSettings.panelType = panelType; 
            panelSettings.enable_fragment_id = 0;
            panelSettings.enable_controls = 1;



            //search meta data
            var context = null, search = null, job = null;
            context = gimpModule.getContext();
            if (context) search = context.get('search');
            if (search) job = search.job;

            if (!job || job.areResultsTransformed())
                panelSettings.is_transforming = true;
            else
                panelSettings.is_transforming = false;

            //set the href to the panel editor 
            var editVisualizationHref = Splunk.util.make_url('paneleditor', app, 'edit', intersectX, intersectY)+ '?' + Splunk.util.propToQueryString(panelSettings);



            var menuDict = [
                {
                    label: _("Edit search"),
                    uri: Splunk.util.make_url('paneleditor', app, 'searchedit', intersectX, intersectY) + '?id=' + encodeURIComponent(dashboardId),
                    callback: function(event) {
                        $(document).trigger('SessionTimeout.Jobber');
                        that.showExpose(id);
                        var options = {
                                onBeforeDestroy: function() {
                                    //restart the jobber
                                    $(document).trigger('SessionStart.Jobber');
                                    $(".dashboardCellEditable").removeClass("dashboardCellActive");
                                    that.hideExpose();
                                },
                                onFrameLoad: function(popup, iframe) {
                                    $(document).bind('panelsave', function() {
                                        popup.destroyPopup();
                                        that.softRefresh(id);
                                    });
                                },
                                isModal: false,
                                pclass: 'panelEditorPopup'
                        };
                        Splunk.Popup.IFramer(event.target.href, _("Edit search"), options);
                        return false;
                    }
                },
                {
                    label: _("Edit visualization"),
                    uri: editVisualizationHref,
                    callback: function(event) {
                        $(document).trigger('SessionTimeout.Jobber');
                        //panel meta found on <a data-*=""/>
                        //gimp module lookup
                        var id = $($('.Gimp')[sequence]).attr('id');
                        that.showExpose(id);
                        var options = {
                                onBeforeDestroy: function() {
                                    //restart the jobber
                                    $(document).trigger('SessionStart.Jobber');
                                    $(".dashboardCellEditable").removeClass("dashboardCellActive");
                                    that.hideExpose();
                                },
                                onFrameLoad: function(popup, iframe) {
                                    $(document).bind('panelsave', function() {
                                        popup.destroyPopup();
                                        that.softRefresh(id);
                                    });
                                },
                                isModal: false,
                                pclass: 'panelEditorPopup'
                        };
                        Splunk.Popup.IFramer(event.target.href, _("Edit visualization"), options);
                        return false;
                    }
                },
                {
                    label: _("Delete"),
                    uri: '',
                    callback: function(event) {
                        that.showExpose(id);
                        setTimeout(function(){
                            var deletePanel = confirm(_('Are you sure you would like to delete this panel?'));
                            that.hideExpose();
                            if (deletePanel) {
                                var url = Splunk.util.make_url('paneleditor', app, 'delete', intersectX, intersectY)+ '?' + Splunk.util.propToQueryString({id: dashboardId});
                                $.ajax({
                                    url: url,
                                    type: 'POST',
                                    timeout: 10000,
                                    complete: function(jqXHR, textStatus) {
                                        if (jqXHR.status==204) {
                                            //delete node beacuse we are going to reset sequence
                                            meta.closest('.layoutCell').remove();
                                            that.resetSequence();
                                            that.softRefresh(id);
                                        } else {
                                            alert(_('Sorry, the specified panel could not be deleted.'));
                                        }
                                    }
                                });
                            }
                        }, 600);
                        return false;
                    }
                }
            ];
            this.actionsMenu = new Splunk.MenuBuilder({
                menuDict: menuDict,
                activator: (that.$isAwesomeBrowser ? meta : meta.parent()),
                menuClasses: 'splMenu-primary'
            });
            this.actionsMenu.showMenu();
            return false;
        });
    },

    panelRowsAddOverlayLayers: function(doBind) {

        var that = this;
        that.isDNDEditMode = doBind;

        if(doBind) {
            $(window).unbind("real_resize", doAddOverlays);
            $(window).bind("real_resize", doAddOverlays);
            doAddOverlays();
        }


        function doAddOverlays(e) {

            if ( ! that.isDNDEditMode ) {
                return ;
            }

            var start = DebugUtils.getCurrfentTime();

            var mySelection = $(that.panelRowsSelector);
            mySelection.find(".vmPanelDropPlaceholderOverlay").remove();

            // reset z-index since IE is dumb.
            if ( ! that.$isAwesomeBrowser ) {
                mySelection.children().css({"z-index": "1"});
            }

            mySelection.find(".layoutCellInner").each(function(){
                var overlayNode = $(document.createElement("div")).addClass("layoutCellInner vmPanelDropPlaceholderOverlay");
                $(this).after(overlayNode);
                var ieThingy = 25; 

                var height = ($(this).parent().height());
                if( ! that.$isAwesomeBrowser )
                    height -= ieThingy;

                height += "px";

                var top = that.$isAwesomeBrowser ? "0" : ieThingy+"px";
                bindAttributes(overlayNode, ($(this).parent().width() - 15) + "px", height, top);


                if ( ! that.$isAwesomeBrowser ) {
                    overlayNode = $(document.createElement("div")).addClass("layoutCellInner vmPanelDropPlaceholderOverlay");
                    $(this).after(overlayNode);
                    bindAttributes(overlayNode, ($(this).parent().width() - 100) + "px", ieThingy + "px", 0);
                }
            });


            function bindAttributes(element, width, height, top) {
                element.css({
                    'width': width,
                    'height': height,
                    'z-index': 2,
//                  'background-color': 'red',
                    'top': top
                }).bind({
                    mouseover: function(){
                    	var selection = $(this).parent().children().first();
                    	selection.find(".dashboardContent, .splHeader").css("opacity", "0.6");
                    },
                    mouseout: function(){
                        that.dragAndDropMouseOut($(this).parent().children().first());
                    }
                });
            }

            DebugUtils.trace( "doAddOverlays", start) ;

        }

    },
    
    dragAndDropMouseOut: function (selection) {
    	if (selection) {
    		selection.find(".dashboardContent, .splHeader").css("opacity", "1.0");
    	}
    	else {
    		 this.dragAndDropMouseOut($(this.panelRowsSelector).find('.layoutCellInner'));
    	}
    },

    dragAndDropControllerInit: function() {

        var that = this;

        var maxHeight = 250;
        var newRowHeight = 20;

        var sortableParameters = {
                connectWith: that.panelRowsSelector,
                placeholder: 'vmPanelDropPlaceholder',
                opacity: 0.7,
                tolerance: 'pointer',
                cursor: 'move',
                delay: 100,
                cursorAt: { top: (maxHeight / 2) },
                handle: '.vmPanelDropPlaceholderOverlay'
        };
		
		//help IE get out of class early
		if(! this.$isAwesomeBrowser){			
			sortableParameters.helper = function(){
				return $('<div style="border:4px dashed #cccccc;"></div>');
			};
			sortableParameters.opacity = 1;
		}

		$('.splLastRefreshed').hide();
		
        $(that.panelRowsSelector).fadeOut('fast', function(){$(this).fadeIn('fast');});


        // FIXME hide the "move panels" button
        // this should be removed from the template once the feature is stable
        $(".editmode > .splButton-tertiary.move").hide();


        _removeEmptyRows();

        // set max height
        var selector =  $(that.panelRowsSelector);

        selector.find(".layoutCell").css({"max-height": (maxHeight + "px")/*, "overflow": "hidden"*/});
        selector.find(".layoutCellInner").css({"min-height": "0", "max-height":  ((maxHeight - 10) + "px"), "overflow": "hidden"});
        selector.find(".dashboardContent").css({"max-height": ((maxHeight - 60) + "px"), "overflow": "hidden"});

        that.panelRowsAddOverlayLayers(true);

        _generateEmptyRows(false);

        that.changeChartFlow();

        /** END COMMANDS - METHODS START HERE */


        function _bindEvents() {

            var myRowSelection = $(that.panelRowsSelector);

            myRowSelection.unbind('sortstart');
            myRowSelection.unbind('sortactivate');
            myRowSelection.unbind('sortover');
            myRowSelection.unbind('sortstop');

            myRowSelection.bind( "sortstart", _sortableStart );
            myRowSelection.bind( "sortactivate", _sortableActivate );
            myRowSelection.bind( "sortover", _sortableOver );
            myRowSelection.bind( "sortstop", _sortableStop );
        }


        function _sortableStart(event, ui) {
            $('.vmPanelDropPlaceholder').css("height", Math.floor( $(ui.item).height() - 15) + 'px' ); //TODO: this seems hacky
            $('.vmPanelDropPlaceholder').css("width", Math.floor($(ui.item).width() - 25) + 'px');
        }

        function _sortableActivate(event, ui) {
//        	var start = DebugUtils.getCurrfentTime();
             
            if( ! (this === ui.item.parent()[0]) ) {
                if ( $(this).children().length > 2 ) {  // disable rows that has 3 panels - this is a UI constrain
                    $(this).sortable("disable");
                    _sortableRefresh();
                }
            }
            else if ( $(this).children().length == 2 ) { // for a single panel row - disable the insertion points above and below
                $(this).next().sortable("disable");//.css("background-color", "red");
                $(this).prev().sortable("disable");//.css("background-color", "green");
                _sortableRefresh();
            }

//           DebugUtils.trace( "_sortableActivate", start) ;

        }
        /**
         * handle sortable over target
         */
        function _sortableOver(event, ui) {
            // var start = DebugUtils.getCurrfentTime();

            that.equalizeWidths(event, ui);

            var numItems = $(this).children().length;
            if ( $(ui.sender).context === $(this).context )
                numItems--;

            var width = Math.floor(96 / numItems) + "%";
            $('.vmPanelDropPlaceholder').css("width",width);

            // attempt to set width of helper to width of placeholder
            //$(ui.helper).width($(ui.placeholder).width());
            
//          var height = Math.max($(this).height(), $(ui.item).height()) + "px";
//          // DebugUtils.trace( "_sortableOver", start) ;
        }

        function _sortableStop(event, ui) {
            var start = DebugUtils.getCurrfentTime();
            
            // on some rare cases you can drop the panel top a position where the mouse is not over it.
            // for these cases we would like to apply the mouseout styling ann all panels, just to play safe.
            that.dragAndDropMouseOut();
            
            
            // hide any visible menus
            that.menusGC();

            DebugUtils.trace("_sortableStop invoked") ;

            $(that.panelRowsSelector).sortable('destroy');

            _removeEmptyRows();

            that.equalizeWidths(event, ui, true);

            // save the state to the system
            _save();

            that.changeChartFlow();

            $(".vmPanelDropPlaceholderOverlay", $(that.panelRowsSelector)).remove();

            _generateEmptyRows(true);

            that.panelRowsAddOverlayLayers(true);
            
            // fire off the panel drop event, passing the dropped element as extra data
            $(document).trigger(that.PANEL_DROP_EVENT, {droppedElement: ui.item[0]});

            DebugUtils.trace( "_sortableStop end", start) ;
        }


        function _sortableInit( setParams ) {
            var start = DebugUtils.getCurrfentTime();
            var sortable;

            if (setParams )
                sortable = $(that.panelRowsSelector).sortable(sortableParameters);
            else 
                sortable = $(that.panelRowsSelector).sortable();


            sortable.disableSelection();

            _bindEvents();

            DebugUtils.trace( "_sortableInit ("+(setParams)+") ", start) ;
            return sortable;
        }

        function _sortableRefresh(setParams) {
            var start = DebugUtils.getCurrfentTime();
            var sortable = _sortableInit(setParams).sortable("refresh");
            DebugUtils.trace( "_sortableRefresh", start) ;
            return sortable;
        }


        function _generateEmptyRows(doRefresh) {

            var counter = 1;
            $(that.panelRowsSelector).each(function(){
                _addEmptyRow($(this), "before");
            });
            _addEmptyRow($(that.panelRowsSelector).last(), "after", 100);

            // XXX not sure what is causing this, but sometimes new rows are getting a 0 opacity.
            // This ugly woraround takes care of that.
            $(".layoutRow").fadeTo(0, 1);

            doRefresh ? _sortableRefresh(true) : _sortableInit(true);


            function _addEmptyRow(element, where, rowHeight) {
                var start = DebugUtils.getCurrfentTime();

                rowHeight = rowHeight ? rowHeight : newRowHeight;
                var newElement = $(document.createElement("div")).addClass("layoutRow equalHeightRow splClearfix panel_row1_col").css("min-height", rowHeight + "px");
                ( where == "after" ) ? element.after(newElement) : element.before(newElement);

                DebugUtils.trace( "_addEmptyRow", start) ;
            }
        }


        function _removeEmptyRows() {
            var start = DebugUtils.getCurrfentTime();

            $(that.panelRowsSelector).each(function(){
                if ( $(this).children().length == 0 )
                    $(this).remove();
            });

//          $(".vmPanelDropPlaceholderOverlay", $(that.panelRowsSelector)).css("opacity", "0.2").css("background-color", "white");
//          $(".layoutCellInner", $(that.panelRowsSelector)).parent().children().first().css("box-shadow", "0 0 5px #CCCCCC");

            DebugUtils.trace( "_removeEmptyRows", start) ;
        }




        function _save() {
//          var start = DebugUtils.getCurrfentTime();
            $.post(Splunk.util.make_url(['viewmaster', Splunk.util.getCurrentApp(), Splunk.ViewConfig.view.id].join('/')), {
                'action': 'edit',
                'view_json': JSON.stringify(_toJSON())
            }, 
            _onSaveCallback, 'json');

//          DebugUtils.trace( "_save", start)
            function _toJSON() {
                var output = {};
                output['new_panel_sequence'] = [];

                $(that.panelRowsSelector).each(function() {
                    var rowSet = [];
                    $('.paneledit', this).each(function() {
                        var s = parseInt($(this).attr('data-sequence'), 10);
                        if (!isNaN(s)) 
                            rowSet.push(s);
                    });
                    output['new_panel_sequence'].push(rowSet);
                });
                return output;
            }

            function _onSaveCallback(jsonObject){
                if (jsonObject.success) {
                    // reset the current indexing to future actions
                    that.resetSequence();
                }
                else {
                    for (var i=0,L=jsonObject.messages.length; i<L; i++) {
                        alert('dashboard failed in updating: ' + jsonObject.messages[i].message);
                    }
                }
            }

        }
    },

    resetSequence: function() {
        var sequence = 0;
        var x = 0;
        $(this.panelRowsSelector).each(function(){
            if ( $(this).children().length == 0 )
                return ;

            var y = 0;
            $('.paneledit', this).each(function() {
                $(this).attr("data-sequence", sequence++);
                $(this).attr("data-intersect-y", y++);
                $(this).attr("data-intersect-x", x);
            });
            x++;
        });
    },
    /**
     * sets the width of panel row items based on number of children in the row
     * 
     * @param {object} event object
     * @param {object} ui jquery-ui object
     * @param {boolean} fullSize set full width if true
     */
    equalizeWidths: function (event, ui, fullSize) {

        var start = DebugUtils.getCurrfentTime();

        $(this.panelRowsSelector).each(function(index, value){

            var children = $(this).children();

            var numPanels = children.length;
            if ( event && ($(ui.sender).context === $(this).context) )
                numPanels--;

            if (numPanels == 0) return; // no work to do, exit

            fullSize = (!event || fullSize);

            var width = (Math.floor((fullSize ? 100 : 96) / numPanels)) + "%";

            children.css("width", width);

            //XXX terrible hack
            if (fullSize && numPanels == 3)
                children.last().css("width", "34%");

            // other javascript routines depend on the class name matching the number of columns in the row,
            // so update these here to avoid an inconsistent state
            if(numPanels == 1) {
                $(this).removeClass('twoColRow threeColRow').addClass('oneColRow');
            }
            else if(numPanels == 2) {
                $(this).removeClass('oneColRow threeColRow').addClass('twoColRow');
            }
            else if(numPanels == 3) {
                $(this).removeClass('oneColRow twoColRow').addClass('threeColRow');
            }

            $(".vmPanelDropPlaceholderOverlay", children).each(function(){
                $(this).css("width", $(this).parent().children().first().width() + "px");
            });
        });

        DebugUtils.trace( "equalizeWidths", start) ;

//      this.equalizeHeights();

        this.changeChartFlow();


    },

    changeChartFlow: function() {
        if ( true || this.$isAwesomeBrowser ) {
            var start = DebugUtils.getCurrfentTime();
            $(document).trigger(this.DISPLAY_REFLOW_EVENT);
            DebugUtils.trace( "DISPLAY_REFLOW_EVENT", start) ;
        }
    },


    dragAndDropControllerDestroy: function() {
        var theSelection = $(this.panelRowsSelector);
        theSelection.fadeOut('fast', function(){$(this).fadeIn('fast');});

        try {
            theSelection.sortable('destroy');
        }
        catch (e) {}

        // reset visualization
        $(".vmPanelDropPlaceholderOverlay").remove();
		
		$('.splLastRefreshed').show();

        // reset max height
        theSelection.find(".layoutCell").css({"max-height": "none", "overflow": "none"});
        theSelection.find(".layoutCellInner").css({"max-height":  "none", "overflow": "none"});
        theSelection.find(".dashboardContent").css({"max-height": "none", "overflow": "none"});

        theSelection.each(function(){
            var children = $(this).children();
            var width = (Math.floor(100 / children.length)) + "%";
            children.css("width", width);
            if ( $(this).children().length == 0 )
                $(this).remove();
        });
        this.equalizeWidths();
        this.equalizeHeights();
        this.panelRowsAddOverlayLayers(false);

        this.changeChartFlow();
    }, 

    /**
     * Enable the expose around a targeted panel.
     *
     * @param {String} id The id attribute for the targeted Gimp module.
     */
    showExpose: function(id) {
        //panel module lookup
        var that = this;
        var gimpModule = Splunk.Globals['ModuleLoader'].getModuleInstanceById(id);
        var moduleContentEl = $($(gimpModule.container).attr('s:parentmodule'));
        if (!moduleContentEl.hasClass("JSChart")) {
            moduleContentEl = $(moduleContentEl).children()[0];
        }
        var content = $(moduleContentEl).closest('.SplunkModule');
        content.addClass('dashboardVisActive');
        content.addClass('dashboardCellExpose');
        content.expose({
            color: '#000',
            closeOnClick: false,
            opacity: 0.5,
            loadSpeed: 0,
            closeSpeed: 0,
            onLoad: function(e) {
                $('.splIcon-close').click(function(){
                    that.hideExpose();
                });
            },
            onClose: function(e) {
                content.removeClass('dashboardCellExpose');
            }
        });
        content.expose().load();       
    },

    /**
     * Disable the expose around any targeted panel if present'
     */ 
    hideExpose: function() {
        $.mask.close();
        $(".dashboardVisActive").removeClass("dashboardVisActive"); 
    },

    /**
     * Initialize the drag'n'drop behavior.
     */
    dragndropInit: function() {
        var that = this;
        this.$panelRows.sortable({
            connectWith: this.panelRowsSelector,
            update: function(event, ui) {
                var rows = [];
                that.isMoving = false;
                that.$panelRows.each(function() {
                    var row = [];
                    $('.move a', this).each(function() {
                        row.push(parseInt($(this).attr('data-sequence'), 10));
                    });
                    if (row.length) {
                        rows.push(row);
                    }
                });
                that.save(rows);
            }
        }).disableSelection();
    },

    /**
     * Save the new layout to the server.
     *
     * @param {Array} rows An array of arrays providing the new sequence structure (ie., [[0,2],[1]]).
     */
    save: function(rows) {
        var params = {
                url: Splunk.util.make_url('/paneleditor/'),
                type: 'POST',
                timeout: 50000,
                data: JSON.stringify(rows),
                contentType: 'application/json',
                complete: function(response) {
                    //if (response.status!=200) {
                    //alert(_('Error:\nYour panel changes could not be saved.'));
                    //}
                }
        };
        $.ajax(params);
    },

    /**
     * for the given group (aka panel title), we return a date object with the timestamp of the oldest job it contains.
     */
    getEarliestCreateTimeForGroup: function(group) {
        var earliest = null;
        for (var i=0,l=this.dateDict[group].length; i<l; i++) {
            if (!earliest) {
                earliest = this.dateDict[group][i]; 
                continue;
            }
            if (this.dateDict[group][i] < earliest) {
                earliest = this.dateDict[group][i];
            }
        }
        return earliest;
    },

    /** 
     * By proactively linking these two together on jobDispatched 
     * and jobResurrected, we preserve the linkage for the 
     * times like jobProgress when we have no direct linkage.
     */
    linkSearchIdToGroup: function(job, group) {
        var sid = job.getSearchId();
        if (this.searchIdToGroupNames.hasOwnProperty(sid)) {
            this.searchIdToGroupNames[sid].push(group);
        } else {
            this.searchIdToGroupNames[sid] = [group];
        }
    },

    /**
     * given an sid, this method returns an array of matching group names.   
     * Specifically returns the header string(s) of panels that contain modules
     * that are currently using the given job.
     * (Assumes: on corresponding jobDispatched / jobResurrected event previously
     *  triggered, we will have stored the link between job and group)  
     */ 
    getGroupNamesForSearchId: function(sid) {
        if (this.searchIdToGroupNames.hasOwnProperty(sid)) {
            return $.extend([], this.searchIdToGroupNames[sid]);
        }
        return [];
    },

    /**
     * updates the 'last refreshed' time for the correct panel, 
     * as identified by the 'group' argument.
     * NOTE: the method name uses the generic word 'exists' because this 
     * is a listener for both jobDispatched and jobResurrected events.  
     * All jobs enter the world triggering one of those two events. 
     */
    onJobExists: function(event, job, group) {
        this.linkSearchIdToGroup(job, group);
        //new job was dispatched, lets clear the old data.
        this.dateDict[group] = [];
        this.updateRefreshedTimeForGroup(event, job, group);
    },

    /**
     * If the job in question is a real time search, 
     * then we call updateRefreshedTimeForGroup.
     */
    onJobProgress: function(event, job) {
        var group = this.getGroupNamesForSearchId(job.getSearchId());
        if (job.isRealTimeSearch()) {
            this.updateRefreshedTimeForGroup(event, job, group);
        }
    },

    /**
     * uses the given job object and group string to update the corresponding 
     * panel header's 'last refreshed' date and time. 
     */
    updateRefreshedTimeForGroup: function(event, job, group) {
        // DebugUtils.trace("updateRefreshedTimeForGroup group=" + group + " sid=" + job.getSearchId());

        if (!group) return;
        // NOTE: if a panel contains either all real-time searches or a 
        // mixture of real time and historical searches, the last refreshed 
        // time will always display the MOST RECENT of the real time searches.
        if (job.isRealTimeSearch()) {
            var now = new Date();
            // resistance is futile. 
            this.dateDict[group] = [now];
            this.setLastRefreshedHeaderText(group, this.NOW_REFRESHED_TIME);

            // NOTE: on the other hand if a panel contains only historical searches, 
            // the last refreshed time will always display the OLDEST of the historical searches that were run.
        } else if (job.getCreateTime()) {
            // 1 We keep a list of all of the times received per group.
            if (!this.dateDict.hasOwnProperty(group)) {
                this.dateDict[group] = [];
            }
            this.dateDict[group].push(job.getCreateTime());

            // 2 we get the earliest one for this group.
            var earliest = this.getEarliestCreateTimeForGroup(group);

            var diff = Math.max((new Date().getTime() - earliest.getTime()) / 1000, 0);

            // 3 get the correct localized string. 
            var dateText;
            if (diff === 0)  {
                // this is to account for dashboards that render in 0 milliseconds, to the precision of the Date object
                dateText = '1s';
            } else if (diff < 60)  {
                dateText = '&lt; 1m';
            } else if (diff < 3600) {
                dateText = Math.ceil(diff / 60) + 'm';
            } else if (diff < 86400) {
                dateText = Math.ceil(diff / 3600) + 'h';
            } else {
                dateText = Math.ceil(diff / 86400) + 'd';
            }
            this.setLastRefreshedHeaderText(group, dateText, format_time(earliest, "medium"));

            //refresh the timer every minuet for this panel
            this.intSet = this.intSet || [];
            var that = this;
            if(!this.intSet[job.getSearchId()]){
                setInterval(function(){
                    that.updateRefreshedTimeForGroup(event, job, group);
                },60000);
                that.intSet[job.getSearchId()] = true;
            }
        }
    },
    setLastRefreshedHeaderText: function(group, shortDateText, longDateText) {
        var lastRefreshedSpan = $("<span>");
        lastRefreshedSpan.addClass("splLastRefreshed");
        lastRefreshedSpan.attr("title", sprintf(this.FULL_REFRESHED_TIME, {dateText: longDateText}));
        if (shortDateText === this.NOW_REFRESHED_TIME) {
            lastRefreshedSpan.html(sprintf(this.NOW_REFRESHED_TIME));
        } else {
            lastRefreshedSpan.html(sprintf(this.GENERIC_REFRESHED_TIME, {dateText: shortDateText}));
        }

        // 4 go find the correct panel title
        $('h2[title="' + group + '"]').closest('.layoutCell').find('.meta').attr('title', group);
        $('.meta[title="' + group + '"]').find("span.splLastRefreshed").remove();
        $('.meta[title="' + group + '"]').prepend(lastRefreshedSpan);
    },
    /**
     * Auto truncates the panel headers based on available width
     */
    handlePanelResize: function() {
        this.titleHeaders.each(function() {
            // without this check it has the neat effect of nuking the contents of all $(".splHeader h2")
            // including those in modules like ResultsHeader.
            if ($(this).attr('title')) {
                // this is just a trial and error calculation; could be smarter
                var charWidth = parseInt(Math.pow($(this).parent().width() / 12 - 15, 1.15), 10);
                //$(this).text(Splunk.util.smartTrim($(this).attr('title'), charWidth));
            }
        });
        // set equal heights in view mode only
        if(!this.editMode) {
            this.equalizeHeights();
        }
    },

    /**
     * This method catches the case where the user is looking at a new simple
     * dashboard that has no panels, and displays an accelerator link
     */
    showDashboardPrompts: function() {
        var view_config = Splunk.util.getCurrentViewConfig();
        if (view_config.hasOwnProperty('view') && view_config['view']['objectMode'] != 'SimpleDashboard') {
            return false;
        }
        var panelCount = $('.dashboardCell').length;
        if (panelCount == 0) {
            var link = $( _('<p class="dashboardPromptMessage">This dashboard is empty. <a href="#">Edit the dashboard</a> to add a panel.</p>')).bind('click', function() {
                Splunk.Globals.Viewmaster.openDashEditForm(Splunk.util.getCurrentView());
                return false;
            }).appendTo($('.layoutRow.firstRow'));
        }
    },
    /**
     * This method equalizes heights of dashboard cells within the same panel
     */
    equalizeHeights: function() {
        var start = DebugUtils.getCurrfentTime();
        $(".equalHeightRow").each(function(){
            $(this).find('.layoutCellInner').css({'min-height': 0}); 
            if ($.browser.msie && $.browser.version == 6.0) { 
                $(this).children().css({'height': 0}); 
            }
            var max = 0;
            $(this).find('.layoutCellInner').each(function(i){
                if ($(this).height() > max) { max = $(this).height(); }
            });
            if ($.browser.msie && $.browser.version == 6.0) { $(this).find('.layoutCellInner').css({'height': max}); }
            $(this).find('.layoutCellInner').css({'min-height': max}); 
        });
        DebugUtils.trace( "equalizeHeights", start) ;
    },

    /**
     * This method traverses the dashboard rows from top to bottom, whenever it finds one that will have a page break
     * in the middle of it, inserts a page-breaking element above it
     */
    insertPageBreakers: function() {
        // IE9 and IE10 can handle page breaking purely in CSS
        if($.browser.msie && parseFloat($.browser.version) >= 9) {
            return;
        }
        var $row, rowHeight,
        currentHeight = 0,
        $pageBreaker = $('<div class="page-breaker"></div>'),
        pageBreakHeight = ($.browser.msie) ? 800 : 900; // pixel height to use when breaking up the page

        $('.equalHeightRow').each(function(i, row) {
            $row = $(row);
            // caclulate the row height, force to zero for empty elements, since some browsers will report a non-zero height
            rowHeight = ($row.is(':empty')) ? 0 : $row.outerHeight(true); // true means include margin
            if(i != 0 && rowHeight > 0 && currentHeight + rowHeight >= pageBreakHeight) {
                // this element needs a page break before it
                $pageBreaker.clone().insertBefore($row);
                currentHeight = rowHeight;
            }
            else {
                currentHeight += rowHeight;
            }
        });
    },

    removePageBreakers: function() {
        if($.browser.msie && parseFloat($.browser.version) >= 9) {
            return;
        }
        $('.page-breaker').remove();
    }

});

var DebugUtils = {

        traceEnabled: false,

        getCurrfentTime: function() {
            if(this.traceEnabled)
                return (new Date()).getTime();
        },
        trace: function(arg, start) {
            if( this.traceEnabled && window.console) {
                var now = this.getCurrfentTime();
                arg = this._addSpaces(arg, 30);
                if (start) 
                    arg += ["\t", (now - start)].join('');
                console.log([now, "\t", arg].join(''));
            }
        },
        _addSpaces: function(str, len) {
            var newStr = str;
            while(newStr.length < len)
                newStr += " ";

            return newStr;
        }
};





