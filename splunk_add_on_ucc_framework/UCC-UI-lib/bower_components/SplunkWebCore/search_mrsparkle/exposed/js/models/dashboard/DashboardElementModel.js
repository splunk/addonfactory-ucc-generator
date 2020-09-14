define([
    'underscore',
    'backbone',
    'splunkjs/mvc/tokenawaremodel',
    'splunkjs/mvc/tokenutils'
], function(_, Backbone, TokenAwareModel, TokenUtils) {
    /**
     * A special token aware model that introduce following behaviour to original one
     *
     * Always work on tokens:true in dashboard edit mode unless specify explicitly.
     * set with tokens:true while get and toJSON with tokens:false in view mode unless specify explicitly.
     * Trigger change event when dashboard mode change if report properties contain tokens
     */

    var DEFAULT_OPTIONS = {
        edit: {
            set: {
                tokens: true
            },
            get: {
                tokens: true
            },
            toJSON: {
                tokens: true
            }
        },
        view: {
            set: {
                tokens: true
            },
            get: {
                tokens: false
            },
            toJSON: {
                tokens: false
            }
        }
    };

    var DashboardTokenAwareModel = TokenAwareModel.extend({
        constructor: function(attributes, options) {
            this._state = options.state || new Backbone.Model();
            // a model that track report properties change when switch dashboard mode.
            this._diff = new Backbone.Model();
            TokenAwareModel.prototype.constructor.apply(this, arguments);
            this.listenTo(this._state, 'change:mode', this._onModeChange);
            this.listenTo(this._diff, 'all', this.trigger);
        },
        set: function(k, v, options) {
            var optionOverride = this._getDefaultOptions();
            if (typeof k === 'object') {
                // value is options
                v = _.extend({}, optionOverride.set, v);
            }
            else {
                options = _.extend({}, optionOverride.set, options);
            }
            return TokenAwareModel.prototype.set.call(this, k, v, options);
        },
        get: function(k, options) {
            var defaultOptions = this._getDefaultOptions();
            return TokenAwareModel.prototype.get.call(this, k, _.extend({}, defaultOptions.get, options));
        },
        toJSON: function(options) {
            var defaultOptions = this._getDefaultOptions();
            return TokenAwareModel.prototype.toJSON.call(this, _.extend({}, defaultOptions.toJSON, options));
        },
        _isEditMode: function() {
            return this._state.get('mode') === 'edit';
        },
        _getDefaultOptions: function() {
            return this._isEditMode() ? DEFAULT_OPTIONS.edit : DEFAULT_OPTIONS.view;
        },
        _onModeChange: function() {
            // when dashboard mode change, trigger change event for values that contains token
            // for example, we have following key, value in report properties
            // {'foo':'$token$'}
            // in view mode, $token$ will resolve to its value, for example {'foo':'bar'}
            // while in edit mode it will resolve to its token value {'foo':'$token$'}
            // the purpose here is to trigger a change event for 'foo' property so that editor can pick up the latest value
            var previous = this._state.previous('mode');
            var now = this._state.get('mode');
            if (DEFAULT_OPTIONS[previous] && DEFAULT_OPTIONS[now]) {
                var from = TokenAwareModel.prototype.toJSON.call(this, DEFAULT_OPTIONS[previous].toJSON);
                var to = TokenAwareModel.prototype.toJSON.call(this, DEFAULT_OPTIONS[now].toJSON);
                this._diff.clear({silent: true});
                this._diff.set(from, {silent: true});
                this._diff.set(to);
            }
        }
    });

    return DashboardTokenAwareModel;
});