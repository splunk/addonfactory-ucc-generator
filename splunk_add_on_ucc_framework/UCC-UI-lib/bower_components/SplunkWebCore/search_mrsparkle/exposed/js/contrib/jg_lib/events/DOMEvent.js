/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var DOMEventData = require("./DOMEventData");
	var Event = require("./Event");
	var MDOMTarget = require("./MDOMTarget");
	var Class = require("../Class");
	var FunctionUtil = require("../utils/FunctionUtil");
	var Global = require("../utils/Global");
	var ObjectUtil = require("../utils/ObjectUtil");
	var TrieMap = require("../utils/TrieMap");
	var UID = require("../utils/UID");

	return Class(module.id, Event, function(DOMEvent, base)
	{

		// Private Static Constants

		var _UID_PREFIX = "uid_" + UID.random() + "_";

		// Private Static Properties

		var _bubbledEventDataMap = new TrieMap();
		var _executingDefaultMap = {};
		var _isCreatingRaw = false;

		// Private Static Methods

		var _getBubbledEventData = function(domEvent, event)
		{
			if (domEvent.target)
				return _bubbledEventDataMap.get([ domEvent, event ]);
			return _getBubbledEventDataIE(domEvent, event);
		};

		var _getBubbledEventDataIE = function(domEvent, event)
		{
			var uid = domEvent.data;
			if (!uid)
				return void(0);

			var eventInfo = _bubbledEventDataMap.get([ uid, event ]);
			if (!eventInfo)
				return void(0);

			var eventData = eventInfo.eventData;
			if (eventData.originalEvent === eventInfo.domEvent)
				eventData.originalEvent = eventInfo.domEvent = domEvent;

			return eventData;
		};

		var _setBubbledEventData = function(domEvent, event, eventData)
		{
			if (domEvent.target)
				_bubbledEventDataMap.set([ domEvent, event ], eventData);
			else if (!_setBubbledEventDataIE(domEvent, event, eventData))
				return;

			if (_bubbledEventDataMap.size() === 1)
				setTimeout(_clearBubbledEventData, 250);
		};

		var _setBubbledEventDataIE = function(domEvent, event, eventData)
		{
			if (domEvent.type === "message")
				return false;

			var uid = domEvent.data;
			if (!uid)
				uid = domEvent.data = _UID_PREFIX + UID.get(domEvent);
			else if (!Class.isString(uid) || (uid.substring(0, _UID_PREFIX.length) !== _UID_PREFIX))
				return false;

			_bubbledEventDataMap.set([ uid, event ], { domEvent: domEvent, eventData: eventData });
			return true;
		};

		var _clearBubbledEventData = function()
		{
			_bubbledEventDataMap.clear();
		};

		var _stopPropagation = function(domEvent)
		{
			if (domEvent.stopPropagation)
				domEvent.stopPropagation();
			else
				domEvent.cancelBubble = true;
		};

		var _preventDefault = function(domEvent)
		{
			if (domEvent.preventDefault)
				domEvent.preventDefault();
			else
				domEvent.returnValue = false;
		};

		var _isDefaultPrevented = function(domEvent)
		{
			if (domEvent.defaultPrevented != null)
				return (domEvent.defaultPrevented === true);
			if (domEvent.getPreventDefault)
				return (domEvent.getPreventDefault() === true);
			return (domEvent.returnValue === false);
		};

		// Public Events

		this.raw = null;

		// Private Properties

		this._domName = null;
		this._isRaw = false;

		// Constructor

		this.constructor = function(name, type, bubbles, cancelable, domName)
		{
			if (type == null)
				type = DOMEventData;
			else if (!Class.isFunction(type))
				throw new Error("Parameter type must be of type Function.");
			else if ((type !== DOMEventData) && !Class.isSubclassOf(type, DOMEventData))
				throw new Error("Parameter type must be a subclass of " + Class.getName(DOMEventData) + ".");

			base.constructor.call(this, name, type, bubbles, cancelable);

			this.domName(domName);

			if (!_isCreatingRaw)
			{
				try
				{
					_isCreatingRaw = true;

					this.raw = this.createRawEvent(name + ".raw") || null;
				}
				finally
				{
					_isCreatingRaw = false;
				}
			}
			else
			{
				this._isRaw = true;
			}
		};

		// Public Accessor Methods

		this.bubbles = function(value)
		{
			if (!arguments.length)
				return base.bubbles.call(this);

			base.bubbles.call(this, value);
			if (this.raw)
				this.raw.bubbles(value);

			return this;
		};

		this.cancelable = function(value)
		{
			if (!arguments.length)
				return base.cancelable.call(this);

			base.cancelable.call(this, value);
			if (this.raw)
				this.raw.cancelable(value);

			return this;
		};

		this.domName = function(value)
		{
			if (!arguments.length)
				return this._domName;

			if ((value != null) && !Class.isString(value))
				throw new Error("Parameter domName must be of type String.");

			this._domName = value || this.name().toLowerCase();
			if (this.raw)
				this.raw.domName(this._domName);

			return this;
		};

		// Public Methods

		this.executeDefault = function(target, eventData)
		{
			if (target.isDOMTarget)
			{
				var domElement = target.getDOMElement();
				var domName = this._domName;

				// logic adapted from jQuery

				if (domElement && domElement[domName] && (domElement != domElement.window))
				{
					var execCount = ObjectUtil.get(_executingDefaultMap, domName) || 0;
					_executingDefaultMap[domName] = execCount + 1;

					try
					{
						domElement[domName]();
					}
					catch (e)
					{
						// ignore errors
					}

					_executingDefaultMap[domName] = execCount;
				}
			}

			base.executeDefault.call(this, target, eventData);
		};

		// Protected Methods

		this.setupContext = function(context)
		{
			base.setupContext.call(this, context);

			context.domElement = null;

			var target = context.target;
			if (target.isDOMTarget)
			{
				var domElement = target.getDOMElement();
				if (domElement)
				{
					context.domElement = domElement;
					this.setupDOMHandler(context, domElement);
				}
			}
		};

		this.teardownContext = function(context)
		{
			var domElement = context.domElement;
			if (domElement)
			{
				this.teardownDOMHandler(context, domElement);
				context.domElement = null;
			}

			base.teardownContext.call(this, context);
		};

		this.setupDOMHandler = function(context, domElement)
		{
			context.domHandler = FunctionUtil.bind(this.domHandler, this, context);

			if (domElement.addEventListener)
				domElement.addEventListener(this._domName, context.domHandler, false);
			else if (domElement.attachEvent)
				domElement.attachEvent("on" + this._domName, context.domHandler);
		};

		this.teardownDOMHandler = function(context, domElement)
		{
			if (domElement.removeEventListener)
				domElement.removeEventListener(this._domName, context.domHandler, false);
			else if (domElement.detachEvent)
				domElement.detachEvent("on" + this._domName, context.domHandler);

			context.domHandler = null;
		};

		this.domHandler = function(context, domEvent)
		{
			if (ObjectUtil.get(_executingDefaultMap, domEvent.type))
				return;

			var bubbles = this.bubbles();
			var cancelable = this.cancelable();
			var eventData = bubbles ? _getBubbledEventData(domEvent, this) : null;
			if (!eventData)
			{
				eventData = this.domEventToEventData(context, domEvent);

				if (eventData.originalEvent === domEvent)
				{
					if (bubbles && eventData.isPropagationStopped())
						_stopPropagation(domEvent);
					if (cancelable && eventData.isDefaultPrevented())
						_preventDefault(domEvent);
				}

				if (bubbles)
					_setBubbledEventData(domEvent, this, eventData);
			}

			if (eventData.isPropagationStopped())
				return;

			if (cancelable && (eventData.originalEvent === domEvent) && _isDefaultPrevented(domEvent) && !eventData.isDefaultPrevented())
				eventData.preventDefault();

			this.notifyListeners(context.target, eventData);

			if (eventData.originalEvent === domEvent)
			{
				if (bubbles && eventData.isPropagationStopped())
					_stopPropagation(domEvent);
				if (cancelable && eventData.isDefaultPrevented())
					_preventDefault(domEvent);
			}
		};

		this.domEventToEventData = function(context, domEvent)
		{
			var eventData = this.createEventData();
			eventData.event = this;
			eventData.originalEvent = domEvent;
			eventData.timeStamp = domEvent.timeStamp || new Date().getTime();

			var target = domEvent.target || domEvent.srcElement;
			eventData.target = this.bubbles() ? (this.resolveDOMElement(target) || context.target) : context.target;

			var view = domEvent.view;
			if (!view)
			{
				var document = this.getOwnerDocument(target);
				view = document.defaultView || document.parentWindow || Global.window;
			}
			eventData.view = view;

			return eventData;
		};

		this.resolveDOMElement = function(domElement)
		{
			if (!domElement)
				return null;

			// resolve text nodes
			if (domElement.nodeType === 3)
			{
				domElement = domElement.parentNode;
				if (!domElement)
					return null;
			}

			// try converting to MEventTarget instance
			var target = MDOMTarget.fromDOMElement(domElement);
			if (target && target.isEventTarget)
				return target;

			// return domElement if this is a raw event
			if (this._isRaw)
				return domElement;

			// otherwise, try finding nearest MEventTarget instance
			domElement = domElement.parentNode;
			while (domElement)
			{
				target = MDOMTarget.fromDOMElement(domElement);
				if (target && target.isEventTarget)
					return target;

				domElement = domElement.parentNode;
			}

			return null;
		};

		this.getOwnerDocument = function(domElement)
		{
			if (!domElement)
				return Global.document;

			return domElement.ownerDocument || ((domElement.nodeType === 9) && domElement) || domElement.document || Global.document;
		};

		this.createRawEvent = function(name)
		{
			return new this.constructor(name, this.type())
				.bubbles(this.bubbles())
				.cancelable(this.cancelable())
				.domName(this.domName());
		};

	});

});
