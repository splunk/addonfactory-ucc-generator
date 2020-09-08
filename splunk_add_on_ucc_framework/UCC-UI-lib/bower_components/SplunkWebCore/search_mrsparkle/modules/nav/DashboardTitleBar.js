Splunk.namespace("Module");
Splunk.Module.DashboardTitleBar = $.klass(Splunk.Module.DispatchingModule, {
    initialize: function($super, container) {
        $super(container);
        this.logger = Splunk.Logger.getLogger("Splunk.Module.DashboardTitleBar");
        this.$viewMode = $('.viewmode', this.container);
        this.$editMode = $('.editmode', this.container);
        this.$rowgroupMessage = $(".message_rowgrouping", this.container);
        this.modeSelector = 'input[name="mode"]';
        var that = this;

        // disable the PDF related buttons until we know that pdf functionality
        // is available	
        $('.schedulepdf', this.container).addClass('splButton-disabled');
        $('.renderpdf', this.container).addClass('splButton-disabled');
        Splunk.pdf.is_pdf_available(function(pdfService) {
            $('.schedulepdf', this.container).removeClass('splButton-disabled');
            $('.schedulepdf', this.container).click(function() {
                Splunk.pdf.is_pdf_available(
                    function() {
                        Splunk.Popup.SchedulePDF($('.pdfPopup'), function(error) {
                            alert(error);
                        });
                    },
                    function() {
                        Splunk.Popup.DisplayPDFUnavailable($('.pdfPopup'));
                    }
                );

                return false;
            }.bind(this));
            
            if (pdfService === "pdfgen")
            {
                $('.renderpdf', this.container).removeClass('splButton-disabled');
                $('.renderpdf', this.container).click(function() {
                    Splunk.pdf.is_pdf_available(
                        function(pdfService) {
                            url = Splunk.pdf.get_render_url_for_current_dashboard(pdfService);
                            viewName = Splunk.ViewConfig.view.label || "" ;
                            window.open(url, "PDF");
                        },
                        function() {
                            Splunk.Popup.DisplayPDFUnavailable($('.pdfPopup'));
                        }
                    );
                    
                    return false;
                }.bind(this));
            }
        });

        $('.move:not(.splButton-disabled)', this.container).click(function() {
            Splunk.Globals.Viewmaster.openPanelFormHelper(Splunk.util.getCurrentView(), 'move');
        });
        $('.add:not(.splButton-disabled)', this.container).click(function() {
            Splunk.Globals.Viewmaster.openPanelFormHelper(Splunk.util.getCurrentView(), 'add');
        });
        $('.print', this.container).click(function() {
            $(document).trigger("PrintPage");
        });
        $('.splRadio label', this.container).click(function(e) {
            $for = $(this).attr('for');
            $input = $('#' + $for);
            that.toggleMode($input.val());
        });
        $('.splRadio input', this.container).click(function(e) {
            that.toggleMode($(this).val());
        });
        var hashParams = Splunk.util.queryStringToProp(Splunk.util.getHash());
        if (hashParams.hasOwnProperty('edit')) {
            if (Splunk.util.normalizeBoolean(hashParams['edit'])) {
                $("input[name='mode'][value='view']").prop('checked', false);
                $("input[name='mode'][value='edit']").prop('checked', true);
                this.toggleMode('edit');
            }
            delete hashParams['edit'];
            window.location.hash = Splunk.util.propToQueryString(hashParams);
        }
        // splRadio
        $('.splRadio').splRadioInit();
        
        //retrieve in memory checked radio for 'back-button' support (Radio input elements remember the last checked state when returned to via history.back(-1)/back button).
        this.toggleMode( $(this.modeSelector + ':checked', this.container).val() );
    },
    toggleMode: function(mode) {
    	var that = this;
        if (mode==='edit') {
            //this.setParam('isViewMode', 'False');
            this.$viewMode.fadeOut('fast', function() {
            	that.$editMode.fadeIn();
            });
            this.$rowgroupMessage.show();
        } else {
            //this.setParam('isViewMode', 'True');
            this.$editMode.fadeOut('fast', function() {
            	that.$viewMode.fadeIn();
            });
            this.$rowgroupMessage.hide();
        }
        $(document).trigger('Splunk.Module.DashboardTitleBar.editMode', [(mode=='edit') ? true : false]);
    }
});
