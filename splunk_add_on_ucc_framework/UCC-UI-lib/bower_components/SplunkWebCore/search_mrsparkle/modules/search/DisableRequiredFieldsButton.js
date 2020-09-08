Splunk.Module.DisableRequiredFieldsButton = $.klass(Splunk.Module.DispatchingModule, {
    

    initialize: function($super, container) {
        $super(container);
        this.logger = Splunk.Logger.getLogger("DisableRequiredFields.js");

        this.enableFieldDiscoveryControlsParam = Splunk.util.normalizeBoolean(this.getParam('enableFieldDiscoveryControls'));
        
        if (this.enableFieldDiscoveryControlsParam) {
            this.enableFieldDiscoveryControls();
        } else {
            this.disableFieldDiscoveryControls();
        }
        
        // setup hide link
        this.sb_hide = $('.splIconicLink', this.container);
        this._initEvents();
        this.checkStatusBuckets = false;
    },

    disableFieldDiscoveryControls: function() {
        $('.tooltip_content', this.container).hide();
        $('.fd_toggle_container', this.container).hide();
    },
    
    enableFieldDiscoveryControls: function() {
        // setup toggle button
        this.fd_checkbox = $('.fd_toggle_checkbox', this.container);
        
    
        // link up the label to the control
        this.fd_checkbox.attr('id', this.moduleId + 'checkbox');
        this.fd_label = $('.fd_toggle_label', this.container).attr('for', this.fd_checkbox.attr('id'));
    
        // setup tooltip
        $('.fd_toggle_container').tipTip({
            content: $('.tooltip_content', this.container).html(),
            defaultPosition: "bottom",
            delay: 300,
            fadeOut: 600,
            maxWidth: "175px",
            enter: function() {
                $(document).mousemove(function(e) {
                    if ($("#tiptip_holder").is(":hidden")) {
                        var pageY = e.pageY;
                        var pageX = e.pageX;
                        $("#tiptip_holder").css("marginTop", pageY+20+"px");
                        $("#tiptip_holder").css("marginLeft", pageX+"px");
                    }
                });
            }
        });
        
        if ($.browser.msie) {
            $('#tiptip_content').css('border-color', 'black');
        }
        
        var self = this;

        // sync toggle to curent state
        var enabled = Splunk.util.normalizeBoolean(this.getParam('enabled', true));
        this.fd_checkbox.attr('checked', enabled).change();
        
        // bind toggle change event
        this.fd_checkbox.bind('change', function() {
            if ($(this).is(':checked')) {
                setTimeout(self.enableFieldExtraction.bind(self), 10);
            } else {
                setTimeout(self.disableFieldExtraction.bind(self), 10);
            }
        });
    },

    _initEvents: function() {
        this.sb_hide.bind('click', function() {
            $('.sidebarControl a').click();
        });
        this.container.css('visibility', 'visible');
    },

    /**
     * update the module context to use FD on next invocation
     */
    enableFieldExtraction: function() {
        var context = this.getContext();
        var search = context.get('search');
        this.setParam('enabled', true);
        if (search && search.job && search.job.getSID() && !search.job.isDone()){
            this.getRootAncestor().pushContextToChildren();
        }
    },

    /**
     * update the module context to *not* use FD on next invocation
     */
    disableFieldExtraction: function() {
        var context = this.getContext();
        var search = context.get('search');
        this.setParam('enabled', false);
        if (search && search.job && search.job.getSID() && !search.job.isDone()){
            this.getRootAncestor().pushContextToChildren();
        }
    },

    /**
     * notify search context to be aware of current FD state
     */
    onBeforeJobDispatched: function(search) {
        if (this.enableFieldDiscoveryControlsParam) {
            if (!Splunk.util.normalizeBoolean(this.getParam('enabled'))) {
                this.logger.info('Disabling required fields');
                search._requiredFieldList = [];
                return;
            }
            this.logger.info('Enabling required fields');
        }
    },
    
    onContextChange: function() {
        this.checkStatusBuckets = true;
    },
    
    onJobProgress: function(event, status) {
        if (this.checkStatusBuckets) {
            var context = this.getContext();
            var search  = context.get("search");
            var sid = search.job.getSearchId();
            if (sid && (search.job.getStatusBuckets() < 1)) {
                //hide
                $(window).trigger('hidesidebar');
            } else {
                //show
                $(window).trigger('showsidebar');
            }
            this.checkStatusBuckets = false;
        }
    }

});

