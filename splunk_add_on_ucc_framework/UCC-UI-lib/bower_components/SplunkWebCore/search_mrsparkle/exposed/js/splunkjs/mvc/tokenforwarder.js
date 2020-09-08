define(function(require, exports, module) {
    var _ = require('underscore');
    var Backbone = require('backbone');
    var mvc = require('./mvc');
    var TokenUtils = require('./tokenutils');

    /**
     * @constructor
     * @memberOf splunkjs.mvc
     * @name TokenForwarder
     * @description The **TokenForwarder** base class is used for creating custom
     * token forwarders. A token forwarder transforms values from one or more 
     * input tokens to an output token. A token forwarder can also validate input
     * tokens, and take special action for invalid input.
     * 
     * **Syntax**
     * 
     *     var myForwarder = new TokenForwarder(
     *         ["$inputToken1$", ..., "$inputTokenN"],
     *         "$outputToken$",
     *         function(inputTokenVal1, ..., inputTokenValN) {
     *             ...
     *             return outputTokenValue;
     *         }
     *     );
     *
     * @example
     * // Form a new output token $searchQuery$ from input token $selectedField$
     * var tf = new TokenForwarder("$selectedField$", "$searchQuery$", function(selectedField) {
     *     var searchQuery = (selectedField === "message")
     *         ? "index=_internal | top 3 message"
     *         : "* | top 3 " + selectedField;
     *     return searchQuery;
     * });
     * 
     * // Add a button to stop the token forwarder
     * $("#stopButton").on("click", function() {
     *     if (tf) {
     *         tf.dispose();
     *         
     *         $("#stopButton").addClass("disabled");
     *         tf = null;
     *     }
     * });
     */
    var TokenForwarder = function() {
        TokenForwarder.prototype.initialize.apply(this, arguments);
    };
    _.extend(TokenForwarder,{
        /** 
         * @constant {String} Constant that can be returned from the filtering 
         * function to indicate that the output token should not be changed. 
         */
        NO_CHANGE: { _forwardNoChange: true }
    });
    _.extend(TokenForwarder.prototype, /** @lends splunkjs.mvc.TokenForwarder.prototype */{
        /**
         * Creates the token forwarder.
         * @param inputTokenOrList  A list of input tokens to observe and
         *                          forward. Can also just be a single token.
         *                          @example: ["$token1$", "$token2$"]
         * 
         * @param outputToken       An output token to update.
         * 
         * @param filterFunc        A filtering function that takes
         *                          values for the input tokens and returns
         *                          a new filtered value to assign to the
         *                          output token. May return
         *                          TokenForwarder.NO_CHANGE to signal that the
         *                          output token should be not be updated.
         *                          @example: function(token1, token2) { return ... }
         */
        initialize: function(inputTokenOrList, outputToken, filterFunc) {
            var inputTokens = (_.isString(inputTokenOrList))
                ? [inputTokenOrList]
                : inputTokenOrList;
            
            var inputTokenDescs = _.map(inputTokens, function(inputToken) {
                if (!TokenUtils.isToken(inputToken)) {
                    throw new Error('Not a valid input token: ' + inputToken);
                }
                var inputTokenDesc = TokenUtils.getTokens(inputToken)[0];
                if (inputTokenDesc.filters.length > 0) {
                    throw new Error('Input token may not have filters: ' + inputToken);
                }
                return inputTokenDesc;
            });
            
            var outputTokenDesc;
            if (!TokenUtils.isToken(outputToken)) {
                throw new Error('Not a valid output token: ' + outputToken);
            }
            outputTokenDesc = TokenUtils.getTokens(outputToken)[0];
            if (outputTokenDesc.filters.length > 0) {
                throw new Error('Output token may not have filters: ' + outputToken);
            }
            
            var recomputeOutputToken = function() {
                var inputValues = _.map(inputTokenDescs, function(tokenDesc) {
                    var ns = mvc.Components.getInstance(
                        tokenDesc.namespace,
                        { create: true });
                    return ns.get(tokenDesc.name);
                });
                
                var outputValue = filterFunc.apply(null, inputValues);
                var ns = mvc.Components.getInstance(
                    outputTokenDesc.namespace,
                    { create: true });
                if (outputValue !== TokenForwarder.NO_CHANGE) {
                    ns.set(outputTokenDesc.name, outputValue);
                }
            };
            
            // Recompute the output token initially and whenever the
            // input tokens change.
            this._listeners = _.extend({}, Backbone.Events);
            _.each(inputTokenDescs, function(tokenDesc) {
                var ns = mvc.Components.getInstance(
                    tokenDesc.namespace,
                    { create: true });
                this._listeners.listenTo(
                    ns, 'change:' + tokenDesc.name,
                    recomputeOutputToken);
            }, this);
            recomputeOutputToken();
        },
        
        /**
         * Destroys the token forwarder.
         */
        dispose: function() {
            this._listeners.stopListening();
        }
    });

    return TokenForwarder;
});
