/**
* JS routines used by manager/EAI
*/

Splunk.namespace("Splunk.EAI");

Splunk.EAI = $.klass({
    elements_loaded: false,
    eaicfg: null,
    endpoint_base: '',
    eai_attributes: null,
    admin_namespace: '',
    initial_form_fields: null,
    entity_name: false,
    saving: 0,
    target_has_acl: false,
    success_message: false,
    redirect: true,
    use_messenger_on_error: false,
    confirmSubmission: false,
    confirmQuestion: _("Are you sure you want to do this?"),

    initialize: function() {
        this.logger = Splunk.Logger.getLogger("Splunk.EAI");
    },

    setup: function(eaicfg, endpoint_base, eai_attributes) {
        this.eaicfg = eaicfg;
        this.endpoint_base = endpoint_base;
        this.eai_attributes = eai_attributes;
    },


    /**
    * Keep track of the initial form values so we can detect which have been
    * deleted later
    */
    elementsLoaded: function(namespace, entity_name) {
        this.elements_loaded = true;
        this.admin_namespace = namespace;
        this.entity_name = entity_name;
        var f = this.getFormValues('eaiform');
        this.initial_form_fields = {};
        for (var elname in f) {
            this.initial_form_fields[elname] = true;
        }
    },


    /**
    * Find all onChange events for an element and execute them in order
    *
    * Onchange handles are methods of this class prefixed with "action_"
    */
    doElementOnChange: function(el, element_name) {
        var elcfg =  this.eaicfg[element_name];
        if (!elcfg['onChange'])
            return;

        return this._execChangeAction(el, element_name, elcfg, elcfg['onChange']);
    },

    _execChangeAction: function(el, element_name, elcfg, actions) {
        actions = actions instanceof Array ? actions : [ actions ];
        for(var i=0; i<actions.length; i++) {
            //var action = 'this._action_'+actions[i]['_action'];
            if (this.elements_loaded || actions[i]['_triggerOnLoad'] != false) {
                var action = this['action_'+actions[i]['_action']];
                if (!action) {
                    this.logger.error("Invalid manager onChange action configured: "+actions[i]['_action']);
                    return;
                }
                action.call(this,el, element_name, elcfg, actions[i]);
            }
        }
    },


    /**
    * Display all but selected elements when an element action is triggered
    */
    action_showonly: function(el, element_name, elcfg, occfg) {
        // hide all except the element to show
        var type = elcfg['type'];
        if (!occfg['_groupset'])
            return;
        var groupset = occfg['_groupset'] instanceof Array ? occfg['_groupset'] :  [ occfg['_groupset'] ];
        var use_regex = occfg['_matchtype'] && occfg['_matchtype']=='regex';
        var selected;

        if (type=='select')
            selected = $(el).children('[selected]').val();
        else if (type=='checkbox')
            selected = $(el).prop('checked') ? 1 : 0;
        else
            selected = $(el).val();

        var show;
        if (use_regex) {
            var matchre = /^\/(.+)\/(\w*)$/,
                key, fallback, pattern, patternre;
            for(key in occfg) {
                if (!occfg.hasOwnProperty(key)) {
                    continue;
                }
                if (key == '//') {
                    fallback = occfg[key];
                } else if (key.substr(0, 1) == '/' && (pattern=matchre.exec(key))) {
                    patternre = new RegExp(pattern[1], pattern[2]);
                    if (patternre.test(selected)) {
                        show = occfg[key];
                        break;
                    }
                }
            }
            if (!show && fallback) {
                show = fallback;
            }
        } else {
            show = occfg[selected];
        }

        if (!show) {
            show = ['ALL'];
        } else {
            show = show.split(/ +/);
        }

        for(var i=0; i<groupset.length; i++) {
            var elname = groupset[i];
            if ($('[id="item-'+elname+'"][type="hidden"]').length) {
                continue; // never show hidden fields
            }
            if (show[0] == 'ALL') {
                $('[id="item-'+elname+'"]').show();
            } else if (show.indexOf(elname)==-1) {
                $('[id="item-'+elname+'"]').hide();
            }
        }

        for (i=0; i<show.length; i++) {
            if ($('[id="item-'+show[i]+'"][type="hidden"]').length) {
                continue; // never show hidden fields
            }
            $('[id="item-'+show[i]+'"]').show();
        }
    },

    /**
    * Modify the list of attributes marked as 'required'
    */
    action_updateDisabled: function(el, element_name, elcfg, occfg) {
        var modifylist = occfg['value_map'];
        if (!modifylist) {
            return;
        }
        var current = $(el).val();
        if (!current in modifylist) {
            this.logger.error('updateRequired onChange handler does not define a value in the value_map for '+current);
            return;
        }
        modifylist = modifylist[current].split(/ +/);
        for (var i=0; i<modifylist.length; i++) {
            if (!modifylist[i])
                continue;
            var op = modifylist[i].substr(0, 1);
            var field = modifylist[i].substr(1);
            var target_el;
            switch(op) {
                case '+':
                    target_el = $('[id="item-'+field+'"]').find('input[name="'+field+'"]');
                    target_el.prop("disabled", true);
                    break;
                case '-':
                    target_el = $('[id="item-'+field+'"]').find('input[name="'+field+'"]');
                    target_el.prop("disabled", false);
                    break;
                default:
                    this.logger.error('Field "'+op+field+'" present in updateDisabled onChange handler that is not prefixed with + or -');
                    break;
            }
        }

    },

    /**
    * Modify the list of attributes marked as 'required'
    */
    action_updateRequired: function(el, element_name, elcfg, occfg) {
        var modifylist = occfg['value_map'];
        if (!modifylist) {
            this.eai_required = undefined;
            return;
        }
        var req = {};
        for (var i=0, fc=this.eai_attributes.requiredFields.length; i<fc; i++) {
            req[this.eai_attributes.requiredFields[i]] = 1;
        }
        var current = $(el).val();
        if (!current in modifylist) {
            this.logger.error('updateRequired onChange handler does not define a value in the value_map for '+current);
            return;
        }
        modifylist = modifylist[current].split(/ +/);
        for (var j=0; j<modifylist.length; j++) {
            if (!modifylist[j])
                continue;
            var op = modifylist[j].substr(0, 1);
            var field = modifylist[j].substr(1);
            switch(op) {
                case '+':
                    req[field] = 1;
                    break;
                case '-':
                    delete req[field];
                    break;
                default:
                    this.logger.error('Field "'+op+field+'" present in updateRequired onChange handler that is not prefixed with + or -');
                    break;
            }
        }
        this.eai_required  = [];
        for (var req_field in req)
            this.eai_required.push(req_field);
    },

    action_triggerChangeHandler: function(el, element_name, elcfg, occfg) {
        target = $('[id="item-'+occfg['target']+'"]');
        if (occfg['makeVisible'])
            target.show();
        if (target.is('input[type="hidden"]')) {
            doElementOnChange(target, occfg['target']);
        } else {
            $('*[onchange]', target).trigger('onchange');
            $('input[type="radio"][onclick][checked]', target).trigger('onclick');
            $('input[type="checkbox"][onclick]', target).trigger('onclick');
        }
    },

    /**
    * Refresh an element by re-requesting it from the server using the current form values
    */
    _triggerElementRefresh_active_count: 0,
    action_triggerElementRefresh: function(el, element_name, elcfg, occfg) {
        var self = this;
        var target = occfg['target'];
        var makeVisible = occfg['makeVisible'] ? true : false;
        var element_overlay = occfg['updateElement'] ? occfg['updateElement'] : {};


        /*jshint -W017:false */
        if (!this._triggerElementRefresh_active_count++) {
            $('.splOverlay-white').show();
            $('#loadingmessage').show();
        }
        /*jshint -W017:true */
        var xhr = $.ajax({
            type: 'POST',
            url: Splunk.util.make_url('manager', self.admin_namespace, self.endpoint_base, '_element', target),
            data: {
                form_defaults: JSON.stringify(self.getFormValues('eaiform')),
                eai_attributes: JSON.stringify(self.eai_attributes),
                element_overlay: JSON.stringify(element_overlay),
                entity_name: JSON.stringify(self.entity_name)
            },
            dataType: 'html',
            success: function(htmlresult, textStatus) {
                if (!--self._triggerElementRefresh_active_count) {
                    $('.splOverlay-white').hide();
                    $('#loadingmessage').hide();
                }
                var newel = $('[id="item-'+target+'"]').replaceWith(htmlresult);
                if ($('[id="item-'+target+'"]').hasClass('accumulator'))
                    self.initAccumulators('item-'+target);
                if (occfg['_triggerOnRefresh']) {
                    newel = $('[id="item-'+target+'"]');
                    $('*[onchange]', newel).trigger('onchange');
                    $('input[type="radio"][onclick][checked]', newel).trigger('onclick');
                    $('input[type="checkbox"][onclick]', newel).trigger('onclick');
                }
                if (occfg['_chained_action']) {
                    self._execChangeAction(el, element_name, elcfg, occfg['_chained_action']);
                }
                if (makeVisible)
                    $('[id="item-'+target+'"]').show();
            },
            error: function(xhr, textStatus, errorThrown) {
                if (!--self._triggerElementRefresh_active_count) {
                    $('.splOverlay-white').hide();
                    $('#loadingmessage').hide();
                }
                Splunk.Messenger.System.getInstance().send('error', 'elementRefresh', sprintf(_('Splunk failed to fetch the element from the server: ')+textStatus));
            }
        });
    },


    /**
    * Set the value of an element to a new value
    * Automatically trigger's the target elements onChange handlers once set
    */
    action_setElementValue: function(el, element_name, elcfg, occfg) {
        var target = occfg['target'];
        var value = occfg['value'];
        var makeVisible = occfg['makeVisible'] ? true : false;
        var value_map = occfg['value_map'];
        if (value_map) {
            var current;
            switch(el.type) {
                case 'checkbox':
                    current = $(el).filter(':checked').val();
                    break;
                case 'select':
                    current = $(el).filter(':selected').val();
                    break;
                default:
                    current = $(el).val();
                    break;
            }
            if (!(current in value_map)) {
                // don't do anything if not explictly asked to
                return;
            }
            value = value_map[current];
        }
        var targetcfg =  this.eaicfg[target];
        var target_el;
        switch(targetcfg.type) {
            case 'radio':
                target_el = $('[id="item-'+target+'"]').find('input[type="radio"][value="'+value+'"]');
                target_el.val(1);
                break;
            case 'checkbox':
                target_el = $('[id="item-'+target+'"]').find('input[type="checkbox"][value="'+value+'"]');
                target_el.val(1);
                break;
            case 'select':
            case 'multiselect':
                target_el = $('[id="item-'+target+'"]').find('select[name="'+target+'"]');
                target_el.val(value);
                break;
            case 'textfield':
                target_el = $('[id="item-'+target+'"]').find('input[name="'+target+'"]');
                target_el.val(value);
                break;
            case 'textarea':
                target_el = $('[id="item-'+target+'"]').find('textarea[name="'+target+'"]');
                target_el.val(value);
                break;
            case 'hidden':
                target_el = $('[id="item-'+target+'"]');
                target_el.val(value);
                break;
            default:
                break;
        }
        if (makeVisible)  {
            $('[id="item-'+target+'"]').show();
        }
        this.doElementOnChange(target_el, target);
    },

    /**
    * Change the state of an element to a given state (enable/disable)
    */
    action_updateElementState: function(el, element_name, elcfg, occfg) {
        var self = this;
        var target = occfg['target'];
        var value_map = occfg['value_map'];

        if(value_map) {
            var current = $(el).filter(':checked').val();
            var target_el = $('[id="item-'+target+'"]').find('select[name="'+target+'"]');

            if(Splunk.util.normalizeBoolean(current)) {
                for(var key in value_map) {
                    var value = value_map[key].trim().toLowerCase();
                    switch(value) {
                        case 'disable':
                            target_el.find('option[value="'+key+'"]').prop('disabled', true);
                            break;
                        case 'enable':
                            target_el.find('option[value="'+key+'"]').prop('disabled', false);
                            break;
                        default:
                            self.logger.error("Invalid manager onChange value_map configured: '"+value+"' is an invalid value.");
                            break;
                    }
                }
                target_el.parent().find('.exampleText').show();
                self.logger.info("Enabled summary indexing: Alert condition has been set to 'always'.");
            }
            else {
                target_el.find('option').prop('disabled', false);
                target_el.parent().find('.exampleText').hide();
            }
        }
    },

    action_showTreeView: function(el, element_name, elcfg, occfg) {
        var elTarget = 'input#'+element_name+'_id';
        var title = _('Treeview');
        var style = 'wizardPopup';

        var data = {
            "eai_path": occfg['eaiPath'],
            "selected_text": occfg['selectedText'] + ": ",
            "start_node": escape($(elTarget).val())
        };

        if (occfg['extraDataFields']) {
            var dataFields = occfg['extraDataFields'].split(',');
            for(var i=0; i<dataFields.length; i++) {
                var field = $.trim(dataFields[i]);
                var target_el = $('[id="item-'+field+'"]').find('input[name="'+field+'"]');
                if (target_el.val().length > 0) {
                    data[field] = target_el.val();
                }
            }
        }

        if (occfg['title']) {
            title = occfg['title'];
        }
        if (occfg['style']) {
            style = occfg['style'];
        }

        var popup = Splunk.Popup.TreePopup(elTarget, title, data, style);
    },

    getFormValues: function(form_id) {
        var f = $('#' + form_id)[0];
        if (!f) {
            Splunk.Messenger.System.getInstance().send('error', 'getFormValues', sprintf(_('Splunk failed to fetch form values for form "%s"'), form_id));
            return {};
        }
        var result = {};
        for(var i=0; i<f.elements.length; i++) {
            var el = f.elements[i];
            var elname = el.name;
            if (elname)
                result[elname] = $(el).val();
        }
        return result;
    },

    /**
    * Initialize passed accumulators
    *
    * @accList {Array} : array containing the ids of the accumulators to initialize
    */
    initAccumulators: function(accList) {
        if (!accList)
            return;
        var accumulators = accList instanceof Array ? accList :  [ accList ];

        for(var i=0; i<accumulators.length; i++) {
            var elname = accumulators[i].substring(5);
            (function(elname) {
                $('#' + accumulators[i]).bind("click", function(evt){
                    var t = evt.target;

                    if ( $(t).is('li') )
                        $li = $(t);
                    else if ( $(t).is('span') )
                        $li = $(t).parent('li');
                    else if ( $(t).is('a.addAllLink') ) {
                        addAll(this);
                        doElementOnChange(t, elname);
                        return false;
                    } else if ( $(t).is('a.removeAllLink') ) {
                        removeAll(this);
                        doElementOnChange(t, elname);
                        return false;
                    } else
                        return;

                    /* if the clicked item is in the available options ul and has the class selected OR if it's in the selectedOptions ul */
                    if ( ($li.parents('.availableOptions').length && $li.hasClass('selected')) || $li.parents('.selectedOptions').length  ) {
                        removeFromSelected($li, this);
                    } else {  // it must be in available options and not have the selected class
                        addToSelected($li, this);
                    }

                    doElementOnChange(t, elname);
                    return false;
                });
            })(elname);
        }

        var removeFromSelected = function($li, context) {
            var value = $li.attr('name');

            // remove from selected options list and hidden select element
            $('.selectedOptions li', context).filter(function() { return $(this).attr("name") == value; }).remove();

            $('.hiddenSelectedOptions option', context).filter(function() { return $(this).attr("value") == value; }).remove();

            $('.availableOptions li', context).filter(function() { return $(this).attr("name") == value; }).removeClass('selected');
        };

        var addToSelected = function(arr, context) {
            var liArray = arr instanceof Array ? arr :  [ arr ];

            var selectedOptions = [];
            var hiddenOptions = [];

            for(var i=0; i<liArray.length; i++) {
                $li = $(liArray[i]);
                value = $li.attr('name');
                fieldValue = $li.text();
                label = $li.text();

                // add new li to selected options ul
                selectedOptions.push('<li name="' + Splunk.util.escapeHtml(value) + '"><span class="splIcon splIcon-arrow-w"></span>' + Splunk.util.escapeHtml(fieldValue) + '</li>');

                // add to hidden selected options select
                hiddenOptions.push('<option selected="selected" value="' + Splunk.util.escapeHtml(value) + '" >' + Splunk.util.escapeHtml(label) + '</option>');

                // set selected class on selected option
                $li.addClass('selected');
            }
            $('.selectedOptions', context).append(selectedOptions.join(''));
            $('.hiddenSelectedOptions', context).append(hiddenOptions.join(''));

            // sort alphabetically
            var selItems = $('.selectedOptions li', context).get();
            selItems.sort(function(a,b){
              var keyA = $(a).text();
              var keyB = $(b).text();

              if (keyA < keyB) return -1;
              if (keyA > keyB) return 1;
              return 0;
            });
            var selItemsUl = $('.selectedOptions', context);
            $.each(selItems, function(i, li){
              selItemsUl.append(li);
            });
        };

        var addAll = function(context) {
            var liArray = $('.availableOptions', context).find('li').not('.selected').get();
            addToSelected(liArray, context);
        };

        var removeAll = function(context) {
            $('.selectedOptions', context).find('li').remove();
            $('.hiddenSelectedOptions', context).find('option').remove();

            $('.availableOptions li.selected', context).removeClass("selected");
        };
    },

    /**
    * Dispatcher function to gather all accumulators into an array and pass it to the setup function
    */
    dispatchInitAccumulators: function() {
        var accumulators = [];
        $('.accumulator').not('.accDisabled').each(function(){
            accumulators.push($(this).attr('id'));
        });
        if ( accumulators.length > 0 )
            this.initAccumulators(accumulators);
    },

    /**
    * Set up admin tabs
    *
    * @tabID {string} : id for the tabwrapper defining the tabs themselves.
    * @selectedTab {string} (optional) : defines which tab to intialize as 'selected', value is the id of tab to turn on
    */
    adminTabify: function(tabID, selectedTab) {
        var $tabID = (tabID.substr(0,1) == '#') ? $(tabID) : $('#' + tabID);
        if (selectedTab)
            selectedTab = (selectedTab.substr(0,1) == '#') ? selectedTab : '#' + selectedTab;

        //make sure all tabs are off except for either the selected one passed, or default to the first tab
        $tabID.find('li').not('.linkTab').each(function(i){
            $a = $(this).children('a');
            if ((!selectedTab && i==0) || (selectedTab && selectedTab == $a.attr('href'))) {
                $(this).addClass('selected');
                $($a.attr('href')).show();
            } else {
                $($a.attr('href')).hide();
            }
        });

        $tabID.bind('click', function(evt){
            var t = evt.target;

            var $elem = false;

            if ( $(t).is('a') && !$(t).parent('li').hasClass('linkTab') ) {
                $elem = $(t);
            } else if ( $(t).is('li') && !$(t).hasClass('linkTab') ) {
                $elem = $(t).children('a');
            }

            if ( $elem ) {
                $($('li.selected').children('a').attr('href')).hide();
                $('li.selected').removeClass('selected');
                $elem.parent('li').addClass('selected');
                $( $elem.attr('href') ).show();

                return false;
            }
        });

        // attach a class to the admin content wrapper for use with cascading, so we know we're in a tabbed env
        $('.adminContent').addClass('hasTabs');
    },

    setError: function(errmsg) {
        if (this.use_messenger_on_error) {
            var messenger = Splunk.Messenger.System.getInstance();
            // Any existing error messages on screen are now obsolete.
            messenger.clear();
            messenger.send('error', 'splunk.eai', errmsg);
        } else {
            $('.EAIError').text(errmsg).show();
        }
    },

    /**
     * Main handler for EAI property form submission
     *
     */
    saveForm: function(formObject, successCallback, errorCallback) {
        if (this.saving++)
            return false;

        if (this.confirmSubmission){
            allowSubmit = confirm(this.confirmQuestion);
            if (!allowSubmit){
                this.saving--;
                return false;
            }
        }


        var self = this;

        var messenger = Splunk.Messenger.System.getInstance();
        this.clearFieldErrors();

        if (!this.validateRequiredFields(formObject)) {
            this.setError(_('Please enter all required fields'));
            if (errorCallback)
                errorCallback();
            this.saving--;
            return false;
        }

        if (!this.validatePasswordFields(formObject)) {
            if (errorCallback)
                errorCallback();
            this.saving--;
            return false;
        }

        try {
            // deal with unselected checkboxes; only process checkboxes that
            // have been marked as proxiable
            var checkboxSuccess = $('input[type="checkbox"]', formObject).each(function() {
                // don't do this for disabled inputs!
                if ($(this).hasClass('proxiable') && $(this).prop('disabled') != true) {
                    self._generateProxyCheckbox(this, formObject);
                }
            });
        } catch (e) {
            alert(_('Error occurred during submission: unable to get checkbox state'));
            return false;
        }

        try {
            if (!this.fieldMappingSubmitHandler())
                return false;
            this.handleDeletedFields(formObject); // must be last.
        } catch (e) {
            alert(_('Error occurred processing form submission: ')+e);
            return false;
        }


        // Backup button nanmes
        $('.jmFormActions button.splButton-primary span').each(function() {
            $(this).data('org', $(this).text());
        });
        $('.jmFormActions button.splButton-primary span').text(_('Saving...'));
        // Prevent user from clicking button again
        $('.jmFormActions button.splButton-primary').attr('disabled', 'disabled');

        $('input[name="__redirect"]', formObject).val(this.redirect ? '1' : '0');

        $(formObject).ajaxSubmit({
            dataType: 'json',
            success: function(response) {
                var callback = false;
                switch(response.status) {
                    case 'OK':
                        //in gdi, modular inputs, we must let the parent page know we have saved success
                        if(window.parent && window.parent.postMessage){
                            window.parent.postMessage('inputsaved', '*');
                        }

                        if (response.redirect) {
                            window.location = response.redirect;
                            return;
                        }
                        messenger.send('info','splunk.eai', self.success_message ? self.success_message : response.msg);
                        callback = successCallback;
                        break;
                    case 'FIELD_ERRORS':
                        self.setError(_('Please correct the errors below'));
                        for(var fieldname in response.fields) {
                            self.setFieldError(fieldname, response.fields[fieldname]);
                        }
                        callback = errorCallback;
                        break;
                    case 'ERROR':
                        self.setError(response.msg);
                        callback = errorCallback;
                        break;
                    default:
                        self.logger.error('Unknown status response received from EAI submission endpoint: '+response.status);
                        break;
                }
                // Restore button names
                $('.jmFormActions button.splButton-primary span').each(function() {
                    $(this).text($(this).data('org'));
                });
                // Remove disabled class - enable button again
                $('.jmFormActions button.splButton-primary').each(function() {
                    $(this).removeAttr('disabled');
                });
                self._revertProxiedCheckboxes(formObject);
                window.scroll(0, 0); // make sure user can see any messages
                if (callback)
                    callback();
                self.saving = 0;
            },
            error: function(xhr, status, error) {
                self.setError(sprintf(_("Your entry was not saved.  The following error was reported: %(error)s."), {'error': error}));
                // Restore button names
                $('.jmFormActions button.splButton-primary span').each(function() {
                    $(this).text($(this).data('org'));
                });
                // Remove disabled class - enable button again
                $('.jmFormActions button.splButton-primary').each(function() {
                    $(this).removeAttr('disabled');
                });
                self._revertProxiedCheckboxes(formObject);
                if (errorCallback)
                    errorCallback();
                self.saving = 0;
            }
        });

        return false; // inhibit submit action
    },

    setFieldError: function(element_name, error_msg) {
        // don't use #id here as it doesn't match ids with characters such as '/' in them
        $('[id="item-'+element_name+'"] .widgeterror').text(error_msg).show();
    },

    clearFieldErrors: function() {
        $('.widgeterror').text('').hide();
    },

    _isFieldSet: function(fieldvalues, fieldname) {
        if (fieldvalues.hasOwnProperty(fieldname)){
            if ( fieldvalues[fieldname]===undefined || fieldvalues[fieldname]===null || !fieldvalues[fieldname])
                return false;
            if (fieldvalues[fieldname].substring && !Splunk.util.trim(fieldvalues[fieldname]).length)
                return false;
        }
        return true;
    },

    validateRequiredFields: function(frm) {
        var required = this.eai_required==undefined ? this.eai_attributes.requiredFields : this.eai_required;
        if (!required)
            return true; // nothing to validate
        var ok = true;
        var values = this.getFormValues($(frm).attr('id'));
        for(var i=0, fc=required.length; i<fc; i++) {
            var fieldname = required[i];
            if (this.eaicfg[fieldname] && this.eaicfg[fieldname]['disableClientSideRequire']!==undefined)  {
                continue;
            }
            if (!this._isFieldSet(values, fieldname)) {
                this.setFieldError(fieldname, _("Required field"));
                ok = false;
            }
        }

        // Check required-if-visible fields
        for(var eaicfg_fieldname in this.eaicfg) {
            // Check if the element if marked requiredIfVisible
            if (!this.eaicfg[eaicfg_fieldname].hasOwnProperty('requiredIfVisible'))
                continue;
            // Check if the element is hidden; if so we don't care about it
            if (!values.hasOwnProperty(eaicfg_fieldname) || $('[id="item-'+eaicfg_fieldname+'"]').is(':hidden'))
                continue;
            if (!this._isFieldSet(values, eaicfg_fieldname)) {
                // Bad user; go to your room.
                this.setFieldError(eaicfg_fieldname, _("Required field"));
                ok = false;
            }
        }
        return ok;
    },

    validatePasswordFields: function(frm) {
        frm = frm[0];
        for(var i=0; i<frm.elements.length; i++) {
            var el = frm.elements[i];
            var elname = el.name;
            if (!elname || elname.substr(0, 4) == 'spl-') {
                continue;
            }
            if ($(el).attr('type') != 'password') {
                continue;
            }
            var pair = $('[name="spl-ctrl_'+elname+'-confirm"]');
            if (pair.val() === undefined)
                continue;
            var val1 = $(el).val();
            // check if password is empty, or all asterisks meaning no changes
            if (val1.match(/^\**$/))
                continue;
            if (val1 != pair.val()) {
                this.setFieldError(elname, _("Passwords do not match"));
                return false;
            }
        }
        return true;
    },

    /**
     * Deleted fields need an empty hidden input field so the endpoint knows to remove them
     */
    handleDeletedFields: function(formObject) {
        var container = $('#deleted');
        if (container.length) {
            container.empty();
        } else {
            container = $('<div id="deleted" style="display:none"></div>').appendTo('form[name="'+this.endpoint_base+'"]');
        }
        var current = this.getFormValues(formObject.attr('id'));
        for (var fieldname in this.initial_form_fields) {
            if (current[fieldname] == undefined) {
                $('<input type="hidden" name="'+fieldname+'" value="" />').appendTo(container);
            }
        }
    },

    /**
     * Update fieldmapping widgets so that the elements are named correctly
     */
    fieldMappingSubmitHandler: function() {
        $('.fieldmapping').filter('.left').each(function() {
            var fieldname = $(this).val();
            var fieldval = $(this).next();
            if (fieldname) {
                var prefix = $(this).parents('.repeatable').data('repeatable').prefix;
                $(fieldval).attr('name', prefix+fieldname);
            } else {
                $(fieldval).attr('name', 'spl-ctrl_null');
            }
        });
        return true;
    },

    initRepeatables: function(frm) {
        $('.repeatable a.addnew', frm).click(this.repeatableAddNew.bind(this));
        $('.repeatable a.delete', frm).click(this.repeatableDeleteField.bind(this));
        $('.repeatable').each(this._checkRepeatableDefaults.bind(this));
    },

    /**
    * Ensure that form mappings in repeatables marked with submitDeleted=false aren't
    * submitted to the endpoint with blank values.
    * Some endpoints (eg. saved searches) want value="" to be submitted to delete them
    * Others (eg. lookups) want the entry to be removed from the form submission altogether
    */
    _checkRepeatableDefaults: function(index, el) {
        if (!$(el).data('repeatable').submitDeleted) {
            $('.fieldmapping .right', el).each(function(index, el) {
                delete this.initial_form_fields[$(el).attr('name')];
            }.bind(this));
        }
    },

    /**
     * Add an entry to a repeatable list of elements
     */
    repeatableAddNew: function(ev) {
        var target = ev.target;
        var container = $(target).parent().parent();
        var maxcount = $(target).parents('.repeatable').data('repeatable').maxcount;
        if (maxcount>-1) {
            if ($(container).find('.widget').length-1 >= maxcount) { // the template is an extra widget, hence -1
                alert(sprintf(ungettext("Cannot add more than %s entry", "Cannot add more than %s entries", maxcount), maxcount));
                return false;
            }
        }
        var template = container.find('.repeatabletemplate > div');
        var newentry = template.clone();
        newentry.attr('id', template.attr('id')+Math.round(Math.random()*1000000000));
        $(target).parent().before(newentry);
        var del = this.repeatableDeleteField.bind(this);
        $('.delete', newentry).click(del);
        this.setupKeyOverride(newentry);
        return false;
    },

    /**
     * Remove an entry from a repeatable list of elements
     */
    repeatableDeleteField: function(ev) {
        var target = ev.target;
        var container = $(target).parents('.repeatable');
        var mincount = container.data('repeatable').mincount;
        if (mincount>0) {
            if ($(container).find('.widget').length-1 <= mincount) { // the template is an extra widget, hence -1
                alert(sprintf(ungettext("Must have at least %s entry", "Must have at least %s entries", mincount), mincount));
                return false;
            }
        }
        var widget = $(target).closest('.widget');
        widget.remove();
        return false;
    },

    /**
     * Generates a proxy hidden input for checkboxes that are submitted while in
     * their unselected state
     */
    _generateProxyCheckbox: function(checkboxObject, formObject, falseValue) {

        if ($(checkboxObject).prop('checked')) return;

        if (falseValue == null) falseValue = '0';

        var expectedName = checkboxObject.name;
        var displacedName = '_spl_proxied_' + expectedName;

        checkboxObject.name = displacedName;
        $(sprintf('<input type="hidden" name="%s" value="%s" />', expectedName, falseValue)).appendTo(formObject);
    },

    /**
     * Undo proxied inputs
     */
    _revertProxiedCheckboxes: function(formObject) {
        $('input[type="checkbox"]', formObject).each(function() {
            var name = $(this).attr('name');
            if (name.indexOf('_spl_proxied_')==0) {
                var original_name = name.substr(13);
                $('input[name="'+original_name+'"]').remove();
                $(this).attr('name', original_name);
            }
        });
    },

    /**
     * Override return key
     */
    setupKeyOverride: function(frm) {
        if (!frm)
            frm = $('#eaiform');
        var self = this;

        // most input fields should submit the form
        $('input', frm).not('.withbutton').keypress(function(ev) {
            if (ev.which==13) {
                frm.submit();
                return false;
            }
            return true;
        });

        // except for text fields that have a button attached; those should trigger
        // the appropriate onchange handler
        $('input.withbutton', frm).keypress(function(ev) {
            if (ev.which==13) {
                self.doElementOnChange(ev.target, $(ev.target).attr('name'));
                //$(ev.target).change(); // pretend the user clicked the button
                return false;
            }
            return true;
        });

    },

    /**
     * Execute run-time inits
     *
     */
    handleAdminReady: function(namespace, entity_name) {

        this.dispatchInitAccumulators();

        //
        // leverage the base input event handlers to initialize the widget states
        // so that rendered page state matches the current settings
        //
        $('*[onchange]').trigger('onchange');
        $('input[type="radio"][onclick][checked]').trigger('onclick');
        $('input[type="checkbox"][onclick]').trigger('onclick');

        // handle the return key correctly
        this.setupKeyOverride();

        // mark page as loaded
        this.elementsLoaded(namespace, entity_name);
        this.initRepeatables();

    }
});
Splunk.EAI.instance = null;
Splunk.EAI.getInstance = function() {
    if (arguments.length) {
        // Could conceivably be called more than once to re-initialize EAI with new params
        Splunk.EAI.instance = new Splunk.EAI();
        Splunk.EAI.instance.setup.apply(Splunk.EAI.instance, arguments);
    } else if(!Splunk.EAI.instance) {
        alert("Attempted to fetch instance of Splunk.EAI prior to initialization");
    }
    return Splunk.EAI.instance;
};


function moveObjectToApp(uriToMove,entityName,entowner) {
    var movePopup = new Splunk.Popup($('.moveObjectFormContainer'), {
        title: _('Move Object'),
        buttons: [
            {
            label: _('Move'),
            type: 'primary',
            callback: function(){
                $('.popupContent #moveControl input[name="name"]').val(entityName);
                $('.popupContent #moveControl input[name="entowner"]').val(entowner);
                $('.popupContent #moveControl input[name="uri"]').val(uriToMove);
                $('.popupContent #moveControl').submit();
                return true;
            }.bind(this)
            }
        ]
    });
}


/**
 * Restart splunkd/splunkweb and udpate the UI with progress
 */
function restart_server(return_to) {
    var start_time;
    var restart_timeout = false;
    var restart_tries = 0;
    var restart_url_base;
    var restart_url_proto;
    var restart_done = false;
    var restart_notified = false;
    var img_list = [];
    var RESTART_MAX_TRIES = 180; // Wait max of 3 minutes for restart
    var PING_INTERVAL = 2000;

    var restart_fail = function(msg) {
        $('.splOverlay').hide();
        $('#restartstatus').hide();
        $('#statusmsg').hide();
        Splunk.Messenger.System.getInstance().send('error', 'restart_server', msg);
    };

    var restart_succeeded = function() {
        if (!restart_notified) {
            restart_notified = true;
            alert(_('Restart successful - click OK to log back into Splunk'));
            var bounce_url;
            if (return_to) {
                bounce_url = restart_url_base + Splunk.util.make_full_url('/account/login', { return_to: return_to });
            } else {
                bounce_url = restart_url_base + Splunk.util.make_url('/');
            }
            window.location.href = bounce_url;
        }
        return;
    };

    var restart_in_progress = function() {
        $('.splOverlay').show();
        $('#statusmsg').hide();
        $('#restartstatus').show();
    };

    var restart_ssl_notice = function() {
        $('.splOverlay').show();
        $('#statusmsg').hide();
        $('#restartsslwarn').show();
        $('#restartsslwarn a').attr('href', restart_url_base + Splunk.util.make_url('/'));
    };

    /**
    * Track when the current instance of the appserver was started; if it changes then
    * the restart has finished.
    */
    var restart_check_status = function () {
        if (restart_done)
            return;

        if(restart_tries++ >= RESTART_MAX_TRIES) {
            return restart_fail(_('Timed out waiting for restart'));
        }

        $.ajax({
            type: 'GET',
            dataType: 'json',
            cache: false,
            url: restart_url_base + Splunk.util.make_url('/api/config/UI_UNIX_START_TIME'),
            success: function(data) {
                if (data.start_time > start_time) {
                    restart_done = true;
                    clearTimeout(restart_timeout);
                    return restart_succeeded();
                }
            }
        });
        // if the script fails to load (ie. because splunkweb is still down)
        // jquery won't give us an error; instead nothing will happen hence we
        // need to refire the poll
        restart_timeout = setTimeout(restart_check_status, PING_INTERVAL);
    };

    var restart_img_loaded = function() {
        restart_done = true;
        clearTimeout(restart_timeout);
        restart_succeeded();
    };

    /**
    * Img checking works better than timestamp checking if the protocol has been changed
    */
    var restart_check_status_img = function() {
        if (restart_done) {
            return;
        }
        var im = new Image();
        im.onload = restart_img_loaded;
        im.src = restart_url_base + Splunk.util.make_url('/config/img?proto='+restart_url_proto+'&_='+ Math.random());
        img_list.push(im);
        restart_timeout = setTimeout(restart_check_status_img, PING_INTERVAL);
    };

    /*
     * TODO ahebert: confirm dialogs should not be used at all. See SPL-124596.
     * As this page might be backbonified soon, leave it as is for now.
     */
    if (!confirm(_("Are you sure you want to restart Splunk?")))
        return false;

    restart_in_progress();
    $.post(Splunk.util.make_url('/api/manager/control'), {operation: 'restart_server'}, function(data) {
        if (data.status=='OK') {
            start_time = data.start_time;

            if (data.ssl == 'window') data.ssl = window.location.protocol == 'https:';

            restart_url_proto = data.ssl ? 'https' : 'http';
            restart_url_base = (data.ssl ? 'https://' : 'http://') + window.location.hostname + (data.port==80 || (data.ssl && data.port==443) ? '' : ':'+data.port);

            // Turn off stuff that continues to try to communicate with the appserver
            Splunk.Logger.mode.Default = Splunk.Logger.mode.None;
            Splunk.Messenger.System.getInstance().abortRequests = true;

            // Send a signal to stop all the pollers
            Splunk.Session.getInstance().signalRestart();

            restart_tries = 0;
            var current_port = window.location.port || (window.location.protocol=='http:' ? 80 : 443);
            var current_ssl = window.location.protocol == 'https:';
            if ((!current_ssl && data.ssl) || (data.ssl && current_port!=data.port)) {
                // Switching into SSL or changing ports with SSL enabled can cause problems if the browser doesn't accept the new cert
                // (ie. a self signed, or untrusted cert is in use which is a common case)
                return restart_ssl_notice();
            }
            if (data.ssl!=current_ssl || current_port!=data.port) {
                restart_check_status_img();
            } else {
                restart_check_status();
            }
            return restart_in_progress();
        } else if (data.status == 'PERMS') {
            return restart_fail(_('Permission Denied - You are not authorized to restart the server'));
        } else if (data.status == 'AUTH') {
            return restart_fail(_('Restart failed'));
        } else if (data.status == 'FAIL') {
            return restart_fail(_('Restart failed: '+data.reason));
        } else {
            return restart_fail(_('Restart failed'));
        }
    }, 'json');
    return false;
}


/**
 * Request a resync of the authentication system
 */
function resync_auth() {
    var msg = Splunk.Messenger.System.getInstance();
    msg.send('info', 'resync_auth', _('Syncing..'));
    $.ajax({
        type: 'POST',
        data: {operation: 'resync_auth'},
        dataType: 'text',
        cache: false,
        url: Splunk.util.make_url('/api/manager/control'),
        success: function(data) {
            if (data.substr(0,2)=='OK') {
                msg.send('info', 'resync_auth', _('Authentication synched successfully.'));
                /*jshint -W066:false */
                setTimeout("window.location.reload();", 1000);
                /*jshint -W066:true */
            } else if(data.substr(0,4)=='AUTH') {
                msg.send('error', 'resync_auth', _('Synch failed - authentication rejected - Log in again to retry.'));
            } else if(data.substr(0,5)=='PERMS') {
                msg.send('error', 'resync_auth', _('Permission denied. You are not authorized to reload the authentication system'));
            } else {
                msg.send('error', 'resync_auth', _('Synch failed: ')+data);
            }
        },
        error: function() {
            msg.send('error', 'resync_auth', _('Failed to contact server'));
        }
    });
}


///////////////////////////////////////////////////////////////////////////////
// Global event handlers
///////////////////////////////////////////////////////////////////////////////

$(function(){
    // because minification can be on or off, may be doubly-bound
    $('a.aboutLink').unbind('click');

    $('a.aboutLink').click(function(event) {
        Splunk.Popup.AboutPopup($('.aboutPopupContainer'));
    });
});
