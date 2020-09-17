define(['jquery', 'underscore'], function($, _) {
    var keyboard = {};

    keyboard.KEYS = {
        BACKSPACE:     8,
        TAB:           9,
        ENTER:        13,
        SHIFT:        16,
        CONTROL:      17,
        ALT:          18,
        CAPS_LOCK:    20,
        ESCAPE:       27,
        SPACE_BAR:    32,
        PAGE_UP:      33,
        PAGE_DOWN:    34,
        END:          35,
        HOME:         36,
        LEFT_ARROW:   37,
        UP_ARROW:     38,
        RIGHT_ARROW:  39,
        DOWN_ARROW:   40,
        DELETE:       46,
        UPPERCASE_F:  70,
        LEFT_META:    91,
        RIGHT_META:   92,
        LOWERCASE_F: 102,
        PERIOD:      110,
        NUM_LOCK:    144,
        SCROLL_LOCK: 145,
        DECIMAL:     190
    };

    /**
     * A helper method that will enforce circular tabbing inside the given container (i.e. tabbing from the last element
     * will wrap around to the first element and reverse tabbing from the first element will wrap around to the last).
     *
     * Will only set focus on the next element if the event's target is inside the container, and if it does, will
     * prevent the default action of the event.
     *
     * @param $container (jQuery object) the container that should enforce the circular tabbing
     * @param event (DOM event object) the keydown event that initiated the tabbing action
     * @returns (jQuery object) the element that was focused, or null if no element was focused
     */
    keyboard.handleCircularTabbing = function($container, event, includeContainer) {
        var tabbableSelectors = 'a[href]:not(.synthetic-select):not(.disabled), area[href], input:not([disabled]),' +
                                'select:not([disabled]), textarea:not([disabled]),' +
                                        'button:not([disabled]), iframe, object, embed, *[tabindex],' +
                                '*[contenteditable]',
            tabbableElements = $();


        // Support an array of containers instead of just one
        if (_.isArray($container)) {
            var containers = $container;
            _.each(containers, function($el) {
                tabbableElements = tabbableElements.add($el.find(tabbableSelectors));
            });
        } else {
            tabbableElements = $container.find(tabbableSelectors);
        }

        if (includeContainer) {
            tabbableElements = tabbableElements.add($container);
        }

        tabbableElements = _.chain(tabbableElements).uniq()
            .filter(function(el) {
                var $el = $(el);
                return $el.is(':visible') && $el.css('visibility') !== 'hidden';
            })
            .value();

        var firstElement = tabbableElements[0],
            lastElement = tabbableElements[tabbableElements.length - 1];

        if(_.contains(tabbableElements, event.target)) {
            event.preventDefault();
            if(event.target === lastElement && !event.shiftKey) {
                return $(firstElement).focus();
            }
            if(event.target === firstElement && event.shiftKey) {
                return $(lastElement).focus();
            }
            if(event.shiftKey) {
                return $(tabbableElements[_.indexOf(tabbableElements, event.target) - 1]).focus();
            }
            return $(tabbableElements[_.indexOf(tabbableElements, event.target) + 1]).focus();
        }
        return null;
    };
    
    keyboard.isNumber = function(keyCode) {
        // 0-9 Main Keyboard or Numeric Keypad
        return ((keyCode >= 48 && keyCode <= 57) || (keyCode >= 96 && keyCode <= 105));
    };
    
    keyboard.isDecimal = function(keyCode) {
        // Period (Main Keyboard) or Decimal (Numeric Keypad)
        return (keyCode === keyboard.KEYS.PERIOD || keyCode === keyboard.KEYS.DECIMAL);
    };
    
    keyboard.isMinus = function(keyCode) {
        switch (keyCode) {
            case 109: //substract on numpad
            case 173: //hyphen FF - note this is used for mute/unmute on other browsers, so it's not 100%, but it's unlikely to cause issues.
            case 189: //hyphen other browsers
                return true;
            default:
                return false;
        }
    };
    
    keyboard.isNumeric = function(keyCode) {
        return keyboard.isNumber(keyCode) || keyboard.isDecimal(keyCode) || keyboard.isMinus(keyCode);
    };
    
    keyboard.addsText = function(keyCode) {
        //Note, this applies to text fields, where enter and tab characters are not entered
        switch (keyCode) {
            case keyboard.KEYS.ENTER:
            case keyboard.KEYS.SHIFT:
            case keyboard.KEYS.CONTROL:
            case keyboard.KEYS.ALT:
            case keyboard.KEYS.LEFT_META:
            case keyboard.KEYS.RIGHT_META:
            case keyboard.KEYS.UP_ARROW:
            case keyboard.KEYS.DOWN_ARROW:
            case keyboard.KEYS.LEFT_ARROW:
            case keyboard.KEYS.RIGHT_ARROW:
            case keyboard.KEYS.PAGE_DOWN:
            case keyboard.KEYS.PAGE_UP: 
            case keyboard.KEYS.TAB:
            case keyboard.KEYS.BACKSPACE:
            case keyboard.KEYS.DELETE:
            case keyboard.KEYS.ESCAPE:
            case keyboard.KEYS.NUM_LOCK:
            case keyboard.KEYS.SCROLL_LOCK:
            case keyboard.KEYS.CAPS_LOCK:
            case keyboard.KEYS.PAGE_UP:
            case keyboard.KEYS.PAGE_DOWN:
            case keyboard.KEYS.END:
            case keyboard.KEYS.HOME:
                return false;
        }
        
        //Function Keys: F1 to F19
        if (keyCode >= 112 && keyCode <= 130) {
            return false;
        }
        
        //DEFAULT
        return true;
    };

    return keyboard;
});