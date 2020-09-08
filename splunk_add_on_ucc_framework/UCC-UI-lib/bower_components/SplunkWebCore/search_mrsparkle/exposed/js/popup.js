/* Popup building class
 *
 *   @param {Object} contents A jQuery element reference to the content to inject
 *   @param {Object} (Optional) options An optional object literal having non-required settings.
 *
 *    Usage:
 *       var popupHandle = new Splunk.Popup({ options array })
 *
 *    Options:
 *        title: (string) Title to display in the header bar of the popup (ex: 'My Popup')
 *        contents: (JQuery object or html) The contents of the popup.  (ex: $('.popupContainer')).  NOTE: if html is used, cloneFlag should be set to false
 *        pclass: (string) Class to apply to the popup, used mainly for styling (ex: 'popupClass')
 *        cloneFlag: (bool) Flag to tell popup whether to clone the passed contents into the popup (true) or move them.  This should generally only be left as true when
 *                          passing a reference to an existing element that you wish to leave untouched, for example a dom scaffolding you intend to reuse.
 *        buttons: (array/object lit) Array to define buttons and their handlers.
 *                 properties:
 *                    label: (string) button text to display (ex: 'Ok')
 *                    type: (string) type of button.  expected value is either 'primary' or 'secondary'
 *                    callback: (function) callback to fire on button click.  callback should return true to close popup, false to leave it open.
 *        inlineMode: setting this to true invokes 'minimally invasive' mode. see more explanation below
 *        isModal: (bool) Defaults to true. Controls if the dialog is modal (dark de-activated background) or a standard dialog.
 *        onBeforeDestroy: (Function) Callback for before the popup is removed from the DOM.
 *
 *    Methods:
 *        getPopup()
 *            desc: getter for a reference to the popup container
 *
 *        destroyPopup()
 *            desc: destroys popup
 *
 *
 *    Example usage:
 *       var popup = new Splunk.Popup($('.popupScaffolding'), {
 *           title : "My Popup",
 *           pclass : "myPopupClass",
 *           buttons : [
 *               {
 *                   label: 'Cancel',
 *                   type : 'secondary',
 *                   callback: function(){
 *                       return this.popupCancel();
 *                   }.bind(this)
 *               },
 *               {
 *                   label: 'Apply',
 *                   type : 'primary',
 *                   callback: function(){
 *                       return this.popupAccept();
 *                   }.bind(this)
 *               }
 *           ]
 *       });
 *
 *      Inline Mode :
 *              In inlineMode, Popup will provide no chrome whatsoever, the only services it provides are the modal transparent overlay,
 *              popup positioning and showing, and closing the popup.  If the dom element provided (popup) has any item with class="splIcon-close",
 *              Popup will attach a close handler to it, as well as the default binding to esc key presses.  destroyPopup simply hides the dom with display:none;
*/

Splunk.Popup = $.klass({

    // reference to DOM instance
    _popup: null,

    // indicates if popup is currently active
    isActive: false,

    initialize: function(contents, options) {
        this.logger = Splunk.Logger.getLogger("popup_manager.js");

        if ( !contents ) {
            this.logger.error('Splunk.Popup: No popup contents specified');
        }

        this.popupContents = contents;

        //defaults
        this._options = {
            title       : '',
            pclass      : false,
            cloneFlag   : true,
            buttons     : false,
            inlineMode  : false,
            onDestroy   : function() {},
            isModal     : true
        };

        // Set the options using the defaults
        if (options) $.extend(this._options, options);

        //check they passed a title and contents
        if ( !this._options['title'] ) {
            this.logger.warn('splunk.Popup: No popup title specified, leaving blank');
        }

        //create the overlay
        if ( this._options['isModal'] ) {
            this.createOverlay();
        }

        //create the popup
        if ( this._options['inlineMode'] ) {
            this._popup = this.popupContents;
        } else {
            this._popup = $('<div class="popupContainer"></div>')
                .append('<div class="splHeader splHeader-popup"><a href="javascript:void(0)" class="splIcon splIcon-close"></a><h2>' + this._options['title'] + '</h2></div>')
                .append('<div class="popupContent"></div>')
                .prependTo('body');

            //add class for styles if they specified one
            if ( this._options['pclass'] ) {
                this._popup.addClass( this._options['pclass'] );
            } else {
                this._popup.addClass('ieBugFixer'); //this fixes a crazy ie6 bug, noted and a better solution is being investigated
            }

            //set the contents
            this.setPopupContents(this.popupContents);

            //set up buttons
            if ( this._options['buttons'] ) {
                this._popup.append('<div class="popupFooter"></div>');
                this.setPopupButtons(this._options['buttons']);
            }
        }

        //position it
        this.positionPopup();

        //ok, show the damn thing
        $(this._popup).css({visibility:'visible',display:'block'});

        //fixes IE6 select box z-indexing issue... only occurs in the 'edit panel' popups
        if($.browser.msie && $.browser.version == '6.0'){
            $('.vmPanelContainer').bgIframe({top: -1, left: -1, width: 398});
        }

        //make the popup draggable
        if ( $(this._popup).children('.splHeader-popup').length ) {
            $(this._popup).draggable({
                handle: ".splHeader-popup h2",
                containment: 'document'
            });
        }

        // setup event handlers
        this._setupEventHandlers();

        // fire generic onPopupLoaded function
        // this.onPopupLoaded();

        // flag as active
        this.isActive = true;

        Splunk.Popup._globalPopupCount += 1;

        Splunk.util.focusFirstField(this._popup);
        
        if ( this._options['isModal'] ) {
            $(this._popup).trap();//SPL-48440 trap tabbing to popup only
         }

        return this._popup;
    },

    /* deprecated, leaving to warn legacy code */
    createPopup: function(popupParent, popupTitle, popupContents, handleOK, handleCancel, handleAccept) {
       this.logger.error('splunk.Popup: Function signature changed, please see /exposed/js/popup.js for details');
    },
    _setupEventHandlers: function(){
         // handle close button click
        $(this._popup).find('.splHeader .splIcon-close').click(function(){
            this.destroyPopup();
            return false;
        }.bind(this));

        // Create an escape key binding to close the popup
        $(document).bind('keydown.Popup', function(event) {
            if (event.keyCode == 27) {
                event.preventDefault();
                this.destroyPopup();
            }
        }.bind(this));
    },
    setPopupContents: function(popupContents){
            //this is terribly destructive, throws away what was in the popup if there is anything then pushes the new content in.  dangerous...
            $(this._popup).find('.popupContent').empty();

            var newContents = $(popupContents);

            if ( this._options['cloneFlag'] ) {
                //$('.popupContent', this._popup).append(newContents.clone(true));
                newContents = $(popupContents).clone(true).appendTo($(this._popup).find('.popupContent')).show();
            } else {
                //$('.popupContent', this._popup).append(newContents);
                newContents = $(popupContents).appendTo($(this._popup).find('.popupContent')).show();
            }

             //for IE, set the width explicitly
            if ( $.browser.msie ) {
                this.setPopupDimensions(newContents);
            }
    },
    setPopupButtons: function(buttons) {
        var popupInstance = this;

        $.each(buttons, function(i,button) {
            if ( button.hasOwnProperty('label') ) {
                buttonText = button.label;
            } else {
                buttonText = '';
            }
            if ( button.hasOwnProperty('type') ) {
                buttonType = button.type;
            } else {
                buttonType = 'primary';
            }
            if ( button.hasOwnProperty('callback') ) {
                buttonHandler = button.callback;
            } else {
                popupInstance.logger.warn('Splunk.Popup: Button has no callback defined');
                buttonHandler = function(){ return true; };
            }

            popupInstance.addButton(buttonText, buttonType, buttonHandler);
        });

    },
    addButton: function(buttonText, buttonType, buttonHandler) {
        buttonType = buttonType.toLowerCase();

        var newbutton = $('<button></button>')
            .addClass('splButton-' + buttonType)
            .append('<span>' + buttonText + '</span>')
            .appendTo($(this._popup).children('div.popupFooter'))
            .click(function(){
                if ( buttonHandler() ) {
                    this.destroyPopup();
                }
            }.bind(this));
    },
    createOverlay: function(popupParent) {
        if (Splunk.Popup._globalPopupCount > 0) return;
        $('<div class="splOverlay"></div>')
            .prependTo('body').show();

        // For FF2 mac only, there are at least two bugs with flash, opacity, and position:fixed items.  this fixes it by hiding the flash timeline.
       if ( $.browser.mozilla && $.browser.version.substr(0,3) < "1.9" ){
               $('.FlashWrapperContainer').css('z-index','-1');
        }

        if ( $.browser.msie && $.browser.version == '6.0' ) {
            var h, w;
            h = $('body').height();
            w = $('body').width();
            $('.splOverlay')
                .css({height: h, width: w})
                .bgIframe();
        }
    },
    destroyOverlay: function() {
        if (Splunk.Popup._globalPopupCount > 0) return;
        $('.splOverlay').remove();
    },
    setPopupDimensions: function(popupContents) {
        //var popupContentsHeight = $(popupContents).outerHeight();
        var popupContentWidth = $(popupContents).outerWidth();

        //var popupChromeHeight = parseInt($(this._popup).find('.splHeader-popup').outerHeight(),10) + parseInt($(this._popup).find('.popupFooter').outerHeight(),10);

        //var totalPopupHeight = parseInt(popupContentsHeight, 10) + parseInt(popupChromeHeight,10);

        //$(this._popup).css({width:popupContentWidth});
        $(this._popup).css({width:popupContentWidth});
    },
    positionPopup: function() {
        var posX, posY,
            height = this._popup.outerHeight(),
            width = this._popup.outerWidth(),
            wst, //window scroll top
            wsl, //window scroll left
            ww = $(window).width(),
            wh = $(window).height();

        //basic positioning top left if all else fails
        posX = 0;
        posY = 0;

        //check for any problems (window shorter than popup, etc.)

        //y-pos
        if ( $.fn.scrollTop )
        {
            wst = $(window).scrollTop();
            posY = wst; // start with popup at the top of the viewport
            if ( wh > height ) //verify window is taller than the popup
            {
                posY = (wh - height)/2 + wst;
            }
        }

        //x-pos
        if ( $.fn.scrollLeft )
        {
            wsl = $(window).scrollLeft();
            if ( ww > width )  //verify window is wider than the popup
            {
                posX = (ww - width)/2;
            }
        }

        //set the position
        this._popup.css({top:posY, left:posX});
    },
    onPopupLoaded: function() {
        if ( $('#runMe').length ) {
           /*jshint -W061:false */
           eval($('#runMe').text());
           /*jshint -W061:true */
        }
    },
    //getter for popup container
    getPopup: function() {
        return this._popup;
    },
    destroyPopup: function(){
        Splunk.Popup._globalPopupCount -= 1;
        
        if (this._options['onBeforeDestroy']) this._options['onBeforeDestroy'](this);
        
        if ( this._options['inlineMode'] ) {
            $(this._popup).hide();
        } else {
            $(this._popup).remove();
        }

        if ( this._options['isModal'] ) {
            this.destroyOverlay();
        }
        
        if ( $.browser.mozilla && $.browser.version.substr(0,3) < "1.9" ){
               $('.FlashWrapperContainer').css('z-index','auto');
        }

        this.isActive = false;

        //remove handlers
        $(document).unbind('keydown.Popup');

        // Fire the pseudo callback
        if (this._options['onDestroy']) this._options['onDestroy'](this);

    }
});

Splunk.Popup.createExportResultsForm = function(formContainer, job, type) {
    // another weird variable that we can pass in as a closure.
    // see comment in createSavedSearchForm.  This can be eliminated by
    // making the popup class pass the button callbacks an argument
    // thats a reference back to the container div of the popup contents.
    if(typeof type === 'undefined'){
        type = 'event';
    }

    var exportPopupHandle = null;
    var exportPopup = new Splunk.Popup(formContainer, {
        title: _('Export Results'),
        buttons: [
            {
                label: _('Cancel'),
                type: 'secondary',
                callback: function(){
                    return true;
                }
            },
            {
                label: _('Export'),
                type: 'primary',
                callback: function(){
                    // Export dialog functions
                    var limit = $(exportPopupHandle).find('[name="spl_ctrl-limit"]:checked').val();
                    if (limit == 'unlimited') {
                         $(exportPopupHandle).find('[name="count"]').val('0');
                    } else {
                        var countstr =  $(exportPopupHandle).find('[name="spl_ctrl-count"]').val();
                        var count =  parseInt(countstr, 10);
                        if (isNaN(count) || count<1 || countstr!=count) {
                            alert(_("Must export at least one result"));
                            return false;
                        }
                        $(exportPopupHandle).find('[name="count"]').val(count);
                    }
                    return $(exportPopupHandle).find(".exForm").submit();
                }
            }
        ]
    });
    exportPopupHandle = exportPopup.getPopup();
    var exportForm = $(exportPopupHandle).find(".exForm")[0];
    exportForm.action = Splunk.util.make_url('api/search/jobs/' + job.getSID() + '/'+ type);

    if(job.areResultsTransformed()){
        $("option[value='raw']", exportForm).remove();
    }
};


Splunk.Popup.createEventtypeForm = function(formContainer, title, search, tags) {
    options = {
        url: Splunk.util.make_url('manager', Splunk.util.getCurrentApp(), '/saved/eventtypes/_new?action=edit&noContainer=2&viewFilter=modal&eleOnly=1'),
        titlebar_class: 'TitleBareventtypePopup',
        setupPopup: function(EAIPopup) {
            if (search) {
                var searchStr = Splunk.util.stripLeadingSearchCommand(search.toString());
                $('form.entityEditForm textarea[name="search"]', EAIPopup.getPopup()).val(searchStr);
            }

            if (tags) {
                $('form.entityEditForm input[name="tags"]', EAIPopup.getPopup()).val(tags);
            }
        },
        beforeSaveForm: function(eai) {
            var name = $('form.entityEditForm input[name="name"]').val();
            eai.success_message = sprintf(_("Your eventtype '%(eventtypeName)s' was saved."), {eventtypeName: name});
        },
        onAjaxError: function() {
            var messenger = Splunk.Messenger.System.getInstance();
            messenger.send('error',
               'splunk.eventtype',
               _("Splunk encountered an error when it attempted to retrieve the eventtype form. Try again or contact an admin.")
            );
        }
    };
    return Splunk.Popup.createEAIForm(formContainer, title, options);
};

Splunk.Popup.createSavedSearchForm = function(formContainer, title, search) {
    options = {
        url: Splunk.util.make_url('manager', Splunk.util.getCurrentApp(), "/saved/searches"),
        titlebar_class: 'TitleBarSavedSearchPopup',
        setupPopup: function(EAIPopup) {
            if (search) {
                var searchStr = search.toString();
                var timeRange = search.getTimeRange();
                var earliestTime = timeRange.getEarliestTimeTerms();
                var latestTime = timeRange.getLatestTimeTerms();

                // pre-populate the search string if we were given one.
                if (searchStr) {
                    $('form.entityEditForm textarea[name="search"]').val(Splunk.util.stripLeadingSearchCommand(searchStr));
                }

                if (earliestTime) {
                    $('form.entityEditForm input[name="dispatch.earliest_time"]').val(earliestTime);
                }

                if (latestTime) {
                    $('form.entityEditForm input[name="dispatch.latest_time"]').val(latestTime);
                }
            }
            // Save the dispatching view
            $('form.entityEditForm input[name="displayview"]', EAIPopup.getPopup()).val(Splunk.util.getCurrentDisplayView());
            $('form.entityEditForm input[name="request.ui_dispatch_view"]', EAIPopup.getPopup()).val(Splunk.util.getCurrentDisplayView());
        },
        beforeSaveForm: function(eai) {
            // first write out the shared viewstate and get the viewstate id;
            // inject the ID into the EAI form
            var vs_id = Splunk.Globals.ModuleLoader.commitViewParams(null, true);
            var vs_input = $('form.entityEditForm input[name="vsid"]');
            if (!vs_input) {
                search.logger.error('handleSaveSubmit - Cannot find vsid element; viewstate will not be saved');
            } else {
                vs_input.val(vs_id);
            }
            // pull out the name the user gave it, cause we pass that as the argument
            // to the client's callback, which is called if the POST succeeds.
            var name = $('form.entityEditForm input[name="name"]').val();
            eai.success_message = sprintf(_("Your search '%(savedSearchName)s' was saved."), {savedSearchName: name}); // XXX
        },
        onAjaxError: function() {
            var messenger = Splunk.Messenger.System.getInstance();
            messenger.send('error',
                'splunk.savedsearches',
                _("Splunk encountered an error when it attempted to retrieve the save search form. Try again or contact an admin.")
            );
        }
    };

    return Splunk.Popup.createEAIForm(formContainer, title, options);
};


Splunk.Popup.createSchedulePDFForm = function(formContainer, title) {
	var pdfUrl,
        viewLabel;
    var getArgs = {};

    pdfUrl = Splunk.pdf.get_render_url_for_current_dashboard();

    getArgs["pdfPreviewUrl"] = pdfUrl;

    if (typeof Splunk !== "undefined" && 
        typeof Splunk.ViewConfig !== "undefined" && 
        typeof Splunk.ViewConfig.view !== "undefined" &&
        typeof Splunk.ViewConfig.view.label === "string" &&
        Splunk.ViewConfig.view.label.length > 0) {
        
        getArgs["viewLabel"] = Splunk.ViewConfig.view.label;
    }

	var scheduledViewsUrl = Splunk.util.make_full_url('scheduledview/' + Splunk.util.getCurrentApp() + '/' + Splunk.util.getCurrentView(), getArgs);

	return Splunk.Popup.IFramer(scheduledViewsUrl, _('Schedule PDF Delivery'), {'pclass':'schedulePdfPopup'});
};

Splunk.Popup.createUserOptionsForm = function(formContainer, title) {
    var options = {
        url: Splunk.util.make_url('manager', Splunk.util.getCurrentApp(), 'authentication', 'changepassword', 'admin', '?action=edit&noContainer=1&eleOnly=1'),
        titlebar_class: 'TitleBarSavedSearchPopup',
        beforeSaveForm: function(eai) {
            eai.success_message = _('Successfully changed user options');
        },
        onAjaxError: function() {
        }
    };

    return Splunk.Popup.createEAIForm(formContainer, title, options);
};

/**
* Generic handler for creating popups that display EAI forms
* see Splunk.Popup.createSavedSearchForm() etc for examples of using it
*/
Splunk.Popup.createEAIForm = function(formContainer, title, options) {

    // Prevent multiple popups
    if (Splunk.Popup.createEAIForm.opened) return;

    var logger = Splunk.Logger.getLogger("Splunk.Popup.createEAIForm");

    // We need to keep the html for the "Loading..." popup separate from the actual
    // form popup so that we never copy/clone the original form we get from the endpoint
    // to keep any data bound to tags by javascript in the form intact.
    var loadingContainer = $('<div></div').appendTo(formContainer);
    var loadedFormContainer = $('<div style="display:block"></div>').appendTo(formContainer);

    // Insure that the intermediate popup always says loading
    // This is a bit of a necessary hack... Right now EAI forms come with
    // some js that gets interpreted when the form is requested asynchronously.
    // By not resetting this html content, the form appears to be preloaded,
    // but may not be correctly rendered because the js that originally came
    // with it is not re-evaluated.
    //$(formContainer).html('<div class="popupLoading">Loading...</div>');
    $(loadingContainer).html('<div class="popupLoading">Loading...</div>');
    if ($.browser.msie) {
        $(loadingContainer).css({"overflow":"", "height":""});
    }

    // for now I have to define this var out here, cause it gets bound in closures
    // in our callbacks, and it does an evil snake-eating-own-tail thing.
    // TODO - it would be a lot nicer and I think quite sensible to rework the popup.js callbacks
    // so that they are given an argument that is a reference to the popup's form object.
    // after which the need for this messy closure would go away.

    // Create the popup just for now.
    var EAIPopup = new Splunk.Popup(loadingContainer, {
        title: title,
        pclass: options.titlebar_class,
        cloneFlag: false,
        onDestroy: function() {
            Splunk.Popup.createEAIForm.opened = false;
        }
    });

    // Hide the footer in the intermediary popup
    $('.popupFooter', EAIPopup.getPopup()).hide();

    var messenger = Splunk.Messenger.System.getInstance();

    // Cancel handler for the form
    var cancel = function(){ return true; };

    // Save button handler for the form
    var handleSaveSubmit = function() {
        var form = $('form.entityEditForm', EAIPopup.getPopup());
        var eai = Splunk.EAI.getInstance();
        eai.redirect = false;

        // Check that the form's submit handler gives the go ahead to submit the form
        //if (!handleEditFormSubmit(form[0]))
            //return false;

        if (options.beforeSaveForm)
            options.beforeSaveForm(eai);

        // Alert the user that their save is being processed
        $('div.popupFooter button.splButton-primary span', this._popup).text(_('Saving...'));
        $('div.popupFooter button.splButton-primary', this._popup).unbind('click').removeClass('primary').addClass('secondary');

        // submit the form and close the popup
        eai.saveForm(form,
            function() {
                // Success
                Splunk.Globals.ModuleLoader.refreshViewData();
                if(window.opener && !window.opener.closed){
                    try{
                        window.opener.Splunk.Globals.ModuleLoader.refreshViewData();
                    }catch(e){
                        logger.warn("Could not refresh view data for parent opener", e);
                    }
                }
                EAIPopup.destroyPopup();
            },
            function() {
                // Error; leave the popup on screen so the user can correct the problem
                // scroll to the top so they can see the error
                loadedFormContainer.scrollTop(0);

                $('div.popupFooter button.splButton-primary span', this._popup).text(_('Save'));
                $('div.popupFooter button.splButton-primary', this._popup).bind('click', handleSaveSubmit).removeClass('secondary').addClass('primary');
            }
        );
        return false;
    };

    // Sets the EAIPopup up correctly
    var setupPopup = function() {
        // Kill the "Loading..." popup
        if (EAIPopup) EAIPopup.destroyPopup();

        EAIPopup = new Splunk.Popup(loadedFormContainer, {
            title: title,
            pclass: options.titlebar_class,
            cloneFlag: false,
            onDestroy: function() {
                Splunk.Popup.createEAIForm.opened = false;
            },
            buttons: [
                {
                    label: _('Cancel'),
                    type: 'secondary',
                    callback: cancel
                },
                {
                    label: _('Save'),
                    type: 'primary',
                    callback: handleSaveSubmit
                }
            ]
        });

        // Set the focus to the first element in the form
        $('form.entityEditForm input[name="name"]', EAIPopup.getPopup()).focus();

        // We want error messages to stay inside the popup instead of going
        // to to the masked messenger at the top of the page
        Splunk.EAI.getInstance().use_messenger_on_error = false;

        if (options.setupPopup)
            options.setupPopup(EAIPopup);


        // TODO - this is probably good functionality across all popups,
        // catch form.onsubmit(which errant return-keypresses can trigger)
        // and bind it to the callback for the 'primary' action button
        // if there's only one, and return false on it, if there's more than one.
        // Override the onsubmit handler for the form as it will be triggered explictly by our handler
        $("form", loadedFormContainer).unbind('submit');
        $("form", loadedFormContainer).submit(handleSaveSubmit);
    };

    // Modal marked as opened
    Splunk.Popup.createEAIForm.opened = true;

    // Get the form from EAI
    $.ajax({
        url: options.url,
        dataType: 'html',
        error: function() {
            if (EAIPopup) {
                EAIPopup.destroyPopup();
                Splunk.Popup.createEAIForm.opened = false;
            }

            if (options.onAjaxError)
                options.onAjaxError();
        },

        success:function(resp, status) {
            // Javascript contained in the form is executed at this point
            if (options.prefix) {
                resp = options.prefix + resp;
            }
            if (options.suffix) {
                resp = resp + options.suffix;
            }
            $(loadedFormContainer).html(resp);

            /***************
             * Resizing the form element in THIS FORM'S CASE ONLY.
             * if we need this elsewhere, this logic should be pulled up into popup class itself.
             ***************/
            var safeHeight = $(window).height() - 200;
            if ($.browser.msie) {
                // overflow:scroll fixes a bug that could only be reproduced on IE8 on zhang's machine.
                $(loadedFormContainer).css("overflow", "scroll");
                if ((parseInt($.browser.version, 10) <7) ) {
                    $(loadedFormContainer).css("height", safeHeight + "px");
                } else {
                    $(loadedFormContainer).css("max-height", safeHeight + "px");
                }
            } else {
                $(loadedFormContainer).css("overflow", "auto");
                $(loadedFormContainer).css("max-height", safeHeight + "px");
            }

            // Initialize the actual popup
            setupPopup();
        }
    });
};

Splunk.Popup._globalPopupCount = 0;



Splunk.Popup.createShareLinkForm = function(formContainer, title, search) {
    var messenger = Splunk.Messenger.System.getInstance();

    // the callback to run if we successfully save the job.
    var onSaveSuccess = function() {

        var app = Splunk.util.getCurrentApp();
        var view = Splunk.util.getCurrentDisplayView();
        var args = {"sid" : search.job.getSearchId()};

        args["vs"] = Splunk.Globals.ModuleLoader.commitViewParams(null, true);


        url = [];
        url.push(document.location.protocol);
        url.push("//");
        url.push(document.location.host);
        url.push(Splunk.util.make_url("app", app, view));

        url.push("?" + Splunk.util.propToQueryString(args));

        //hack of the day.
        setTimeout(function(){
            $(".linkTextInput")
                .val(url.join(""))
                .focus(function() {this.select();})
                .focus();
        },0);


        // this is called both by the cancel button on the popup layer
        // as well as by the little blue 'undo save'  link in the text.
        var undoEverything = function(event) {
            var undoSaveSuccess = function() {
                search.logger.debug("results are now unsaved again.");
            };
            var undoSaveFailure = function() {
                messenger.send('error', 'splunk.search', _("Splunk encountered an error while trying to undo the saving of your results. Try again or contact an admin."));
            };
            search.job.unsave(undoSaveSuccess, undoSaveFailure);

            var undoACLSuccess = function() {
                search.logger.debug("results are now again marked as NOT world readable.");
            };
            var undoACLFailure = function() {
                messenger.send('error', 'splunk.search', _("Splunk encountered an error while trying to make your results not world-readable. Try again or contact an admin."));
            };
            search.job.undoWorldReadable(undoACLSuccess, undoACLFailure);
        };
        // workaround - if i attach the undoEverything handler AFTER creating the popup,
        // some cloning nonsense manages to remove it.
        // therefore i create a null reference, bind it, and only then fill it with a reference
        // to the Splunk.Popup instance.

        var linkPopup = null;
        $("a.undoEverything", formContainer).click(function() {
            undoEverything();
            linkPopup.destroyPopup();
        });

        linkPopup = new Splunk.Popup(formContainer, {
            title: title,
            buttons: [
                /*{
                    label: _('Undo'),
                    type: 'secondary',
                    callback: function(){
                        undoEverything();
                        return true;
                    }
                },*/
                {
                    label: _('Close'),
                    type: 'primary',
                    callback: function(){
                        return true;
                    }
                }
            ]
        });
    };
    var onSaveFailure = function(e) {
        messenger.send('error', 'splunk.search', _("Splunk encountered an error when it tried to save your results. It cannot generate a link. Try again or contact an admin.") + e);
    };
    search.job.save(onSaveSuccess, onSaveFailure);

    var onACLSuccess = function() {
        search.logger.debug("results are now marked as world readable.");
    };
    var onACLFailure = function() {
        messenger.send('error', 'splunk.search', _("Splunk encountered an error when it tried to make your results world-readable. Try again or contact an admin."));
    };
    search.job.makeWorldReadable(onACLSuccess, onACLFailure);
};
// This is unfortunate but until we have a popup manager
// or we internalize popup state in the popup class we'll
// have to manage open/closed states manually.
Splunk.Popup.createEAIForm.opened = false;
Splunk.Popup.createEventtypeForm.opened = false;

Splunk.Popup.createTagFieldForm = function(formContainer, title, fieldName, fieldValue, successCallback){
    var resource = Splunk.util.make_url("/tags/"+Splunk.util.getCurrentApp()+"/fields/"+encodeURIComponent(fieldName)+"/"+encodeURIComponent(fieldValue));
    var logger = Splunk.Logger.getLogger("Splunk.Popup.createTagFieldForm");
    $.ajax({
        type: "GET",
        url: resource,
        dataType: "html",
        async: false,
        error: function(){
            logger.error(sprintf(_("Could not load %(resource)s"), {resource: resource}));
        }.bind(this),
        complete: function(data, textStatus){
            var content = (data.status==200)?data.responseText:"Could not tag field";
            formContainer.html(content);
        }.bind(this)
    });
    var popup = new Splunk.Popup(formContainer, {
        title: title,
        buttons: [
            {
                label: _("Cancel"),
                type: 'secondary',
                callback: function(){ return true; }
            },
            {
                label: _("Ok"),
                type: 'primary',
                callback: function(){ return false; }
            }
        ]
    });
    $("input[name='add']", popup.getPopup()).focus();
    var ajaxFormOptions = {
        complete: function(xhr, statusText){
            if(statusText=="error"){
                alert(_("Your tag(s) could not be saved.\nOnly alphanumeric characters, underscores, hyphens and periods are allowed for tags."));
            }else{
                successCallback.apply(null, arguments);
                popup.destroyPopup();
            }
        }.bind(this),
        target: formContainer
    };
    var popupForm = $("form", popup.getPopup());
    popupForm.ajaxForm(ajaxFormOptions);
    $("input[name='add']", popup.getPopup()).keydown(function(event){
        if(event.keyCode==13){
            popupForm.submit();
        }
    });
    $("button.splButton-primary", popup.getPopup()).click(function(){popupForm.submit();});
};

/**
 * A simplified static interface for loading a wizard within a DHTML popup.
 * NOTE: jQuery is throwing exceptions on certain html elements, specifically the steps helper. Investigating.
 *
 * @param {String} path Fully qualified path of the wizard to load.
 * @param {String} title The vanity title to display in the popup.
 * @param {Object} options Optional constructor arguments:
 *        {Object} data (Optional) object literal of key/value pairs to add to the GET request (Does not require url encoding).
 *        {Function} onBeforeDestroy (Optional) callback handler for before the modal is destroyed (removed from the DOM).
 *        {String} pclass (Optional) A class attribute to be added to the root of the popup.
 *        {Bool} scrolling (Optional) toggles scrollbars in the popup
 *        {Function} onFrameLoad (Optional) callback handler for when the iframe loads. Passes popup instance and jQuery element reference to IFRAME contents arguments to callback.
 * @type Object
 * @return The Splunk.Popup object.
 */
Splunk.Popup.IFramer = function(path, title, options) {
    options = options || {};
    var isInit = true;
    var data = options.data || null;
    var scrolling = options.scrolling || false;
    var src;
    var popopOptions = {
        title: title
    };
    if(options.onBeforeDestroy){
        popopOptions.onBeforeDestroy = options.onBeforeDestroy;
    }
    if(options.pclass){
        popopOptions.pclass = options.pclass;
    }
    if("isModal" in options){
      popopOptions.isModal = options.isModal;
    }
    var iframe = $('<iframe/>');
    if(data){
        src = path + "?" + Splunk.util.propToQueryString(data);
    }else{
        src = path;
    }
    iframe.attr("src", "about:blank");//chrome needs a little rub to cleanse it's cache
    iframe.attr("scrolling", scrolling ? "yes" : "no");//ie6 likes scrollabars
    var popup = new Splunk.Popup(iframe, popopOptions);
    iframe = $("iframe", popup.getPopup());
    iframe[0].src = src;
    // laoding animation
    var $loading = $('<div class="popup-loading">Loading...</div>');
    $loading.css({'width':'100%','height':'100%','position':'absolute', 'top':'0','background-color':'#fff'});
    $('.popupContent').append($loading);

    /**
     * Handler for resize of iframe.
     * Note: to trigger this from inside and iframe you must use something like parent.$(parent.document).trigger('event');
     */
    var onResize = function(){
        //defer iframe height calculation to after draw complete
        setTimeout(function(){
            var iframeHeight = iframe.height();
            if (!iframe[0].contentDocument) {
                return;
            }
            var bodyHeight = iframe.contents().find("body").height(); // this var gets cached somehow in IE6 :(
            if(iframeHeight != bodyHeight){
                iframe.css("height", "auto");//requires a rub for redraw
                //iframe.css("height", iframe.contents().find("body").height());
                iframe.height(iframe.contents().find("body").height()); // css transition won't work unless we use height() instead of css()
            }
            if(isInit){
                $('.popup-loading').remove();
                popup.positionPopup();
                isInit = false;
            }
        }, 0);
    };
    //Move this logic out for more generic util.
    iframe.load(function(){//observer load of iframe
        var contents = iframe.contents();
        contents.find("body").find("div.splClearfix:last").hide();
        contents.find("form").css("display","block");
        //handle possible changes in the document (Note: onresize is not fired during the reflow of a page)
        onResize();
        //chrome does trigger click on select elements
        contents.find("select, input").bind("change", onResize);
        contents.find("body").bind("mouseup", onResize);
        contents.find("form.cancel").submit(function(){
            //jquery workaround
            setTimeout(function(){popup.destroyPopup();}, 0);
        });
        contents.find("a.cancel").click(function() {
            //jquery workaround
            setTimeout(function(){popup.destroyPopup();}, 0);
        });

        if (contents.find("div.ui-close-popup").length > 0) {
			// if the loaded page has a div with class ui-close-popup
			// then automatically close the popup
			setTimeout(function(){popup.destroyPopup();}, 0);        
        }

        contents.find("div.information input").click(function() {
            this.select();
        });
        if(options.onFrameLoad){
            options.onFrameLoad(popup, contents);
        }

        if(options.onDone && typeof options.onDone === 'function'){
            contents.find('a.ok').click(function(e){
                options.onDone.apply(this,[e]);
            });
        }
        
        contents.find('body').trap(); //SPL-48440 trap tabbing to popup only

    });
    return popup;
};

/**
 * A simplified static interface for launching wizard iframe'd DHTML-dialogs.
 *
 * @param {String} path The URI path to load in the dialog.
 * @param {String} title The title to display in the popup.
 * @param {Object} search See Splunk.Search object.
 * @param {Object} options See below:
 *                 @param {Boolean} enableDispatchTimes Will not pass dispatch times to workflow used in the
 *                                                       in the instantiation of searches. Defaults to true.
 * @type Object
 * @return The Splunk.Popup object.
 */
Splunk.Popup.WizardHelper = function(path, title, search, options) {
  $(document).trigger('SessionTimeout.Jobber');
  options = options || {};
  var onDone = options.onDone || false;
  var enableDispatchTimes = options.hasOwnProperty('enableDispatchTimes') ? options.enableDispatchTimes : true;
  var time = search.getTimeRange();
  var data = {
      'search': Splunk.util.stripLeadingSearchCommand(search.toString()),
      'ui.display_view': Splunk.util.getCurrentDisplayView(),
      'ui.dispatch_view': Splunk.util.getCurrentDisplayView()
  };
  if (enableDispatchTimes) {
      data['dispatch.latest_time'] = time.getLatestTimeTerms();
      data['dispatch.earliest_time'] = time.getEarliestTimeTerms();
  }
  var vsid = Splunk.Globals.ModuleLoader.commitViewParams(null, true);
  if (vsid) {
      data['ui.vsid'] = vsid;
  }
  /**
   * Handler pre-close state of popup and destroy the saved search if a cancel button exists.
   *
   * @param (Object} popup Some popup object reference.
   */
  var onBeforeDestroy = function(popup) {
      Splunk.Globals.ModuleLoader.refreshViewData();
      $(document).trigger('SessionStart.Jobber');
      var iframe = $("iframe", popup.getPopup());
      var cancel = iframe.contents().find("form.cancel");
      cancel.unbind();//remove bound submit handler to eliminate recursion error
      cancel.ajaxSubmit();//calling the actual dom element and invoking submit does not work on chrome
  };
  return Splunk.Popup.IFramer(path, title, {data: data, onBeforeDestroy: onBeforeDestroy, pclass: 'wizardPopup', onDone: onDone });
};

Splunk.Popup.SummarizationVerificationWizard = function(verifyLink, total_buckets, max_verify_time, max_verify_buckets, options) {
     options = options || {};
     var path = Splunk.util.make_url("/manager/system/summarization/verify/step1/new");
     var title = options.title || _("Verify Summary");

      var data = {};
      data['verifyLink'] = verifyLink;
      data['total_buckets'] = total_buckets;
      data['max_verify_time'] = max_verify_time;
      data['max_verify_buckets'] = max_verify_buckets;

   $(document).trigger('SessionTimeout.Jobber');
   options = options || {};
   var onDone = function(){window.location.reload();};

   var onBeforeDestroy = function(popup) {
       $(document).trigger('SessionStart.Jobber');
       var iframe = $("iframe", popup.getPopup());
       var cancel = iframe.contents().find("form.cancel");
       cancel.unbind();//remove bound submit handler to eliminate recursion error
       cancel.ajaxSubmit();//calling the actual dom element and invoking submit does not work on chrome
   };
  return Splunk.Popup.IFramer(path, title, {data: data, onBeforeDestroy: onBeforeDestroy, pclass: 'wizardPopup', onDone: onDone });
};


Splunk.Popup.SummarizationVerificationResultsPopup = function(isSuccess, result, options) {
     options = options || {};
     var path = Splunk.util.make_url("/manager/system/summarization/verify/showResults");
     var title = isSuccess ? _("Verification Success") : _("Verification Failed");

      var data = {};
      data['isSuccess'] = isSuccess;
      data['result'] = result;

   $(document).trigger('SessionTimeout.Jobber');
   options = options || {};
   var onDone = function(){};

   var onBeforeDestroy = function(popup) {
       $(document).trigger('SessionStart.Jobber');
       var iframe = $("iframe", popup.getPopup());
       var cancel = iframe.contents().find("form.cancel");
       cancel.unbind();//remove bound submit handler to eliminate recursion error
       cancel.ajaxSubmit();//calling the actual dom element and invoking submit does not work on chrome
   };
  return Splunk.Popup.IFramer(path, title, {data: data, onBeforeDestroy: onBeforeDestroy, pclass: 'wizardPopup', onDone: onDone });
};


Splunk.Popup.PeerDecomissionConfirm = function(peername, options) {
    options = options || {};
    var path = Splunk.util.make_url("/manager/system/clustering/master/confirmDecommission");
    var title = options.title || _("Decommission Peer");
 
    var data = {}; 
    data['peername'] = peername;

  $(document).trigger('SessionTimeout.Jobber');
  options = options || {};
  var onDone = function(){window.location.reload();};

  var onBeforeDestroy = function(popup) {
      $(document).trigger('SessionStart.Jobber');
      var iframe = $("iframe", popup.getPopup());
      var cancel = iframe.contents().find("form.cancel");
      cancel.unbind();//remove bound submit handler to eliminate recursion error
      cancel.ajaxSubmit();//calling the actual dom element and invoking submit does not work on chrome
  };
  return Splunk.Popup.IFramer(path, title, {data: data, onBeforeDestroy: onBeforeDestroy, pclass: 'wizardPopup', onDone: onDone });
}; 


/**
 * A simplified static interface for launching an alert wizard.
 *
 * @param {Object} search
 * @type Object
 * @return The Splunk.Popup object.
 */
Splunk.Popup.AlertWizard = function(search) {
    if (window.location.href.indexOf('mode=classic')!=-1){
        var path = Splunk.util.make_url("/alertswizard/" + encodeURIComponent(Splunk.util.getCurrentApp()) + "/step1/new");
        return Splunk.Popup.WizardHelper(path, _("Create Alert"), search);
    }
    return Splunk.Popup.AlertWizardV2(search);
};

/**
 * A simplified static interface for launching an alert wizard.
 *
 * @param {Object} search
 * @type Object
 * @return The Splunk.Popup object.
 */
Splunk.Popup.AlertWizardV2 = function(search) {
    var path = Splunk.util.make_url("/alertswizardv2/" + encodeURIComponent(Splunk.util.getCurrentApp()) + "/step1/new");
    return Splunk.Popup.WizardHelper(path, _("Create Alert"), search, {enableDispatchTimes: false});
};

/**
 * A simplified static interface for launching a schedule digest wizard.
 *
 * @param {Object} search
 * @type Object
 * @return The Splunk.Popup object.
 */
Splunk.Popup.ScheduleDigestWizard = function(search, options) {
    options = options || {};
    var path = Splunk.util.make_url("/scheduledigestwizard/" + encodeURIComponent(Splunk.util.getCurrentApp()) + "/step1/new");
    var title = options.title || _("Create Scheduled Report");
    return Splunk.Popup.WizardHelper(path, title, search);
};

/**
 * A simplified interface for launching a dashboard wizard.
 *
 * @param {Object} search
 * @param {Object} options See below:
 *                 {String} title The title to display, defaults to "Save Search" if not defined.
 * @type Object
 * @return The Splunk.Popup object.
 */
Splunk.Popup.DashboardWizard = function(search, options) {
    options = options || {};
    var path = Splunk.util.make_url("/dashboardwizard/" + encodeURIComponent(Splunk.util.getCurrentApp()) + "/step1/new");
    var title = options.title || _("Create Dashboard Panel");
    var popup = Splunk.Popup.WizardHelper(path, title, search);
    var iframe = $("iframe", popup.getPopup());
    //iframe.attr("search.is_events", search.job && !search.job.areResultsTransformed() ? "1" : "0");
    iframe.attr("panel_type", options.panel_type || "table");
    return popup;
};

/**
 * A simplified static interface for launching a save search wizard.
 *
 * @param {Object} search.
 * @param {Object} options See below:
 *                 {String} title The title to display, defaults to "Save Search" if not defined.
 * @type Object
 * @return The Splunk.Popup object.
 */
Splunk.Popup.SaveSearchWizard = function(search, options) {
    options = options || {};
    var path = Splunk.util.make_url("/savesearchwizard/" + encodeURIComponent(Splunk.util.getCurrentApp()) + "/new");
    var title = options.title || _("Save Search");
    return Splunk.Popup.WizardHelper(path, title, search, options);
};

/**
 * A simplified interface for launching an 'about' popup
 *
 * @param {Object} jQuery object pointing to the container to display

 * @type Object
 * @return The Splunk.Popup object.
 */
Splunk.Popup.AboutPopup = function(container) {
    // because minification can be on or off,
    if (container.css('display') == 'none') {
        return new Splunk.Popup(container, {
            title: _('About Splunk'),
            buttons: [
                {
                label: _('Done'),
                type: 'primary',
                callback: function(){
                    return true;
                }.bind(this)
                }
            ]
        });
    }
};

/**
 * A simplified interface for launching an 'TreeView' popup
 *
 * @param {Object} elTarget jQuery object pointing to the container to display the selection result
 * @param {String} title Popup window title
 * @param {Object} data (Optional) Object literal of key/value pairs to add to the POST request to /tree/data
 * @param {Object} style (Optional) css style

 * @type Object
 * @return The Splunk.Popup object.
 */
Splunk.Popup.TreePopup = function(elTarget, title, data, style) {
    data = data || {};
    style = style || 'wizardPopup';
    var path = Splunk.util.make_url("/tree");
    var popup = Splunk.Popup.IFramer(path, title, {data: data, pclass: style, isModal: true});
    var iframe = $("iframe", popup.getPopup());
    iframe.load(function() {
        iframe.contents().find(".splButton-secondary").click(function(){
            popup.destroyPopup();
        });
        $(this).contents().find('.splButton-primary').click(function() {
            $(elTarget).val(iframe.contents().find('span#selected').text());
            popup.destroyPopup();
        });
    });
    return popup;
};


/**
 * Static method to launch wall application.
 */
Splunk.Popup.Wall = function() {
    var path = Splunk.util.make_url("/wall/" + encodeURIComponent(Splunk.util.getCurrentApp()) + "/new");
    var onBeforeDestroy = function(popup) {
        Splunk.Messenger.System.getInstance().getServerMessages();
        var iframe = $("iframe", popup.getPopup());
        var cancel = iframe.contents().find("form.cancel");
        cancel.unbind();//remove bound submit handler to eliminate recursion error
        cancel.ajaxSubmit();//calling the actual dom element and invoking submit does not work on chrome
    };
    return Splunk.Popup.IFramer(path, _('Wall'), {data: {}, onBeforeDestroy: onBeforeDestroy, pclass: 'wizardPopup', isModal: false});
};

/**
 * Schedule pdf popup helper. This could be much more simplified via an iframe and a
 * classic MVC based work for this.
 *
 * @param {Object} $targetContainer A jquery object reference to a target container to inject the popup into.
 * @param {Function} error A handler for if retrieving pdf status details failed, passes back a single argument of the
 *                         error string.
 */
Splunk.Popup.SchedulePDF = function($targetContainer, error) {

	$targetContainer = $targetContainer.first();

	var params = {};
	params["viewId"] = Splunk.ViewConfig.view.id;
	params["namespace"] = Splunk.ViewConfig.app.id;
	params["owner"] = $C.USERNAME;


    if (Splunk.util.getConfigValue('PDFGEN_IS_AVAILABLE', true)) {
        displaySchedulePDFForm();
    }
    else {
        displaySchedulePDFUnavailable();
    }

    function displaySchedulePDFForm(pdfService) {
        Splunk.Popup.createSchedulePDFForm($targetContainer, _('Schedule for PDF Delivery'), pdfService);
    }
    
    function displaySchedulePDFUnavailable() {
    	Splunk.Popup.DisplayPDFUnavailable($targetContainer);
    }

};

Splunk.Popup.DisplayPDFUnavailable = function($targetContainer) {
	displayPDFUnavailable();

    function displayPDFUnavailable() {
        var msg;

		var linkToHelp = Splunk.util.make_full_url("help", {location:"learnmore.pdf.requirements"});
		msg = _("<p>PDF generation isn't supported on this platform. <a href=") + linkToHelp + _(">Learn more.</a></p>");
        $targetContainer.html(msg);
        var popup = new Splunk.Popup($targetContainer, {
            title: _('PDF Generation Not Supported'),
            buttons: [
                {
                    label: _('OK'),
                    type: 'primary'
                }
            ]
        });
    }
};
