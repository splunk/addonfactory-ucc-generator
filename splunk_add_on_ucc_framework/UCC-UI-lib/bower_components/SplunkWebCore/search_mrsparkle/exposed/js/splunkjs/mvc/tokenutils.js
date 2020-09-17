define(function(require, exports, module) {
    var _ = require('underscore');
    var Registry = require('./registry');
    
    var VALUE_ESCAPERS = {
        search: function(v) {
            return JSON.stringify(String(v));
        },
        url: function(v) {
            return encodeURIComponent(String(v));
        },
        html: function(v) {
            return _.escape(String(v));
        },
        noEscape: function(v) {
            return v;
        }
    };
    _.extend(VALUE_ESCAPERS, {
        h: VALUE_ESCAPERS.html,
        u: VALUE_ESCAPERS.url,
        s: VALUE_ESCAPERS.search,
        n: VALUE_ESCAPERS.noEscape
    });
    
    // NOTE: The regular expressions here for parsing tokens should attempt to
    //       be backward-compatible with the token parsing methods in
    //       exposed/js/utils.js such as discoverReplacementTokens() and
    //       replaceTokens().
    
    // ex: ns:
    var TOKEN_NAMESPACE_PREFIX_PATTERN = /(\w+:)?/.source;
    // ex: token.name|suh               (old-style filter chain)
    // ex: token.name|lower|capitalize  (new-style filter chain)
    var TOKEN_NAME_CHARS_PATTERN = /([^$|:]+?)(\|[|\w]+)?/.source;
    // ex: $ns:token.name|suh$
    var TOKEN_PATTERN = /\$/.source + TOKEN_NAMESPACE_PREFIX_PATTERN + TOKEN_NAME_CHARS_PATTERN + /\$/.source;
    
    var TOKEN_OR_DOLLAR_RE = new RegExp(TOKEN_PATTERN + '|' + /\$\$/.source, 'g');
    var OLD_STYLE_FILTER_CHAIN_RE = /^[suh]{1,3}$/;
    
    /**
     * Duplicates a RegExp literal so that it can be used safely for
     * operations like test() that mutate the RegExp object.
     */
    var r = function(regexp) {
        var flags = '';
        if (regexp.global) {
            flags += 'g';
        }
        if (regexp.multiline) {
            flags += 'm';
        }
        if (regexp.ignoreCase) {
            flags += 'i';
        }
        return new RegExp(regexp.source, flags);
    };
    
    /**
     * @name TokenUtils
     * @private
     * @description The **TokenUtils** class contains utilities for processing 
     * template strings that can contain tokens.
     * 
     * '$fullName$' is a simple example of a token that can appear in a
     * template string.
     * 
     * '$ns:foo.bar|suh$' is a more complex example.
     * Here the token has the name 'foo.bar' and is escaped using the
     * 's' (search), 'u' (url), and 'h' (HTML) escaping functions
     * (in that order). It also lives in the 'ns' namespace.
     * 
     * Some functions defined in this class will ignore namespaced tokens
     * to preserve backward compatibility:
     * 
     *      Namespace Aware   | Namespace Unaware
     *      ----------------- | -------------------
     *      getTokens         | getTokenNames
     *      replaceTokens     | replaceTokenNames
     *      hasToken          | hasTokenName
     *      isToken           | isTokenName
     *      -                 | getTokenName
     * @namespace splunkjs.mvc.tokenutils
     */
    var TokenUtils = {
        // The namespace where filters reside in the current implementation.
        _FILTER_NAMESPACE: '__filters',
        
        /**
         * Returns the tokens in the specified template string.
         * 
         * The format of the token descriptors may be extended in the future.
         * 
         * Example:
         *      TokenUtils.getTokens(
         *          '$firstName|u$ $ns:lastName|u$')
         *      ==
         *          [
         *              {
         *                  namespace: 'default', name: 'firstName',
         *                  filters: [
         *                      { name: 'u' }
         *                  ]
         *              }, {
         *                  namespace: 'ns', name: 'lastName',
         *                  filters: [
         *                      { name: 'u' }
         *                  ]
         *              }
         *          ]
         * 
         * @function getTokens
         * @param searchTemplate    A template string whose tokens will be returned.
         * @param options.tokenNamespace
         *                          Token namespace to use when resolving
         *                          unqualified token references.
         *                          Defaults to 'default'.
         * Private API:
         * 
         * @param options._isToken  If specified, alters return value to
         *                          indicate whether the specified template
         *                          string contains exactly one token
         *                          (and nothing else).
         * @memberof splunkjs.mvc.tokenutils
         */
        getTokens: function(searchTemplate, options) {
            options = options || {};
            var defaultTokenNamespace = options.tokenNamespace || 'default';
            
            /*
             * Looks for:
             *     (1a) $$ (literal $)
             *     (1b) $ns:token.name|suh$ (tokens)
             */
            var tokens = [];
            var rex = r(TOKEN_OR_DOLLAR_RE);
            while (true) {
                var match = rex.exec(searchTemplate);
                if (options._isToken) {
                    return match && 
                        (match.index === 0) &&
                        (match[0].length === searchTemplate.length) &&
                        // Reject $$ here
                        (match[0].length > 2);
                }
                if (!match) {
                    break;
                }
                var tokenNamespace = match[1];
                var tokenName = match[2];
                var filterChain = match[3];
                
                // NOTE: Some browsers return '' and others return undefined
                //       when there is no match.
                if (!tokenNamespace && !tokenName) {
                    // Matched '$$'
                    continue;
                }
                
                if (!tokenNamespace) {
                    tokenNamespace = defaultTokenNamespace;
                } else {
                    // Chop trailing ':'
                    tokenNamespace = tokenNamespace.substring(
                        0, tokenNamespace.length - 1);
                }
                
                var filters;
                if (filterChain) {
                    var filterNames = TokenUtils._parseFilterChain(filterChain);
                    filters = _.map(filterNames, function(filterName) {
                        return { name: filterName };
                    });
                } else {
                    filters = [];
                }
                
                tokens.push({
                    namespace: tokenNamespace,
                    name: tokenName,
                    filters: filters
                });
            }
            return tokens;
        },
        
        /**
         * Returns the token names in the specified template string,
         * ignoring namespaced tokens.
         * 
         * Example:
         *      TokenUtils.getTokenNames(
         *          '$firstName|u$ $lastName|u$ $ns:ignored$')
         *      ==
         *          ['firstName', 'lastName']
         * @function getTokenNames
         * @memberof splunkjs.mvc.tokenutils
         */
        getTokenNames: function(searchTemplate) {
            var tokens = TokenUtils.getTokens(searchTemplate);
            
            // Do not recognize namespaced tokens for backward compatibility
            var tokenNames = [];
            _.each(tokens, function(token) {
                if (token.namespace === 'default') {
                    tokenNames.push(token.name);
                }
            });
            
            return tokenNames;
        },
        
        /**
         * Replaces all tokens in the specified template using the
         * values in the specified token registry.
         * 
         * An optional filter function may be provided that will
         * be used to transform the values of all substituted tokens
         * after all embedded filters have been applied.
         * 
         * If there is any problem replacing a token, it will be left
         * as-is in the original string. This can happen if the referenced
         * token does not exist or a referenced filter does not exist.
         *
         * Example:
         *      var tokenRegistry = mvc.Components;
         *      tokenRegistry.get('default').set('firstName', 'Bob');
         *      tokenRegistry.get('default').set('lastName', 'Waters');
         *      
         *      TokenUtils.replaceTokens(
         *          '$firstName$ $lastName$',
         *          tokenRegistry)
         *      ==
         *          'Bob Waters'
         * 
         * @param str               A template string whose tokens will be replaced.
         * @param tokenRegistry     Registry from which to read token values.
         * @param options.escaper   Transforms token values as they are substituted.
         *                          Applied after all embedded filters.
         * @param options.allowNoEscape {boolean}
         *                          Defaults to true and denotes whether the $token|n$ 
         *                          no-escape filter, which disables the default escaper
         *                          is allowed. Pass false if the default escaper has to
         *                          be enforced (eg. when escaping HTML to prevent XSS). 
         * @param options.tokenNamespace
         *                          Token namespace to use when resolving
         *                          unqualified token references.
         *                          Defaults to 'default'.
         * @param escaper           Deprecated. Use options.escaper instead.
         */
        replaceTokens: function(str, tokenRegistry, optionsOrEscaper) {
            var options;
            if (_.isFunction(optionsOrEscaper)) {
                options = {escaper: optionsOrEscaper};
            } else {
                options = optionsOrEscaper || {};
            }
            
            var extraFilterFunc = options.escaper;
            var defaultTokenNamespace = options.tokenNamespace || 'default';
            
            /*
             * Looks for:
             *     (1a) $$ (literal $)
             *     (1b) $ns:token.name|suh$ (tokens)
             *
             * Replaces with:
             *     (1a) $
             *     (1b) <token value, after optional escaping>
             */
            return str.replace(r(TOKEN_OR_DOLLAR_RE), function(match, tokenNamespace, tokenName, filterChain) {
                // NOTE: Some browsers return '' and others return undefined
                //       when there is no match.
                if (!tokenNamespace && !tokenName) {
                    // Matched '$$'
                    return '$';
                }
                
                if (!tokenNamespace) {
                    tokenNamespace = defaultTokenNamespace;
                } else {
                    // Chop trailing ':'
                    tokenNamespace = tokenNamespace.substring(0, tokenNamespace.length - 1);
                }
                
                var tokenModel = tokenRegistry.get(tokenNamespace);
                if (tokenModel === undefined) {
                    return match;
                }
                var v = tokenModel.get(tokenName);
                if (v === undefined) {
                    // No such token. Abort resolve.
                    return match;
                }
                if (filterChain) {
                    var filterNames = TokenUtils._parseFilterChain(filterChain, extraFilterFunc, tokenRegistry);
                    
                    var filterFuncs = _.map(filterNames, function(filterName) {
                        return TokenUtils.getFilter(filterName, tokenRegistry);
                    });
                    if (_.compact(filterFuncs).length !== filterFuncs.length) {
                        // No such filter. Abort resolve.
                        return match;
                    }
                    
                    _.each(filterFuncs, function(filterFunc) {
                        if (filterFunc) {
                            v = filterFunc(v);
                            if (filterFunc === VALUE_ESCAPERS.noEscape && options.allowNoEscape !== false) {
                                extraFilterFunc = null;
                            }
                        }
                    });
                }
                if (_.isFunction(extraFilterFunc)) {
                    v = extraFilterFunc(v);
                }
                
                return v;
            });
        },
        
        /*
         * Parses a filter chain to a list of filters in the chain.
         * 
         * Expects exactly 1 or 3 arguments.
         * 
         * Input Example:
         *      (1) '|suh'          (old-style)
         *      (2) '|upper|lower'  (new-style)
         * Output Example:
         *      (1) ['s', 'u', 'h']
         *      (2) ['upper', 'lower']
         */
        _parseFilterChain: function(filterChain, suppressedOldFilterFunc, registry) {
            var filterNames = filterChain.substring(1).split('|');
            
            // Old-style filter chains use a combination of the single
            // letters ['s', 'u', 'h'] to create a filter chain.
            if (filterNames.length === 1 && 
                OLD_STYLE_FILTER_CHAIN_RE.test(filterNames[0]))
            {
                filterNames = filterNames[0].split('');
                
                if (suppressedOldFilterFunc) {
                    // If an user-requested old-style filter is requested
                    // that matches a code-requested extra filter function,
                    // suppress the user-requested filter to avoid applying
                    // the filter multiple times. This behavior preserves
                    // backward compatibility with Splunk 5 and below.
                    // 
                    // This behavior of smartly avoiding double-filtering
                    // (or double-escaping) is not followed for new-style
                    // filter chains because it can cause omission or
                    // reordering of the filters requested by the user,
                    // which can be confusing.
                    filterNames = _.filter(filterNames, function(filterName) {
                        // Suppress user-requested old-style filters that
                        // match the code-requested extra filter function
                        var filterFunc = TokenUtils.getFilter(filterName, registry);
                        return (filterFunc !== suppressedOldFilterFunc);
                    });
                }
            }
            
            return filterNames;
        },
        
        /**
         * Replaces all tokens in the specified template using the
         * specific map of token values, ignoring namespaced tokens.
         * 
         * An optional escaper function may be provided that will
         * be used to transform the values of all substituted tokens.
         *
         * Example:
         *      TokenUtils.replaceTokens('$firstName$ $lastName$', {
         *          'firstName': 'Bob',
         *          'lastName': 'Waters'
         *      }) == 'Bob Waters'
         */
        replaceTokenNames: function(str, valuesByTokenName, escaper, tokenFilters) {
            // Only replace the specified tokens in the default namespace
            // for backward compatibility
            var tokenRegistry = new Registry();
            var defaultTokenModel = tokenRegistry.getInstance(
                'default', {create: true});
            defaultTokenModel.set(valuesByTokenName);
            // set token filters
            if (tokenFilters) {
                _(tokenFilters).each(function(filter, name) {
                    TokenUtils.setFilter(name, filter, tokenRegistry);
                });
            }
            return TokenUtils.replaceTokens(str, tokenRegistry, escaper);
        },
        
        /**
         * Returns whether the specified template string contains any tokens.
         * 
         * Example:
         *      TokenUtils.hasToken('Name: $fullName$') == true
         *      TokenUtils.hasToken('Name: $firstName$ $lastName$') == true
         *      TokenUtils.hasToken('foobar') == false
         *      TokenUtils.hasToken('$ns:fullName$') == true
         */
        hasToken: function(str) {
            return TokenUtils.getTokens(str).length > 0;
        },
        
        /**
         * Returns whether the specified template string contains any tokens,
         * ignoring namespaced tokens.
         * 
         * Example:
         *      TokenUtils.hasToken('Name: $fullName$') == true
         *      TokenUtils.hasToken('Name: $firstName$ $lastName$') == true
         *      TokenUtils.hasToken('foobar') == false
         *      TokenUtils.hasToken('$ns:fullName$') == false
         */
        hasTokenName: function(str) {
            return _.some(TokenUtils.getTokens(str), function(token) {
                return token.namespace === 'default';
            });
        },
        
        /**
         * Returns whether the specified template string consists of exactly
         * one token (and nothing else).
         * 
         * Example:
         *      TokenUtils.isToken('$fullName$') == true
         *      TokenUtils.isToken('Name: $fullName$') == false
         *      TokenUtils.isToken('Name') == false
         *      TokenUtils.isToken('$ns:fullName$') == true
         */
        isToken: function(p) {
            return TokenUtils.getTokens(p, {_isToken: true});
        },
        
        /**
         * Returns whether the specified template string consists of exactly
         * one non-namespaced token (and nothing else).
         * 
         * Example:
         *      TokenUtils.isToken('$fullName$') == true
         *      TokenUtils.isToken('Name: $fullName$') == false
         *      TokenUtils.isToken('Name') == false
         *      TokenUtils.isToken('$ns:fullName$') == false
         */
        isTokenName: function(p) {
            return TokenUtils.isToken(p) &&
                TokenUtils.getTokens(p)[0].namespace === 'default';
        },
        
        /**
         * Returns the token name of the solitary non-namespaced token in the 
         * specified template string.
         * 
         * If there is no such token a falsy value is returned.
         * 
         * Example:
         *      TokenUtils.getTokenName('$fullName$') == 'fullName'
         *      TokenUtils.getTokenName('Name') == false
         *      TokenUtils.getTokenName('$ns:fullName$') == false
         */
        getTokenName: function(tokenStr) {
            return TokenUtils.isTokenName(tokenStr) && 
                TokenUtils.getTokenNames(tokenStr)[0];
        },
        
        /**
         * Quotes a literal string as a template string.
         * 
         * Example:
         *      TokenUtils.quoteAsTokenString('$1.00') == '$$1.00'
         *      TokenUtils.quoteAsTokenString('C:\Windows') == 'C:\Windows'
         *      TokenUtils.quoteAsTokenString('identifier') == 'identifier'
         */
        quoteAsTokenString: function(literalStr) {
            if (!_.isString(literalStr)) {
                return literalStr;
            } else {
                // Replaces $ with $$
                return literalStr.replace(/\$/g, function(match) {
                    return '$$';
                });
            }
        },
        
        /**
         * Registers a new filter function with the specified name.
         * 
         * Note that built-in filters cannot be overridden.
         */
        setFilter: function(filterName, filterFunc, registry) {
            var isBuiltinFilter = TokenUtils.getEscaper(filterName);
            if (isBuiltinFilter ||
                OLD_STYLE_FILTER_CHAIN_RE.test(filterName))
            {
                throw new Error(
                    'Cannot register new filter with reserved name "' +
                    filterName + '".');
            }
            
            var filters = registry.getInstance(
                TokenUtils._FILTER_NAMESPACE, { create: true });
            filters.set(filterName, filterFunc);
        },
        
        /**
         * Returns the filter function registered with the specified name.
         */
        getFilter: function(filterName, registry) {
            // Built-in filters take precedence and cannot be overridden
            var builtinFilterFunc = TokenUtils.getEscaper(filterName);
            if (builtinFilterFunc) {
                return builtinFilterFunc;
            }
            
            var filters = registry.getInstance(
                TokenUtils._FILTER_NAMESPACE, { create: true });
            return filters.get(filterName);
        },
        /**
         * return all the token filters
         * @param registry
         */
        getFilters: function(registry) {
            var filters = registry.getInstance(
                TokenUtils._FILTER_NAMESPACE, {create: true});
            return filters.toJSON();
        },
        /**
         * Returns the built-in escaping function corresponding to the specified
         * identifying character (i.e. one of 's', 'u', or 'h') or
         * long name (i.e. one of 'search', 'url', or 'html').
         * 
         * @see TokenUtils.getFilter()
         */
        getEscaper: function(esc) {
            return VALUE_ESCAPERS[esc];
        },
        /**
         * Returns true if a namespaced token exists in the registry
         *
         * @param  {Registry}   registry  
         * @param  {Object}     token
         * @return {Boolean}
         */         
        isTokenDefined: function (registry, token) {
            return registry.getInstance(token.namespace).has(token.name);
        },         
        /**        
         * Setup change listeners on each token. The callback should be fired
         * whenever a 'rejects' or 'depends' token dependency changes:
         * - unresolved -> resolved
         * - resolved -> unresolved
         *
         * @param  {Object[]}  tokenDependencies
         * @param  {String}    tokenDependencies.depends
         * @param  {String}    tokenDependencies.rejects
         * @param  {Registry}  registry
         * @param  {Function}  callback
         * @param  {Object}    context
         */
        listenToTokenDependencyChange: function(tokenDependencies, registry, callback, context) {
            if (tokenDependencies) {
                var tokens = TokenUtils.getTokenDeps(tokenDependencies, 'submitted');
                _(tokens.all).each(function(token) {
                    var namespace = registry.get(token.namespace);
                    var eventname = 'change:' + token.name;
                    var wrappedCb = _.wrap(callback, function(fn, model, currTokenValue) {
                        var prevTokenValue = !!model.previous(token.name);
                        currTokenValue = !!currTokenValue;
                        if(!currTokenValue || !prevTokenValue && currTokenValue) {
                            fn.call(context);
                        }
                    });
                    namespace.on(eventname, wrappedCb);
                }, context);
            }
        },      
        /**        
         * Remove all the namespaced token dependency change listeners that
         * were created by 'listenToTokenDependencyChange'
         *
         * @param  {Object[]}  tokenDependencies
         * @param  {String}    tokenDependencies.depends
         * @param  {String}    tokenDependencies.rejects
         * @param  {Registry}  registry
         */
        stopListeningToTokenDependencyChange: function(tokenDependencies, registry) {
            if (tokenDependencies) {
                var tokens = TokenUtils.getTokenDeps(tokenDependencies, 'submitted');
                _(tokens.all).each(function(token) {
                    var namespace = registry.get(token.namespace);
                    var eventname = 'change:' + token.name;
                    // remove all callbacks from the namespace for the named event
                    namespace.off(eventname);                
                });
            }
        }, 
        /**
         * Returns a singleton containing 'rejects', 'depends', and the combined 
         * ('all') token dependencies. 
         *
         * @param  {Object[]}  tokenDependencies
         * @param  {String}    tokenDependencies.depends
         * @param  {String}    tokenDependencies.rejects
         * @param  {Registry}  registry
         * @param  {String}    namespace
         * @return {Object}
         */
        getTokenDeps: function(tokenDependencies, namespace) {
            var tokens = {};
            namespace = namespace || 'submitted';

            if (tokenDependencies) {
                var required = tokenDependencies.depends ? TokenUtils.getTokens(tokenDependencies.depends, { tokenNamespace: namespace }) : [];
                var rejected = tokenDependencies.rejects ? TokenUtils.getTokens(tokenDependencies.rejects, { tokenNamespace: namespace }) : [];
                var all = required.concat(rejected);

                tokens = {
                    required: required,
                    rejected: rejected,
                    all: all
                };
            }

            return tokens;
        },                 
        /**
         * Return true if ALL "depends", and ZERO "rejects", dependencies are
         * resolved.
         *
         * @param  {Object[]}  tokenDependencies
         * @param  {String}    tokenDependencies.depends
         * @param  {String}    tokenDependencies.rejects
         * @param  {Registry}  registry
         * @return {Boolean}
         */
        tokenDependenciesMet: function(tokenDependencies, registry){
            var isTokenDefined = _.partial(TokenUtils.isTokenDefined, registry);
            var tokens = TokenUtils.getTokenDeps(tokenDependencies, 'submitted');

            return _(tokens.required).all(isTokenDefined) && !_(tokens.rejected).any(isTokenDefined);
        }
    };
    
    return TokenUtils;
});
