define(function(require, exports, module) {
    var _ = require('underscore');
    var mvc = require("splunkjs/mvc");
    var TokenEscapeString = require("./tokenescapestring");
    var TokenSafeString = require("./tokensafestring");
    var console = require("util/console");
    var TokenUtils = require('./tokenutils');
    var BaseModel = require('models/Base');
    
    // Enables logging of when values are propagated between models.
    var VERBOSE = false;
    
    // DOC: BaseModel is a private superclass.
    //      Backbone.Model is the nearest public superclass.

    /**
     * @constructor
     * @memberOf splunkjs.mvc
     * @name TokenAwareModel
     * @description The **TokenAwareModel** class creates a new token-aware 
     * model with built-in data-binding support.
     *
     * The **set** and **get** methods support a "tokens" Boolean option.
     * When `true`, the property is interpreted as a template
     * that might contain token escapes such as "$indexName$".
     * If set to a template, the property is defined as a computed property
     * based on the referenced tokens and kept up to date when those token
     * values change.
     * @extends splunkjs.mvc.Utils
     *
     * @param {Object} attributes - Initial attributes of this model.
     * @param {Object} options - Options.
     * @param  {Object} options.tokenNamespace=default -  The name of the namespace to use
     * when resolving unqualified token references such as `$token$`. 
     * @param options.retainUnmatchedTokens - When `true`, returns the computed 
     * value of the specified property, but with unresolved tokens retained in 
     * the output string. For example, the template "$first$ $last$" resolves to
     * "Bob $last$" if only the `$first$` token was defined (and it was "Bob").
     * @param  {Object} options.tokenEscaper - Escaping function that escapes all expanded
     * token values.
     * @param  {Object} options.allowNoEscape - Specify whether the $token|n$ no-escape filter can be used.
     * See TokenUtils#replaceTokens()
     * @param  {Object} options.* - Interpreted the same way as in {@link splunkjs.mvc.TokenAwareModel#set}.
     *
     * @example
     * // get() and set() methods are always symmetric when using the
     * // same 'tokens' option (usually 'true' or missing).
     * this.set('color', '$color$', {tokens: true});
     * this.get('color', {tokens: true});
     * >> '$color$'
     * 
     * // If a property depends on an uninitialized token,
     * // it takes on an 'undefined' value.
     * this.get('color');
     * >> undefined
     * 
     * // Properties update automatically when their template's
     * // token(s) are updated.
     * mvc.Components.getInstance('default').set('color', '#ff0000');
     * this.get('color');
     * >> '#ff0000'
     * 
     * // Setting the literal value of a (non-pushed) property
     * // will destroy any previous template it may have had.
     * this.set('color', '#cafeba');
     * this.get('color');
     * >> '#cafeba'
     * this.get('color', {tokens: true});
     * >> '#cafeba'
     * mvc.Components.getInstance('default').get('color');
     * >> '#ff0000'
     */
    var TokenAwareModel = BaseModel.extend(/** @lends splunkjs.mvc.TokenAwareModel.prototype */{
        /**
         * @deprecated Enables token replacement by default for the <b>set</b> method.
         * 
         * When <tt>true</tt>, all calls to <b>set</b> implicitly take the option
         * <tt>{tokens: true}</tt>.
         */
        applyTokensByDefault: false,

        /**
         * @deprecated Enables retrieval of raw (unreplaced) tokens for
         * the <b>get</b> and <b>toJSON</b> methods.
         * 
         * When <tt>true</tt>, all calls to <b>get</b> and <b>toJSON</b> implicitly take the
         * option <tt>{tokens: true}</tt>.
         */
        retrieveTokensByDefault: false,

        // Private API:
        // 
        // @param options._tokenRegistry
        //                      An alternate token registry to use other than
        //                      `mvc.Components`. For use by tests only.
        //
        // NOTE: Must override constructor() and not initialize()
        //       because this._templates and listeners need to be
        //       in place before the first (non-empty) call to set(),
        //       which the default constructor() does by default.
        constructor: function(attributes, options) {
            attributes = attributes || {};
            options = options || {};

            // Save options whose effects persist beyond the constructor
            this._tokenNamespace = options.tokenNamespace || undefined;
            this._retainUnmatchedTokens = options.retainUnmatchedTokens;
            this._tokenEscaper = options.tokenEscaper || undefined;
            this._allowNoEscape = options.allowNoEscape;
            this._tokenRegistry = options._tokenRegistry || mvc.Components;
            this._applyTokensByDefault = 
                (options.hasOwnProperty('applyTokensByDefault'))
                    ? options.applyTokensByDefault
                    : this.applyTokensByDefault;
            this._retrieveTokensByDefault = 
                (options.hasOwnProperty('retrieveTokensByDefault'))
                    ? options.retrieveTokensByDefault
                    : this.retrieveTokensByDefault;
            
            // Initialize self to empty
            BaseModel.prototype.constructor.call(this, {});
            this._templates = new BaseModel({});
            this._bindings = {};
            this._pushed_properties = [];

            // When property templates change, update property bindings
            this.listenTo(this._templates, 'change', function(model, options) {
                this._updateBindingsForProperties(model.changed, options);
            });
            
            // Initialize property values and templates
            this.set(attributes, options);
        },
        
        _updateBindingsForProperties: function(properties, options) {
            var that = this;
            _.each(properties, function(propTemplate, propName) {
                var newBinding;
                if (propTemplate === undefined) {
                    newBinding = undefined;
                } else {
                    // Create new binding for the property that
                    // computes its value by taking the template
                    // and replacing any token escapes that occur.
                    var tokens = TokenUtils.getTokens(propTemplate, {
                        tokenNamespace: that._tokenNamespace
                    });
                    
                    var computeValueFunc = function(_retainUnmatchedTokens) {
                        // If template is a solitary token escape and the token
                        // has a non-string value, pass through that value.
                        // (String values may still need to go through additional
                        //  escaping based on the filter in the token escape.)
                        if (TokenUtils.isToken(propTemplate)) {
                            var token = tokens[0];
                            var tokenModel = that._tokenRegistry.getInstance(
                                token.namespace, { create: true });
                            var tokenValue = tokenModel.get(token.name);
                            if (!_.isString(tokenValue) && (tokenValue !== undefined)) {
                                return tokenValue;
                            }
                        }
                        
                        var templateSatisfied = _.all(tokens, function(token) {
                            var tokenModel = that._tokenRegistry.getInstance(
                                token.namespace, { create: true });
                            var tokenValue = tokenModel.get(token.name);
                            
                            var filtersSatisfied = _.all(token.filters, function(filter) {
                                var filterFunc = TokenUtils.getFilter(
                                    filter.name, that._tokenRegistry);
                                return (filterFunc !== undefined);
                            });
                            
                            return (tokenValue !== undefined) && filtersSatisfied;
                        });
                        
                        var propValue;
                        if (templateSatisfied || that._retainUnmatchedTokens || _retainUnmatchedTokens) {
                            propValue = TokenUtils.replaceTokens(
                                propTemplate, that._tokenRegistry, {
                                    tokenNamespace: that._tokenNamespace,
                                    escaper: that._tokenEscaper,
                                    allowNoEscape: that._allowNoEscape
                                });
                        } else {
                            propValue = undefined;
                        }
                        return propValue;
                    };
                    
                    var items = [];
                    _.each(tokens, function(token) {
                        items.push({
                            namespace: token.namespace,
                            name: token.name
                        });
                        
                        _.each(token.filters, function(filter) {
                            items.push({
                                namespace: TokenUtils._FILTER_NAMESPACE,
                                name: filter.name
                            });
                        });
                    });
                    
                    newBinding = {
                        observes: items,
                        template: propTemplate,
                        computeValue: computeValueFunc
                    };
                }
                
                that._setBinding(propName, newBinding, options);
            });
        },
        
        /*
         * This is an initial implementation of the general Data Binding
         * feature that Token Binding is implemented on top of.
         * 
         * Data Binding thinks not in terms of "tokens" but rather in terms
         * of a "binding", its "observed properties" and its "target property".
         * To reiterate, it should not be aware of tokens.
         */
        _setBinding: function(propName, newBinding, options) {
            var that = this;
            
            // Destroy the old binding, unregistering old listeners
            this._disposeBindingListeners(this._bindings[propName]);
            
            // Register new binding
            this._bindings[propName] = newBinding;
            
            if (newBinding !== undefined) {
                // When observed properties change, update the target property value
                newBinding._listeners = [];
                _.each(newBinding.observes, function(observedItem) {
                    var observedContext = that._tokenRegistry.getInstance(
                        observedItem.namespace, { create: true });
                    var observedPropName = observedItem.name;
                    var listener = function() {
                        that._pullPropertyValue(propName);
                    };
                    that.listenTo(observedContext, 'change:' + observedPropName, listener);
                    
                    // Save listener for later removal
                    listener.dispose = function() {
                        that.stopListening(observedContext, 'change:' + observedPropName, listener);
                    };
                    newBinding._listeners.push(listener);
                });
                
                // If property is push-enabled then push-enable the binding
                if (this._isPushEnabled(propName)) {
                    this._configureBindingForPush(propName);
                }
                
                /*
                 * Reconcile the target property's preexisting value (if defined)
                 * with the observed property(s)' value(s).
                 * 
                 * If this is a push-pull binding, the target property's value (if defined)
                 * takes precedence and otherwise the observed property's value is used.
                 * 
                 * If this is a pull-only binding, just initialize the target property's
                 * computed value based on the new binding.
                 */
                if (this._isPushEnabled(propName) && this.get(propName) !== undefined) {
                    this._pushPropertyValue(propName, options);
                } else {
                    this._pullPropertyValue(propName, options);
                }
            }
        },
        
        _pullPropertyValue: function(propName, options) {
            var binding = this._bindings[propName];
            var propValue = binding.computeValue();
            
            if (VERBOSE) {
                console.log('PROPAGATE: ' + propName + ' <- ' + propValue);
            }
            
            // We may have gotten a stashed silent value (see set()), so we have
            // to unstash it.
            options = options || {};
            if (options.hasOwnProperty('_silent')) {
                options.silent = options._silent;
                delete options._silent;
            }
            
            BaseModel.prototype.set.call(this, propName, propValue, options);
        },
        
        /**
         * Marks the specified property as being push-enabled.
         * A push-enabled property propagates changes to its value
         * to the single token in its associated template.
         * 
         * Due to this definition, a push-enabled property must be bound to a
         * template containing a single token. Attempting to push-enable any
         * other kind of property is an error.
         * @param {String} propName - The property name.
         */
        enablePush: function(propName) {
            if (this._isPushEnabled(propName)) {
                // Already push-enabled
                return;
            }
            
            this._pushed_properties.push(propName);
            
            // If binding already exists, push-enable it
            if (this._bindings[propName] !== undefined) {
                this._configureBindingForPush(propName);
            }
        },
        
        _isPushEnabled: function(propName) {
            return _.contains(this._pushed_properties, propName);
        },
        
        _configureBindingForPush: function(propName) {
            var binding = this._bindings[propName];
            if (!TokenUtils.isToken(binding.template)) {
                // This property's template is not presently bound to a
                // single token. Therefore there is no token that can
                // be pushed to yet.
                return;
            }
            
            // Forward value changes to solitary token in template
            var that = this;
            var listener = function(model, newValue, options) {
                that._pushPropertyValue(propName);
            };
            this.listenTo(this, 'change:' + propName, listener);
            
            // Save listener for later removal
            listener.dispose = function() {
                that.stopListening(that, 'change:' + propName, listener);
            };
            binding._listeners.push(listener);
        },
        
        _pushPropertyValue: function(propName, options) {
            var binding = this._bindings[propName];
            var newValue = this.get(propName);
            var observedItem = binding.observes[0];
            var observedContext = this._tokenRegistry.getInstance(
                observedItem.namespace, { create: true });
            var observedPropName = observedItem.name;
            
            if (VERBOSE) {
                console.log('PROPAGATE: ' + newValue + ' -> ' + observedPropName);
            }
            
            // We may have gotten a stashed silent value (see set()), so we have
            // to unstash it.
            options = options || {};
            if (options.hasOwnProperty('_silent')) {
                options.silent = options._silent;
                delete options._silent;
            }
            
            observedContext.set(observedPropName, newValue, options);
        },
        
        /**
         * Sets the specified property with a value.
         *
         * Values marked with "`mvc.tokenSafe`" are interpreted as templates.
         * 
         * @param {String} key - The name of the property to set.
         * @param {String} val - The value of the property.
         * @param {Object} [options] - Options.
         * @param {Boolean} [options.tokens=false] - Indicates whether to interpret
         * string values as a template rather than as a literal string. When `true`,
         * any string values are interpreted as templates rather than literal strings.
         */
        set: function(key, val, options) {
            var that = this;
            
            // Normalize arguments to (attrs, options)
            var attrs;
            if (typeof key === 'object') {
                attrs = key;
                options = val;
            } else {
                (attrs = {})[key] = val;
            }
            options = options || {};

            if (!options.hasOwnProperty('tokens')) {
                options.tokens = this._applyTokensByDefault;
            }

            // Collect changes to be made
            var bulkTemplateSets = {};
            var bulkTemplateUnsets = [];
            var bulkSelfSets = {};
            var queueTemplateSet = function(propName, propTemplate) {
                bulkTemplateSets[propName] = propTemplate;
            };
            var queueLiteralSet = function(propName, propValue) {
                if (!that._isPushEnabled(propName)) {
                    // Blank out any preexisting template unless this
                    // is a pushed property
                    bulkTemplateUnsets.push(propName);
                }
                bulkSelfSets[propName] = propValue;
            };
            _.each(attrs, function(propValue, propName) {
                if (propValue instanceof TokenSafeString) {
                    // Interpret as template.
                    queueTemplateSet(propName, propValue.value);
                } else if (propValue instanceof TokenEscapeString) {
                    // Interpret as literal value.
                    queueLiteralSet(propName, propValue.value);
                } else if (_.isString(propValue) && options.tokens) {
                    // Interpret as template.
                    queueTemplateSet(propName, propValue);
                } else {
                    // Otherwise interpret as a literal value.
                    queueLiteralSet(propName, propValue);
                }
            });
            
            // If we do a set/unset on _templates, we can't pass in 
            // {silent: true}, as that will preclude us from getting a change
            // event, and we won't be able to set up any bindings. Instead,
            // we stash the silent value in _silent, and only use these 
            // modified options for _templates.
            var optionsForTemplates = _.clone(options);
            if (options.hasOwnProperty('silent')) {
                optionsForTemplates._silent = options.silent;
                delete optionsForTemplates.silent;
            }
            
            // Perform changes in bulk
            if (!_.isEmpty(bulkTemplateSets)) {
                this._templates.set(bulkTemplateSets, optionsForTemplates);
            }
            if (!_.isEmpty(bulkTemplateUnsets)) {
                _.each(bulkTemplateUnsets, function(propName) {
                    if (that._templates && that._templates.has(propName)) {
                        that._templates.unset(propName, optionsForTemplates);
                    }
                });
            }
            if (!_.isEmpty(bulkSelfSets)) {
                BaseModel.prototype.set.call(this, bulkSelfSets, options);
            }
        },
        
        /**
         * Gets the value of the specified property. 
         * 
         * @param {String} key - The name of the property to get.
         * @param {Object} [options] - Options.
         * @param {Boolean} [options.tokens=false] - When `true`, returns the 
         * template string for the specified property rather than its current value.
         */
        get: function(key, options) {
            options || (options = {});
            if (!options.hasOwnProperty('tokens')) {
                options.tokens = this._retrieveTokensByDefault;
            }

            if (options.tokens) {
                if (this._templates.has(key)) {
                    return this._templates.get(key);
                } else {
                    return TokenUtils.quoteAsTokenString(
                        BaseModel.prototype.get.call(this, key));
                }
            } else {
                var v = BaseModel.prototype.get.call(this, key);
                if (v == null && options.retainUnmatchedTokens && this._templates.has(key)) {
                    v = TokenUtils.replaceTokens(this._templates.get(key), this._tokenRegistry, {
                        tokenNamespace: this._tokenNamespace,
                        escaper: this._tokenEscaper,
                        allowNoEscape: this._allowNoEscape
                    });
                }
                return v;
            }
        },
        
        /**
         * Returns a dictionary of all properties for this model
         * with the specified prefix. The prefix is removed in the returned copy.
         * 
         * Properties that are computed from templates are returned
         * as an appropriate `mvc.tokenSafe(...)` value.
         * 
         * For example, if this model has `{'value': 'foo', 'tp_value': 'bar'}`,
         * and the prefix for extraction is `'tp_'`, the returned dictionary
         * is `{'value': 'bar'}`.
         * @param {String} prefix - The prefix.
         */
        extractWithPrefix: function(prefix) {
            var that = this;
            
            var extractedProperties = {};
            _.each(_.keys(this.attributes), function(propNameOnThis) {
                if (propNameOnThis.indexOf(prefix) === 0) {
                    var propName = 
                        propNameOnThis.substring(prefix.length);
                    
                    // Get property's template or literal value
                    var propValue;
                    var templateValue = that.get(propNameOnThis, {tokens: true});
                    if (templateValue !== undefined) {
                        propValue = mvc.tokenSafe(templateValue);
                    } else {
                        propValue = that.get(propNameOnThis);
                    }
                    
                    extractedProperties[propName] = propValue;
                }
            });
            return extractedProperties;
        },
        
        /**
         * Returns a copy of all properties for this model.
         * 
         * @param {Object} [options] - Options.
         * @param {Boolean} [options.tokens=false] - When `true`, returns the 
         * template string for the specified property rather than its current value.
         */
        toJSON: function(options) {
            options || (options = {});
            if (!options.hasOwnProperty('tokens')) {
                options.tokens = this._retrieveTokensByDefault;
            }
            
            if (options.tokens) {
                var that = this;
                
                var result = {};
                // Fill in quoted literals
                _.each(this.attributes, function(value, key) {
                    result[key] = that.get(key, {tokens: true});
                });
                // Fill in real templates
                result = _.extend(result, this._templates.toJSON());
                return result;
            } else {
                return BaseModel.prototype.toJSON.apply(this, arguments);
            }
        },

        dispose: function() {
            this._templates.deepOff();
            _.each(this._bindings, this._disposeBindingListeners);
            this._bindings = {};
            this.deepOff();
        },

        _disposeBindingListeners: function(binding) {
            if (binding) {
                _.each(binding._listeners, function(listener) {
                    listener.dispose();
                });
                binding._listeners = [];
            }
        }
    });
    
    /*
     * Creates an empty report model for use by low-level core UI views.
     * 
     * Core UI views expect that templated properties can always be
     * accessed and that they retain unmatched tokens. It is also assumed
     * that templated properties can be set without specifying `{tokens: true}`
     * explicitly.
     * 
     * Package-private.
     */
    TokenAwareModel._createReportModel = function(attributes) {
        return new TokenAwareModel(attributes || {}, {
            applyTokensByDefault: true,
            retainUnmatchedTokens: true
        });
    };
    
    return TokenAwareModel;
});
