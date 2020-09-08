define([
    'underscore',
    './eventhandler',
    'util/eval',
    'splunkjs/mvc/tokenutils',
    'util/console'
], function(_,
            EventHandler,
            Eval,
            TokenUtils,
            console) {

    /**
     * The search event handler hooks into a event of a search manager and triggers the execution of actions
     * when the event occurs.
     */
    var SearchEventHandler = EventHandler.extend({
        componentIdSetting: 'managerid',

        normalizeEventName: function() {
            var event = this.settings.get('event');
            var eventSettings = SearchEventHandler.events[event];
            if (eventSettings.data === false && eventSettings.withData && this.needsResultsData()) {
                this.settings.set('event', eventSettings.withData);
            }
        },

        startListeningToManager: function(mgr, event) {
            this._component = mgr;
            var eventSettings = SearchEventHandler.events[event];

            if (eventSettings.data === false && eventSettings.withData && this.needsResultsData()) {
                eventSettings = SearchEventHandler.events[eventSettings.withData];
            }

            if (eventSettings.data) {
                var data = this._data = mgr.data(eventSettings.data, eventSettings.fetchOptions);
                this.listenTo(data, 'data nodata', this.handleDataLoaded);
            } else {
                this.listenTo(mgr, 'search:' + event, this.handleEvent);
            }
        },

        needsResultsData: function() {
            var conditions = this.settings.get('conditions');

            function containsResultDataVariable(variableList) {
                return _.any(variableList, function(variable) {
                    return variable.indexOf('result.') === 0;
                });
            }

            function evalContainsResultDataVariable(evalExpression) {
                try {
                    var expr = Eval.compile(evalExpression);
                    return containsResultDataVariable(expr.findVariables(true));
                } catch (e) {
                    return false;
                }
            }

            function tokenStringContainsDataVariable(tokenString) {
                return containsResultDataVariable(TokenUtils.getTokenNames(tokenString));
            }

            return !!(conditions && _.any(conditions, function(condition) {
                if (condition.attr === 'match') {
                    if (evalContainsResultDataVariable(condition.value)) {
                        return true;
                    }
                }
                return _.any(condition.actions, function(action) {
                    switch (action.type) {
                        case 'eval':
                            return evalContainsResultDataVariable(action.value);
                        case 'set':
                        case 'link':
                            return tokenStringContainsDataVariable(action.value);
                        default:
                            return false;
                    }
                });
            }));
        },

        stopListeningToManager: function() {
            if (this._data) {
                this.stopListening(this._data);
                this._data.destroy();
                this._data = null;
            }
            if (this._component) {
                this.stopListening(this._component);
                this._component = null;
            }
        },

        onComponentChange: function(_components, manager) {
            this.stopListeningToManager();
            this.startListeningToManager(manager, this.settings.get('event'));
        },

        createEventData: function(eventName, e) {
            var eventSettings = SearchEventHandler.events[eventName];
            var eventData = {data: {}};
            if (eventSettings.data) {
                _.extend(eventData.data, SearchEventHandler.getResultModel(this._data.data()));
            }

            if (eventSettings.props) {
                _.extend(eventData.data, SearchEventHandler.getJobPropertiesModel(e));
            }

            if (eventSettings.msg) {
                eventData.data.message = e;
            }

            return eventData;
        },

        handleDataLoaded: function() {
            this.handleEvent({content: this._component.get('data')});
        },

        handleEvent: function(e) {
            var event = this.settings.get('event');
            var eventData = this.createEventData(event, e);
            if (eventData != null) {
                EventHandler.prototype.handleEvent.call(this, eventData);
            }
        }
    }, {
        expandJobProperties: function (target, source, keyPrefix) {
            _.each(source, function (value, key) {
                if (_.isObject(value)) {
                    SearchEventHandler.expandJobProperties(target, value, keyPrefix + "." + key);
                } else {
                    target[keyPrefix + "." + key] = value;
                }
            });
        },
        getJobPropertiesModel: function (jobData) {
            var model = {};
            _.each(jobData.content, function (value, key) {
                if (_.isObject(value)) {
                    SearchEventHandler.expandJobProperties(model, value, "job." + key);
                } else {
                    model['job.' + key] = value;
                }
            });
            return model;
        },

        getResultModel: function(data) {
            var model = {};
            if (data && data.results && data.results.length) {
                _.each(data.results[0], function(value, field) {
                    model['result.' + field] = value;
                });
            }
            return model;
        },

        events: {
            progress: {
                data: false,
                props: true,
                withData: 'preview'
            },
            preview: {
                data: 'preview',
                // Fetch options for the data
                fetchOptions: {
                    output_mode: 'json',
                    count: 1
                },
                props: true
            },
            done: {
                data: false,
                props: true,
                withData: 'finalized'
            },
            finalized: {
                data: 'results',
                fetchOptions: {
                    count: 1,
                    output_mode: 'json',
                    condition: function(mgr) {
                        var data = mgr.get('data');
                        // Fetch data once the job is done
                        return data && data.isDone;
                    }
                },
                props: true
            },
            error: {
                msg: true
            },
            fail: {
                msg: true
            },
            cancelled: {
                msg: false
            }
        }
    });

    return SearchEventHandler;
});
