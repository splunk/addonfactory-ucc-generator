define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {

    function ItemState() {
        this.initialize.apply(this, arguments);
    }

    _.extend(ItemState.prototype, Backbone.Events, {
        stateIdPrefix: 'state_',
        initState: {},
        initialize: function(initialState, xml, options) {
            options || (options = {});
            this._dirty = false;
            this._state = $.extend(true, {}, _.result(this, 'initState'));
            this._committedState = $.extend(true, {}, _.result(this, 'initState'));
            this._originalXML = null;
            this._xml = null;
            this._stateOptions = options.stateOptions;
            if (initialState) {
                this.setState(initialState, options);
                this.commitState();
            }
            if (xml) {
                this.setXML(xml);
                this.updateOriginalXML();
            }
            this.updateId(options);

        },
        updateId: function(options) {
            options || (options = {});
            this._autoId = options.autoId;
            if (options.id) {
                this.id = options.id;
                return;
            }
            if (this.idAttribute) {
                this.id = this._state[this.idAttribute];
            }
            if (!this.id) {
                this.id = _.uniqueId(this.stateIdPrefix);
            }
        },
        _cleanStateObject: function(state) {
            state = $.extend(true, {}, state);
            for (var k in state) {
                if (state.hasOwnProperty(k)) {
                    var v = state[k];
                    if (v === undefined) {
                        delete state[k];
                    }
                }
            }
            return state;
        },
        setState: function(state) {
            this._state = this._cleanStateObject(state);
            this.triggerIfNecessary();
        },
        restoreState: function() {
            this._state = this.getCommittedState();
            this.triggerIfNecessary();
        },
        clear: function() {
            ItemState.prototype.setState.call(this, $.extend(true, {}, _.result(this, 'initState')));
        },
        commitState: function(options) {
            options || (options = {});
            this._committedState = this.getState();
            if (options.updateOriginalXML === true) {
                this.updateOriginalXML();
            }
            this.triggerIfNecessary();
        },
        triggerIfNecessary: function() {
            var dirty = this.isDirty();
            if (dirty !== this._dirty) {
                this.trigger(dirty ? 'dirty' : 'clean', this.getState(), this.getCommittedState());
                this._dirty = dirty;
            }
            dirty && this.trigger('changed', this);
        },
        getDiff: function() {
            var diff = {added: {}, changed: {}, removed: {}};
            var state = this._state;
            var committed = this._committedState;
            _.each(_.union(_.keys(state), _.keys(committed)), function(key) {
                if (state[key] !== committed[key]) {
                    if (state[key] != null && committed[key] != null) {
                        diff.changed[key] = state[key];
                    } else if (state[key]) {
                        diff.added[key] = state[key];
                    } else {
                        diff.removed[key] = committed[key];
                    }
                }
            });
            return diff;
        },
        getState: function() {
            return $.extend(true, {}, this._state);
        },
        getCommittedState: function() {
            return $.extend(true, {}, this._committedState);
        },
        isDirty: function() {
            return !_.isEqual(this._state, this._committedState);
        },
        getXML: function() {
            return this._xml;
        },
        setXML: function(xml) {
            this._xml = xml;
        },
        getOriginalXML: function() {
            return this._originalXML;
        },
        updateOriginalXML: function() {
            this._originalXML = this.getXML();
        },
        isPredefinedID: function() {
            return this._autoId === false;
        }
    });

    ItemState.extend = Backbone.Model.extend;

    return ItemState;
});