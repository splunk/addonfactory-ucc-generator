define([
    'underscore',
    'backbone',
    'util/console'
], function(_, Backbone, console) {

    function ItemStateCollection() {
        this.initialize.apply(this, arguments);
    }

    _.extend(ItemStateCollection.prototype, Backbone.Events, {
        initialize: function() {
            this._dirty = false;
            this._items = {};
            this._deletedItems = [];
            this._addedItems = [];
        },
        add: function(state) {
            this.addStateInternal(state);
            if (_.contains(this._deletedItems, state)) {
                this._deletedItems = _(this._deletedItems).without(state);
            } else {
                this._addedItems.push(state);
            }
            this.triggerIfNecessary();
        },
        addStateInternal: function(state) {
            if (this._items[state.id]) {
                console.log('Overwriting state %o', state.id);
                this.removeStateInternal(this._items[state.id]);
            }
            this._items[state.id] = state;
            this.listenTo(state, 'all', this.triggerIfNecessary);
        },
        remove: function(id) {
            var state = this._items[id];
            if (state) {
                if (_.contains(this._addedItems, state)) {
                    this._addedItems = _(this._addedItems).without(state);
                } else {
                    this._deletedItems.push(state);
                }
                this.removeStateInternal(state);
                this.triggerIfNecessary();
                return true;
            } else {
                return false;
            }
        },
        removeStateInternal: function(state) {
            this.stopListening(state);
            delete this._items[state.id];
        },
        clear: function() {
            _(this._items).chain().keys().each(function(id) {
                this.remove(id);
            }.bind(this));
        },
        has: function(id) {
            return !!this._items[id];
        },
        get: function(id) {
            return this._items[id];
        },
        getStates: function() {
            return _.values(this._items);
        },
        restoreState: function() {
            _(this._addedItems).each(this.removeStateInternal.bind(this));
            this._addedItems = [];
            _(this._deletedItems).each(this.addStateInternal.bind(this));
            this._deletedItems = [];
            _(this._items).invoke('restoreState');
            this.triggerIfNecessary();
        },
        commitState: function(options) {
            this._addedItems = [];
            this._deletedItems = [];
            _(this._items).invoke('commitState', options);
            this.triggerIfNecessary();
        },
        triggerIfNecessary: function() {
            var dirty = this.isDirty();
            if (dirty !== this._dirty) {
                this.trigger(dirty ? 'dirty' : 'clean', this);
                this._dirty = dirty;
            }
            dirty && this.trigger('changed', this);
        },
        diff: function() {
            var added = this._addedItems.slice();
            var removed = this._deletedItems.slice();
            var changed = _(this._items).chain().values()
                .filter(function(item) {
                    return item.isDirty() && !_.contains(added, item);
                }).value();
            return {
                added: added,
                removed: removed,
                changed: changed
            };
        },
        isDirty: function() {
            return _(this._items).any(function(item) { return item.isDirty(); }) ||
                this._deletedItems.length > 0 || this._addedItems.length > 0;
        },
        find: function(predicate, ctx) {
            return _.find(this._items, predicate, ctx);
        },
        empty: function() {
            return _.isEmpty(this._items);
        }
    });

    ItemStateCollection.extend = Backbone.Model.extend;

    return ItemStateCollection;
});