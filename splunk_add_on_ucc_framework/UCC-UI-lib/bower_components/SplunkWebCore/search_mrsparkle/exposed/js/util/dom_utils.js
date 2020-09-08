define(
    [],
    function() {
        
        //see: http://stackoverflow.com/questions/512528/set-cursor-position-in-html-textbox
        //submission by mcpDESIGNS
        var setCaretPosition = function(el, caretPos) {
            if (el) {
                el.value = el.value;
                // ^ this is used to not only get "focus", but
                // to make sure we don't have it everything -selected-
                // (it causes an issue in chrome, and having it doesn't hurt any other browser)

                if (el.createTextRange) {
                    var range = el.createTextRange();
                    range.move('character', caretPos);
                    range.select();
                    return true;
                } else {
                    // (el.selectionStart === 0 added for Firefox bug)
                    if (el.setSelectionRange && (el.selectionStart || el.selectionStart === 0)) {
                        el.focus();
                        el.setSelectionRange(caretPos, caretPos);
                        return true;
                    } else { // fail city, fortunately this never happens (as far as I've tested) :)
                        el.focus();
                        return false;
                    }
                }
            }
            
            return false;
        };
        
        //see: http://stackoverflow.com/questions/2897155/get-cursor-position-within-an-text-input-field
        //sbumission by Max
        var getCaretPosition = function(el) {
            var caretPos, selection;
            
            if (el) {
                if (el.selectionStart || el.selectionStart === 0) {
                    caretPos = el.selectionStart;
                } else if (document.selection) {
                    // IE Support
                    el.focus();
                    selection = document.selection.createRange();
                    selection.moveStart('character', -el.value.length);
                    caretPos = selection.text.length;
                }
            }
            
            return caretPos;
        };
        
        var supportsNativePlaceholder = function() {
            return ('placeholder' in document.createElement('input'));
        };
        
        return {
            setCaretPosition: setCaretPosition,
            getCaretPosition: getCaretPosition,
            supportsNativePlaceholder: supportsNativePlaceholder
        };        
    }
);