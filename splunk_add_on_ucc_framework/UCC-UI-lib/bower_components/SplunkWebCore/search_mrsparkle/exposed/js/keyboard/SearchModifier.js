define(["underscore"], function(_) {
    /**
     * A lil utility to translate modifier keys pressed to a search action (negate and/or replace)
     * Finds the best match of modifier key bindings based on navigator.userAgent.
     * Merges custom and defaults members and peforms reverse iteration where the lowest index 
     * custom entry takes highest precedent and defaults takes lowest.
     */
    function Modifier(options) {
        options || (options = {});
        var defaults = options.defaults || _.extend({}, Modifier.defaults),
            custom = options.custom || _.extend([], Modifier.custom);
        this.map = this.parse(defaults, custom);
    }
    Modifier.prototype = {
        isNegation: function(e) {
            return !!e[this.map.negate];
        },
        isReplacement: function(e) {
            return !!e[this.map.replace];
        },
        parse: function(defaults, custom) {
            var userAgent = navigator.userAgent || "",
                modifierMatch = null;
            for (var i=custom.length-1; i>-1; i--) {
                var modifier = custom[i];
                if (userAgent.search(modifier.userAgentRex)!=-1) {
                    modifierMatch = modifier;
                }
            }
            if(!modifierMatch) {
                modifierMatch = defaults;
            }
            return modifierMatch;
        }
    };
    Modifier.custom = [
        {"userAgentRex": /Macintosh/, "negate": "altKey", "replace": "metaKey"},//note: FF altKey+metaKey and click results in hand only possible negate/replace combo is shiftKey+metaKey or shiftKey+altKey.
        {"userAgentRex": /Linux.*Chrome/, "negate": "ctrlKey", "replace": "shiftKey"},
        {"userAgentRex": /Linux/, "negate": "ctrlKey", "replace": "metaKey"},
        {"userAgentRex": /Windows/, "negate": "altKey", "replace": "ctrlKey"}
    ];
    Modifier.defaults = {"userAgentRex": /.*/, "negate": "altKey", "replace": "metaKey"};
    return Modifier;
});
