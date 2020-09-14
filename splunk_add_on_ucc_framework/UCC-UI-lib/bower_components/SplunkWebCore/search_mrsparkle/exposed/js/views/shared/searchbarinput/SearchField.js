define(
    [
        'jquery',
        'underscore',
        'module',
        'ace/ace',
        'views/Base',
        'views/shared/searchbarinput/AutoCompletion',
        'util/keyboard',
        'helpers/Printer'
    ],
    function($, _, module, Ace, Base, AutoCompletion, keyboard_utils, Printer) {
        return Base.extend({
            moduleId: module.id,
            className: function () {
                if ((_.isUndefined(this.options.useSyntaxHighlighting) &&
                        this.model.user && this.model.user.getSearchSyntaxHighlighting())
                    || this.options.useSyntaxHighlighting) {
                    return 'search-field-wrapper highlighted';
                }
                return 'search-field-wrapper';
            },
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
                this._disabled = false;
                if (!this.options.enabled) {
                    this.disable();
                }
                this.activate();
            },
            startListening: function() {
                this.listenTo(Printer, Printer.PRINT_START, this.invalidateReflow);
                this.listenTo(Printer, Printer.PRINT_END, this.invalidateReflow);
                
                this.listenTo(this.model.searchBar, 'searchFieldfocus', this.searchFieldfocus);

                this.listenTo(this.model.searchBar, 'change:search', function() {
                    this.setSearchString(this.model.searchBar.get('search') || "");
                });
                
                this.listenTo(this.model.content, 'applied', function(options) {
                    this.submit(options);
                });
                
                this.listenTo(this.model.content, 'change:' + this.options.searchAttribute, function() {
                    this.setSearchString(this.model.content.get(this.options.searchAttribute) || "");
                });
                
                this.listenTo(this.model.searchBar, 'setCaretPositionToEnd', this.setCaretPositionToEnd);

                this.listenTo(this.model.searchBar, 'reformatSearch', function() {
                    if (this.options.autoFormat && this.editor) {
                        this.reformatSearch(this.editor);
                    }
                });
            },
            
            setupEditorListeners: function() {
                this.editor.on('input', function(e) {
                    this.model.searchBar.set('search', this.editor.getValue());
                }.bind(this));
                
                this.editor.on('focus', function(e) {
                    this.model.searchBar.set('assistantCursor', - 1);
                    $(this.editor.container).addClass('focused');
                }.bind(this));
                
                this.editor.on('blur', function(e) {
                    $(this.editor.container).removeClass('focused');
                    if (this.options.submitOnBlur) {
                        this.submit();
                    }
                }.bind(this));
                
                this.editor.keyBinding.originalOnCommandKey = this.editor.keyBinding.onCommandKey;
                
                //SPL-123019,SPL-125909 - Removing unused keyboard accelerator
                this.editor.commands.removeCommands({
                    "Command-L": "gotoline",
                    "Command-,": "showSettingsMenu",
                    "Ctrl-E": "goToNextError",
                    "Ctrl-Shift-E" : "goToPreviousError"
                });
                
                this.editor.keyBinding.onCommandKey = function(e, hashId, keyCode) {
                    var completer = this.editor.completer,
                        popup = completer && completer.popup;
                    if (!e.metaKey && !e.ctrlKey) {
                        switch (e.keyCode) {
                            case keyboard_utils.KEYS['DOWN_ARROW']:
                                // Left bracket and down arrow register as 40. If the shift key is down, then it must be a bracket.
                                if (this.options.useAssistant && !e.shiftKey) {
                                    if (this.editor.selection.getCursor().row + 1 === this.editor.session.getLength()) {
                                        this.model.searchBar.trigger('openOrEnterAssistant');
                                        e.preventDefault();
                                        return;
                                    }
                                }
                                break;
                            case keyboard_utils.KEYS['ENTER']:
                                if (!(popup && popup.isOpen && popup.getData(popup.getRow()))) {
                                    if (completer) {
                                        completer.detach();
                                    }
                                    if (!e.shiftKey) {
                                        this.submit();
                                        e.preventDefault();
                                        return;
                                    }
                                }
                                break;
                            case keyboard_utils.KEYS['TAB']:
                                if (!(popup && popup.isOpen && popup.getData(popup.getRow()))) {
                                    if (e.shiftKey) {
                                        this.model.searchBar.trigger('closeAssistant');
                                    }
                                    return;
                                }
                                break;
                            default:
                                break;
                        }
                    }
                    if ((e.which === keyboard_utils.KEYS['LOWERCASE_F'] || e.which === keyboard_utils.KEYS['UPPERCASE_F']) &&
                        (e.metaKey || e.ctrlKey) &&
                        (this.editor.session.getLength() === 1 && this.editor.session.getRowWrapIndent() === 0)) {
                        //SPL-123020 Remove find key binding for single line searches.
                        return;
                    }
                    this.editor.keyBinding.originalOnCommandKey(e, hashId, keyCode);
                }.bind(this);

                var reformatCommand = {
                    name: "autoFormat", 
                    bindKey: {win: 'Ctrl-\\', mac: 'Command-\\'},
                    exec: this.reformatSearch.bind(this),
                    readOnly: false
                };

                this.editor.commands.addCommand(reformatCommand);
                
                var update = function() {
                    var shouldShow = !(this.editor.getValue() || "").length;
                    var node = this.editor.renderer.emptyMessageNode;
                    if (!shouldShow && node) {
                        this.editor.renderer.scroller.removeChild(this.editor.renderer.emptyMessageNode);
                        this.editor.renderer.emptyMessageNode = null;
                    } else if (shouldShow && !node) {
                        node = this.editor.renderer.emptyMessageNode = document.createElement("div");
                        node.textContent = _("enter search here...").t();
                        node.className = "ace_invisible ace_emptyMessage";
                        this.editor.renderer.scroller.appendChild(node);
                    }
                }.bind(this);
                this.editor.on("input", update);
                setTimeout(update, 100);
            },
            
            activate: function(options) {
                if (this.active) {
                    return Base.prototype.activate.apply(this, arguments);
                }
                
                if (this.editor) {
                    this.setSearchString(this.model.searchBar.get('search'));
                }
                
                return Base.prototype.activate.apply(this, arguments);
            },
            
            disable: function () {
                this._disabled = true;
                if (this.editor) {
                    this.editor.setOptions({
                        readOnly: true
                    });
                    this.editor.renderer.$cursorLayer.element.style.opacity=0;
                }
                this.$el.addClass('disabled');
            },
            
            enable: function () {
                this._disabled = false;
                if (this.editor) {
                    this.editor.setOptions({
                        readOnly: false
                    });
                    this.editor.renderer.$cursorLayer.element.style.opacity=1;
                }
                this.$el.removeClass('disabled');
            },
            
            reformatSearch: function(editor) {
                var TokenIterator = Ace.require('ace/token_iterator').TokenIterator,
                    Range = Ace.require("ace/range").Range,
                    lang = Ace.require("ace/lib/lang"),
                    currentVal = editor.session.getValue(),
                    iter = new TokenIterator(editor.session,0,0),
                    unQuotedRange = new Range(0, 0, 0, 0),
                    position = {row: 0, column: 0},
                    isFirstTime = true,
                    groups = [],
                    token, index;
                       
                // Separate quoted and unquoted strings
                while (isFirstTime || iter.stepForward()) {
                    isFirstTime = false;
                    token = iter.getCurrentToken();

                    if (token && token.type === "quoted") {
                        unQuotedRange.setStart(position.row, position.column);
                        position = iter.getCurrentTokenPosition();
                        unQuotedRange.setEnd(position.row, position.column);
                        
                        groups.push({value: editor.session.getTextRange(unQuotedRange), type: "unquoted"});
                        groups.push({value: token.value, type: "quoted"});

                        position.column += token.value.length;
                    }
                }
                
                index = editor.session.doc.positionToIndex(position, 0);
                groups.push({value: currentVal.substring(index), type: "unquoted"});
                
                // Clean whitespaces in unquoted strings
                groups.forEach(function(group, i) {
                    if (group.type === "unquoted" && group.value) {
                        var value = group.value;
                        // Remove whitespace characters in both sides of pipe and open bracket
                        value = value.replace(/\s*(\||\[)\s*/g, " $1 ");
                        // Remove whitespace characters after a newline character
                        value = value.replace(/(\r\n|\r|\n)\s+/g, "$1");
                        // Remove whitespaces between open bracket and pipe
                        value = value.replace(/\[ +\|/g, "[|");
                        // Remove extra whitespaces or tabs after a non-whitespace character
                        value = value.replace(/(\S)?[\t ]+/g, "$1 ");
                        group.value = value;
                    }
                }.bind(this));
                
                editor.selectAll();
                editor.session.replace(editor.selection.getRange(), _.pluck(groups, 'value').join("").trim());
                
                // Get position and number of indents for pipes, open brackets 
                // and characters which are after a newline character
                iter = new TokenIterator(editor.session,0,0);
                var positions = [],
                    openBracketsNum = 0,
                    preToken;
                
                while (iter.stepForward()) {
                    token = iter.getCurrentToken();
                    position = iter.getCurrentTokenPosition();
                    
                    if (token.type === "subsearch" && token.value === "[") {
                        openBracketsNum += 1;
                        position.indents = openBracketsNum > 0 ? openBracketsNum : 0;
                        positions.push(position);
                        continue;
                    }

                    if (token.type === "subsearch" && token.value[0] === "]") {
                        // There might be a case that multiple close brackets are combined together 
                        openBracketsNum -= token.value.split('').length;
                        continue;
                    }

                    if (token.type === "pipe" && token.value === "|") {
                        iter.stepBackward();
                        preToken = iter.getCurrentToken();
                        if (!(preToken.type === "subsearch" && preToken.value === "[")) {
                            position.indents = openBracketsNum > 0 ? openBracketsNum : 0;
                            positions.push(position);
                        }
                        iter.stepForward();
                        continue;
                    }

                    if (iter.$tokenIndex == 0 && token.type !== "pipe" && token.type !== "subsearch") {
                        position.indentionOnly = true;
                        position.indents = openBracketsNum > 0 ? openBracketsNum + 1 : 1;
                        positions.push(position);
                    }
                }

                // Add newline or indention for each position
                var rowsToAdd = 0,
                    columnsToRemove = 0,
                    lastPositionRow = 0, 
                    nextLine = "",
                    tabString = editor.session.getTabString();

                positions.forEach(function(position) {
                    nextLine = lang.stringRepeat(tabString, position.indents);

                    if (position.indentionOnly) {
                        // Add indention only
                        editor.session.doc.insertMergedLines({
                            column: position.column,
                            row: position.row + rowsToAdd
                        }, [nextLine]);
                    } else {
                        // Add newline and indention
                        editor.session.doc.insertMergedLines({
                            column: (position.row === lastPositionRow) ? (position.column - columnsToRemove) : position.column,
                            row: position.row + rowsToAdd
                        }, ["", nextLine]);
                        rowsToAdd++;
                    }

                    columnsToRemove = position.column - nextLine.length;
                    lastPositionRow = position.row;
                });

                // Set cursor to the end
                editor.navigateFileEnd();
            },
            
            submit: function(options) {
                this.model.searchBar.trigger('closeAssistant');
                this._onFormSubmit(options);
            },

            _onFormSubmit: function(options) {
                options = options || {};
                var defaults = {
                    forceChangeEvent: this.options.forceChangeEventOnSubmit
                };
                _.defaults(options, defaults);
                
                // don't do anything if there's nothing in the search box and submitEmptyString = false
                var search = this.model.searchBar.get('search'),
                    currentSearch = this.model.content.get(this.options.searchAttribute),
                    searchFromTextarea = this.editor.getValue();
                
                if (search !== searchFromTextarea) {
                    this.model.searchBar.set('search', searchFromTextarea);
                    search = searchFromTextarea;
                }
                if (this.options.submitEmptyString || search) {
                    if (this.options.disableOnSubmit) {
                        this.disable();
                    }
                    var setData = {};
                    setData[this.options.searchAttribute] = search;
                    if (currentSearch !== search){
                        this.model.content.set(setData, options);
                    } else {
                        if (options.forceChangeEvent) {
                            this.model.content.unset(this.options.searchAttribute, {silent: true});
                            this.model.content.set(setData, options);
                        }
                    }
                }
            },
            
            /**
             * Sometimes, like when we're resurrecting a search, we will
             * write our own input value.
             */
            setSearchString: function(search) {
                var currentVal = (this.editor && this.editor.getValue() || '') ;
                this.model.searchBar.set('search', search);
                if (this.editor && search !== currentVal) {
                    this.editor.setValue(search || '', 1);
                }
            },
            
            getSearchFieldValue: function(){
                return $.trim(this.editor.getValue());
            },
            
            searchFieldfocus: function() {
                this.editor && this.editor.focus();
            },
            
            setCaretPositionToEnd: function() {
                this.editor && this.editor.navigateFileEnd();             
            },

            // SPL-131215 - Dashboards use the helperModel that loads collections/models asyn. In this case we must reset the mode once the 
            // searchbnfs collection's fetch is complete. 
            setMode: function(module) {
                if (this.editor && module) {
                    if (this.collection.searchBNFs.dfd && this.collection.searchBNFs.dfd.state() === 'pending') {
                        this.collection.searchBNFs.dfd.done(this.setMode.bind(this, module));
                    }
                    var splMode = new module.Mode(this.collection.searchBNFs.getCommandsParsedSyntax());
                    this.editor.session.setMode(splMode);
                }
            },

            render: function() {
                if (!this.$el.html()) {
                    this.$searchField = $('<textarea class="search-field"></textarea>');
                    this.$searchField.appendTo(this.$el);
                    this.editor = Ace.edit(this.$searchField[0]);
                    this.editor.setSession(Ace.createEditSession(this.model.searchBar.get('search') || ''));
                    this.setupEditorListeners();
                    var config = Ace.require('ace/config');
                    config.loadModule('ace/mode/spl', this.setMode.bind(this));
                    
                    this.editor.setOptions({
                        maxLines: this.options.maxSearchBarLines,
                        wrap: true,
                        fontSize: 12,
                        highlightActiveLine: false,
                        showPrintMargin: false,
                        showLineNumbers: this.options.showLineNumbers,
                        showGutter: this.options.showLineNumbers,
                        enableMultiselect: false,
                        displayIndentGuides: false,
                        behavioursEnabled: this.options.autoFormat,
                        minLines: this.options.minSearchBarLines
                    });
                    
                    this._disabled ? this.disable() : this.enable();
                    
                    this.editor.session.setUndoSelect(false);

                    // Disable the warning message.
                    this.editor.$blockScrolling = Infinity;
                    
                    if (this.options.useAutocomplete) {
                        var useSyntaxHighlighting;
                        if ((_.isUndefined(this.options.useSyntaxHighlighting) &&
                            this.model.user && this.model.user.getSearchSyntaxHighlighting())
                            || this.options.useSyntaxHighlighting) {
                            useSyntaxHighlighting = true;
                        } else {
                            useSyntaxHighlighting = false;
                        }

                        this.children.autoCompletion = new AutoCompletion($.extend(true, {}, this.options, {
                            editor: this.editor,
                            model: {
                                application: this.model.application
                            },
                            collection: {
                                searchBNFs: this.collection.searchBNFs
                            },
                            useSyntaxHighlighting: useSyntaxHighlighting
                        }));
                    }
                }

                if (this.options.giveFocusOnRender) {
                    this.searchFieldfocus();
                }
                this.setCaretPositionToEnd();
                
                return this;
            },
            
            reflow: function() {
                this.editor.resize(true);
            },
            
            remove: function() {
                if (this.editor) {
                    this.editor.destroy();
                }
                return Base.prototype.remove.apply(this, arguments);
            }
        });
    }
);