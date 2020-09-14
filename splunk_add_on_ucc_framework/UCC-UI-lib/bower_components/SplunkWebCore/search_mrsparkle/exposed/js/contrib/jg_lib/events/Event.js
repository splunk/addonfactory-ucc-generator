/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var EventData = require("./EventData");
	var Class = require("../Class");
	var ErrorUtil = require("../utils/ErrorUtil");
	var Map = require("../utils/Map");
	var ObjectUtil = require("../utils/ObjectUtil");
	var TrieMap = require("../utils/TrieMap");
	var UID = require("../utils/UID");
	var WeakMap = require("../utils/WeakMap");

	return Class(module.id, Object, function(Event, base)
	{

		// Private Static Constants

		var _DEBUG_KEY = "__DEBUG_EVENTS__";

		// Public Static Properties

		Event.debug = false;

		// Private Static Properties

		var _contextMaps = new WeakMap();

		// Public Static Methods

		Event.resolve = function(target, event, strict)
		{
			if (target == null)
				throw new Error("Parameter target must be non-null.");
			if (event == null)
				throw new Error("Parameter event must be non-null.");

			if (event instanceof Event)
				return event;

			if (!Class.isString(event))
				throw new Error("Parameter event must be of type String or " + Class.getName(Event) + ".");

			var eventName = event;
			if (eventName.indexOf(".") < 0)
			{
				event = target[eventName];
			}
			else
			{
				var eventPath = eventName.split(".");
				event = target;
				for (var i = 0, l = eventPath.length; i < l; i++)
				{
					event = event[eventPath[i]];
					if (event == null)
						break;
				}
			}

			if ((event != null) && (event instanceof Event))
				return event;

			if (strict !== false)
				throw new Error("Unknown event \"" + eventName + "\".");

			return null;
		};

		Event.offAll = function(target)
		{
			var contextMap = _contextMaps.get(target);
			if (!contextMap)
				return;

			var eventList = contextMap.keys();
			for (var i = 0, l = eventList.length; i < l; i++)
				eventList[i].offAll(target);
		};

		Event.hasListeners = function(target)
		{
			var contextMap = _contextMaps.get(target);
			if (!contextMap)
				return false;

			var eventList = contextMap.keys();
			for (var i = 0, l = eventList.length; i < l; i++)
			{
				if (eventList[i].hasListeners(target))
					return true;
			}

			return false;
		};

		// Private Static Methods

		var _debug = function(context)
		{
			var target = context.target;
			var debugMap = ObjectUtil.get(target, _DEBUG_KEY);
			if (!debugMap)
				debugMap = target[_DEBUG_KEY] = {};

			var event = context.event;
			var debugEventKey = event.name() + " #" + UID.get(event);
			var listenerCount = context.listenerMap.size();
			if (listenerCount > 0)
				debugMap[debugEventKey] = listenerCount;
			else
				delete debugMap[debugEventKey];
		};

		var _listenerInfoComparator = function(listenerInfo1, listenerInfo2)
		{
			if (listenerInfo1.priority > listenerInfo2.priority)
				return -1;
			if (listenerInfo1.priority < listenerInfo2.priority)
				return 1;
			if (listenerInfo1._order < listenerInfo2._order)
				return -1;
			if (listenerInfo1._order > listenerInfo2._order)
				return 1;
			return 0;
		};

		// Private Properties

		this._name = null;
		this._type = null;
		this._bubbles = false;
		this._cancelable = false;
		this._defaultAction = null;

		// Constructor

		this.constructor = function(name, type, bubbles, cancelable)
		{
			if (name == null)
				throw new Error("Parameter name must be non-null.");
			if (!Class.isString(name))
				throw new Error("Parameter name must be of type String.");

			if (type == null)
				type = EventData;
			else if (!Class.isFunction(type))
				throw new Error("Parameter type must be of type Function.");
			else if ((type !== EventData) && !Class.isSubclassOf(type, EventData))
				throw new Error("Parameter type must be a subclass of " + Class.getName(EventData) + ".");

			this._name = name;
			this._type = type;

			if (bubbles != null)
				this.bubbles(bubbles);
			if (cancelable != null)
				this.cancelable(cancelable);
		};

		// Public Accessor Methods

		this.name = function()
		{
			return this._name;
		};

		this.type = function()
		{
			return this._type;
		};

		this.bubbles = function(value)
		{
			if (!arguments.length)
				return this._bubbles;

			if ((value != null) && !Class.isBoolean(value))
				throw new Error("Parameter bubbles must be of type Boolean.");

			this._bubbles = (value === true);

			return this;
		};

		this.cancelable = function(value)
		{
			if (!arguments.length)
				return this._cancelable;

			if ((value != null) && !Class.isBoolean(value))
				throw new Error("Parameter cancelable must be of type Boolean.");

			this._cancelable = (value === true);

			return this;
		};

		this.defaultAction = function(value)
		{
			if (!arguments.length)
				return this._defaultAction;

			if ((value != null) && !Class.isFunction(value))
				throw new Error("Parameter defaultAction must be of type Function.");

			this._defaultAction = value || null;

			return this;
		};

		// Public Methods

		this.on = function(target, listener, scope, priority)
		{
			var context = this.getContext(target);
			this.addListener(context, listener, scope, priority);
		};

		this.off = function(target, listener, scope)
		{
			var context = this.getContext(target, false);
			if (!context)
				return;

			this.removeListener(context, listener, scope);
			if (context.listenerMap.size() > 0)
				return;

			this.delContext(target);
		};

		this.offAll = function(target)
		{
			var context = this.getContext(target, false);
			if (!context)
				return;

			var listenerList = this.getListeners(context, false);
			var listenerInfo;
			for (var i = 0, l = listenerList.length; i < l; i++)
			{
				listenerInfo = listenerList[i];
				if (listenerInfo.listener)
					this.off(target, listenerInfo.listener, listenerInfo.scope);
			}
		};

		this.fire = function(target, eventData)
		{
			if (eventData.isPropagationStopped())
				return !(this._cancelable && eventData.isDefaultPrevented());

			if (!eventData.event)
				eventData.event = this;
			if (!eventData.target)
				eventData.target = target;

			var isRootDispatch = ((eventData.event === this) && (eventData.target === target));

			var bubbleTargets = this.getBubbleTargets(target);
			this.notifyListeners(target, eventData);
			if (bubbleTargets && (bubbleTargets.length > 0) && !eventData.isPropagationStopped())
				this.notifyBubbleListeners(bubbleTargets, eventData);

			eventData.resetPropagation();

			if (this._cancelable && eventData.isDefaultPrevented())
				return false;

			if (isRootDispatch)
				this.executeDefault(target, eventData);

			return true;
		};

		this.hasListeners = function(target)
		{
			var context = this.getContext(target, false);
			if (!context)
				return false;

			return (context.listenerMap.size() > 0);
		};

		this.notifyListeners = function(target, eventData)
		{
			var context = this.getContext(target, false);
			if (!context)
				return;

			var originalCurrentEvent = eventData.currentEvent;
			var originalCurrentTarget = eventData.currentTarget;

			eventData.currentEvent = this;
			eventData.currentTarget = target;

			var listenerList = this.getListeners(context);
			var listenerInfo;
			for (var i = 0, l = listenerList.length; i < l; i++)
			{
				listenerInfo = listenerList[i];
				if (listenerInfo.listener)
				{
					try
					{
						listenerInfo.listener.call(listenerInfo.scope, eventData);
						if (eventData.isImmediatePropagationStopped())
							break;
					}
					catch (e)
					{
						ErrorUtil.nonBlockingThrow(e);
					}
				}
			}

			eventData.currentEvent = originalCurrentEvent;
			eventData.currentTarget = originalCurrentTarget;
		};

		this.notifyBubbleListeners = function(bubbleTargets, eventData)
		{
			for (var i = 0, l = bubbleTargets.length; i < l; i++)
			{
				this.notifyListeners(bubbleTargets[i], eventData);
				if (eventData.isPropagationStopped())
					break;
			}
		};

		this.executeDefault = function(target, eventData)
		{
			if (this._defaultAction)
				this._defaultAction.call(target, eventData);
		};

		this.getBubbleTargets = function(target)
		{
			if (!this._bubbles)
				return null;

			var bubbleTargets = [];
			var bubbleTarget = target.getBubbleTarget();
			while (bubbleTarget && bubbleTarget.isEventTarget)
			{
				bubbleTargets.push(bubbleTarget);
				bubbleTarget = bubbleTarget.getBubbleTarget();
			}

			return bubbleTargets;
		};

		this.getTypeName = function()
		{
			return Class.getName(this._type) || (this._name + ".type");
		};

		this.isValidType = function(eventData)
		{
			return (eventData instanceof this._type);
		};

		this.createEventData = function()
		{
			return new this._type();
		};

		// Protected Methods

		this.getContext = function(target, create)
		{
			var contextMap = _contextMaps.get(target);
			if (!contextMap)
			{
				if (create === false)
					return null;

				contextMap = new Map();
				_contextMaps.set(target, contextMap);
			}

			var context = contextMap.get(this);
			if (!context)
			{
				if (create === false)
					return null;

				context = { target: target, event: this };
				contextMap.set(this, context);

				this.setupContext(context);
			}

			return context;
		};

		this.delContext = function(target)
		{
			var contextMap = _contextMaps.get(target);
			if (!contextMap)
				return;

			var context = contextMap.get(this);
			if (!context)
				return;

			contextMap.del(this);
			if (contextMap.size() === 0)
				_contextMaps.del(target);

			this.teardownContext(context);
		};

		this.setupContext = function(context)
		{
			context.listenerMap = new TrieMap();
			context._listenerList = null;
			context._listenerOrder = 0;
		};

		this.teardownContext = function(context)
		{
			context.listenerMap = null;
			context._listenerList = null;
		};

		this.addListener = function(context, listener, scope, priority)
		{
			var listenerMap = context.listenerMap;
			var listenerKeys = [ listener, scope ];
			var listenerInfo = listenerMap.get(listenerKeys);
			if (!listenerInfo)
			{
				listenerInfo = { listener: listener, scope: scope, priority: priority, _order: (++context._listenerOrder) };
				listenerMap.set(listenerKeys, listenerInfo);
			}
			else if (listenerInfo.priority !== priority)
			{
				listenerInfo.priority = priority;
			}
			else
			{
				return;
			}

			context._listenerList = null;

			if (Event.debug)
				_debug(context);
		};

		this.removeListener = function(context, listener, scope)
		{
			var listenerMap = context.listenerMap;
			var listenerKeys = [ listener, scope ];
			var listenerInfo = listenerMap.get(listenerKeys);
			if (!listenerInfo)
				return;

			listenerMap.del(listenerKeys);
			listenerInfo.listener = null;
			listenerInfo.scope = null;

			context._listenerList = null;

			if (Event.debug)
				_debug(context);
		};

		this.getListeners = function(context, sorted)
		{
			var listenerList = context._listenerList;
			if (!listenerList)
			{
				listenerList = context._listenerList = context.listenerMap.values();
				listenerList._isSorted = false;
			}

			if ((sorted !== false) && !listenerList._isSorted)
			{
				listenerList.sort(_listenerInfoComparator);
				listenerList._isSorted = true;
			}

			return listenerList;
		};

	});

});
