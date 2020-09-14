define(
    [
        'jquery',
        'underscore',
        'models/SplunkDBase'
    ],
    function(
        $,
        _,
        SplunkDBaseModel
    ) {
        return SplunkDBaseModel.extend({
            url: "configs/conf-searchbnf",
            initialize: function() {
                SplunkDBaseModel.prototype.initialize.apply(this, arguments);
            },
            
            parse: function(response, options) {
                response = SplunkDBaseModel.prototype.parse.call(this, response, options);
                if (options.parseSyntax) {
                    if (!options.collection) {
                        throw 'The option parseSyntax=true can only be used when fetching the full SearchBNFs collection';
                    }
                    var parsedSyntax = options.collection._parsedSyntaxes[this.entry.get('name')];
                    if (parsedSyntax) {
                        this.entry.content.set('_parsedSyntax', {
                            isList: parsedSyntax.isList,
                            args: parsedSyntax.args,
                            functions: parsedSyntax.functions,
                            keywords: parsedSyntax.keywords,
                            other: parsedSyntax.other,
                            list: parsedSyntax.list
                        });
                    }
                }

                if (options.collection && this.isCommand()) {
                    var aliases = this.getAliases();
                    _.each(aliases, function(alias) {
                        options.collection._aliasesMap[alias + '-command'] = this.entry.get('name');
                    }.bind(this));
                }

                return response;
            },
            
            /**
             * Determines if the model represents a command.
             * @return {Boolean}
             */
            isCommand: function() {
                return /^.+-command$/.test(this.entry.get('name'));
            },
            
            /**
             * Returns a list of aliases for a stanza or empty array for no aliases.
             * @return {array}
             */
            getAliases: function() {
                var alias = this.entry.content.get('alias'),
                    aliases = [];
                if (alias) {
                   aliases = alias.replace(/\s*,\s*/g,',').split(',');
                }
                return aliases;
            },

            getOneExample: function() {
                // SPL-124105: Loop all the attributes to get an examplecheat or an example.
                // This will return the first example of the examples sorted by the logic  
                // in SearchAssistant.cpp(line:1691-1708)
                var examplecheat,
                    example;

                _.each(this.entry.content.attributes, function(value, key) {
                    if (/^examplecheat/.test(key)) {
                        examplecheat = value;
                    } else if (/^example/.test(key) && !example) {
                        example = value;
                    }
                });

                return examplecheat || example;
            },

            getShortDescription: function() {
                var shortDesc = this.entry.content.get('shortdesc'),
                    description = this.entry.content.get('description');

                // Based on SearchAssistant.cpp(line:1722-1731)
                if (!shortDesc) {
                    shortDesc = (description && description.length < 100) ? description : "";
                }

                return shortDesc;
            }
        });
    }
);