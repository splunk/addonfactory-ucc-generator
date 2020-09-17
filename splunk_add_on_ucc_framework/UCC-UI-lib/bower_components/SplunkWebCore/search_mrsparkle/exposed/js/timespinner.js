/**
 *   Splunk.TimeSpinner
 *
 *   Desc:
 *      This class sets up a time spinner widget.  Restricts input to numbers, left/right keys navigate and block highlight.  
 *          TODO:  add up/down scrolling of numbers 
 *
 *   @param {Object} el A jQuery element reference to the element to set up the timespinner in
 *   @param {Object} (Optional) options An optional object literal having non-required settings.
 *
 *    Usage:
 *       var t = new Splunk.TimeSpinner($('.myElement'), { options array })
 *
 *    Options:
 *        
 *      
 *    Methods:
 *        there are no intentionally public methods
 */

Splunk.TimeSpinner = $.klass({
    initialize: function(el, options){
        this.logger = Splunk.Logger.getLogger("timespinner.js");
        
        if ( !el ) {
            this.logger.error('Splunk.TimeSpinner: No container element specified');
        } else {
            this.wrapperEl = $(el);
        
            //defaults
            this._options = {
                hours: '00',
                minutes: '00',
                seconds: '00',
                milliseconds: '000'    
            };
            
            // Set the options using the defaults
            if (options) $.extend(this._options, options);
            
            // create dom
            this._createDom();
            
            // initialize jquery ui spinner on each input
            this._initializeSpinners();         
        }
    },
    _createDom: function() {
        var tsHtml = $("<div class='TimeSpinner'></div>");
        
        var hours = $("<input class='hours tsInput' />").attr('value',this._options['hours']);
        var minutes = $("<input class='minutes tsInput' />").attr('value',this._options['minutes']);
        var seconds = $("<input class='seconds tsInput' />").attr('value',this._options['seconds']);
        var milliseconds = $("<input class='milliseconds tsInput' />").attr('value',this._options['milliseconds']);
        
        tsHtml.append(hours)
            .append("<div class='colon'>:</div>")
            .append(minutes)
            .append("<div class='colon'>:</div>")
            .append(seconds)
            .append("<div class='colon'>.</div>")       	
            .append(milliseconds);	
    
        this.wrapperEl.append(tsHtml);
    },
    _initializeSpinners: function() {

        var context = this;
        
        // set up event handlers
        $('input', this.wrapperEl).each(function(){
            var padding = $(this).val().length;
            $(this)
                .bind('keyup', function(e){ 
                    context._keyup(e, this, padding); 
                })
                .bind('keydown', function(e){ 
                    return context._keydown(e, this, padding); 
                })
                .bind('click', function(){
                    $(this).focus();
                    $(this).select();
                }).bind('focus', function(){
                    var reference = this;
                    setTimeout(function(){$(reference).select();}, 0); // using a blank setTimeout fixes incorrect behavior in Safari
                }).bind('blur', function() {
                    context._formatEntry(this, padding);
                });

        });
    },
    _getCaretPosition: function(ctrl){
        var CaretPos = 0;
        // IE Support
        if (document.selection) {
            ctrl.focus ();
            var Sel = document.selection.createRange();
            var SelLength = document.selection.createRange().text.length;
            Sel.moveStart ('character', -ctrl.value.length);
            CaretPos = Sel.text.length - SelLength;
        }
        // Firefox support
        else if (ctrl.selectionStart || ctrl.selectionStart == '0')
            CaretPos = ctrl.selectionStart;
    
        return (CaretPos);
    },
    _setCaretPosition: function(elem, caretPos){
        elem = $(elem)[0];
                
        if(elem != null) {
            if(elem.createTextRange) {
                var range = elem.createTextRange();
                range.move('character', caretPos);
                range.select();
            } else {
                if(elem.selectionStart) {
                    elem.focus();
                    elem.setSelectionRange(caretPos, caretPos);
                } else 
                    elem.focus();
            }
        }
    }, 
    _keydown: function(e, el, padding) {  
        if ( (e.keyCode >= 96 && e.keyCode <= 105) ||  (e.keyCode >= 48 && e.keyCode <= 57)  ) {
            if ( $(el).val().length >= padding && !this._isTextHighlighted($(el)[0])  ) {
                return false;
            }
        }    
        return true;
    },
    _keyup: function(e, el, padding) {  
        // do nothing if key is tab or shift + tab - fix for SPL-40514
        if (e.keyCode == 9 || e.keyCode == 16) {
            return;
        }
        if ( e.keyCode == $.ui.keyCode.RIGHT || e.keyCode == $.ui.keyCode.LEFT ) {
            var len = $(el).val().toString().length;
            var carPos = this._getCaretPosition(el);
            var nextInput;
 
            if ( (e.keyCode == $.ui.keyCode.RIGHT) && (carPos == len) && !$(el).is('.milliseconds') ) {
                $(el).blur();
                nextInput = $('input', this.wrapperEl).eq( $('input', this.wrapperEl).index(el) + 1);
                nextInput.focus();
            } else if ( (e.keyCode == $.ui.keyCode.LEFT) && (carPos == 0) && !$(el).is('.hours') ) {
                $(el).blur();
                nextInput = $('input', this.wrapperEl).eq( $('input', this.wrapperEl).index(el) - 1);
                nextInput.focus();
            }                     
        } else if ( (e.keyCode >= 96 && e.keyCode <= 105) ||  (e.keyCode >= 48 && e.keyCode <= 57)  ) {
            // it's numeric, so make sure this won't put us over length. if so, only leave the first x digits (they most likely repeated digits).  
            if ( $(el).val().length > padding ) {
                $(el).val($(el).val().substr(0,2));
            }
        } else {
            // as a last check, strip out anything that isn't a number if it got by
            $(el).val($(el).val().replace(/[^0-9]/g,''));
        }
    },   
    _formatEntry: function(el, padding) {
        // double check numeric
        $(el).val($(el).val().replace(/[^0-9]/g,''));
        var result = $(el).val();
        while (padding && (result.length < padding)) {
			result = '0' + result;
		}
		$(el).val(result);
    },
    disable: function() {
        this.wrapperEl.addClass('tsDisabled').find('input').attr('disabled','disabled');
    },
    enable: function() {
        this.wrapperEl.removeClass('tsDisabled').find('input').removeAttr('disabled');
    },
    _isTextHighlighted: function(ctrl) {
        // IE Support
        if (document.selection) {
            ctrl.focus();
            var Sel = document.selection.createRange();
            var SelLength = document.selection.createRange().text.length;
            
            if ( SelLength > 0 ) {
                return true;
            }
        }
        // Firefox support
        else if (ctrl.selectionStart != ctrl.selectionEnd) {
            return true;
        }
        
        return false;
    }   
   
});

























