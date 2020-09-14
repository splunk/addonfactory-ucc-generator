define(
    [
        "jquery",
        "underscore",
        "models/services/configs/SearchBNF",
        "collections/SplunkDsBase"
    ],
    function(
        $,
        _,
        Model,
        SplunkDsBaseCollection
    ) {
        return SplunkDsBaseCollection.extend({
            url: "configs/conf-searchbnf",
            model: Model,
            initialize: function() {
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
                // TODO: consider creating in parse and removing after parse of models
                //       or adding to the parse options instead of instance level.
                this._parsedSyntaxes = {};
                this._aliasesMap = {};
            },
            
            parse: function(response, options) {
                if (options.parseSyntax) {
                    _.each(response.entry, function(entry) {
                        var name = entry.name,
                        syntax = entry.content.syntax;
                        if (syntax) {
                            if (this._parsedSyntaxes[name]) {
                                return;
                            }
                            
                            if (/^.+-command$/.test(name)) {
                                // strip the command name from the syntax since it should not be parsed
                                // -7 to get the length of the "-command" plus one space
                                syntax = syntax.substr(name.length-7);
                            }
                            this._parsedSyntaxes[name] = this._getParsedSyntax(syntax, response);
                        }
                    }.bind(this));
                }
                return SplunkDsBaseCollection.prototype.parse.apply(this, arguments);
            },
            
            /**
             * getCommands filters models in the collection to just those that represent commands
             * @return {Array of SearchBNF models}
             */
            getCommands: function() {
                return this.filter(function(model) {
                    return model.isCommand();
                });
            },
            
            /**
             * getCommandsParsedSyntax iterates through the collection and 
             * returns the parsed syntax for all models that represent a command and their aliases
             * in the collection.
             * @return {object} an object of parsed syntaxes where the key is the command model name and the value is the parsedSyntax.
             */
            getCommandsParsedSyntax: function() {
                var commandsParsedSyntax = {};
                this.each(function(model) {
                    if (model.isCommand()) {
                        var parsedSyntax = _.extend({}, model.entry.content.get('_parsedSyntax')),
                            aliases = model.getAliases();
                        _.each(aliases, function(alias) {
                            commandsParsedSyntax[alias + '-command'] = parsedSyntax;
                        });
                        commandsParsedSyntax[model.entry.get('name')] = parsedSyntax;
                    }
                }.bind(this));
                return commandsParsedSyntax;
            },

            findByEntryName: function(name) {
                name = this._aliasesMap[name] || name;
                return SplunkDsBaseCollection.prototype.findByEntryName.call(this, name);
            },

            /**
             * _getParsedSyntax an internal function used in parse to parse the syntax strings in the response
             * @param  {string} syntax   the syntax string to parse
             * @param  {string} response the response from parse
             * @return {object} an object that represents the syntax
             */
            _getParsedSyntax: function(syntax, response) {
                var index = 0,
                    parsedSyntax = {
                        isList: false,
                        args: [],
                        functions: [],
                        keywords: [],
                        other: [],
                        list: [],
                        addSubSyntax: function(parsedSubSyntax, options) {
                            if (parsedSubSyntax.isList) {
                                if (options.isFunction) {
                                    var functions=_.map(parsedSubSyntax.list, function(listItem) {
                                        return {name: listItem, parenOptional: options.optionalParen || false};
                                    }.bind(this));
                                    this.functions = _.union(this.functions, functions);
                                } else {
                                    if (this.isList) {
                                        // if command rules are just list of strings then just append list
                                        this.list = _.union(this.list, parsedSubSyntax.list);
                                    } else if (this.isEmpty()) {
                                        // if command rules is empty just set it to array
                                        this.list = parsedSubSyntax.list.slice(0);
                                        this.isList = true;
                                    } else {
                                        // this is a case where a list of strings were the syntax but not functions,
                                        // could be keywords or valid values for an argument.
                                        // example syntax = <int>(<timescale>)? where timescale is a list
                                        // for now skip 
                                    }
                                }
                            } else {
                                this.args = _.union(this.args, parsedSubSyntax.args);
                                this.functions = _.union(this.functions, parsedSubSyntax.functions);
                                this.keywords = _.union(this.keywords, parsedSubSyntax.keywords);
                                this.other = _.union(this.other, parsedSubSyntax.other);
                            }
                        },
                        isEmpty: function() {
                            return !(this.args.length
                                + this.functions.length
                                + this.keywords.length
                                + this.other.length
                                + this.list.length);
                        }
                    };
                    
                // Check if the syntax is a list of strings
                // This is either a list of functions or a list of allowable values/part of value to an argument.
                // Currently only using if it is a list of functions.
                    // matches foo foo_bar and foo-baz
                var listItemRegex = '[\\w\\-_]+',
                    // matches (perc|p|exactperc|upperperc)<int>, (perc)<int> and pert<int>
                    dynamicListItemRegex = '(?:(?:\\(' + listItemRegex + '(?:\\|' + listItemRegex + ')*\\))|' + listItemRegex + ')<int>',
                    // matches a list of functions that match the listItemRegex and synamicListItemRegex
                    listRegex = new RegExp('^(?:(?:' + dynamicListItemRegex + ')|\\(?' + listItemRegex + ')(?:\\|(?:(?:' + dynamicListItemRegex + ')|' + listItemRegex +'))*\\)?$');
                if (syntax.match(listRegex)) {
                    // replace all functions that match (perc|p|exactperc|upperperc)<int>, 
                    // (perc)<int> or pert<int> with a regex for the function name
                    syntax = syntax.replace(/(\(?[\w\-_]+\)?|(?:\([\w\-_]+(?:\|[\w\-_]+)+)\))<int>/g, function(fullMatch, match, index) {
                        var functionsArray = match.replace(/[\(\)]/g,'').split('|');
                        var replaceText = '';
                        functionsArray.forEach(function(currentValue,index,arr) {
                            replaceText += replaceText ?  "|" + currentValue+'\\d+' : currentValue + '\\d+';
                        }, this);
                        return replaceText;
                    });
                    // If list is wrapped in () remove them. For example (perc) or (p|perc).
                    parsedSyntax.list = syntax.replace(/[\(\)]/g,'').split('|');
                    parsedSyntax.isList = true;
                    return parsedSyntax;
                }
            
                while (index < syntax.length) {
                    // go to next char if the current ch is in the skip list
                    var subSytax = syntax.substr(index),
                        skipRegex = /^(\s|\?|\*|">"|"<")/,
                        skipMatch = subSytax.match(skipRegex);
                    
                    if (skipMatch) {
                        index += skipMatch[0].length;
                        continue;
                    }
                    
                    // check if the next part of the syntax matches <token-name> where token-name is a stanza in the bnf.
                    var stanzaRe = /^<([^>]+)>/,
                    stanzaMatch = subSytax.match(stanzaRe);
                    if (stanzaMatch) {
                        // get stanza name
                        var stanza = stanzaMatch[1];
                        // Look a head to determine if the stanza being looked up will be used to define a function.
                        // This would be a case like were the syntax = <some-token> "(" <int> ")" or syntax = <some-token> ("(" <int> ")")?
                        // The "(" following the <some-token> indicated that <some-token> will be used as a function.
                        var addOptions = {'isFunction': false},
                            stanzaFunctionRegex = /^\s*(\(?)\s*"\("(.+)"\)"\s*(\))?\s*(\?)?/,
                            stanzaFunctionMatch = syntax.substr(index + stanzaMatch[0].length).match(stanzaFunctionRegex);
                        if (stanzaFunctionMatch) {
                            addOptions.isFunction = true;
                            addOptions.optionalParen = (stanzaFunctionMatch[1] === '(' && stanzaFunctionMatch[3] === ')' && stanzaFunctionMatch[4] === '?');
                        } 
                        if (!this._parsedSyntaxes[stanza]) {
                            // if stanza is not defined yet and it has a syntax get it and define it
                            var stanzaEntry = _.find(response.entry, function(entry) {
                                return entry.name === stanza;
                            });
                            if (stanzaEntry) {
                                var stanzaSyntax = stanzaEntry.content.syntax;
                                if (stanzaSyntax) {
                                    // set to building to avoid infinite loops caused by syntax that references its self.
                                    this._parsedSyntaxes[stanza] = 'building';
                                    this._parsedSyntaxes[stanza] = this._getParsedSyntax(stanzaSyntax, response);
                                }
                            } else {
                                // if the stanza does not have an entry push on the other list 
                                //so consumer can determine what to do with it
                                parsedSyntax.other.push(stanza);
                            }
                        }
                        
                        if (this._parsedSyntaxes[stanza] && this._parsedSyntaxes[stanza] !== 'building') {
                            // merge sub parsedSyntaxes into parsedSyntax
                            parsedSyntax.addSubSyntax(this._parsedSyntaxes[stanza], addOptions);
                        }
                        index += (stanzaMatch[0].length);
                        continue;
                    }
                    
                    // check next part of syntax is an argument
                    // args in the syntax must match this regex
                    var argumentRegex = /^(\(?)\b([^\s=()]+)(\)?)=/,
                    argumentsMatch = subSytax.match(argumentRegex);
                    if (argumentsMatch) {
                        // arguments could be a list for example (maxrows|maxcols)=<int>
                        var argumentKeys = argumentsMatch[2].split('|'),
                            argumentValueType = undefined;
                        // advance index to after =
                        index += (argumentsMatch[0].length);
                        
                        var valueSyntax = syntax.substr(index),
                            endOfValueSynax = 0;
                        // Find syntax for the value of the argument. For example 
                        // labelfield=<int>(d|m|h) the syntax for the value is <int>(d|m|h)
                        // and for foo=<bar> the syntax of the value <bar>
                        if (argumentsMatch[1] === "(" && argumentsMatch[3] !== ")") {
                            // If argument is surrounded by parentheses like (labelfield=<int>(d|m|h)) or (foo=<bar>)
                            // endOfValueSynax should be the at the closing parenthesis that
                            // matches argumentsMatch[1] or a space not in a nested parentheses.
                            // This if statement handles the following cases: 
                            // * (sup=<int>)|(conf=<num>) finding the syntax value for sup is <int>
                            // * (override=<bool> | <subsearch-options>)* finding the syntax value for override is <bool>
                            // * (time=(foo | bar)) finding the syntax value for time is (foo | bar)
                            var paren = 0;
                            while (endOfValueSynax < valueSyntax.length) {
                                if (valueSyntax[endOfValueSynax] === ")" || valueSyntax[endOfValueSynax] === " ") {
                                    if (paren === 0) {
                                        break;
                                    }
                                    
                                    if (valueSyntax[endOfValueSynax] === ")") {
                                        paren--;
                                    }
                                } else if (valueSyntax[endOfValueSynax] === "(") {
                                    paren++;
                                }
                                endOfValueSynax++;
                            }
                        } else {
                            // This else statement handles the following cases and more:
                            // * (maxrows|maxcols)=<int> syntax value <bool>
                            // * type=(inner|outer|left) | usetime=<bool> | earlier=<bool>
                            endOfValueSynax = valueSyntax.indexOf(' ');
                        }
                            
                        valueSyntax = (endOfValueSynax > -1) ? valueSyntax.substr(0, endOfValueSynax): valueSyntax;
                        
                        // If value syntax is a simple value = <token> set it to the valueType
                        var simpleValueRegex =/^\s*<([^>]+)>$/,
                        simpleValueMatch = valueSyntax.match(simpleValueRegex);

                        index += (valueSyntax.length + 1);
                        
                        argumentKeys.forEach(function(argumentKey, index, argumentKeys) {
                            parsedSyntax.args.push({key: argumentKey.replace(/<int>/, '\\d+'), valueType: (simpleValueMatch && simpleValueMatch[1]) || ''});
                        }.bind(this));

                        continue;
                    }
                    
                    // check next part of syntax is a function
                    // function in the syntax must match this regex
                    var functionRegex = /^([\w-_]+)\s*(\(?)\s*"\("(.+)"\)"\s*(\))?\s*(\?)?/,
                        functionMatch = subSytax.match(functionRegex);
                    if (functionMatch) {
                        var functionName = functionMatch[1],
                            parenOptional = (functionMatch[2] === '(' && functionMatch[4] === ')' && functionMatch[5] === '?');

                        parsedSyntax.functions.push({name: functionName, parenOptional: parenOptional});
                        index += functionMatch[1].length + functionMatch[2].length;
                    }
                    
                    // check next part of syntax is a keyword
                    // keywords in the syntax must match this regex
                    var keywordRegex = /^\(?(\w+(?:\|\w+)*)\s*\)?\??\s+<([^>]+)>/,
                        keywordMatch = subSytax.match(keywordRegex);
                    if (keywordMatch) {
                        parsedSyntax.keywords.push(keywordMatch[1].replace(/[\(\)]/g,''));
                        index += (keywordMatch[1].length + 1);
                        continue;
                    }
                    index++;
                }
                return parsedSyntax;
            }
        });
    }
);