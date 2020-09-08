Splunk.Viewmaster = $.klass({
    
    dashPopupInstance: null,
    panelPopupInstance: null, 

    _dashPageIsStale: false,
    
    logger: Splunk.Logger.getLogger("viewmaster.js"),
    
    
    ///////////////////////////////////////////////////////////////////////////
    // Helpers
    ///////////////////////////////////////////////////////////////////////////

    _getFormContainer: function(slot) {
        slot = slot || 1;
        var cont = $("#viewmasterFormContainer" + slot);
        if (!cont.length) {
            cont = $('<div id="viewmasterFormContainer' + slot + '"/>').hide().appendTo('body');
        }
        return cont;
    },


    _buildUri: function(is_api, view_id, panel_type, panel_sequence) {
        var output = ['viewmaster', Splunk.util.getCurrentApp()];
        if (view_id != undefined) output.push(view_id);
        if (panel_type != undefined) output.push(panel_type);
        if (panel_sequence != undefined) output.push(panel_sequence);
        if (is_api) output.splice(0, 1, 'api');
        return Splunk.util.make_url(output.join('/'));
    },
    
    
    
    ///////////////////////////////////////////////////////////////////////////
    // create dashboard dialog
    ///////////////////////////////////////////////////////////////////////////

    openDashCreateForm: function() {
        this._getFormContainer().load(
            this._buildUri(),
            this.openDashCreateFormCallback.bind(this)
        );
    },
    openDashCreateFormCallback: function() {
        
        this.dashPopupInstance = new Splunk.Popup(this._getFormContainer(), {
            title: _('Create new dashboard'),
            buttons: [
                {
                    label: _('Cancel'),
                    type: 'secondary',
                    callback: function(){ return true; }
                },
                {
                    label: _('Create'),
                    type: 'primary',
                    callback: this.handleDashCreate.bind(this)
                }
            ]
        });
        
        $('form', this.dashPopupInstance.getPopup()).bind('submit',
            this.handleDashCreate.bind(this)
        );
    },
    handleDashCreate: function(evt) {
        var formElement = $('form[name="vmCreateDashboard"]', this.dashPopupInstance.getPopup());
        var $vmName = $('#vmName', this.dashPopupInstance.getPopup());
        var vmNameReg = /[^\w]/;
        var $err = $('#vm-form-message-text', this.dashPopupInstance.getPopup());
        if (!$vmName.val() || vmNameReg.test( $vmName.val() ) ) {
            $err.parent().show();
            $err.html(_('Invalid ID'));
            $vmName.focus();
        } else {
            formElement.ajaxSubmit({
                'success': this.handleDashCreateCallback.bind(this),
                'dataType': 'json'
            });
        }
        return false;
    },
    handleDashCreateCallback: function(jsonObject) {
        if (jsonObject.success) {
            var newViewId = jsonObject.data['view_id'];
            if (newViewId) {
                window.location.href = Splunk.util.make_url('app', Splunk.util.getCurrentApp(), newViewId);
                this.dashPopupInstance.destroyPopup();
            } else {
                alert(_('Unexpected error while creating a dashboard'));
            } 
        } else {
            for (var i=0,L=jsonObject['messages'].length; i<L; i++) {
                alert(jsonObject['messages'][i]['message']);
            }
        }
    },
    
    

    ///////////////////////////////////////////////////////////////////////////
    // Edit dashboard dialog
    ///////////////////////////////////////////////////////////////////////////

    dashEditFormDom: null,
    panelEditFormDom: null,
    activeViewId: null,
 
    /**
     * Helper for opening and show/hiding sections based on a mode. This is used for turning on/off
     * either the add panel and or move panel functionality.
     *
     * @param {String} view_id
     * @param {String} mode The mode to display, one of 'add', 'move' or ''.
     */
    openPanelFormHelper: function(view_id, mode) {
        this.mode = mode;
        this._getFormContainer().load(
            this._buildUri(false, view_id) + (mode ? '?mode=' + mode : ''), //the signature for _buildUri is argument based.
            this.openDashEditFormCallback.bind(this)
        );
        this.activeViewId = view_id;
    },

    /**
     * Handles main open request to the dashboard edit dialog
     */
    openDashEditForm: function(view_id) {
        this._getFormContainer().load(
            this._buildUri(false, view_id),
            this.openDashEditFormCallback.bind(this)
        );
        this.activeViewId = view_id;
    },
    openDashEditFormCallback: function() {

        if (this.dashPopupInstance && this.dashPopupInstance.isActive) {
            this.dashPopupInstance.setPopupContents(this._getFormContainer());

        } else {
            var title, buttons;
            if (this.mode=='add') {
                title = _('New panel');
                buttons = [
                     {
                         label: _('Cancel'),
                         type: 'secondary',
                         callback: function(){ return true; }
                    },
                    {
                        label: _('Save'),
                        type: 'primary',
                        callback: function() { 
                            this.handleAddPanel();
                        }.bind(this)
                    }
                ];
            }else{
                title = sprintf(_('Edit %s'), this.activeViewId);
                buttons = [{
                    label: _('Close'),
                    type: 'primary',
                    callback: function() { 
                        if (this._dashPageIsStale) {
                            window.location.href = Splunk.util.make_url(
                                'app', 
                                Splunk.util.getCurrentApp(), 
                                this.activeViewId
                            );
                            return false;
                        } else {
                            return true;
                        }
                    }.bind(this)
                }];
            }
            
            this.dashPopupInstance = new Splunk.Popup(this._getFormContainer(), {
                title: title,
                buttons: buttons
            });
            
            // bind top-level click handler for panel actions
            this.dashPopupInstance.getPopup().click(function(evt) {
                var target = $(evt.target);
                if (!target.is('a')
                    || !target.attr('panel_action')) return true;
        
                switch(target.attr('panel_action')) {
                    case 'edit':
                        this.handleEditPanelClick(target.attr('panel_sequence'));
                        break;
                    case 'delete':
                        this.handleDeletePanelClick(target.attr('panel_sequence'));
                        break;
                    default:
                        break;
                }
                return false;
            }.bind(this));
            
            this._dashPageIsStale = false;
           
        }
        
        // save a reference to the active (not the template) DOM element
        this.dashEditFormDom = $('form[name="vmEditDashboard"]', this.dashPopupInstance.getPopup());
        this.dashAddFormDom = $('form[name="vmAddPanel"]', this.dashPopupInstance.getPopup());

        var popupDom = this.dashPopupInstance.getPopup();

        var searchMode = $('#vmpSearchCommandSaved').length ? 'saved' : 'string';
        
        // setup saved search / inline search switches
        this.setActiveSearchModeOptions(searchMode, this.dashAddFormDom);
        this.dashAddFormDom.click(
            function(evt) {
                var target = $(evt.target);
                if (target.is('input') && target.attr('name') == 'searchMode') {
                    this.setActiveSearchModeOptions(target.attr('value'), this.dashAddFormDom);
                } 
            }.bind(this)
        );
        
        // init the panel drag controller; the jquery sortable() plugin will
        // fire a 'sortstop' when user has completed re-org
        $('ul.vmEditReorderCanvasRow', popupDom).sortable({
            'forcePlaceholderSize': true, 
            'placeholder': 'vmPanelDropPlaceholder',
            'connectWith': $('ul.vmEditReorderCanvasRow', popupDom),
            'cursor': 'move'
        }).disableSelection();
        $('ul.vmEditReorderCanvasRow', popupDom).bind(
            'sortstop', 
            this.handleEditDashSave.bind(this)
        );
        
        // bind the 'add panel' link
        $('#vmAddPanelSubmit', popupDom).click(this.handleAddPanel.bind(this));
    },
    
    
    /**
     * Handles the 'add panel' functionality on the main dashboard edit dialog
     */
    handleAddPanel: function() {
        var formElement = $('form[name="vmAddPanel"]', this.dashPopupInstance.getPopup());
        formElement.ajaxSubmit({
            'success': this.handleAddPanelCallback.bind(this),
            'dataType': 'json'
        });
        return false;
    },
    handleAddPanelCallback: function(jsonObject) {
        if (jsonObject.success) {
            if (this.mode=='add') {
                this.mode = null;
                this.dashPopupInstance.destroyPopup();
                $(document).trigger('RefreshPage');
                return;
            }
            this.openDashEditForm(this.dashEditFormDom.attr('view_id'));
            this._dashPageIsStale = true;
        } else {
            for (var i=0,L=jsonObject['messages'].length; i<L; i++) {
                alert(jsonObject['messages'][i]['message']);
            }
        }
    },
    
    

    /**
     * Handles the 'delete' action link on panels
     */
    handleDeletePanelClick: function(panel_sequence) {
        if (!confirm(_('Are you sure you want to delete this panel?'))) {
            return;
        }
        $.post(
            this._buildUri(false, 
                this.dashEditFormDom.attr('view_id'), 
                'panel', 
                panel_sequence
            ),
            {'action': 'delete'},
            this.handleDeletePanelClickCallback.bind(this),
            'json'
        );
    },
    handleDeletePanelClickCallback: function(jsonObject) {
        if (jsonObject.success) {
            this.openDashEditForm(this.dashEditFormDom.attr('view_id'));
            this._dashPageIsStale = true;
        } else {
            alert('delete failed');
        }
    },
    
    
    
    /**
     * Handles panel reordering updates
     */
    handleEditDashSave: function(evt, ui) {
        $.post(
            this._buildUri(
                false, 
                this.dashEditFormDom.attr('view_id')
            ),
            {
                'action': 'edit',
                'view_json': JSON.stringify(this.dashFormToJson())
            },
            this.handleEditDashSaveCallback.bind(this),
            'json'
        );
        this._lastUpdateTime = new Date();
    },
    handleEditDashSaveCallback: function(jsonObject) {
        if (jsonObject.success) {
            this.logger.info('Updated dashboard');
            if (this.mode === 'move') {
                this._dashPageIsStale = true;
                this.updatePanelSequnece();
                return;
            }
            this.openDashEditForm(this.dashEditFormDom.attr('view_id'));
            this._dashPageIsStale = true;
        } else {
            for (var i=0,L=jsonObject.messages.length; i<L; i++) {
                alert('dashboard failed in updating: ' + jsonObject.messages[i].message);
            }
        }
    },
    dashFormToJson: function() {
        var output = {
            'new_panel_sequence': []
        };
        
        var rowSet;
        $('.vmEditReorderCanvas ul', this.dashEditFormDom).each(function() {
            rowSet = [];
            $('li', this).each(function() {
                var s = parseInt($(this).attr('panel_sequence'), 10);
                if (!isNaN(s)) { rowSet.push(s); }
            });
            output['new_panel_sequence'].push(rowSet);
        });
        return output;
    },
    updatePanelSequnece: function() {
        $('.vmEditReorderCanvas ul li', this.dashEditFormDom).each(function(index, value) {
            $(this).attr("panel_sequence", index);
        });
    },



    /**
     * Handles the 'edit panel' request on a specific panel
     */
    handleEditPanelClick: function(panel_sequence) {

        this._getFormContainer('2').load(
            this._buildUri(false, 
                this.dashEditFormDom.attr('view_id'), 
                'panel', 
                panel_sequence
            ),
            this.handleEditPanelClickCallback.bind(this)
        );
    },
    handleEditPanelClickCallback: function(jsonObject) {
        
        this.panelPopupInstance = new Splunk.Popup(this._getFormContainer('2'), {
            title: _('Edit panel'),
            buttons: [
                {
                    label: _('Cancel'),
                    type: 'secondary',
                    callback: function(){ return true; }
                },
                {
                    label: _('Save'),
                    type: 'primary',
                    callback: this.handleEditPanelSave.bind(this)
                }
            ]
        });
        
        // bind event for enter-key submission
        $('form', this.panelPopupInstance.getPopup()).bind('submit',
            this.handleEditPanelSave.bind(this)
        );
        
        var popupDom = this.panelPopupInstance.getPopup();
        
        this.panelEditFormDom = $('form', popupDom);

        popupDom.css('z-index',
            parseInt(popupDom.css('z-index') + 1, 10)
        );

        this.setActiveSearchModeOptions(this.panelEditFormDom.attr('current_search_mode'));

        this.setActiveDrilldownOptions();

        // bind panel searchMode toggles 
        this.panelEditFormDom.click(
            function(evt) {
                var target = $(evt.target);
                if (target.is('input') && target.attr('name') == 'searchMode') {
                    this.setActiveSearchModeOptions(target.attr('value'));
                } 
            }.bind(this)
        );
        // IE does not bubble change events for some reason.  
        // so we have to bind directly to the select.
        $("select#vmpPanelClass").change(
            function(evt) {
                var target = $(evt.target);
                this.logger.debug(target.attr('name'));
                this.setActiveDrilldownOptions(target.val());
            }.bind(this)
        );
        
    },
    setActiveDrilldownOptions: function(panelStyle) {
        if (!panelStyle) {
            panelStyle = $("select#vmpPanelClass").val();
        }
        var tableOptions = $("div.tableDrilldown", this.panelEditFormDom);
        var chartOptions = $("div.chartDrilldown", this.panelEditFormDom);
        var entireFieldSet = $("fieldset.drilldownOptions", this.panelEditFormDom);
        
        switch (panelStyle) {
            case "table" :
                tableOptions.show();
                chartOptions.hide();
                entireFieldSet.show();
                break;
            case "chart" :
                chartOptions.show();
                tableOptions.hide();
                entireFieldSet.show();
                break;
            default: 
                entireFieldSet.hide();
                break;
        }
    },

    setActiveSearchModeOptions: function(searchMode, targetDom) {
        var panelForm = targetDom || this.panelEditFormDom;
        
        switch (searchMode) {
            
            case 'string':
                $('#vmpSearchModeString', panelForm).prop('checked', true);
                $('.searchModeString', panelForm).show();
                $('.searchModeSaved', panelForm).hide();
                $('.searchModeString .control', panelForm).prop('disabled', null);
                $('.searchModeSaved .control', panelForm).prop('disabled', 'disabled');
                break;
                
            case 'saved':
                $('#vmpSearchModeSaved', panelForm).prop('checked', true);
                $('.searchModeString', panelForm).hide();
                $('.searchModeSaved', panelForm).show();
                $('.searchModeString .control', panelForm).prop('disabled', 'disabled');
                $('.searchModeSaved .control', panelForm).prop('disabled', null);
                break;
                
            default:
                break;
        }
    },
    

    
    /**
     * Handles the 'Save' form button click on the panel edit dialog.  If
     * successful, will close the popup; otherwise display error.
     */
    handleEditPanelSave: function() {
        var form = $("select#vmpPanelClass")[0].form;
        var panelStyle = $("select#vmpPanelClass").val();
        var drilldownEnabledStyles = ["chart", "table"];

        var hiddenInput = $(form["option.drilldown"]);

        for (var i=0; i<drilldownEnabledStyles.length; i++) {
            var radioElt = $('input[name=' + drilldownEnabledStyles[i] +  '_option.drilldown]:checked');
            // if we're on chart or table, copy the radio val into the hidden val.
            if (panelStyle == drilldownEnabledStyles[i]) {
                hiddenInput.val(radioElt.val());
            }
            // dont let any of these client-only form elements submit.
            radioElt.remove();
        }
        // if this is neither chart nor table, dont let the hidden input submit either.
        if (drilldownEnabledStyles.indexOf(panelStyle) == -1) {
            hiddenInput.remove();
        }

        
        this.panelEditFormDom.ajaxSubmit({
            'success': this.handleEditPanelSaveCallback.bind(this),
            'dataType': 'json',
            'url': this.panelEditFormDom.attr('action') + '/' + this.panelEditFormDom.attr('panel_sequence')
        });
        return false;
    },
    handleEditPanelSaveCallback: function(jsonObject) {
        if (jsonObject.success == true) {
            this._dashPageIsStale = true;
            this.panelPopupInstance.destroyPopup();
            this.openDashEditForm(this.panelEditFormDom.attr('view_id'));
        } else {
            for (var i=0,L=jsonObject.messages.length; i<L; i++) {
                alert('saved panel FAILED: ' + jsonObject.messages[i].message);
            }
        }
    }

});
   
