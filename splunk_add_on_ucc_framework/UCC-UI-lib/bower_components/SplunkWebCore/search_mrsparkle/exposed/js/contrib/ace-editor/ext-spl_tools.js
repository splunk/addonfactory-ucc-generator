ace.define("ace/spl_autocomplete", ["require","exports","module","ace/autocomplete","ace/keyboard/hash_handler","ace/autocomplete/popup","ace/autocomplete/util","ace/lib/event","ace/lib/lang","ace/lib/dom","ace/snippets"], 
function(require, exports, module) {
    "use strict";

    var Autocomplete = require("./autocomplete").Autocomplete,
        FilteredList = require("./autocomplete").FilteredList,
        oop = require("./lib/oop"),
        lang = require("./lib/lang"),
        event = require("./lib/event"),
        keys = require("./lib/keys"),
        snippetManager = require("./snippets").snippetManager;

    var SplAutocomplete = function() {
        Autocomplete.apply(this, arguments);

        this.autoSelect = false;
        this.changeTimer = lang.delayedCall(function(){
            this.updateCompletions(false);
            // SPL-121377: After completion list gets updated, set updating to false.
            this.updating = false; 
        }.bind(this), 200);

        this.delayedDetach = lang.delayedCall(this.detach.bind(this), 200);
        event.addMouseWheelListener(document.body, this.delayedDetach);
        event.addListener(document.body, 'mousedown', this.delayedDetach);
    };

    oop.inherits(SplAutocomplete, Autocomplete);

    (function(){
        var clonedCommands = {};
        oop.mixin(clonedCommands, Autocomplete.prototype.commands);

        this.commands = oop.mixin(clonedCommands, {
            "Tab": function(editor) {
                if (editor.completer.tooltipNode) {
                    editor.completer.tooltipNode.focus();
                }
            },
            Esc : function(editor) { 
                editor.completer.detach();
                $(editor.textInput.getElement()).one('keyup', function(e) {
                    if (e.keyCode === 27) {
                        event.stopEvent(e);
                    }
                });
            }
        });

        this.showPopup = function(editor) {
            // User can disable extra tooltip by set editor's extraTooltipForAutoCompletion as false.
            // Then this.handleExtraTooltip will be set as undefined eventually.
            this.handleExtraTooltip = editor.handleExtraTooltip;

            Autocomplete.prototype.showPopup.apply(this, arguments);
        },

        this.$init = function() {
            this.popup = Autocomplete.prototype.$init.apply(this, arguments);

            // Overrides the cursor style default set in the init.
            this.popup.renderer.content.style.cursor = "pointer";

            // Enable syntax highlighting for popup.
            if (this.editor.syntaxHighlightingForAutoCompletion) {
                this.popup.renderer.setStyle("highlighted");
            }
            
            // Overrides show method to adjust popup position.
            var originalShow = this.popup.show.bind(this.popup);
            this.popup.show = function(pos, lineHeight, topdownOnly) {
                lineHeight = 36; // Search bar height
                topdownOnly = true;
                pos.left += 1;
                originalShow(pos, lineHeight, topdownOnly);
            };
            
            // Overrides background tokenizer's $tokenizeRow to 
            // highlight syntax and matched texts.
            var bgTokenizer = this.popup.session.bgTokenizer;
            bgTokenizer.$tokenizeRow = function(row) {
                var data = this.popup.data[row],
                    tokens = [],
                    tokensWithMatched = [];

                if (!data) {
                    return tokens;
                }

                data.caption = data.value;

                var editorBgTokenizer = this.editor.session.bgTokenizer,
                    startState = "start";

                if (data.type === "next" || data.type === "command") {
                    startState = "command";
                } else if (data.type === "commandArgs") {
                    startState = data.command.name + "-command";
                }

                tokens = editorBgTokenizer.tokenizer.getLineTokens(data.caption, startState).tokens,
                tokensWithMatched = addMatchedTokens(data, tokens);
                tokens = trimCaptionAndTokens(this.popup, data, tokensWithMatched);

                if (data.meta) {
                    tokens.push({type: "rightAlignedText", value: data.meta});
                }
                return tokens;
            }.bind(this);

            this.popup.on("hide", function(){
                this.handleExtraTooltip && this.handleExtraTooltip();
            }.bind(this));
            
            var mouseTarget = this.popup.renderer.getMouseEventTarget();
            event.addListener(mouseTarget, "mouseout", function() {
                this.handleExtraTooltip && this.handleExtraTooltip();
            }.bind(this));

            event.addMouseWheelListener(this.popup.container, function(e) {
                // SPL-122770: prevent default scrolling behaviour from browser
                event.stopEvent(e);
            });

            return this.popup;
        };

        this.insertMatch = function(data, options) {
            if (this.updating) {
                return;
            }

            data = data? data: this.popup.getData(this.popup.getRow());
            if (!data) {
                return false;
            }

            if (data.completer && data.completer.insertMatch) {
                data.completer.insertMatch(this.editor, data);
            } else {
                if (this.completions.filterText) {
                    // TODO: This part can be improved
                    var ranges = this.editor.selection.getAllRanges(),
                        rangeLength = ranges.length,
                        i = 0,
                        range;
                    for (i = 0; i < rangeLength; i++) {
                        range = ranges[i];
                        range.start.column -= this.completions.filterText.length;
                        this.editor.session.remove(range);
                    }
                }

                if (data.snippet) {
                    snippetManager.insertSnippet(this.editor, data.snippet);
                } else if (data.value){
                    this.editor.execCommand("insertstring", data.value);
                }
            }

            if (!data.completer ||
                (data.completer && !data.completer.keepPopupAfterInsert)) {
                this.detach();
            } else {
                // SPL-121377: If the selected item has keepPopupAfterInsert flag set to true,
                // popup will stay and get updated after the insertion. 
                // Set an updating flag to true to avoid any insertMatch call before it gets updated. 
                this.updating = true;
            }
        };

        this.updateDocTooltip = function() {
            var popup = this.popup,
                all = popup.data,
                row = popup.getHoveredRow() >= 0? popup.getHoveredRow() : popup.getRow(),
                selected = all && all[row],
                first = all && all[0],
                doc = null;

            if (this.handleExtraTooltip) {
                this.handleExtraTooltip(popup, row);
            }

            // updateDocTooltip is called in a delayed function (this.tooltipTimer). 
            // There are cases, like the binded editor gets reset or popup is closed,
            // happens before this one gets called.
            if (!this.editor || !popup.isOpen) {
                return this.hideDocTooltip();
            }

            // Show tooltip if the first option belongs to 'command' type or next command.
            if (!selected && first && (first.type.indexOf("command") !== -1 || 
                first.type === "next" )) {
                this.editor.completers.some(function(completer) {
                    if (completer.getDocTooltip) {
                        doc = completer.getDocTooltip(first);
                    }
                    return doc;
                });

                doc = doc? doc: first;
                if (doc.docHTML) {
                    return this.showDocTooltip(doc);
                } else {
                    return this.hideDocTooltip();
                }
            }

            if (!selected || selected.hideDocTooltip) {
                this.hideDocTooltip();
            } else {
                Autocomplete.prototype.updateDocTooltip.apply(this, arguments);
            }
        };

        this.showDocTooltip = function(item) {
            Autocomplete.prototype.showDocTooltip.apply(this, arguments);

            // Change poistion
            var tooltipNode = this.tooltipNode,
                rect = this.popup.container.getBoundingClientRect();

            tooltipNode.style.width = rect.width + "px";
            tooltipNode.style.top = (rect.bottom - 1) + "px";
            tooltipNode.style.left = this.popup.container.style.left;
            tooltipNode.style.right = this.popup.container.style.right;

            event.addListener(tooltipNode, 'focus', function(e) {
                // focus to the first link element
                var linkElements = tooltipNode.getElementsByTagName('a'); 
                if (linkElements.length > 0) {
                    linkElements[0].focus();
                } else {
                    this.editor.focus();
                    event.stopEvent(e);
                }
            }.bind(this));

            event.addListener(tooltipNode, 'keydown', function(e){
                switch (keys.keyCodeToString(e.keyCode)) {
                    case "tab":
                        this.editor.focus();
                        event.stopEvent(e);
                        break;
                    case "up":
                    case "down":
                    case "right":
                    case "left":
                        event.stopEvent(e);
                        break;
                    default:
                        break;
                }
            }.bind(this));

            event.addListener(tooltipNode, 'mousedown', function(e) {
                event.stopEvent(e);
            });

            event.addMouseWheelListener(tooltipNode, function(e) {
                event.stopEvent(e);
            });
        };

        this.blurListener = function(e) {
            // editor.textInput and tooltipNode both bind with this listener.
            // If focus is on the nodes inside tooltipNode. We dont't do anything.

            if (e.relatedTarget && this.tooltipNode && this.tooltipNode.contains(e.relatedTarget)) {
                return;
            }

            // SPL-121466: firefox currently doesn't support relatedTarget. 
            // e.relatedTarget will always be null.
            // Add a timer to check the focused element.
            setTimeout(function (e) {
                var relatedTarget = document.activeElement;
                if (!(relatedTarget && this.tooltipNode && this.tooltipNode.contains(relatedTarget))) {
                    Autocomplete.prototype.blurListener.apply(this, arguments);
                }
            }.bind(this, e));
        };

        function addMatchedTokens (data, tokens) {
            var matchedIndexArray = !data.matchMask ? [] : data.matchMask.split(" ").map(function(matchedIndex) {
                return parseInt(matchedIndex, 10);
            });

            if (!matchedIndexArray.length) {
                return tokens;
            }

            var token,
                value,
                start = 0, // start index of token
                end = 0, // end index of token
                index = 0, // index of matched text
                i = 0,
                j = 0,
                last = 0, // index of previous matched text
                firstTime = true, // first time touch of token
                tokensWithMatched = [];

            for (i = 0; i < tokens.length; i++) {
                token = tokens[i];

                if (j === matchedIndexArray.length) {
                    tokensWithMatched.push(token);
                    continue;
                }

                end = (start + token.value.length - 1);
                last = null;
                firstTime = true;

                while (j < matchedIndexArray.length) {
                    index = matchedIndexArray[j];

                    if (index === start) {
                        tokensWithMatched.push({value: token.value[0], type: token.type + '.matched-highlight'});
                        firstTime = false;
                    } 
                    else if (index > start && index <= end) {
                        value = token.value[index - start];
                        if (firstTime) {
                            tokensWithMatched.push({value: token.value.substring(0, index - start), type: token.type});
                            tokensWithMatched.push({value: value, type: token.type + '.matched-highlight'});
                            firstTime = false;
                        } else {
                            // Last index and the current index are not connected in this token.
                            if (index - last > 1) {
                                tokensWithMatched.push({value: token.value.substring(last + 1, index), type: token.type});
                                tokensWithMatched.push({value: value, type: token.type + '.matched-highlight'});
                            } else {
                                tokensWithMatched[tokensWithMatched.length - 1].value += value;
                            }
                        }
                    } 
                    // index is not in this token
                    else if (index > end) {
                        if (firstTime) {
                            tokensWithMatched.push(token);
                        } else if (last !== end) {
                            // Need put the rest text of this token into the tokensWithMatched
                            tokensWithMatched.push({value: token.value.substring(last - start + 1), type: token.type});
                        }
                        start += token.value.length;
                        break;
                    }

                    // If this is the last matched index. Make sure the rest text of this token are put into the tokensWithMatched.
                    if ( (j + 1) === matchedIndexArray.length && index != end) {
                        tokensWithMatched.push({value: token.value.substring(index - start + 1), type: token.type});
                    }

                    j++;
                    last = index;
                }
            }
            return tokensWithMatched;
        }

        function trimCaptionAndTokens (popup, data, tokens) {
            // The approximate length of texts can be filled into each line
            var maxW = Math.floor((popup.renderer.$size.scrollerWidth / popup.renderer.layerConfig.characterWidth) + 6);
            if (data.meta) {
                maxW = maxW - data.meta.length;
            }

            if (data.caption.length <= maxW) {
                return tokens;
            }

            var caption = data.caption,
                midpoint = 0,
                toremove = 0,
                lstrip = 0,
                rstrip = 0;
           
            midpoint = Math.ceil(caption.length / 2);
            toremove = caption.length - maxW;
            lstrip = Math.ceil(toremove/2);
            rstrip = toremove - lstrip;
            lstrip = midpoint - lstrip - 1;
            rstrip = midpoint + rstrip;

            data.caption = caption.substring(0, lstrip + 1) + "\u2026" + caption.substring(rstrip);

            var token,
                start = 0, // start index of token
                end = 0, // end index of token
                trimmedTokens = [];
            
            for (var i = 0; i < tokens.length; i++) {
                token = tokens[i];
                end = start + token.value.length - 1;

                // token in the left side of lstrip point, or in the right side of rstrip point
                if (lstrip > end || start > rstrip) {
                    trimmedTokens.push(token);
                    start += token.value.length;
                    continue;
                }

                // check if lstrip point is within the token and also rstrip point
                if (start > lstrip && end < rstrip) {
                    start += token.value.length;
                    continue;
                }
                // Both lstrip and rstrip are in the same token
                if (lstrip >= start && rstrip <= end) {
                    trimmedTokens.push({value: token.value.substring(0, lstrip - start + 1), type: token.type});
                    trimmedTokens.push({value: "\u2026", type:""});
                    trimmedTokens.push({value: token.value.substring(rstrip - start), type: token.type});
                } 
                // Only lstrip in the token
                else if (lstrip >= start && lstrip <= end) {
                    trimmedTokens.push({value: token.value.substring(0, lstrip - start + 1), type: token.type});
                    trimmedTokens.push({value: "\u2026", type:""});
                } 
                // Only rstrip in the token
                else if (rstrip >= start && rstrip <= end) {
                    trimmedTokens.push({value: token.value.substring(rstrip - start), type: token.type});
                }

                start += token.value.length;
            }
            return trimmedTokens;
        }


    }).call(SplAutocomplete.prototype);

    SplAutocomplete.startCommand = {
        name: "startSplAutocomplete",
        exec: function(editor) {
            if (!editor.completer) {
                editor.completer = new SplAutocomplete();
            }
            editor.completer.autoInsert = false;
            editor.completer.autoSelect = false;
            editor.completer.showPopup(editor);
            editor.completer.cancelContextMenu();
        },
        bindKey: "Ctrl-Space|Ctrl-Shift-Space|Alt-Space"
    };

    
    (function() {
        var priorites = {
            "commandArgs": 1,
            "command" : 2,
            "next": 3,
            "term": 4,
            "search": 5
        };
        // Overrides setFilter method to compare priorities
        // and values for sorting.
        this.setFilter = function(str) {
            var matches = this.all;
            if (str.length > this.filterText && str.lastIndexOf(this.filterText, 0) === 0) {
                matches = this.filtered;
            }

            this.filterText = str;
            matches = this.filterCompletions(matches, this.filterText);
            matches = matches.sort(function(a, b) {
                var result =  b.exactMatch - a.exactMatch || b.score - a.score ;
                if (result === 0 && a.type && b.type) {
                    result = priorites[a.type] - priorites[b.type];
                }
                if (result === 0) {
                    result = (a.value === b.value) ? 0 : ((a.value < b.value) ? -1 : 1); 
                }
                return result;
            });

            var prev = null;
            matches = matches.filter(function(item){
                var caption = item.snippet || item.caption || item.value;
                if (caption === prev) return false;
                prev = caption;
                return true;
            });

            this.filtered = matches;
        };

        // Overrides filterCompletions to use an another way 
        // to store the indexes of matched elements.
        this.filterCompletions = function(items, needle) {
            var results = [],
                upper = needle.toUpperCase(),
                lower = needle.toLowerCase();

            loop: for (var i = 0, item; item = items[i]; i++) {
                var caption = item.value || item.caption || item.snippet;
                if (!caption) continue;
                var lastIndex = -1,
                    matchMask = "",
                    matched = [],
                    penalty = 0,
                    index, distance;

                if (this.exactMatch) {
                    if (needle !== caption.substr(0, needle.length))
                        continue loop;
                }else{
                    for (var j = 0; j < needle.length; j++) {
                        var i1 = caption.indexOf(lower[j], lastIndex + 1),
                            i2 = caption.indexOf(upper[j], lastIndex + 1);
                        index = (i1 >= 0) ? ((i2 < 0 || i1 < i2) ? i1 : i2) : i2;
                        if (index < 0)
                            continue loop;
                        distance = index - lastIndex - 1;
                        if (distance > 0) {
                            if (lastIndex === -1)
                                penalty += 10;
                            penalty += distance;
                        }
                        matched.push(index);
                        lastIndex = index;
                    }
                }
                item.matchMask = matched.join(" ");
                item.exactMatch = penalty ? 0 : 1;
                // Use negative value to indicate the less of the penalty, 
                // the higher of the score.
                item.score = (item.score || 0) - penalty; 
                results.push(item);
            }
            return results;
        };
        
    }).call(FilteredList.prototype);

    exports.SplAutocomplete = SplAutocomplete;
});


ace.define("ace/ext/spl_tools",["require","exports","module", "ace/ext/language_tools","ace/snippets","ace/autocomplete","ace/config","ace/lib/lang","ace/autocomplete/util","ace/autocomplete/text_completer","ace/editor"], 
function(require, exports, module) {
    "use strict";

    /*
        Private variables and functions
    */
    var langTools = require("./language_tools"),
        util = require("../autocomplete/util"),
        SplAutocomplete = require("../spl_autocomplete").SplAutocomplete,
        dom = require("../lib/dom");


    var splLiveAutoComplete = function(e) {
        var editor = e.editor,
            hasCompleter = editor.completer && editor.completer.activated;
        if (e.command.name === "insertstring" ||
            e.command.name === "backspace" ||
            e.command.name === "paste"
            ) {
            var prefix = getCompletionPrefix(editor);
            if (prefix && !hasCompleter) {
                if (!editor.completer) {
                    editor.completer = new SplAutocomplete();
                }
                editor.completer.autoInsert = false;
                editor.completer.showPopup(editor);
            }
        }
    };

    var identifierRegexList = [/[a-zA-Z_0-9=\s\|\$\-\u00A2-\uFFFF]/];
    function getCompletionPrefix(editor) {
        var pos = editor.getCursorPosition(),
            line = editor.session.getLine(pos.row),
            prefix;

        identifierRegexList.forEach(function(identifierRegex) {
            if (!prefix && identifierRegex) {
                prefix = util.retrievePrecedingIdentifier(line, pos.column, identifierRegex);
            }
        });
        return prefix;
    }
    
    /*
        Extend/Override dependencies
    */
    var completers = [
            langTools.textCompleter, 
            langTools.keyWordCompleter,
            langTools.snippetCompleter
        ],
        Editor = require("../editor").Editor;
    require("../config").defineOptions(Editor.prototype, "editor", {
        enableSplLiveAutocompletion: {
            set: function(val) {
                if (val) {
                    if (!this.completers) {
                        this.completers = Array.isArray(val)? val: completers;
                    }
                    this.commands.addCommand(SplAutocomplete.startCommand);
                    this.commands.on('afterExec', splLiveAutoComplete);
                } else {
                    this.commands.removeCommand(SplAutocomplete.startCommand);
                    this.commands.removeListener('afterExec', splLiveAutoComplete);
                }
            },
            value: false
        },
        extraTooltipForAutoCompletion: {
            set: function(val) {
                if (val && typeof val === "function") {
                    this.handleExtraTooltip = val;
                } else {
                    this.handleExtraTooltip = undefined;
                }
            },
            value : false
        },
        syntaxHighlightingForAutoCompletion: {
            set: function(val) {
                this.syntaxHighlightingForAutoCompletion = !val ? false : true;
            },
            value : false
        }
    });
});


(function() {
    ace.require(["ace/ext/spl_tools"], function() {});
})();
           