define([
            'jquery',
            'underscore',
            'util/backbone',
            'util/console'
        ],
        function(
            $,
            _,
            backboneUtils,
            console
        ) {

    var ApiDependencyAggregator = function() {
        this._handlers = [];
        this._isFetching = false;
        this._previousDepList = [];
    };

    _.extend(ApiDependencyAggregator.prototype, {

        addHandler: function(resource, flags, callback) {
            if (this._isFetching) {
                throw new Error('addHandler cannot be called while a fetch is in progress');
            }
            if (!callback) {
                callback = flags;
                flags = null;
            }
            var handlerEntry = { _resourceType: resource, callback: callback };
            if (_.isArray(flags) && flags.length > 0) {
                handlerEntry.flags = flags;
            }
            this._handlers.unshift(handlerEntry);
        },

        fetchAll: function(config, context) {
            if (this._isFetching) {
                throw new Error('fetchAll cannot be called while another fetch is in progress');
            }
            config = this._normalizeConfig(config, context);
            this._activeDepList = this._convertToDependencyList(config);
            this._isFetching = true;
            // NOTE: applying the handlers might modify the _activeDepList
            // if the handlers call the waitFor method.
            this._applyHandlersToDependencyList(this._activeDepList, context);
            return this._waitForBlockingDependencies(this._activeDepList)
                .then(function() {
                    this._updatePreviousDependencies($.extend(true, [], this._activeDepList));
                    return this._convertDependenciesToResourceTree(this._activeDepList, config);
                }.bind(this))
                .always(function() {
                    this._isFetching = false;
                }.bind(this));
        },

        isFetchingResource: function(resourceType, flags) {
            if (!this._isFetching) {
                throw new Error('isFetchingResource can only be called while a fetch is in progress');
            }
            var dep = { _resourceType: resourceType };
            if (flags) {
                dep.flags = flags;
            }
            return !!this._findMatchingDependency(dep, this._activeDepList);
        },

        waitFor: function(resourceType, flags) {
            if (!this._isFetching) {
                throw new Error('waitFor can only be called while a fetch is in progress');
            }
            var dep = { _resourceType: resourceType };
            if (flags) {
                dep.flags = flags;
            }
            var match = this._findMatchingDependency(dep, this._activeDepList);
            // If the requested dependency is not already being handled, it needs to be
            // added the active dependency list on the fly.
            if (!match) {
                match = _.extend({ blocking: false }, dep);
            }
            if (!match.deferred) {
                this._applyHandlersToDependency(match);
                this._addToDependencyList(match, this._activeDepList);
            }
            return match.deferred.then(function() {
                return match.resource;
            });
        },

        _normalizeConfig: function(config, context) {
            var newConfig = {};
            if (config.hasOwnProperty('apiDependencies')) {
                config = _(config.apiDependencies).isFunction() ? config.apiDependencies(context) : config.apiDependencies;
            }
            if (_.isFunction(config)) {
                config = config(context);
            }
            _(config).each(function(entry, name) {
                if (entry.hasOwnProperty('apiDependencies')) {
                    var nestedConfig = _(entry.apiDependencies).isFunction() ? entry.apiDependencies(context) : entry.apiDependencies;
                    newConfig[name] = this._normalizeConfig(nestedConfig, context);
                } else {
                    if (backboneUtils.isModelConstructor(entry) || backboneUtils.isCollectionConstructor(entry)) {
                        entry = { resourceType: entry };
                    }
                    entry = _.extend({ blocking: true }, entry);
                    entry._resourceType = entry.resourceType;
                    delete entry.resourceType;
                    if (!_.isArray(entry.flags) || entry.flags.length === 0) {
                        delete entry.flags;
                    }
                    newConfig[name] = entry;
                }
            }, this);
            return newConfig;
        },

        _convertToDependencyList: function(config) {
            var depList = [];
            _(config).each(function(entry) {
                if (entry._resourceType) {
                    this._addToDependencyList(entry, depList);
                } else {
                    _(this._convertToDependencyList(entry)).each(function(nestedEntry) {
                        this._addToDependencyList(nestedEntry, depList);
                    }, this);
                }
            }, this);
            return depList;
        },

        _addToDependencyList: function(dep, depList) {
            var match = this._findMatchingDependency(dep, depList);
            if (!match) {
                depList.push(dep);
            } else {
                match.blocking = (match.blocking || dep.blocking);
            }
            return match;
        },

        _applyHandlersToDependencyList: function(depList) {
            _(depList).each(function(dep) {
                // calls to waitFor can cause the handlers to applied multiple times,
                // successive calls should be ignored.
                if (dep.deferred) {
                    return;
                }
                this._applyHandlersToDependency(dep);
            }, this);
        },

        _applyHandlersToDependency: function(dep) {
            var handler = this._findMatchingDependency(dep, this._handlers);
            if (!handler) {
                console.error('Unable to find a handler for resource type', dep._resourceType, 'with flags', dep.flags || []);
                throw new Error('No handler found for at least one dependency');
            }
            var previous = this._findMatchingDependency(dep, this._previousDepList) || null;
            var handlerResult = handler.callback(previous ? previous.resource : null, this);
            // The handler can return a single value instead of a resource/deferred pair.
            // Wrap that value with $.when since it can be a deferred or it can be the resource itself.
            if (!handlerResult.deferred) {
                handlerResult = { deferred: $.when(handlerResult) };
            }
            dep.resource = handlerResult.resource;
            dep.deferred = handlerResult.deferred;
            // Instead of defining the resource up-front, the deferred can resolve to the resource.
            if (!dep.resource) {
                dep.deferred = dep.deferred.then(function(resource) {
                    dep.resource = resource;
                });
            }
        },

        _updatePreviousDependencies: function(updatedDeps) {
            var previous = this._previousDepList;
            this._previousDepList = updatedDeps;
            _(previous).each(function(previousDep) {
                this._addToDependencyList(previousDep, this._previousDepList);
            }, this);
        },

        _waitForBlockingDependencies: function(depList) {
            var blockingDeferreds = _(depList).chain()
                .where({ blocking: true })
                .pluck('deferred')
                .value();

            return $.when.apply($, blockingDeferreds);
        },

        _convertDependenciesToResourceTree: function(depList, config) {
            var resourceTree = { deferreds: {} };
            _(config).each(function(entry, name) {
                if (entry.hasOwnProperty('_resourceType')) {
                    var dep = this._findMatchingDependency(entry, depList);
                    if (!dep) {
                        throw new Error(
                            'Unable to find a handled dependency for a config entry.  '
                            + 'This should not happen.'
                        );
                    }
                    resourceTree[name] = dep.resource;
                    resourceTree.deferreds[name] = dep.deferred;
                } else {
                    resourceTree[name] = this._convertDependenciesToResourceTree(depList, entry);
                }
            }, this);
            return resourceTree;
        },

        _findMatchingDependency: function(dep, depList) {
            return _(depList).find(function(testDep) {
                return (
                    dep._resourceType === testDep._resourceType
                        && _.isEqual(dep.flags, testDep.flags)
                );
            });
        }

    });

    return ApiDependencyAggregator;

});