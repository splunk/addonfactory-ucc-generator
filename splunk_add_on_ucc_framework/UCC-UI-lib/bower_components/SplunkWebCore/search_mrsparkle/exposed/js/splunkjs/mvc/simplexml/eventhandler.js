define([
    'underscore',
    'splunkjs/mvc',
    'splunkjs/mvc/basemanager',
    'splunkjs/mvc/basesplunkview',
    'splunkjs/mvc/settings',
    'splunkjs/mvc/tokenutils',
    'splunkjs/mvc/utils',
    'splunk.util',
    'util/eval',
    'util/console'
], function (_, mvc, BaseManager, BaseSplunkView, Settings, TokenUtils, Utils, SplunkUtil, Eval, console) {

    var EventHandler = BaseManager.extend({
        componentIdSetting: 'viewid',
        initialize: function (options) {
            if (!options.event) {
                throw new Error('No event name specified for event handler instance');
            }
            if (options.actions && !options.conditions) {
                if (options.allowImplicitConditions) {
                    var implicit = options.allowImplicitConditions;
                    var conditions = [];
                    var defaultActions = [];

                    _(options.actions).each(function(action) {
                        if(_(implicit.actions).contains(action.type)) {
                            var condAttr = _(implicit.attributes).find(function(attr){ return action[attr] != null; });
                            if (condAttr) {
                                conditions.push({ attr: implicit.attr, value: action[condAttr], actions: [action] });
                                return;
                            }
                        }
                        defaultActions.push(action);
                    });

                    if (defaultActions.length > 0) {
                        conditions.push({ value: '*', actions: defaultActions });
                    }
                    options.conditions = conditions;
                } else {
                    options.conditions = [{ value: '*', actions: options.actions }];
                }
            }
            this.settings = new Settings(_.pick(options, this.componentIdSetting, 'event', 'conditions', 'target'));
            this.normalizeEventName();
            this.listenTo(this.settings, 'change:event', this.normalizeEventName);
            this.bindToComponentSetting();
        },
        normalizeEventName: function() {
            // Nothing to do in the base event handler
        },
        bindToComponentSetting: function() {
            if (this.settings.has(this.componentIdSetting)) {
                this.bindToComponent(this.settings.get(this.componentIdSetting));
            }
            this.listenTo(this.settings, 'change:' + this.componentIdSetting, this.bindToComponent);
        },
        bindToComponent: function(){
            var componentId = this.settings.get(this.componentIdSetting);
            this.listenTo(mvc.Components, 'change:' + componentId, this.onComponentChange);
            var cur = mvc.Components.get(componentId);
            if(cur) {
                this.onComponentChange(null, cur);
            }
        },
        onComponentChange: function (components, component) {
            if (this._component) {
                this.stopListening(this._component);
            }
            if (component) {
                this._component = component;
                this.listenTo(component, this.settings.get('event'), this.handleEvent);
            }
        },
        handleEvent: function (e) {
            var conditions = this.settings.get('conditions');
            if (e && conditions && conditions.length) {
                var match = _(conditions).find(_.partial(_.bind(this.conditionMatches, this), _, e));
                if (match) {
                    var data = e.data;
                    var origEvent = e.event && e.event.originalEvent ? e.event.originalEvent : null;

                    if (_.isFunction(e.preventDefault)) {
                        e.preventDefault();
                    }

                    _(match.actions).each(_.partial(_.bind(this.executeAction, this), _, data, origEvent));
                }
            }
        },
        conditionMatches: function (condition, e) {
            if (condition.attr === 'match') {
                return EventHandler.evaluateCondition(condition.value, e.data);
            }
            if (condition.value == '*') {
                return true;
            } else {
                return e[condition.attr] === condition.value;
            }
        },
        executeAction: function (action, data, evt) {
            var target = this.settings.get('target');
            switch (action.type) {
                case "set":
                    return EventHandler.setToken(action.token, action.value, action, data);
                case "unset":
                    return EventHandler.unsetToken(action.token);
                case "link":
                    var newWindow = evt && !!(evt.metaKey || evt.ctrlKey);
                    return EventHandler.linkTo(action.value, action.target || target, data, newWindow);
                case "eval":
                    return EventHandler.evalToken(action.token, action.value, data);
                default:
                    throw new Error('Invalid drilldown action type ' + JSON.stringify(action.type));
            }
        }
    }, {
        setToken: function (name, format, options, data) {
            var value;
            if (options.delimiter != null && _.isArray(data)) {
                value = _(data).map(function(data){
                    var model = EventHandler.getTokenModel(data);
                    return TokenUtils.replaceTokenNames(format, model);
                }).join(options.delimiter);
            } else {
                if (_.isArray(data)) {
                    data = _.first(data);
                }
                var model = EventHandler.getTokenModel(data);
                value = TokenUtils.replaceTokenNames(format, model);
            }

            if (options.prefix != null || options.suffix != null) {
                value = (options.prefix || '') + value + (options.suffix || '');
            }

            EventHandler.applyTokenValue(name, value);
        },
        evalToken: function(name, expr, data) {
            try {
                EventHandler.applyTokenValue(name, EventHandler.evaluate(expr, data));
            } catch (e) {
                console.error('Error executing eval expression %s: %s', expr, e);
            }
        },
        applyTokenValue: function(name, value){
            var defaultTokenModel = mvc.Components.get('default');
            var submittedTokenModel = mvc.Components.get('submitted');
            defaultTokenModel.set(name, value);
            if (submittedTokenModel) {
                submittedTokenModel.set(name, value);
            }
        },
        unsetToken: function (name) {
            var defaultTokenModel = mvc.Components.get('default');
            var submittedTokenModel = mvc.Components.get('submitted');
            defaultTokenModel.unset(name);
            if (submittedTokenModel) {
                submittedTokenModel.unset(name);
            }
        },
        linkTo: function (urlFormat, target, data, newWindow) {
            if (urlFormat[0] === '/' && urlFormat[1] !== '/') {
                urlFormat = SplunkUtil.make_url(urlFormat);
            }
            var url = TokenUtils.replaceTokenNames(urlFormat, EventHandler.getTokenModel(data), TokenUtils.getEscaper('url'), EventHandler.getTokenFilters());

            Utils.redirect(url, newWindow, target);
        },
        getTokenModel: function (data) {
            var submittedTokenModel = mvc.Components.get('submitted');
            return _.extend(submittedTokenModel ? submittedTokenModel.toJSON() : {}, data);
        },
        getTokenFilters: function() {
            return TokenUtils.getFilters(mvc.Components);
        },
        evaluate: function(expr, data) {
            return Eval.execute(expr, EventHandler.getTokenModel(data), true);
        },
        evaluateCondition: function(expr, data){
            try {
                var result = EventHandler.evaluate(expr, data);
                if (!_.isBoolean(result)) {
                    console.warn('Eval expression %s for condition did not return a boolean value', expr);
                }
                return result === true;
            } catch (e) {
                console.error('Error executing eval expression %s for condition: %s', expr, e);
            }
        }
    });

    return EventHandler;
});