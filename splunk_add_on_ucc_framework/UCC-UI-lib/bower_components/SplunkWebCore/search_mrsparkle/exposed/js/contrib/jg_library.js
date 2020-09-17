/**
 * Copyright (c) 2012 Jason Gatt
 * 
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 */

jg_import.define("jgatt.events.EventData", function()
{
jg_namespace("jgatt.events", function()
{

	this.EventData = jg_extend(Object, function(EventData, base)
	{

		// Public Properties

		this.event = null;
		this.target = null;
		this.currentEvent = null;
		this.currentTarget = null;

		// Private Properties

		this._isPropagationStopped = false;
		this._isImmediatePropagationStopped = false;
		this._isDefaultPrevented = false;

		// Constructor

		this.constructor = function()
		{
		};

		// Public Methods

		this.stopPropagation = function()
		{
			this._isPropagationStopped = true;
		};

		this.stopImmediatePropagation = function()
		{
			this._isPropagationStopped = true;
			this._isImmediatePropagationStopped = true;
		};

		this.preventDefault = function()
		{
			this._isDefaultPrevented = true;
		};

		this.isPropagationStopped = function()
		{
			return this._isPropagationStopped;
		};

		this.isImmediatePropagationStopped = function()
		{
			return this._isImmediatePropagationStopped;
		};

		this.isDefaultPrevented = function()
		{
			return this._isDefaultPrevented;
		};

	});

});
});

jg_import.define("jgatt.utils.TypeUtils", function()
{
jg_namespace("jgatt.utils", function()
{

	this.TypeUtils = jg_static(function(TypeUtils)
	{

		// Public Static Methods

		TypeUtils.isTypeOf = function(value, type)
		{
			if (value == null)
				return false;

			if (type === Object)
				return true;

			switch (typeof value)
			{
				case "number":
					return (type === Number);
				case "boolean":
					return (type === Boolean);
				case "string":
					return (type === String);
				default:
					return (value instanceof type);
			}
		};

		TypeUtils.isSubclassOf = function(c, type)
		{
			return ((c != null) && (c.prototype != null) && (c.prototype instanceof type));
		};

	});

});
});

jg_import.define("jgatt.properties.Property", function()
{
jg_namespace("jgatt.properties", function()
{

	var TypeUtils = jg_import("jgatt.utils.TypeUtils");

	this.Property = jg_extend(Object, function(Property, base)
	{

		// Private Properties

		this._name = null;
		this._type = null;
		this._defaultValue = null;
		this._readOnly = false;
		this._getter = null;
		this._setter = null;
		this._readFilter = null;
		this._writeFilter = null;
		this._onRead = null;
		this._onWrite = null;

		// Constructor

		this.constructor = function(name, type, defaultValue, readOnly)
		{
			if (name == null)
				throw new Error("Parameter name must be non-null.");
			if (typeof name !== "string")
				throw new Error("Parameter name must be a string.");
			if (type == null)
				throw new Error("Parameter type must be non-null.");
			if (typeof type !== "function")
				throw new Error("Parameter type must be a class.");

			this._name = name;
			this._type = type;

			defaultValue = this.assertType(defaultValue, "Parameter defaultValue is incompatible with property type.");

			if ((readOnly != null) && (typeof readOnly !== "boolean"))
				throw new Error("Parameter readOnly must be a boolean.");

			this._defaultValue = defaultValue;
			this._readOnly = (readOnly === true);
		};

		// Public Getters/Setters

		this.name = function()
		{
			return this._name;
		};

		this.type = function()
		{
			return this._type;
		};

		this.defaultValue = function()
		{
			return this._defaultValue;
		};

		this.readOnly = function()
		{
			return this._readOnly;
		};

		this.getter = function(value)
		{
			if (arguments.length == 0)
				return this._getter;

			if ((value != null) && (typeof value !== "function"))
				throw new Error("Parameter getter must be a function.");

			this._getter = value ? value : null;

			return this;
		};

		this.setter = function(value)
		{
			if (arguments.length == 0)
				return this._setter;

			if ((value != null) && (typeof value !== "function"))
				throw new Error("Parameter setter must be a function.");

			this._setter = value ? value : null;

			return this;
		};

		this.readFilter = function(value)
		{
			if (arguments.length == 0)
				return this._readFilter;

			if ((value != null) && (typeof value !== "function"))
				throw new Error("Parameter readFilter must be a function.");

			this._readFilter = value ? value : null;

			return this;
		};

		this.writeFilter = function(value)
		{
			if (arguments.length == 0)
				return this._writeFilter;

			if ((value != null) && (typeof value !== "function"))
				throw new Error("Parameter writeFilter must be a function.");

			this._writeFilter = value ? value : null;

			return this;
		};

		this.onRead = function(value)
		{
			if (arguments.length == 0)
				return this._onRead;

			if ((value != null) && (typeof value !== "function"))
				throw new Error("Parameter onRead must be a function.");

			this._onRead = value ? value : null;

			return this;
		};

		this.onWrite = function(value)
		{
			if (arguments.length == 0)
				return this._onWrite;

			if ((value != null) && (typeof value !== "function"))
				throw new Error("Parameter onWrite must be a function.");

			this._onWrite = value ? value : null;

			return this;
		};

		// Public Methods

		this.get = function(target, propertyMap)
		{
			if (this._onRead)
				this._onRead.call(target);

			var value = this.getInternal(target, propertyMap);

			if (this._readFilter)
			{
				var value2 = this._readFilter.call(target, value);
				if (value2 !== value)
					value = this.assertType(value2, "Value returned from readFilter for property " + this._name + " is incompatible with property type.");
			}

			return value;
		};

		this.set = function(target, propertyMap, value)
		{
			if (this._readOnly)
				throw new Error("Property " + this._name + " is read-only.");

			value = this.assertType(value, "Value assigned to property " + this._name + " is incompatible with property type.");

			if (this._writeFilter)
			{
				var value2 = this._writeFilter.call(target, value);
				if (value2 !== value)
					value = this.assertType(value2, "Value returned from writeFilter for property " + this._name + " is incompatible with property type.");
			}

			if (!this.setInternal(target, propertyMap, value))
				return false;

			if (this._onWrite)
				this._onWrite.call(target);

			return true;
		};

		this.getInternal = function(target, propertyMap)
		{
			var propertyInfo = propertyMap.get(this);
			if (!propertyInfo)
				propertyInfo = propertyMap.set(this, this.createPropertyInfo(this, target));

			var value = propertyInfo.value;

			if (this._getter)
			{
				var value2 = this._getter.call(target);
				if (value2 !== value)
					value = propertyInfo.value = this.assertType(value2, "Value returned from getter for property " + this._name + " is incompatible with property type.");
			}

			return value;
		};

		this.setInternal = function(target, propertyMap, value)
		{
			value = this.assertType(value, "Value assigned to property " + this._name + " is incompatible with property type.");

			var propertyInfo = propertyMap.get(this);
			if (!propertyInfo)
				propertyInfo = propertyMap.set(this, this.createPropertyInfo(this, target));

			if (this._setter)
				this._setter.call(target, value);

			propertyInfo.value = value;

			return true;
		};

		// Protected Methods

		this.assertType = function(value, message)
		{
			var type = this._type;

			if ((value != null) && !TypeUtils.isTypeOf(value, type))
				throw new Error(message);

			if (value == null)
			{
				if (type === Number)
					value = 0;
				else if (type === Boolean)
					value = false;
				else
					value = null;
			}

			return value;
		};

		this.createPropertyInfo = function(property, target)
		{
			return new Property.PropertyInfo(property, target);
		};

	});

	this.Property.PropertyInfo = jg_extend(Object, function(PropertyInfo, base)
	{

		// Public Properties

		this.property = null;
		this.target = null;
		this.value = null;

		// Constructor

		this.constructor = function(property, target)
		{
			this.property = property;
			this.target = target;
			this.value = property._defaultValue;
		};

	});

});
});

jg_import.define("jgatt.utils.Dictionary", function()
{
jg_namespace("jgatt.utils", function()
{

	this.Dictionary = jg_extend(Object, function(Dictionary, base)
	{

		// Private Static Constants

		var _HASH_KEY = "__jgatt_utils_Dictionary_hash";

		// Private Static Properties

		var _hashCount = 0;

		// Private Static Methods

		var _hash = function(value)
		{
			if (value === null)
				return "null";
			switch (typeof value)
			{
				case "object":
				case "function":
					if (value.hasOwnProperty(_HASH_KEY))
						return value[_HASH_KEY];
					var hash = value[_HASH_KEY] = "#" + (++_hashCount);
					return hash;
				case "string":
					return "\"" + value + "\"";
				default:
					return value + "";
			}
		};

		// Private Properties

		this._kvs = null;
		this._size = 0;

		// Constructor

		this.constructor = function()
		{
			this._kvs = {};
		};

		// Public Methods

		this.size = function()
		{
			return this._size;
		};

		this.get = function(key)
		{
			var hash = _hash(key);
			if (this._kvs.hasOwnProperty(hash))
				return this._kvs[hash].v;
			return undefined;
		};

		this.set = function(key, value)
		{
			var hash = _hash(key);
			if (this._kvs.hasOwnProperty(hash))
			{
				this._kvs[hash].v = value;
				return value;
			}
			this._kvs[hash] = { k: key, v: value };
			this._size++;
			return value;
		};

		this.del = function(key)
		{
			var hash = _hash(key);
			if (this._kvs.hasOwnProperty(hash))
			{
				var value = this._kvs[hash].v;
				delete this._kvs[hash];
				this._size--;
				return value;
			}
			return undefined;
		};

		this.has = function(key)
		{
			var hash = _hash(key);
			return this._kvs.hasOwnProperty(hash);
		};

		this.keys = function()
		{
			var keys = [];
			var kvs = this._kvs;
			for (var hash in kvs)
			{
				if (kvs.hasOwnProperty(hash))
					keys.push(kvs[hash].k);
			}
			return keys;
		};

		this.values = function()
		{
			var values = [];
			var kvs = this._kvs;
			for (var hash in kvs)
			{
				if (kvs.hasOwnProperty(hash))
					values.push(kvs[hash].v);
			}
			return values;
		};

	});

});
});

jg_import.define("jgatt.properties.MPropertyTarget", function()
{
jg_namespace("jgatt.properties", function()
{

	var Property = jg_import("jgatt.properties.Property");
	var Dictionary = jg_import("jgatt.utils.Dictionary");

	this.MPropertyTarget = jg_static(function(MPropertyTarget)
	{

		// Private Static Methods

		var _resolveProperty = function(target, property)
		{
			if (property == null)
				throw new Error("Parameter property must be non-null.");

			if (property instanceof Property)
				return property;

			if (typeof property !== "string")
				throw new Error("Parameter property must be a string or an instance of jgatt.properties.Property.");

			var targetProperty = target[property];
			if (!(targetProperty instanceof Property))
				throw new Error("Unknown property \"" + property + "\".");

			return targetProperty;
		};

		// Private Properties

		this._propertyMap = null;

		// Constructor

		this.constructor = function()
		{
			this._propertyMap = new Dictionary();
		};

		// Public Methods

		this.get = function(property)
		{
			property = _resolveProperty(this, property);
			return property.get(this, this._propertyMap);
		};

		this.set = function(property, value)
		{
			property = _resolveProperty(this, property);
			return property.set(this, this._propertyMap, value);
		};

		this.getInternal = function(property)
		{
			property = _resolveProperty(this, property);
			return property.getInternal(this, this._propertyMap);
		};

		this.setInternal = function(property, value)
		{
			property = _resolveProperty(this, property);
			return property.setInternal(this, this._propertyMap, value);
		};

	});

});
});

jg_import.define("jgatt.utils.ErrorUtils", function()
{
jg_namespace("jgatt.utils", function()
{

	this.ErrorUtils = jg_static(function(ErrorUtils)
	{

		// Public Static Methods

		ErrorUtils.asyncThrow = function(e)
		{
			setTimeout(function() { throw e; }, 1);
		};

	});

});
});

jg_import.define("jgatt.events.Event", function()
{
jg_namespace("jgatt.events", function(ns)
{

	var EventData = jg_import("jgatt.events.EventData");
	var MPropertyTarget = jg_import("jgatt.properties.MPropertyTarget");
	var Property = jg_import("jgatt.properties.Property");
	var Dictionary = jg_import("jgatt.utils.Dictionary");
	var ErrorUtils = jg_import("jgatt.utils.ErrorUtils");
	var TypeUtils = jg_import("jgatt.utils.TypeUtils");

	this.Event = jg_extend(Object, function(Event, base)
	{

		// Private Static Methods

		var _listenerInfoComparator = function(info1, info2)
		{
			if (info1.priority > info2.priority)
				return -1;
			if (info1.priority < info2.priority)
				return 1;
			if (info1.index < info2.index)
				return -1;
			if (info2.index > info2.index)
				return 1;
			return 0;
		};

		// Private Properties

		this._name = null;
		this._type = null;
		this._bubbles = false;
		this._cancelable = false;

		// Constructor

		this.constructor = function(name, type, bubbles, cancelable)
		{
			if (name == null)
				throw new Error("Parameter name must be non-null.");
			if (typeof name !== "string")
				throw new Error("Parameter name must be a string.");
			if (type == null)
				throw new Error("Parameter type must be non-null.");
			if (typeof type !== "function")
				throw new Error("Parameter type must be a class.");
			if ((type !== EventData) && !TypeUtils.isSubclassOf(type, EventData))
				throw new Error("Parameter type must be a subclass of jgatt.events.EventData.");
			if ((bubbles != null) && (typeof bubbles !== "boolean"))
				throw new Error("Parameter bubbles must be a boolean.");
			if ((cancelable != null) && (typeof cancelable !== "boolean"))
				throw new Error("Parameter cancelable must be a boolean.");

			this._name = name;
			this._type = type;
			this._bubbles = (bubbles === true);
			this._cancelable = (cancelable === true);
		};

		// Public Getters/Setters

		this.name = function()
		{
			return this._name;
		};

		this.type = function()
		{
			return this._type;
		};

		this.bubbles = function()
		{
			return this._bubbles;
		};

		this.cancelable = function()
		{
			return this._cancelable;
		};

		// Public Methods

		this.addEventListener = function(target, eventMap, listener, priority)
		{
			if (listener == null)
				throw new Error("Parameter listener must be non-null.");
			if (typeof listener !== "function")
				throw new Error("Parameter listener must be a function.");
			if ((priority != null) && (typeof priority !== "number"))
				throw new Error("Parameter priority must be a number.");

			if ((priority == null) || isNaN(priority))
				priority = 0;

			var eventInfo = eventMap.get(this);
			if (!eventInfo)
				eventInfo = eventMap.set(this, { map: new Dictionary(), list: null, index: 0 });

			var listenerMap = eventInfo.map;
			var listenerInfo = listenerMap.get(listener);
			if (!listenerInfo)
				listenerInfo = listenerMap.set(listener, { listener: listener });
			else if (listenerInfo.priority === priority)
				return;

			listenerInfo.priority = priority;
			listenerInfo.index = eventInfo.index;

			eventInfo.list = null;
			eventInfo.index++;
		};

		this.removeEventListener = function(target, eventMap, listener)
		{
			if (listener == null)
				throw new Error("Parameter listener must be non-null.");
			if (typeof listener !== "function")
				throw new Error("Parameter listener must be a function.");

			var eventInfo = eventMap.get(this);
			if (!eventInfo)
				return;

			var listenerMap = eventInfo.map;
			if (!listenerMap.has(listener))
				return;

			listenerMap.del(listener);

			eventInfo.list = null;
		};

		this.hasEventListener = function(target, eventMap)
		{
			var eventInfo = eventMap.get(this);
			if (!eventInfo)
				return false;

			return (eventInfo.map.size() > 0);
		};

		this.dispatchEvent = function(target, eventMap, eventData)
		{
			if (eventData == null)
				throw new Error("Parameter eventData must be non-null.");
			if (!(eventData instanceof this._type))
				throw new Error("Parameter eventData is incompatible with event type.");

			if (eventData.isPropagationStopped())
				return (!this._cancelable || !eventData.isDefaultPrevented());

			if (eventData.event == null)
				eventData.event = this;
			if (eventData.target == null)
				eventData.target = target;
			eventData.currentEvent = this;
			eventData.currentTarget = target;

			var eventInfo = eventMap.get(this);
			if (eventInfo)
			{
				var listenerList = eventInfo.list;
				if (!listenerList)
				{
					var listenerMap = eventInfo.map;
					if (listenerMap.size() > 0)
					{
						listenerList = eventInfo.list = listenerMap.values();
						listenerList.sort(_listenerInfoComparator);
					}
				}

				if (listenerList)
				{
					var listenerInfo;
					for (var i = 0, l = listenerList.length; i < l; i++)
					{
						listenerInfo = listenerList[i];
						try
						{
							eventData.currentEvent = this;
							eventData.currentTarget = target;
							listenerInfo.listener.call(target, eventData);
							if (eventData.isImmediatePropagationStopped())
								break;
						}
						catch (e)
						{
							ErrorUtils.asyncThrow(e);
						}
					}
				}
			}

			if (this._bubbles && !eventData.isPropagationStopped())
			{
				var parent = target.parent;
				if (parent != null)
				{
					if ((parent instanceof Property) && jg_has_mixin(target, MPropertyTarget))
						parent = target.get(parent);
				}
				else
				{
					parent = target.parentNode;
				}

				if ((parent != null) && ns.MEventTarget && jg_has_mixin(parent, ns.MEventTarget))
					parent.dispatchEvent(this, eventData);
			}

			return (!this._cancelable || !eventData.isDefaultPrevented());
		};

	});

});
});

jg_import.define("jgatt.events.ChainedEvent", function()
{
jg_namespace("jgatt.events", function()
{

	var Event = jg_import("jgatt.events.Event");
	var TypeUtils = jg_import("jgatt.utils.TypeUtils");

	this.ChainedEvent = jg_extend(Event, function(ChainedEvent, base)
	{

		// Private Properties

		this._parentEvent = null;

		// Constructor

		this.constructor = function(name, parentEvent, type, bubbles, cancelable)
		{
			if (parentEvent == null)
				throw new Error("Parameter parentEvent must be non-null.");
			if (!(parentEvent instanceof Event))
				throw new Error("Parameter parentEvent must be an instance of jgatt.events.Event.");

			var parentType = parentEvent._type;
			if (type == null)
				type = parentType;
			else if (typeof type !== "function")
				throw new Error("Parameter type must be a class.");
			else if ((type !== parentType) && !TypeUtils.isSubclassOf(type, parentType))
				throw new Error("Parameter type must be a subclass of parentEvent type.");

			base.constructor.call(this, name, type, bubbles, cancelable);

			this._parentEvent = parentEvent;
		};

		// Public Getters/Setters

		this.parentEvent = function()
		{
			return this._parentEvent;
		};

		// Public Methods

		this.dispatchEvent = function(target, eventMap, eventData)
		{
			base.dispatchEvent.call(this, target, eventMap, eventData);

			if (!eventData.isPropagationStopped())
				this._parentEvent.dispatchEvent(target, eventMap, eventData);

			return (!this._cancelable || !eventData.isDefaultPrevented());
		};

	});

});
});

jg_import.define("jgatt.events.MEventTarget", function()
{
jg_namespace("jgatt.events", function()
{

	var Event = jg_import("jgatt.events.Event");
	var Dictionary = jg_import("jgatt.utils.Dictionary");

	this.MEventTarget = jg_static(function(MEventTarget)
	{

		// Private Static Methods

		var _resolveEvent = function(target, event)
		{
			if (event == null)
				throw new Error("Parameter event must be non-null.");

			if (event instanceof Event)
				return event;

			if (typeof event !== "string")
				throw new Error("Parameter event must be a string or an instance of jgatt.events.Event.");

			var targetEvent = target._eventNameMap[event];
			if (!targetEvent)
			{
				var eventPath = event.split(".");
				targetEvent = target;
				for (var i = 0, l = eventPath.length; i < l; i++)
				{
					targetEvent = targetEvent[eventPath[i]];
					if (targetEvent == null)
						break;
				}
				if (!(targetEvent instanceof Event))
					throw new Error("Unknown event \"" + event + "\".");
				target._eventNameMap[event] = targetEvent;
			}

			return targetEvent;
		};

		// Private Properties

		this._eventMap = null;
		this._eventNameMap = null;

		// Constructor

		this.constructor = function()
		{
			this._eventMap = new Dictionary();
			this._eventNameMap = {};
		};

		// Public Methods

		this.addEventListener = function(event, listener, priority)
		{
			event = _resolveEvent(this, event);
			event.addEventListener(this, this._eventMap, listener, priority);
		};

		this.removeEventListener = function(event, listener)
		{
			event = _resolveEvent(this, event);
			event.removeEventListener(this, this._eventMap, listener);
		};

		this.hasEventListener = function(event)
		{
			event = _resolveEvent(this, event);
			return event.hasEventListener(this, this._eventMap);
		};

		this.dispatchEvent = function(event, eventData)
		{
			event = _resolveEvent(this, event);
			return event.dispatchEvent(this, this._eventMap, eventData);
		};

	});

});
});

jg_import.define("jgatt.events.MObservable", function()
{
jg_namespace("jgatt.events", function()
{

	var Event = jg_import("jgatt.events.Event");
	var EventData = jg_import("jgatt.events.EventData");
	var MEventTarget = jg_import("jgatt.events.MEventTarget");

	this.MObservable = jg_static(function(MObservable)
	{

		// Mixin

		this.mixin = function(base)
		{
			base = jg_mixin(this, MEventTarget, base);
		};

		// Public Events

		this.changed = new Event("changed", EventData);

	});

});
});

jg_import.define("jgatt.geom.Point", function()
{
jg_namespace("jgatt.geom", function()
{

	this.Point = jg_extend(Object, function(Point, base)
	{

		// Public Properties

		this.x = 0;
		this.y = 0;

		// Constructor

		this.constructor = function(x, y)
		{
			this.x = (x !== undefined) ? x : 0;
			this.y = (y !== undefined) ? y : 0;
		};

		// Public Methods

		this.length = function()
		{
			return Math.sqrt(this.x * this.x + this.y * this.y);
		};

		this.hasNaN = function()
		{
			return (isNaN(this.x) ||
			        isNaN(this.y));
		};

		this.hasInfinity = function()
		{
			return ((this.x == Infinity) || (this.x == -Infinity) ||
			        (this.y == Infinity) || (this.y == -Infinity));
		};

		this.hasPositiveInfinity = function()
		{
			return ((this.x == Infinity) ||
			        (this.y == Infinity));
		};

		this.hasNegativeInfinity = function()
		{
			return ((this.x == -Infinity) ||
			        (this.y == -Infinity));
		};

		this.isFinite = function()
		{
			return (((this.x - this.x) === 0) &&
			        ((this.y - this.y) === 0));
		};

		this.equals = function(point)
		{
			return ((this.x == point.x) &&
			        (this.y == point.y));
		};

		this.clone = function()
		{
			return new Point(this.x, this.y);
		};

		this.toString = function()
		{
			return "(" + this.x + ", " + this.y + ")";
		};

	});

});
});

jg_import.define("jgatt.geom.Matrix", function()
{
jg_namespace("jgatt.geom", function()
{

	var Point = jg_import("jgatt.geom.Point");

	this.Matrix = jg_extend(Object, function(Matrix, base)
	{

		// Public Properties

		this.a = 1;
		this.b = 0;
		this.c = 0;
		this.d = 1;
		this.tx = 0;
		this.ty = 0;

		// Constructor

		this.constructor = function(a, b, c, d, tx, ty)
		{
			this.a = (a !== undefined) ? a : 1;
			this.b = (b !== undefined) ? b : 0;
			this.c = (c !== undefined) ? c : 0;
			this.d = (d !== undefined) ? d : 1;
			this.tx = (tx !== undefined) ? tx : 0;
			this.ty = (ty !== undefined) ? ty : 0;
		};

		// Public Methods

		this.transformPoint = function(point)
		{
			var x = this.a * point.x + this.c * point.y + this.tx;
			var y = this.b * point.x + this.d * point.y + this.ty;
			return new Point(x, y);
		};

		this.translate = function(x, y)
		{
			this.tx += x;
			this.ty += y;
		};

		this.scale = function(scaleX, scaleY)
		{
			this.a *= scaleX;
			this.b *= scaleY;
			this.c *= scaleX;
			this.d *= scaleY;
			this.tx *= scaleX;
			this.ty *= scaleY;
		};

		this.rotate = function(angle)
		{
			angle = (angle / 180) * Math.PI;

			var cosAngle = Math.cos(angle);
			var sinAngle = Math.sin(angle);
			var a = this.a;
			var b = this.b;
			var c = this.c;
			var d = this.d;
			var tx = this.tx;
			var ty = this.ty;

			this.a = a * cosAngle - b * sinAngle;
			this.b = b * cosAngle + a * sinAngle;
			this.c = c * cosAngle - d * sinAngle;
			this.d = d * cosAngle + c * sinAngle;
			this.tx = tx * cosAngle - ty * sinAngle;
			this.ty = ty * cosAngle + tx * sinAngle;
		};

		this.skew = function(skewX, skewY)
		{
			skewX = (skewX / 180) * Math.PI;
			skewY = (skewY / 180) * Math.PI;

			var tanSkewX = Math.tan(skewX);
			var tanSkewY = Math.tan(skewY);
			var a = this.a;
			var b = this.b;
			var c = this.c;
			var d = this.d;
			var tx = this.tx;
			var ty = this.ty;

			this.a = a + b * tanSkewX;
			this.b = b + a * tanSkewY;
			this.c = c + d * tanSkewX;
			this.d = d + c * tanSkewY;
			this.tx = tx + ty * tanSkewX;
			this.ty = ty + tx * tanSkewY;
		};

		this.concat = function(matrix)
		{
			var a1 = this.a;
			var b1 = this.b;
			var c1 = this.c;
			var d1 = this.d;
			var tx1 = this.tx;
			var ty1 = this.ty;

			var a2 = matrix.a;
			var b2 = matrix.b;
			var c2 = matrix.c;
			var d2 = matrix.d;
			var tx2 = matrix.tx;
			var ty2 = matrix.ty;

			this.a = a1 * a2 + b1 * c2;
			this.b = b1 * d2 + a1 * b2;
			this.c = c1 * a2 + d1 * c2;
			this.d = d1 * d2 + c1 * b2;
			this.tx = tx1 * a2 + ty1 * c2 + tx2;
			this.ty = ty1 * d2 + tx1 * b2 + ty2;
		};

		this.invert = function()
		{
			var det = this.determinant();
			var a = this.a / det;
			var b = this.b / det;
			var c = this.c / det;
			var d = this.d / det;
			var tx = this.tx;
			var ty = this.ty;

			this.a = d;
			this.b = -b;
			this.c = -c;
			this.d = a;
			this.tx = c * ty - d * tx;
			this.ty = b * tx - a * ty;
		};

		this.identity = function()
		{
			this.a = 1;
			this.b = 0;
			this.c = 0;
			this.d = 1;
			this.tx = 0;
			this.ty = 0;
		};

		this.determinant = function()
		{
			return (this.a * this.d) - (this.b * this.c);
		};

		this.hasInverse = function()
		{
			var det = Math.abs(this.determinant());
			return ((det > 0) && (det < Infinity));
		};

		this.hasNaN = function()
		{
			return (isNaN(this.a) ||
		        	isNaN(this.b) ||
			        isNaN(this.c) ||
			        isNaN(this.d) ||
			        isNaN(this.tx) ||
		        	isNaN(this.ty));
		};

		this.hasInfinity = function()
		{
			return ((this.a == Infinity) || (this.a == -Infinity) ||
		        	(this.b == Infinity) || (this.b == -Infinity) ||
			        (this.c == Infinity) || (this.c == -Infinity) ||
			        (this.d == Infinity) || (this.d == -Infinity) ||
			        (this.tx == Infinity) || (this.tx == -Infinity) ||
		        	(this.ty == Infinity) || (this.ty == -Infinity));
		};

		this.hasPositiveInfinity = function()
		{
			return ((this.a == Infinity) ||
		        	(this.b == Infinity) ||
			        (this.c == Infinity) ||
			        (this.d == Infinity) ||
			        (this.tx == Infinity) ||
		        	(this.ty == Infinity));
		};

		this.hasNegativeInfinity = function()
		{
			return ((this.a == -Infinity) ||
		        	(this.b == -Infinity) ||
			        (this.c == -Infinity) ||
			        (this.d == -Infinity) ||
			        (this.tx == -Infinity) ||
		        	(this.ty == -Infinity));
		};

		this.isFinite = function()
		{
			return (((this.a - this.a) === 0) &&
			        ((this.b - this.b) === 0) &&
			        ((this.c - this.c) === 0) &&
			        ((this.d - this.d) === 0) &&
			        ((this.tx - this.tx) === 0) &&
			        ((this.ty - this.ty) === 0));
		};

		this.isIdentity = function()
		{
			return ((this.a == 1) &&
		        	(this.b == 0) &&
			        (this.c == 0) &&
			        (this.d == 1) &&
			        (this.tx == 0) &&
		        	(this.ty == 0));
		};

		this.equals = function(matrix)
		{
			return ((this.a == matrix.a) &&
		        	(this.b == matrix.b) &&
			        (this.c == matrix.c) &&
			        (this.d == matrix.d) &&
			        (this.tx == matrix.tx) &&
		        	(this.ty == matrix.ty));
		};

		this.clone = function()
		{
			return new Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty);
		};

		this.toString = function()
		{
			return "(" + this.a + ", " + this.b + ", " + this.c + ", " + this.d + ", " + this.tx + ", " + this.ty + ")";
		};

	});

});
});

jg_import.define("jgatt.geom.Rectangle", function()
{
jg_namespace("jgatt.geom", function()
{

	this.Rectangle = jg_extend(Object, function(Rectangle, base)
	{

		// Public Properties

		this.x = 0;
		this.y = 0;
		this.width = 0;
		this.height = 0;

		// Constructor

		this.constructor = function(x, y, width, height)
		{
			this.x = (x !== undefined) ? x : 0;
			this.y = (y !== undefined) ? y : 0;
			this.width = (width !== undefined) ? width : 0;
			this.height = (height !== undefined) ? height : 0;
		};

		// Public Methods

		this.hasNaN = function()
		{
			return (isNaN(this.x) ||
			        isNaN(this.y) ||
			        isNaN(this.width) ||
			        isNaN(this.height));
		};

		this.hasInfinity = function()
		{
			return ((this.x == Infinity) || (this.x == -Infinity) ||
			        (this.y == Infinity) || (this.y == -Infinity) ||
			        (this.width == Infinity) || (this.width == -Infinity) ||
			        (this.height == Infinity) || (this.height == -Infinity));
		};

		this.hasPositiveInfinity = function()
		{
			return ((this.x == Infinity) ||
			        (this.y == Infinity) ||
			        (this.width == Infinity) ||
			        (this.height == Infinity));
		};

		this.hasNegativeInfinity = function()
		{
			return ((this.x == -Infinity) ||
			        (this.y == -Infinity) ||
			        (this.width == -Infinity) ||
			        (this.height == -Infinity));
		};

		this.isFinite = function()
		{
			return (((this.x - this.x) === 0) &&
			        ((this.y - this.y) === 0) &&
			        ((this.width - this.width) === 0) &&
			        ((this.height - this.height) === 0));
		};

		this.equals = function(rectangle)
		{
			return ((this.x == rectangle.x) &&
			        (this.y == rectangle.y) &&
			        (this.width == rectangle.width) &&
			        (this.height == rectangle.height));
		};

		this.clone = function()
		{
			return new Rectangle(this.x, this.y, this.width, this.height);
		};

		this.toString = function()
		{
			return "(" + this.x + ", " + this.y + ", " + this.width + ", " + this.height + ")";
		};

	});

});
});

jg_import.define("jgatt.graphics.Caps", function()
{
jg_namespace("jgatt.graphics", function()
{

	this.Caps = jg_static(function(Caps)
	{

		// Public Static Constants

		Caps.NONE = "none";
		Caps.ROUND = "round";
		Caps.SQUARE = "square";

	});

});
});

jg_import.define("jgatt.utils.NumberUtils", function()
{
jg_namespace("jgatt.utils", function()
{

	this.NumberUtils = jg_static(function(NumberUtils)
	{

		// Public Static Constants

		NumberUtils.EPSILON = (function()
		{
			var eps = 1;
			var temp = 1;
			while ((1 + temp) > 1)
			{
				eps = temp;
				temp /= 2;
			}
			return eps;
		})();

		NumberUtils.PRECISION = (function()
		{
			var prec = 0;
			var temp = 9;
			while ((temp % 10) == 9)
			{
				prec++;
				temp = temp * 10 + 9;
			}
			return prec;
		})();

		// Public Static Methods

		NumberUtils.parseNumber = function(value)
		{
			if (value == null)
				return NaN;

			switch (typeof value)
			{
				case "number":
					return value;
				case "string":
					return value ? Number(value) : NaN;
				case "boolean":
					return value ? 1 : 0;
			}

			return NaN;
		};

		NumberUtils.toPrecision = function(n, precision)
		{
			precision = (precision !== undefined) ? precision : 0;

			if (precision < 1)
				precision = NumberUtils.PRECISION + precision;

			if (precision < 1)
				precision = 1;
			else if (precision > 21)
				precision = 21;

			return Number(n.toPrecision(precision));
		};

		NumberUtils.toFixed = function(n, decimalDigits)
		{
			decimalDigits = (decimalDigits !== undefined) ? decimalDigits : 0;

			if (decimalDigits < 0)
				decimalDigits = 0;
			else if (decimalDigits > 20)
				decimalDigits = 20;

			return Number(n.toFixed(decimalDigits));
		};

		NumberUtils.roundTo = function(n, units)
		{
			units = (units !== undefined) ? units : 1;

			return NumberUtils.toPrecision(Math.round(n / units) * units, -1);
		};

		NumberUtils.minMax = function(n, min, max)
		{
			if (n < min)
				n = min;
			if (n > max)
				n = max;
			return n;
		};

		NumberUtils.maxMin = function(n, max, min)
		{
			if (n > max)
				n = max;
			if (n < min)
				n = min;
			return n;
		};

		NumberUtils.interpolate = function(n1, n2, f)
		{
			return n1 * (1 - f) + n2 * f;
		};

		NumberUtils.approxZero = function(n, threshold)
		{
			if (n == 0)
				return true;

			threshold = (threshold !== undefined) ? threshold : NaN;
			if (isNaN(threshold))
				threshold = NumberUtils.EPSILON;

			return (n < 0) ? (-n < threshold) : (n < threshold);
		};

		NumberUtils.approxOne = function(n, threshold)
		{
			if (n == 1)
				return true;

			n -= 1;

			threshold = (threshold !== undefined) ? threshold : NaN;
			if (isNaN(threshold))
				threshold = NumberUtils.EPSILON;

			return (n < 0) ? (-n < threshold) : (n < threshold);
		};

		NumberUtils.approxEqual = function(n1, n2, threshold)
		{
			if (n1 == n2)
				return true;

			n1 -= n2;

			threshold = (threshold !== undefined) ? threshold : NaN;
			if (isNaN(threshold))
				threshold = NumberUtils.EPSILON;

			return (n1 < 0) ? (-n1 < threshold) : (n1 < threshold);
		};

		NumberUtils.approxLessThan = function(n1, n2, threshold)
		{
			return ((n1 < n2) && !NumberUtils.approxEqual(n1, n2, threshold));
		};

		NumberUtils.approxLessThanOrEqual = function(n1, n2, threshold)
		{
			return ((n1 < n2) || NumberUtils.approxEqual(n1, n2, threshold));
		};

		NumberUtils.approxGreaterThan = function(n1, n2, threshold)
		{
			return ((n1 > n2) && !NumberUtils.approxEqual(n1, n2, threshold));
		};

		NumberUtils.approxGreaterThanOrEqual = function(n1, n2, threshold)
		{
			return ((n1 > n2) || NumberUtils.approxEqual(n1, n2, threshold));
		};

	});

});
});

jg_import.define("jgatt.graphics.ColorUtils", function()
{
jg_namespace("jgatt.graphics", function()
{

	var NumberUtils = jg_import("jgatt.utils.NumberUtils");

	this.ColorUtils = jg_static(function(ColorUtils)
	{

		// Public Static Methods

		ColorUtils.toRGB = function(color)
		{
			var rgb = {};
			rgb.r = (color >> 16) & 0xFF;
			rgb.g = (color >> 8) & 0xFF;
			rgb.b = color & 0xFF;
			return rgb;
		};

		ColorUtils.fromRGB = function(rgb)
		{
			return ((rgb.r << 16) | (rgb.g << 8) | rgb.b);
		};

		ColorUtils.brightness = function(color, brightness)
		{
			var rgb = ColorUtils.toRGB(color);
			var c;

			if (brightness < 0)
			{
				brightness = -brightness;
				c = 0x00;
			}
			else
			{
				c = 0xFF;
			}

			if (brightness > 1)
				brightness = 1;

			rgb.r += Math.round((c - rgb.r) * brightness);
			rgb.g += Math.round((c - rgb.g) * brightness);
			rgb.b += Math.round((c - rgb.b) * brightness);

			return ColorUtils.fromRGB(rgb);
		};

		ColorUtils.interpolate = function(color1, color2, f)
		{
			var rgb1 = ColorUtils.toRGB(color1);
			var rgb2 = ColorUtils.toRGB(color2);

			var rgb = {};
			rgb.r = Math.round(NumberUtils.interpolate(rgb1.r, rgb2.r, f));
			rgb.g = Math.round(NumberUtils.interpolate(rgb1.g, rgb2.g, f));
			rgb.b = Math.round(NumberUtils.interpolate(rgb1.b, rgb2.b, f));

			return ColorUtils.fromRGB(rgb);
		};

	});

});
});

jg_import.define("jgatt.graphics.GradientType", function()
{
jg_namespace("jgatt.graphics", function()
{

	this.GradientType = jg_static(function(GradientType)
	{

		// Public Static Constants

		GradientType.LINEAR = "linear";
		GradientType.RADIAL = "radial";

	});

});
});

jg_import.define("jgatt.graphics.Graphics", function()
{
jg_namespace("jgatt.graphics", function()
{

	var Matrix = jg_import("jgatt.geom.Matrix");
	var Point = jg_import("jgatt.geom.Point");

	this.Graphics = jg_extend(Object, function(Graphics, base)
	{

		// Private Properties

		this._width = 1;
		this._height = 1;
		this._strokeStyle = null;
		this._strokeCommands = null;
		this._fillCommands = null;
		this._drawingStack = null;
		this._drawingStackIndex = 0;
		this._penX = 0;
		this._penY = 0;

		this._element = null;
		this._canvas = null;
		this._context = null;

		// Constructor

		this.constructor = function(width, height)
		{
			this._width = ((width > 1) && (width < Infinity)) ? Math.floor(width) : 1;
			this._height = ((height > 1) && (height < Infinity)) ? Math.floor(height) : 1;
			this._strokeStyle = { thickness: 1, caps: "none", joints: "miter", miterLimit: 10, pixelHinting: true };
			this._drawingStack = [];
		};

		// Public Methods

		this.appendTo = function(element)
		{
			if (!element)
				throw new Error("Parameter element must be non-null.");

			if (element === this._element)
				return true;

			this.remove();

			var canvas = document.createElement("canvas");
			if (!canvas)
				return false;

			if (typeof canvas.getContext !== "function")
				return false;

			var context = canvas.getContext("2d");
			if (!context)
				return false;

			canvas.style.position = "absolute";
			canvas.width = this._width;
			canvas.height = this._height;

			element.appendChild(canvas);

			this._element = element;
			this._canvas = canvas;
			this._context = context;

			this._draw(true);

			return true;
		};

		this.remove = function()
		{
			if (!this._element)
				return false;

			var context = this._context;
			context.clearRect(0, 0, context.canvas.width, context.canvas.height);
			context.beginPath();

			var canvas = this._canvas;
			var parentNode = canvas.parentNode;
			if (parentNode)
				parentNode.removeChild(canvas);

			this._element = null;
			this._canvas = null;
			this._context = null;

			return true;
		};

		this.setSize = function(width, height)
		{
			width = ((width > 1) && (width < Infinity)) ? Math.floor(width) : 1;
			height = ((height > 1) && (height < Infinity)) ? Math.floor(height) : 1;

			if ((width === this._width) && (height === this._height))
				return;

			this._width = width;
			this._height = height;

			var canvas = this._canvas;
			if (!canvas)
				return;

			canvas.width = width;
			canvas.height = height;

			this._draw(true);
		};

		this.setStrokeStyle = function(thickness, caps, joints, miterLimit, pixelHinting)
		{
			if ((caps != null) && (caps !== "none") && (caps !== "round") && (caps !== "square"))
				throw new Error("Parameter caps must be one of \"none\", \"round\", or \"square\".");
			if ((joints != null) && (joints !== "miter") && (joints !== "round") && (joints !== "bevel"))
				throw new Error("Parameter joints must be one of \"miter\", \"round\", or \"bevel\".");

			thickness *= 1;
			thickness = ((thickness > 0) && (thickness < Infinity)) ? thickness : 1;

			caps = caps ? caps : "none";

			joints = joints ? joints : "miter";

			miterLimit *= 1;
			miterLimit = ((miterLimit > 0) && (miterLimit < Infinity)) ? miterLimit : 10;

			pixelHinting = (pixelHinting != false);

			this._strokeStyle = { thickness: thickness, caps: caps, joints: joints, miterLimit: miterLimit, pixelHinting: pixelHinting };
		};

		this.beginSolidStroke = function(color, alpha)
		{
			this.endStroke();

			color = !isNaN(color) ? Math.min(Math.max(Math.floor(color), 0x000000), 0xFFFFFF) : 0x000000;

			alpha = !isNaN(alpha) ? Math.min(Math.max(alpha, 0), 1) : 1;

			var strokeCommands = this._strokeCommands = [];
			strokeCommands.push({ name: "solidStroke", strokeStyle: this._strokeStyle, color: color, alpha: alpha });
			strokeCommands.push({ name: "moveTo", x: this._penX, y: this._penY });
		};

		this.beginGradientStroke = function(type, colors, alphas, ratios, matrix, focalPointRatio)
		{
			if (type == null)
				throw new Error("Parameter type must be non-null.");
			if ((type !== "linear") && (type !== "radial"))
				throw new Error("Parameter type must be one of \"linear\" or \"radial\".");
			if (colors == null)
				throw new Error("Parameter colors must be non-null.");
			if (!(colors instanceof Array))
				throw new Error("Parameter colors must be an array.");
			if (alphas == null)
				throw new Error("Parameter alphas must be non-null.");
			if (!(alphas instanceof Array))
				throw new Error("Parameter alphas must be an array.");
			if (ratios == null)
				throw new Error("Parameter ratios must be non-null.");
			if (!(ratios instanceof Array))
				throw new Error("Parameter ratios must be an array.");
			if ((matrix != null) && !(matrix instanceof Matrix))
				throw new Error("Parameter matrix must be an instance of jgatt.geom.Matrix.");

			this.endStroke();

			var numStops = Math.min(colors.length, alphas.length, ratios.length);
			colors = colors.slice(0, numStops);
			alphas = alphas.slice(0, numStops);
			ratios = ratios.slice(0, numStops);
			var color;
			var alpha;
			var ratio;
			for (var i = 0; i < numStops; i++)
			{
				color = colors[i];
				colors[i] = !isNaN(color) ? Math.min(Math.max(Math.floor(color), 0x000000), 0xFFFFFF) : 0x000000;

				alpha = alphas[i];
				alphas[i] = !isNaN(alpha) ? Math.min(Math.max(alpha, 0), 1) : 1;

				ratio = ratios[i];
				ratios[i] = !isNaN(ratio) ? Math.min(Math.max(ratio, 0), 1) : 0;
			}

			if (matrix)
			{
				matrix = new Matrix(matrix.a * 1, matrix.b * 1, matrix.c * 1, matrix.d * 1, matrix.tx * 1, matrix.ty * 1);
				if ((matrix.tx - matrix.tx) !== 0)
					matrix.tx = 0;
				if ((matrix.ty - matrix.ty) !== 0)
					matrix.ty = 0;
				if (!matrix.hasInverse())
					matrix = null;
			}

			focalPointRatio = !isNaN(focalPointRatio) ? Math.min(Math.max(focalPointRatio, -1), 1) : 0;

			var strokeCommands = this._strokeCommands = [];
			strokeCommands.push({ name: "gradientStroke", strokeStyle: this._strokeStyle, type: type, colors: colors, alphas: alphas, ratios: ratios, matrix: matrix, focalPointRatio: focalPointRatio });
			strokeCommands.push({ name: "moveTo", x: this._penX, y: this._penY });
		};

		this.beginImageStroke = function(image, matrix, repeat)
		{
		};

		this.endStroke = function()
		{
			if (!this._strokeCommands)
				return;

			this._drawingStack.push(this._strokeCommands);
			this._strokeCommands = null;

			this._draw();
		};

		this.beginSolidFill = function(color, alpha)
		{
			this.endFill();

			color = !isNaN(color) ? Math.min(Math.max(Math.floor(color), 0x000000), 0xFFFFFF) : 0x000000;

			alpha = !isNaN(alpha) ? Math.min(Math.max(alpha, 0), 1) : 1;

			var fillCommands = this._fillCommands = [];
			fillCommands.push({ name: "solidFill", color: color, alpha: alpha });
			fillCommands.push({ name: "moveTo", x: this._penX, y: this._penY });
		};

		this.beginGradientFill = function(type, colors, alphas, ratios, matrix, focalPointRatio)
		{
			if (type == null)
				throw new Error("Parameter type must be non-null.");
			if ((type !== "linear") && (type !== "radial"))
				throw new Error("Parameter type must be one of \"linear\" or \"radial\".");
			if (colors == null)
				throw new Error("Parameter colors must be non-null.");
			if (!(colors instanceof Array))
				throw new Error("Parameter colors must be an array.");
			if (alphas == null)
				throw new Error("Parameter alphas must be non-null.");
			if (!(alphas instanceof Array))
				throw new Error("Parameter alphas must be an array.");
			if (ratios == null)
				throw new Error("Parameter ratios must be non-null.");
			if (!(ratios instanceof Array))
				throw new Error("Parameter ratios must be an array.");
			if ((matrix != null) && !(matrix instanceof Matrix))
				throw new Error("Parameter matrix must be an instance of jgatt.geom.Matrix.");

			this.endFill();

			var numStops = Math.min(colors.length, alphas.length, ratios.length);
			colors = colors.slice(0, numStops);
			alphas = alphas.slice(0, numStops);
			ratios = ratios.slice(0, numStops);
			var color;
			var alpha;
			var ratio;
			for (var i = 0; i < numStops; i++)
			{
				color = colors[i];
				colors[i] = !isNaN(color) ? Math.min(Math.max(Math.floor(color), 0x000000), 0xFFFFFF) : 0x000000;

				alpha = alphas[i];
				alphas[i] = !isNaN(alpha) ? Math.min(Math.max(alpha, 0), 1) : 1;

				ratio = ratios[i];
				ratios[i] = !isNaN(ratio) ? Math.min(Math.max(ratio, 0), 1) : 0;
			}

			if (matrix)
			{
				matrix = new Matrix(matrix.a * 1, matrix.b * 1, matrix.c * 1, matrix.d * 1, matrix.tx * 1, matrix.ty * 1);
				if ((matrix.tx - matrix.tx) !== 0)
					matrix.tx = 0;
				if ((matrix.ty - matrix.ty) !== 0)
					matrix.ty = 0;
				if (!matrix.hasInverse())
					matrix = null;
			}

			focalPointRatio = !isNaN(focalPointRatio) ? Math.min(Math.max(focalPointRatio, -1), 1) : 0;

			var fillCommands = this._fillCommands = [];
			fillCommands.push({ name: "gradientFill", type: type, colors: colors, alphas: alphas, ratios: ratios, matrix: matrix, focalPointRatio: focalPointRatio });
			fillCommands.push({ name: "moveTo", x: this._penX, y: this._penY });
		};

		this.beginImageFill = function(image, matrix, repeat)
		{
		};

		this.endFill = function()
		{
			if (!this._fillCommands)
				return;

			this._drawingStack.push(this._fillCommands);
			this._fillCommands = null;

			this._draw();
		};

		this.moveTo = function(x, y)
		{
			x *= 1;
			if ((x - x) !== 0)
				x = 0;
			y *= 1;
			if ((y - y) !== 0)
				y = 0;

			this._penX = x;
			this._penY = y;

			var command = { name: "moveTo", x: x, y: y };
			if (this._strokeCommands)
				this._strokeCommands.push(command);
			if (this._fillCommands)
				this._fillCommands.push(command);
		};

		this.lineTo = function(x, y)
		{
			x *= 1;
			if ((x - x) !== 0)
				x = 0;
			y *= 1;
			if ((y - y) !== 0)
				y = 0;

			this._penX = x;
			this._penY = y;

			var command = { name: "lineTo", x: x, y: y };
			if (this._strokeCommands)
				this._strokeCommands.push(command);
			if (this._fillCommands)
				this._fillCommands.push(command);
		};

		this.curveTo = function(controlX, controlY, anchorX, anchorY)
		{
			controlX *= 1;
			if ((controlX - controlX) !== 0)
				controlX = 0;
			controlY *= 1;
			if ((controlY - controlY) !== 0)
				controlY = 0;
			anchorX *= 1;
			if ((anchorX - anchorX) !== 0)
				anchorX = 0;
			anchorY *= 1;
			if ((anchorY - anchorY) !== 0)
				anchorY = 0;

			this._penX = anchorX;
			this._penY = anchorY;

			var command = { name: "curveTo", controlX: controlX, controlY: controlY, anchorX: anchorX, anchorY: anchorY };
			if (this._strokeCommands)
				this._strokeCommands.push(command);
			if (this._fillCommands)
				this._fillCommands.push(command);
		};

		this.clear = function()
		{
			this._strokeCommands = null;
			this._fillCommands = null;
			this._drawingStack = [];

			this._draw(true);
		};

		// Private Methods

		this._draw = function(redraw)
		{
			var context = this._context;
			if (!context)
				return;

			if (redraw == true)
			{
				this._drawingStackIndex = 0;

				context.clearRect(0, 0, context.canvas.width, context.canvas.height);
				context.beginPath();
			}

			var drawingStack = this._drawingStack;
			var drawingStackSize = drawingStack.length;
			var commands;
			var i;
			for (i = this._drawingStackIndex; i < drawingStackSize; i++)
			{
				commands = drawingStack[i];
				switch (commands[0].name)
				{
					case "solidStroke":
					case "gradientStroke":
						this._drawStroke(commands);
						break;
					case "solidFill":
					case "gradientFill":
						this._drawFill(commands);
						break;
				}
			}
			this._drawingStackIndex = i;
		};

		this._drawStroke = function(commands)
		{
			var context = this._context;
			if (!context)
				return;

			var numCommands = commands.length;
			var command = commands[0];
			var strokeStyle = command.strokeStyle;
			var offset = strokeStyle.pixelHinting ? (strokeStyle.thickness % 2) / 2 : 0;
			var hasPath = false;
			var startX;
			var startY;
			var endX;
			var endY;
			var gradient;
			var numStops;
			var colors;
			var alphas;
			var ratios;
			var color;
			var alpha;
			var ratio;
			var matrix;
			var i;

			context.beginPath();
			for (i = 1; i < numCommands; i++)
			{
				command = commands[i];
				if (command.name === "moveTo")
				{
					if (hasPath && (startX === endX) && (startY === endY))
						context.closePath();
					hasPath = false;
					startX = command.x;
					startY = command.y;
					context.moveTo(startX + offset, startY + offset);
				}
				else if (command.name === "lineTo")
				{
					hasPath = true;
					endX = command.x;
					endY = command.y;
					context.lineTo(endX + offset, endY + offset);
				}
				else if (command.name === "curveTo")
				{
					hasPath = true;
					endX = command.anchorX;
					endY = command.anchorY;
					context.quadraticCurveTo(command.controlX + offset, command.controlY + offset, endX + offset, endY + offset);
				}
			}
			if (hasPath && (startX === endX) && (startY === endY))
				context.closePath();

			context.save();
			context.lineWidth = strokeStyle.thickness;
			context.lineCap = (strokeStyle.caps === "none") ? "butt" : strokeStyle.caps;
			context.lineJoin = strokeStyle.joints;
			context.miterLimit = strokeStyle.miterLimit;
			command = commands[0];
			if (command.name === "solidStroke")
			{
				color = command.color;
				alpha = command.alpha;
				context.strokeStyle = "rgba(" + ((color >> 16) & 0xFF) + ", " + ((color >> 8) & 0xFF) + ", " + (color & 0xFF) + ", " + alpha + ")";
			}
			else if (command.name === "gradientStroke")
			{
				if (command.type === "radial")
					gradient = context.createRadialGradient(0.5 + 0.49 * command.focalPointRatio, 0.5, 0, 0.5, 0.5, 0.5);
				else
					gradient = context.createLinearGradient(0, 0, 1, 0);
				colors = command.colors;
				alphas = command.alphas;
				ratios = command.ratios;
				numStops = colors.length;
				for (i = 0; i < numStops; i++)
				{
					color = colors[i];
					alpha = alphas[i];
					ratio = ratios[i];
					gradient.addColorStop(ratio, "rgba(" + ((color >> 16) & 0xFF) + ", " + ((color >> 8) & 0xFF) + ", " + (color & 0xFF) + ", " + alpha + ")");
				}
				matrix = command.matrix;
				if (matrix)
					context.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
				context.strokeStyle = gradient;
			}
			context.stroke();
			context.restore();
			context.beginPath();
		};

		this._drawFill = function(commands)
		{
			var context = this._context;
			if (!context)
				return;

			var numCommands = commands.length;
			var command;
			var gradient;
			var numStops;
			var colors;
			var alphas;
			var ratios;
			var color;
			var alpha;
			var ratio;
			var matrix;
			var i;

			context.beginPath();
			for (i = 1; i < numCommands; i++)
			{
				command = commands[i];
				if (command.name === "moveTo")
					context.moveTo(command.x, command.y);
				else if (command.name === "lineTo")
					context.lineTo(command.x, command.y);
				else if (command.name === "curveTo")
					context.quadraticCurveTo(command.controlX, command.controlY, command.anchorX, command.anchorY);
			}

			context.save();
			command = commands[0];
			if (command.name === "solidFill")
			{
				color = command.color;
				alpha = command.alpha;
				context.fillStyle = "rgba(" + ((color >> 16) & 0xFF) + ", " + ((color >> 8) & 0xFF) + ", " + (color & 0xFF) + ", " + alpha + ")";
			}
			else if (command.name === "gradientFill")
			{
				if (command.type === "radial")
					gradient = context.createRadialGradient(0.5 + 0.49 * command.focalPointRatio, 0.5, 0, 0.5, 0.5, 0.5);
				else
					gradient = context.createLinearGradient(0, 0, 1, 0);
				colors = command.colors;
				alphas = command.alphas;
				ratios = command.ratios;
				numStops = colors.length;
				for (i = 0; i < numStops; i++)
				{
					color = colors[i];
					alpha = alphas[i];
					ratio = ratios[i];
					gradient.addColorStop(ratio, "rgba(" + ((color >> 16) & 0xFF) + ", " + ((color >> 8) & 0xFF) + ", " + (color & 0xFF) + ", " + alpha + ")");
				}
				matrix = command.matrix;
				if (matrix)
					context.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
				context.fillStyle = gradient;
			}
			context.fill();
			context.restore();
			context.beginPath();
		};

	});

});
});

jg_import.define("jgatt.graphics.Joints", function()
{
jg_namespace("jgatt.graphics", function()
{

	this.Joints = jg_static(function(Joints)
	{

		// Public Static Constants

		Joints.MITER = "miter";
		Joints.ROUND = "round";
		Joints.BEVEL = "bevel";

	});

});
});

jg_import.define("jgatt.properties.PropertyEventData", function()
{
jg_namespace("jgatt.properties", function()
{

	var EventData = jg_import("jgatt.events.EventData");

	this.PropertyEventData = jg_extend(EventData, function(PropertyEventData, base)
	{

		// Public Properties

		this.property = null;
		this.oldValue = null;
		this.newValue = null;

		// Constructor

		this.constructor = function(property, oldValue, newValue)
		{
			this.property = property;
			this.oldValue = oldValue;
			this.newValue = newValue;
		};

	});

});
});

jg_import.define("jgatt.graphics.brushes.Brush", function()
{
jg_namespace("jgatt.graphics.brushes", function()
{

	var MObservable = jg_import("jgatt.events.MObservable");
	var Matrix = jg_import("jgatt.geom.Matrix");
	var Point = jg_import("jgatt.geom.Point");
	var Graphics = jg_import("jgatt.graphics.Graphics");
	var MPropertyTarget = jg_import("jgatt.properties.MPropertyTarget");
	var Property = jg_import("jgatt.properties.Property");
	var PropertyEventData = jg_import("jgatt.properties.PropertyEventData");

	this.Brush = jg_extend(Object, function(Brush, base)
	{

		base = jg_mixin(this, MObservable, base);
		base = jg_mixin(this, MPropertyTarget, base);

		// Private Properties

		this._properties = null;
		this._commands = null;
		this._graphics = null;
		this._matrix = null;
		this._bounds = null;

		// Constructor

		this.constructor = function()
		{
			base.constructor.call(this);

			this.addEventListener(this.changed, this._self_changed, Infinity);
		};

		// Public Methods

		this.beginBrush = function(graphics, matrix, bounds)
		{
			if (!graphics)
				throw new Error("Parameter graphics must be non-null.");
			if (!(graphics instanceof Graphics))
				throw new Error("Parameter graphics must be an instance of jgatt.graphics.Graphics.");
			if ((matrix != null) && !(matrix instanceof Matrix))
				throw new Error("Parameter matrix must be an instance of jgatt.geom.Matrix.");
			if ((bounds != null) && !(bounds instanceof Array))
				throw new Error("Parameter bounds must be an array.");

			this.endBrush();

			if (!this._properties)
				this._properties = this._getProperties();
			this._commands = [];
			this._graphics = graphics;
			this._matrix = matrix ? matrix.clone() : null;
			if (bounds)
			{
				var bounds2 = this._bounds = [];
				var numPoints = bounds.length;
				var point;
				for (var i = 0; i < numPoints; i++)
				{
					point = bounds[i];
					if (point instanceof Point)
						bounds2.push(point.clone());
				}
			}
		};

		this.endBrush = function()
		{
			if (!this._graphics)
				return;

			this.draw(this._properties, this._commands, this._graphics, this._matrix, this._bounds);

			this._commands = null;
			this._graphics = null;
			this._matrix = null;
			this._bounds = null;
		};

		this.moveTo = function(x, y)
		{
			if (!this._graphics)
				return;

			this._commands.push({ name: "moveTo", x: x, y: y });
		};

		this.lineTo = function(x, y)
		{
			if (!this._graphics)
				return;

			this._commands.push({ name: "lineTo", x: x, y: y });
		};

		this.curveTo = function(controlX, controlY, anchorX, anchorY)
		{
			if (!this._graphics)
				return;

			this._commands.push({ name: "curveTo", controlX: controlX, controlY: controlY, anchorX: anchorX, anchorY: anchorY });
		};

		// Protected Methods

		this.draw = function(properties, commands, graphics, matrix, bounds)
		{
		};

		// Private Methods

		this._getProperties = function()
		{
			var properties = {};
			var property;
			for (var p in this)
			{
				property = this[p];
				if (property instanceof Property)
					properties[p] = this.getInternal(property);
			}
			return properties;
		};

		this._self_changed = function(e)
		{
			if ((e.target === this) && (e instanceof PropertyEventData))
				this._properties = null;
		};

	});

});
});

jg_import.define("jgatt.graphics.brushes.DrawingUtils", function()
{
jg_namespace("jgatt.graphics.brushes", function()
{

	var Point = jg_import("jgatt.geom.Point");
	var Brush = jg_import("jgatt.graphics.brushes.Brush");

	this.DrawingUtils = jg_static(function(DrawingUtils)
	{

		// Public Static Methods

		DrawingUtils.arcTo = function(brush, startX, startY, startAngle, arcAngle, radius, radiusY)
		{
			if (brush == null)
				throw new Error("Parameter brush must be non-null.");
			if (!(brush instanceof Brush))
				throw new Error("Parameter brush must be an instance of jgatt.graphics.brushes.Brush.");

			if (arcAngle > 360)
				arcAngle = 360;
			else if (arcAngle < -360)
				arcAngle = -360;

			if (radiusY === undefined)
				radiusY = radius;

			var segs = Math.ceil(Math.abs(arcAngle) / 45);
			var segAngle = arcAngle / segs;
			var theta = (segAngle / 180) * Math.PI;
			var cosThetaMid = Math.cos(theta / 2);
			var angle = (startAngle / 180) * Math.PI;
			var angleMid;
			var ax = startX - Math.cos(angle) * radius;
			var ay = startY - Math.sin(angle) * radiusY;
			var bx;
			var by;
			var cx;
			var cy;
			var i;

			for (i = 0; i < segs; i++)
			{
				angle += theta;
				angleMid = angle - (theta / 2);
				bx = ax + Math.cos(angle) * radius;
				by = ay + Math.sin(angle) * radiusY;
				cx = ax + Math.cos(angleMid) * (radius / cosThetaMid);
				cy = ay + Math.sin(angleMid) * (radiusY / cosThetaMid);
				brush.curveTo(cx, cy, bx, by);
			}

			return new Point(bx, by);
		};

		DrawingUtils.drawRectangle = function(brush, x, y, width, height)
		{
			if (brush == null)
				throw new Error("Parameter brush must be non-null.");
			if (!(brush instanceof Brush))
				throw new Error("Parameter brush must be an instance of jgatt.graphics.brushes.Brush.");

			var x2 = x + width;
			var y2 = y + height;

			brush.moveTo(x, y);
			brush.lineTo(x2, y);
			brush.lineTo(x2, y2);
			brush.lineTo(x, y2);
			brush.lineTo(x, y);
		};

		DrawingUtils.drawEllipse = function(brush, x, y, radiusX, radiusY)
		{
			if (brush == null)
				throw new Error("Parameter brush must be non-null.");
			if (!(brush instanceof Brush))
				throw new Error("Parameter brush must be an instance of jgatt.graphics.brushes.Brush.");

			x += radiusX;

			brush.moveTo(x, y);
			DrawingUtils.arcTo(brush, x, y, 0, 360, radiusX, radiusY);
		};

	});

});
});

jg_import.define("jgatt.utils.FunctionUtils", function()
{
jg_namespace("jgatt.utils", function()
{

	this.FunctionUtils = jg_static(function(FunctionUtils)
	{

		// Public Static Methods

		FunctionUtils.bind = function(f, scope)
		{
			if (f == null)
				throw new Error("Parameter f must be non-null.");
			if (typeof f !== "function")
				throw new Error("Parameter f must be a function.");

			return function() { return f.apply(scope, arguments); };
		};

	});

});
});

jg_import.define("jgatt.properties.ObservableProperty", function()
{
jg_namespace("jgatt.properties", function()
{

	var ChainedEvent = jg_import("jgatt.events.ChainedEvent");
	var Event = jg_import("jgatt.events.Event");
	var EventData = jg_import("jgatt.events.EventData");
	var MObservable = jg_import("jgatt.events.MObservable");
	var Property = jg_import("jgatt.properties.Property");
	var PropertyEventData = jg_import("jgatt.properties.PropertyEventData");
	var Dictionary = jg_import("jgatt.utils.Dictionary");
	var FunctionUtils = jg_import("jgatt.utils.FunctionUtils");

	this.ObservableProperty = jg_extend(Property, function(ObservableProperty, base)
	{

		// Private Static Methods

		var _defaultChangedComparator = function(oldValue, newValue)
		{
			if (oldValue === newValue)
				return false;

			// handle NaN
			if ((oldValue !== oldValue) && (newValue !== newValue))
				return false;

			return true;
		};

		// Public Events

		this.changed = null;

		// Private Properties

		this._noChaining = false;
		this._changedComparator = null;
		this._onChanged = null;

		// Constructor

		this.constructor = function(name, type, defaultValue, readOnly, noChaining)
		{
			base.constructor.call(this, name, type, defaultValue, readOnly);

			if ((noChaining != null) && (typeof noChaining !== "boolean"))
				throw new Error("Parameter noChaining must be a boolean.");

			this._noChaining = (noChaining === true);

			this.changed = this._noChaining ? new Event("changed", EventData) : new ChainedEvent("changed", MObservable.changed);
		};

		// Public Getters/Setters

		this.noChaining = function()
		{
			return this._noChaining;
		};

		this.changedComparator = function(value)
		{
			if (arguments.length == 0)
				return this._changedComparator;

			if ((value != null) && (typeof value !== "function"))
				throw new Error("Parameter changedComparator must be a function.");

			this._changedComparator = value ? value : null;

			return this;
		};

		this.onChanged = function(value)
		{
			if (arguments.length == 0)
				return this._onChanged;

			if ((value != null) && (typeof value !== "function"))
				throw new Error("Parameter onChanged must be a function.");

			this._onChanged = value ? value : null;

			return this;
		};

		// Public Methods

		this.setInternal = function(target, propertyMap, value)
		{
			value = this.assertType(value, "Value assigned to property " + this._name + " is incompatible with property type.");

			var propertyInfo = propertyMap.get(this);
			if (!propertyInfo)
				propertyInfo = propertyMap.set(this, this.createPropertyInfo(this, target));

			if (propertyInfo.isChanging)
				return false;

			try
			{
				propertyInfo.isChanging = true;

				var oldValue = propertyInfo.value;

				if (this._changedComparator)
				{
					if (!this._changedComparator.call(target, oldValue, value))
						return false;
				}
				else if (!_defaultChangedComparator(oldValue, value))
				{
					return false;
				}

				if (this._setter)
					this._setter.call(target, value);

				propertyInfo.value = value;
				propertyInfo.setupValueChain();

				if (propertyInfo.isObservable)
					target.dispatchEvent(this.changed, new PropertyEventData(this, oldValue, value));
			}
			finally
			{
				propertyInfo.isChanging = false;
			}

			return true;
		};

		// Protected Methods

		this.createPropertyInfo = function(property, target)
		{
			return new ObservableProperty.PropertyInfo(property, target);
		};

	});

	this.ObservableProperty.PropertyInfo = jg_extend(Property.PropertyInfo, function(PropertyInfo, base)
	{

		// Public Properties

		this.cachedValue = null;
		this.isObservable = false;
		this.isChanging = false;
		this.isValueChangingMap = null;

		// Constructor

		this.constructor = function(property, target)
		{
			base.constructor.call(this, property, target);

			this.isObservable = jg_has_mixin(target, MObservable);
			this.isValueChangingMap = new Dictionary();

			this.value_changed = FunctionUtils.bind(this.value_changed, this);

			if (property._onChanged && this.isObservable)
				target.addEventListener(property.changed, property._onChanged, Infinity);
		};

		// Public Methods

		this.setupValueChain = function()
		{
			this.clearValueChain();

			var value = this.value;
			if ((value == null) || !jg_has_mixin(value, MObservable))
				return;

			this.cachedValue = value;

			value.addEventListener(value.changed, this.value_changed, -Infinity);
		};

		this.clearValueChain = function()
		{
			var value = this.cachedValue;
			if (value == null)
				return;

			value.removeEventListener(value.changed, this.value_changed);

			this.cachedValue = null;
		};

		this.value_changed = function(e)
		{
			if (!this.isObservable || this.isChanging || this.isValueChangingMap.has(e) || e.isPropagationStopped())
				return;

			try
			{
				this.isValueChangingMap.set(e, true);

				this.target.dispatchEvent(this.property.changed, e);
			}
			finally
			{
				this.isValueChangingMap.del(e);
			}
		};

	});

});
});

jg_import.define("jgatt.graphics.brushes.TileBrush", function()
{
jg_namespace("jgatt.graphics.brushes", function()
{

	var Matrix = jg_import("jgatt.geom.Matrix");
	var Point = jg_import("jgatt.geom.Point");
	var Brush = jg_import("jgatt.graphics.brushes.Brush");
	var ObservableProperty = jg_import("jgatt.properties.ObservableProperty");

	this.TileBrush = jg_extend(Brush, function(TileBrush, base)
	{

		// Public Properties

		this.stretchMode = new ObservableProperty("stretchMode", String, "fill")
			.writeFilter(function(value)
			{
				switch (value)
				{
					case "none":
					case "fill":
					case "uniform":
					case "uniformToFill":
					case "uniformToWidth":
					case "uniformToHeight":
						return value;
					default:
						return "fill";
				}
			});

		this.alignmentX = new ObservableProperty("alignmentX", Number, 0.5)
			.writeFilter(function(value)
			{
				return ((value > -Infinity) && (value < Infinity)) ? value : 0.5;
			});

		this.alignmentY = new ObservableProperty("alignmentY", Number, 0.5)
			.writeFilter(function(value)
			{
				return ((value > -Infinity) && (value < Infinity)) ? value : 0.5;
			});

		this.tileTransform = new ObservableProperty("tileTransform", Matrix, null)
			.readFilter(function(value)
			{
				return value ? value.clone() : null;
			})
			.writeFilter(function(value)
			{
				return value ? value.clone() : null;
			});

		this.renderTransform = new ObservableProperty("renderTransform", Matrix, null)
			.readFilter(function(value)
			{
				return value ? value.clone() : null;
			})
			.writeFilter(function(value)
			{
				return value ? value.clone() : null;
			});

		this.fitToDrawing = new ObservableProperty("fitToDrawing", Boolean, false);

		// Constructor

		this.constructor = function(stretchMode, alignmentX, alignmentY, tileTransform, renderTransform, fitToDrawing)
		{
			base.constructor.call(this);

			if (stretchMode != null)
				this.set(this.stretchMode, stretchMode);
			if (alignmentX != null)
				this.set(this.alignmentX, alignmentX);
			if (alignmentY != null)
				this.set(this.alignmentY, alignmentY);
			if (tileTransform != null)
				this.set(this.tileTransform, tileTransform);
			if (renderTransform != null)
				this.set(this.renderTransform, renderTransform);
			if (fitToDrawing != null)
				this.set(this.fitToDrawing, fitToDrawing);
		};

		// Protected Methods

		this.computeTileMatrix = function(tileWidth, tileHeight, properties, commands, matrix, bounds)
		{
			var tileMatrix;

			var tileTransform = properties.tileTransform;
			if (tileTransform)
			{
				tileMatrix = tileTransform.clone();

				var p1 = new Point(0, 0);
				var p2 = new Point(tileWidth, 0);
				var p3 = new Point(tileWidth, tileHeight);
				var p4 = new Point(0, tileHeight);

				p1 = tileMatrix.transformPoint(p1);
				p2 = tileMatrix.transformPoint(p2);
				p3 = tileMatrix.transformPoint(p3);
				p4 = tileMatrix.transformPoint(p4);

				var left = Math.min(p1.x, p2.x, p3.x, p4.x);
				var right = Math.max(p1.x, p2.x, p3.x, p4.x);
				var top = Math.min(p1.y, p2.y, p3.y, p4.y);
				var bottom = Math.max(p1.y, p2.y, p3.y, p4.y);

				tileWidth = right - left;
				tileHeight = bottom - top;
				tileMatrix.translate(-left, -top);
			}
			else
			{
				tileMatrix = new Matrix();
			}

			var invertedMatrix;
			if (matrix && matrix.hasInverse())
			{
				invertedMatrix = matrix.clone();
				invertedMatrix.invert();
			}

			var minX = Infinity;
			var minY = Infinity;
			var maxX = -Infinity;
			var maxY = -Infinity;
			var point;
			var i;

			if (bounds && !properties.fitToDrawing)
			{
				var numPoints = bounds.length;
				for (i = 0; i < numPoints; i++)
				{
					point = bounds[i];

					if (invertedMatrix)
						point = invertedMatrix.transformPoint(point);

					minX = Math.min(point.x, minX);
					minY = Math.min(point.y, minY);
					maxX = Math.max(point.x, maxX);
					maxY = Math.max(point.y, maxY);
				}
			}
			else
			{
				var numCommands = commands.length;
				var command;
				for (i = 0; i < numCommands; i++)
				{
					command = commands[i];
					if (command.name == "moveTo")
						point = new Point(command.x, command.y);
					else if (command.name == "lineTo")
						point = new Point(command.x, command.y);
					else if (command.name == "curveTo")
						point = new Point(command.anchorX, command.anchorY);  // control point tangents need to be properly computed
					else
						continue;

					if (invertedMatrix)
						point = invertedMatrix.transformPoint(point);

					minX = Math.min(point.x, minX);
					minY = Math.min(point.y, minY);
					maxX = Math.max(point.x, maxX);
					maxY = Math.max(point.y, maxY);
				}
			}

			if (minX == Infinity)
				minX = minY = maxX = maxY = 0;

			var width = maxX - minX;
			var height = maxY - minY;
			var scaleX;
			var scaleY;
			var offsetX;
			var offsetY;

			switch (properties.stretchMode)
			{
				case "none":
					offsetX = (width - tileWidth) * properties.alignmentX;
					offsetY = (height - tileHeight) * properties.alignmentY;
					tileMatrix.translate(offsetX, offsetY);
					break;
				case "uniform":
					scaleX = (tileWidth > 0) ? (width / tileWidth) : 1;
					scaleY = (tileHeight > 0) ? (height / tileHeight) : 1;
					scaleX = scaleY = Math.min(scaleX, scaleY);
					offsetX = (width - tileWidth * scaleX) * properties.alignmentX;
					offsetY = (height - tileHeight * scaleY) * properties.alignmentY;
					tileMatrix.scale(scaleX, scaleY);
					tileMatrix.translate(offsetX, offsetY);
					break;
				case "uniformToFill":
					scaleX = (tileWidth > 0) ? (width / tileWidth) : 1;
					scaleY = (tileHeight > 0) ? (height / tileHeight) : 1;
					scaleX = scaleY = Math.max(scaleX, scaleY);
					offsetX = (width - tileWidth * scaleX) * properties.alignmentX;
					offsetY = (height - tileHeight * scaleY) * properties.alignmentY;
					tileMatrix.scale(scaleX, scaleY);
					tileMatrix.translate(offsetX, offsetY);
					break;
				case "uniformToWidth":
					scaleX = scaleY = (tileWidth > 0) ? (width / tileWidth) : 1;
					offsetX = (width - tileWidth * scaleX) * properties.alignmentX;
					offsetY = (height - tileHeight * scaleY) * properties.alignmentY;
					tileMatrix.scale(scaleX, scaleY);
					tileMatrix.translate(offsetX, offsetY);
					break;
				case "uniformToHeight":
					scaleX = scaleY = (tileHeight > 0) ? (height / tileHeight) : 1;
					offsetX = (width - tileWidth * scaleX) * properties.alignmentX;
					offsetY = (height - tileHeight * scaleY) * properties.alignmentY;
					tileMatrix.scale(scaleX, scaleY);
					tileMatrix.translate(offsetX, offsetY);
					break;
				default:  // "fill"
					scaleX = (tileWidth > 0) ? (width / tileWidth) : 1;
					scaleY = (tileHeight > 0) ? (height / tileHeight) : 1;
					tileMatrix.scale(scaleX, scaleY);
					break;
			}

			var renderTransform = properties.renderTransform;
			if (renderTransform)
				tileMatrix.concat(renderTransform);

			tileMatrix.translate(minX, minY);

			if (matrix)
				tileMatrix.concat(matrix);

			return tileMatrix;
		};

	});

});
});

jg_import.define("jgatt.properties.ObservableArrayProperty", function()
{
jg_namespace("jgatt.properties", function()
{

	var MObservable = jg_import("jgatt.events.MObservable");
	var ObservableProperty = jg_import("jgatt.properties.ObservableProperty");
	var TypeUtils = jg_import("jgatt.utils.TypeUtils");

	this.ObservableArrayProperty = jg_extend(ObservableProperty, function(ObservableArrayProperty, base)
	{

		// Private Properties

		this._elementType = null;

		// Constructor

		this.constructor = function(name, elementType, defaultValue, readOnly, noChaining)
		{
			if (elementType == null)
				throw new Error("Parameter elementType must be non-null.");
			if (typeof elementType !== "function")
				throw new Error("Parameter elementType must be a class.");

			this._elementType = elementType;

			base.constructor.call(this, name, Array, defaultValue, readOnly, noChaining);
		};

		// Public Getters/Setters

		this.elementType = function()
		{
			return this._elementType;
		};

		// Protected Methods

		this.assertType = function(value, message)
		{
			if (value == null)
				return null;

			if (!(value instanceof Array))
				throw new Error(message);

			var elementType = this._elementType;
			if (elementType === Object)
				return value;

			var elementValue;
			for (var i = 0, l = value.length; i < l; i++)
			{
				elementValue = value[i];
				if ((elementValue == null) || !TypeUtils.isTypeOf(elementValue, elementType))
					throw new Error(message);
			}

			return value;
		};

		this.createPropertyInfo = function(property, target)
		{
			return new ObservableArrayProperty.PropertyInfo(property, target);
		};

	});

	this.ObservableArrayProperty.PropertyInfo = jg_extend(ObservableProperty.PropertyInfo, function(PropertyInfo, base)
	{

		// Public Properties

		this.cachedElementValues = null;

		// Constructor

		this.constructor = function(property, target)
		{
			base.constructor.call(this, property, target);
		};

		// Public Methods

		this.setupValueChain = function()
		{
			this.clearValueChain();

			var value = this.value;
			if (value == null)
				return;

			if (jg_has_mixin(value, MObservable))
			{
				this.cachedValue = value;
				value.addEventListener(value.changed, this.value_changed, -Infinity);
			}

			if (value.length == 0)
				return;

			var elementValues = this.cachedElementValues = [];
			var elementValue;
			for (var i = 0, l = value.length; i < l; i++)
			{
				elementValue = value[i];
				if (jg_has_mixin(elementValue, MObservable))
				{
					elementValues.push(elementValue);
					elementValue.addEventListener(elementValue.changed, this.value_changed, -Infinity);
				}
			}
		};

		this.clearValueChain = function()
		{
			var elementValues = this.cachedElementValues;
			if (elementValues)
			{
				var elementValue;
				for (var i = elementValues.length - 1; i >= 0; i--)
				{
					elementValue = value[i];
					elementValue.removeEventListener(elementValue.changed, this.value_changed);
				}
				this.cachedElementValues = null;
			}

			var value = this.cachedValue;
			if (value != null)
			{
				value.removeEventListener(value.changed, this.value_changed);
				this.cachedValue = null;
			}
		};

	});

});
});

jg_import.define("jgatt.graphics.brushes.GradientFillBrush", function()
{
jg_namespace("jgatt.graphics.brushes", function()
{

	var Matrix = jg_import("jgatt.geom.Matrix");
	var TileBrush = jg_import("jgatt.graphics.brushes.TileBrush");
	var ObservableArrayProperty = jg_import("jgatt.properties.ObservableArrayProperty");
	var ObservableProperty = jg_import("jgatt.properties.ObservableProperty");
	var NumberUtils = jg_import("jgatt.utils.NumberUtils");

	this.GradientFillBrush = jg_extend(TileBrush, function(GradientFillBrush, base)
	{

		// Public Properties

		this.type = new ObservableProperty("type", String, "linear")
			.writeFilter(function(value)
			{
				switch (value)
				{
					case "linear":
					case "radial":
						return value;
					default:
						return "linear";
				}
			});

		this.colors = new ObservableArrayProperty("colors", Number, [])
			.readFilter(function(value)
			{
				return value.concat();
			})
			.writeFilter(function(value)
			{
				return value ? value.concat() : [];
			});

		this.alphas = new ObservableArrayProperty("alphas", Number, [])
			.readFilter(function(value)
			{
				return value.concat();
			})
			.writeFilter(function(value)
			{
				return value ? value.concat() : [];
			});

		this.ratios = new ObservableArrayProperty("ratios", Number, [])
			.readFilter(function(value)
			{
				return value.concat();
			})
			.writeFilter(function(value)
			{
				return value ? value.concat() : [];
			});

		this.focalPointRatio = new ObservableProperty("focalPointRatio", Number, 0)
			.writeFilter(function(value)
			{
				return !isNaN(value) ? NumberUtils.minMax(value, -1, 1) : 0;
			});

		this.gradientWidth = new ObservableProperty("gradientWidth", Number, 100)
			.writeFilter(function(value)
			{
				return ((value > 0) && (value < Infinity)) ? value : 100;
			});

		this.gradientHeight = new ObservableProperty("gradientHeight", Number, 100)
			.writeFilter(function(value)
			{
				return ((value > 0) && (value < Infinity)) ? value : 100;
			});

		// Constructor

		this.constructor = function(type, colors, alphas, ratios, focalPointRatio)
		{
			base.constructor.call(this);

			if (type != null)
				this.set(this.type, type);
			if (colors != null)
				this.set(this.colors, colors);
			if (alphas != null)
				this.set(this.alphas, alphas);
			if (ratios != null)
				this.set(this.ratios, ratios);
			if (focalPointRatio != null)
				this.set(this.focalPointRatio, focalPointRatio);
		};

		// Protected Methods

		this.draw = function(properties, commands, graphics, matrix, bounds)
		{
			var gradientWidth = properties.gradientWidth;
			var gradientHeight = properties.gradientHeight;

			var tileMatrix = new Matrix(gradientWidth, 0, 0, gradientHeight);
			tileMatrix.concat(this.computeTileMatrix(gradientWidth, gradientHeight, properties, commands, matrix, bounds));

			graphics.beginGradientFill(properties.type, properties.colors, properties.alphas, properties.ratios, tileMatrix, properties.focalPointRatio);

			var numCommands = commands.length;
			var command;
			for (var i = 0; i < numCommands; i++)
			{
				command = commands[i];
				if (command.name === "moveTo")
					graphics.moveTo(command.x, command.y);
				else if (command.name === "lineTo")
					graphics.lineTo(command.x, command.y);
				else if (command.name === "curveTo")
					graphics.curveTo(command.controlX, command.controlY, command.anchorX, command.anchorY);
			}

			graphics.endFill();
		};

	});

});
});

jg_import.define("jgatt.graphics.brushes.GroupBrush", function()
{
jg_namespace("jgatt.graphics.brushes", function()
{

	var Brush = jg_import("jgatt.graphics.brushes.Brush");
	var ObservableArrayProperty = jg_import("jgatt.properties.ObservableArrayProperty");

	this.GroupBrush = jg_extend(Brush, function(GroupBrush, base)
	{

		// Public Properties

		this.brushes = new ObservableArrayProperty("brushes", Brush, [])
			.readFilter(function(value)
			{
				return value.concat();
			})
			.writeFilter(function(value)
			{
				return value ? value.concat() : [];
			});

		// Constructor

		this.constructor = function(brushes)
		{
			base.constructor.call(this);

			if (brushes != null)
				this.set(this.brushes, brushes);
		};

		// Protected Methods

		this.draw = function(properties, commands, graphics, matrix, bounds)
		{
			var brushes = properties.brushes;
			var numBrushes = brushes.length;
			var brush;
			var numCommands = commands.length;
			var command;
			var i;
			var j;

			for (i = 0; i < numBrushes; i++)
			{
				brush = brushes[i];
				brush.beginBrush(graphics, matrix, bounds);
				for (j = 0; j < numCommands; j++)
				{
					command = commands[j];
					if (command.name === "moveTo")
						brush.moveTo(command.x, command.y);
					else if (command.name === "lineTo")
						brush.lineTo(command.x, command.y);
					else if (command.name === "curveTo")
						brush.curveTo(command.controlX, command.controlY, command.anchorX, command.anchorY);
				}
				brush.endBrush();
			}
		};

	});

});
});

jg_import.define("jgatt.graphics.brushes.SolidFillBrush", function()
{
jg_namespace("jgatt.graphics.brushes", function()
{

	var Brush = jg_import("jgatt.graphics.brushes.Brush");
	var ObservableProperty = jg_import("jgatt.properties.ObservableProperty");
	var NumberUtils = jg_import("jgatt.utils.NumberUtils");

	this.SolidFillBrush = jg_extend(Brush, function(SolidFillBrush, base)
	{

		// Public Properties

		this.color = new ObservableProperty("color", Number, 0x000000)
			.writeFilter(function(value)
			{
				return !isNaN(value) ? NumberUtils.minMax(Math.floor(value), 0x000000, 0xFFFFFF) : 0x000000;
			});

		this.alpha = new ObservableProperty("alpha", Number, 1)
			.writeFilter(function(value)
			{
				return !isNaN(value) ? NumberUtils.minMax(value, 0, 1) : 1;
			});

		// Constructor

		this.constructor = function(color, alpha)
		{
			base.constructor.call(this);

			if (color != null)
				this.set(this.color, color);
			if (alpha != null)
				this.set(this.alpha, alpha);
		};

		// Protected Methods

		this.draw = function(properties, commands, graphics, matrix, bounds)
		{
			graphics.beginSolidFill(properties.color, properties.alpha);

			var numCommands = commands.length;
			var command;
			for (var i = 0; i < numCommands; i++)
			{
				command = commands[i];
				if (command.name === "moveTo")
					graphics.moveTo(command.x, command.y);
				else if (command.name === "lineTo")
					graphics.lineTo(command.x, command.y);
				else if (command.name === "curveTo")
					graphics.curveTo(command.controlX, command.controlY, command.anchorX, command.anchorY);
			}

			graphics.endFill();
		};

	});

});
});

jg_import.define("jgatt.graphics.brushes.SolidStrokeBrush", function()
{
jg_namespace("jgatt.graphics.brushes", function()
{

	var Brush = jg_import("jgatt.graphics.brushes.Brush");
	var ObservableProperty = jg_import("jgatt.properties.ObservableProperty");
	var NumberUtils = jg_import("jgatt.utils.NumberUtils");

	this.SolidStrokeBrush = jg_extend(Brush, function(SolidStrokeBrush, base)
	{

		// Public Properties

		this.color = new ObservableProperty("color", Number, 0x000000)
			.writeFilter(function(value)
			{
				return !isNaN(value) ? NumberUtils.minMax(Math.floor(value), 0x000000, 0xFFFFFF) : 0x000000;
			});

		this.alpha = new ObservableProperty("alpha", Number, 1)
			.writeFilter(function(value)
			{
				return !isNaN(value) ? NumberUtils.minMax(value, 0, 1) : 1;
			});

		this.thickness = new ObservableProperty("thickness", Number, 1)
			.writeFilter(function(value)
			{
				return ((value > 0) && (value < Infinity)) ? value : 1;
			});

		this.caps = new ObservableProperty("caps", String, "none")
			.writeFilter(function(value)
			{
				switch (value)
				{
					case "none":
					case "round":
					case "square":
						return value;
					default:
						return "none";
				}
			});

		this.joints = new ObservableProperty("joints", String, "miter")
			.writeFilter(function(value)
			{
				switch (value)
				{
					case "miter":
					case "round":
					case "bevel":
						return value;
					default:
						return "miter";
				}
			});

		this.miterLimit = new ObservableProperty("miterLimit", Number, 10)
			.writeFilter(function(value)
			{
				return ((value > 0) && (value < Infinity)) ? value : 10;
			});

		this.pixelHinting = new ObservableProperty("pixelHinting", Boolean, true);

		// Constructor

		this.constructor = function(color, alpha, thickness, caps, joints, miterLimit, pixelHinting)
		{
			base.constructor.call(this);

			if (color != null)
				this.set(this.color, color);
			if (alpha != null)
				this.set(this.alpha, alpha);
			if (thickness != null)
				this.set(this.thickness, thickness);
			if (caps != null)
				this.set(this.caps, caps);
			if (joints != null)
				this.set(this.joints, joints);
			if (miterLimit != null)
				this.set(this.miterLimit, miterLimit);
			if (pixelHinting != null)
				this.set(this.pixelHinting, pixelHinting);
		};

		// Protected Methods

		this.draw = function(properties, commands, graphics, matrix, bounds)
		{
			graphics.setStrokeStyle(properties.thickness, properties.caps, properties.joints, properties.miterLimit, properties.pixelHinting);
			graphics.beginSolidStroke(properties.color, properties.alpha);

			var numCommands = commands.length;
			var command;
			for (var i = 0; i < numCommands; i++)
			{
				command = commands[i];
				if (command.name === "moveTo")
					graphics.moveTo(command.x, command.y);
				else if (command.name === "lineTo")
					graphics.lineTo(command.x, command.y);
				else if (command.name === "curveTo")
					graphics.curveTo(command.controlX, command.controlY, command.anchorX, command.anchorY);
			}

			graphics.endStroke();
		};

	});

});
});

jg_import.define("jgatt.graphics.brushes.StretchMode", function()
{
jg_namespace("jgatt.graphics.brushes", function()
{

	this.StretchMode = jg_static(function(StretchMode)
	{

		// Public Static Constants

		StretchMode.NONE = "none";
		StretchMode.FILL = "fill";
		StretchMode.UNIFORM = "uniform";
		StretchMode.UNIFORM_TO_FILL = "uniformToFill";
		StretchMode.UNIFORM_TO_WIDTH = "uniformToWidth";
		StretchMode.UNIFORM_TO_HEIGHT = "uniformToHeight";

	});

});
});

jg_import.define("jgatt.motion.easers.Easer", function()
{
jg_namespace("jgatt.motion.easers", function()
{

	this.Easer = jg_extend(Object, function(Easer, base)
	{

		// Public Properties

		this.direction = 1;

		// Constructor

		this.constructor = function(direction)
		{
			this.direction = (direction !== undefined) ? direction : 1;
		};

		// Public Methods

		this.ease = function(position)
		{
			if (this.direction > 0)
				return this.easeOverride(position);
			else if (this.direction < 0)
				return 1 - this.easeOverride(1 - position);

			if (position < 0.5)
				return this.easeOverride(position * 2) / 2;
			return 0.5 + (1 - this.easeOverride(2 - position * 2)) / 2;
		};

		// Protected Methods

		this.easeOverride = function(position)
		{
			return position;
		};

	});

});
});

jg_import.define("jgatt.motion.Tween", function()
{
jg_namespace("jgatt.motion", function()
{

	var Event = jg_import("jgatt.events.Event");
	var EventData = jg_import("jgatt.events.EventData");
	var MEventTarget = jg_import("jgatt.events.MEventTarget");
	var Easer = jg_import("jgatt.motion.easers.Easer");
	var MPropertyTarget = jg_import("jgatt.properties.MPropertyTarget");
	var Property = jg_import("jgatt.properties.Property");

	this.Tween = jg_extend(Object, function(Tween, base)
	{

		base = jg_mixin(this, MEventTarget, base);
		base = jg_mixin(this, MPropertyTarget, base);

		// Public Events

		this.begin = new Event("begin", EventData);
		this.end = new Event("end", EventData);
		this.update = new Event("update", EventData);

		// Public Properties

		this.easer = new Property("easer", Easer, null)
			.onWrite(function()
			{
				this.endTween();
			});

		// Private Properties

		this._runningEaser = null;
		this._isRunning = false;

		// Constructor

		this.constructor = function(easer)
		{
			base.constructor.call(this);

			if (easer != null)
				this.set(this.easer, easer);
		};

		// Public Methods

		this.beginTween = function()
		{
			this.endTween();

			if (!this.beginTweenOverride())
				return false;

			this._runningEaser = this.getInternal(this.easer);
			this._isRunning = true;

			this.dispatchEvent(this.begin, new EventData());

			return true;
		};

		this.endTween = function()
		{
			if (!this._isRunning)
				return false;

			this.endTweenOverride();

			this._isRunning = false;

			this.dispatchEvent(this.end, new EventData());

			return true;
		};

		this.updateTween = function(position)
		{
			if (!this._isRunning)
				return false;

			var easer = this._runningEaser;
			if (easer)
				position = easer.ease(position);

			if (!this.updateTweenOverride(position))
				return false;

			this.dispatchEvent(this.update, new EventData());

			return true;
		};

		// Protected Methods

		this.beginTweenOverride = function()
		{
			return false;
		};

		this.endTweenOverride = function()
		{
		};

		this.updateTweenOverride = function(position)
		{
			return false;
		};

	});

});
});

jg_import.define("jgatt.properties.ArrayProperty", function()
{
jg_namespace("jgatt.properties", function()
{

	var Property = jg_import("jgatt.properties.Property");
	var TypeUtils = jg_import("jgatt.utils.TypeUtils");

	this.ArrayProperty = jg_extend(Property, function(ArrayProperty, base)
	{

		// Private Properties

		this._elementType = null;

		// Constructor

		this.constructor = function(name, elementType, defaultValue, readOnly)
		{
			if (elementType == null)
				throw new Error("Parameter elementType must be non-null.");
			if (typeof elementType !== "function")
				throw new Error("Parameter elementType must be a class.");

			this._elementType = elementType;

			base.constructor.call(this, name, Array, defaultValue, readOnly);
		};

		// Public Getters/Setters

		this.elementType = function()
		{
			return this._elementType;
		};

		// Protected Methods

		this.assertType = function(value, message)
		{
			if (value == null)
				return null;

			if (!(value instanceof Array))
				throw new Error(message);

			var elementType = this._elementType;
			if (elementType === Object)
				return value;

			var elementValue;
			for (var i = 0, l = value.length; i < l; i++)
			{
				elementValue = value[i];
				if ((elementValue == null) || !TypeUtils.isTypeOf(elementValue, elementType))
					throw new Error(message);
			}

			return value;
		};

	});

});
});

jg_import.define("jgatt.motion.GroupTween", function()
{
jg_namespace("jgatt.motion", function()
{

	var Tween = jg_import("jgatt.motion.Tween");
	var ArrayProperty = jg_import("jgatt.properties.ArrayProperty");

	this.GroupTween = jg_extend(Tween, function(GroupTween, base)
	{

		// Public Properties

		this.tweens = new ArrayProperty("tweens", Tween, [])
			.readFilter(function(value)
			{
				return value.concat();
			})
			.writeFilter(function(value)
			{
				return value ? value.concat() : [];
			})
			.onWrite(function()
			{
				this.endTween();
			});

		// Private Properties

		this._runningTweens = null;

		// Constructor

		this.constructor = function(tweens, easer)
		{
			base.constructor.call(this, easer);

			if (tweens != null)
				this.set(this.tweens, tweens);
		};

		// Protected Methods

		this.beginTweenOverride = function()
		{
			var runningTweens = [];
			var tweens = this.getInternal(this.tweens);
			var tween;

			for (var i = 0, l = tweens.length; i < l; i++)
			{
				tween = tweens[i];
				if (tween.beginTween())
					runningTweens.push(tween);
			}

			if (runningTweens.length == 0)
				return false;

			this._runningTweens = runningTweens;

			return true;
		};

		this.endTweenOverride = function()
		{
			var runningTweens = this._runningTweens;

			for (var i = 0, l = runningTweens.length; i < l; i++)
				runningTweens[i].endTween();

			this._runningTweens = null;
		};

		this.updateTweenOverride = function(position)
		{
			var runningTweens = this._runningTweens;
			var numTweens = runningTweens.length;
			var tween;

			for (var i = 0; i < numTweens; i++)
			{
				tween = runningTweens[i];
				if (!tween.updateTween(position))
				{
					tween.endTween();
					runningTweens.splice(i, 1);
					i--;
					numTweens--;
				}
			}

			return (runningTweens.length > 0);
		};

	});

});
});

jg_import.define("jgatt.motion.interpolators.Interpolator", function()
{
jg_namespace("jgatt.motion.interpolators", function()
{

	this.Interpolator = jg_extend(Object, function(Interpolator, base)
	{

		// Public Methods

		this.interpolate = function(value1, value2, position)
		{
			return (position < 0.5) ? value1 : value2;
		};

	});

});
});

jg_import.define("jgatt.motion.interpolators.NumberInterpolator", function()
{
jg_namespace("jgatt.motion.interpolators", function()
{

	var Interpolator = jg_import("jgatt.motion.interpolators.Interpolator");
	var NumberUtils = jg_import("jgatt.utils.NumberUtils");

	this.NumberInterpolator = jg_extend(Interpolator, function(NumberInterpolator, base)
	{

		// Public Properties

		this.snap = 0;

		// Constructor

		this.constructor = function(snap)
		{
			this.snap = (snap !== undefined) ? snap : 0;
		};

		// Public Methods

		this.interpolate = function(value1, value2, position)
		{
			var number1 = Number(value1);
			var number2 = Number(value2);

			var number = NumberUtils.interpolate(number1, number2, position);

			var snap = this.snap;
			if (snap > 0)
				number = Math.round(number / snap) * snap;

			return number;
		};

	});

});
});

jg_import.define("jgatt.motion.MethodTween", function()
{
jg_namespace("jgatt.motion", function()
{

	var Tween = jg_import("jgatt.motion.Tween");
	var Interpolator = jg_import("jgatt.motion.interpolators.Interpolator");
	var NumberInterpolator = jg_import("jgatt.motion.interpolators.NumberInterpolator");
	var Property = jg_import("jgatt.properties.Property");
	var Dictionary = jg_import("jgatt.utils.Dictionary");

	this.MethodTween = jg_extend(Tween, function(MethodTween, base)
	{

		// Private Static Constants

		var _DEFAULT_INTERPOLATOR = new NumberInterpolator();

		// Private Static Properties

		var _runningTargets = new Dictionary();

		// Public Properties

		this.target = new Property("target", Object, null)
			.onWrite(function()
			{
				this.endTween();
			});

		this.getter = new Property("getter", Function, null)
			.onWrite(function()
			{
				this.endTween();
			});

		this.setter = new Property("setter", Function, null)
			.onWrite(function()
			{
				this.endTween();
			});

		this.startValue = new Property("startValue", Object, null)
			.onWrite(function()
			{
				this.endTween();
			});

		this.endValue = new Property("endValue", Object, null)
			.onWrite(function()
			{
				this.endTween();
			});

		this.interpolator = new Property("interpolator", Interpolator, null)
			.onWrite(function()
			{
				this.endTween();
			});

		// Private Properties

		this._runningTarget = null;
		this._runningGetter = null;
		this._runningSetter = null;
		this._runningStartValue = null;
		this._runningEndValue = null;
		this._runningInterpolator= null;

		// Constructor

		this.constructor = function(target, getter, setter, startValue, endValue, easer, interpolator)
		{
			base.constructor.call(this, easer);

			if (target != null)
				this.set(this.target, target);
			if (getter != null)
				this.set(this.getter, getter);
			if (setter != null)
				this.set(this.setter, setter);
			if (startValue != null)
				this.set(this.startValue, startValue);
			if (endValue != null)
				this.set(this.endValue, endValue);
			if (interpolator != null)
				this.set(this.interpolator, interpolator);
		};

		// Protected Methods

		this.beginTweenOverride = function()
		{
			var target = this.getInternal(this.target);
			if (target == null)
				return false;

			var getter = this.getInternal(this.getter);
			if (getter == null)
				return false;

			var setter = this.getInternal(this.setter);
			if (setter == null)
				return false;

			var endValue = this.getInternal(this.endValue);
			if (endValue == null)
				return false;

			var startValue = this.getInternal(this.startValue);
			if (startValue == null)
			{
				try
				{
					startValue = getter.call(target);
				}
				catch (e)
				{
					return false;
				}
			}

			var interpolator = this.getInternal(this.interpolator);
			if (!interpolator)
				interpolator = _DEFAULT_INTERPOLATOR;

			this._runningTarget = target;
			this._runningGetter = getter;
			this._runningSetter = setter;
			this._runningStartValue = startValue;
			this._runningEndValue = endValue;
			this._runningInterpolator = interpolator;

			var runningSetters = _runningTargets.get(target);
			if (!runningSetters)
				runningSetters = _runningTargets.set(target, new Dictionary());

			var runningTween = runningSetters.get(setter);
			runningSetters.set(setter, this);

			if (runningTween)
				runningTween.endTween();

			return true;
		};

		this.endTweenOverride = function()
		{
			var target = this._runningTarget;
			var setter = this._runningSetter;

			this._runningTarget = null;
			this._runningGetter = null;
			this._runningSetter = null;
			this._runningStartValue = null;
			this._runningEndValue = null;
			this._runningInterpolator = null;

			var runningSetters = _runningTargets.get(target);
			if (runningSetters.get(setter) !== this)
				return;

			runningSetters.del(setter);

			if (runningSetters.size() > 0)
				return;

			_runningTargets.del(target);
		};

		this.updateTweenOverride = function(position)
		{
			var value = this._runningInterpolator.interpolate(this._runningStartValue, this._runningEndValue, position);

			try
			{
				this._runningSetter.call(this._runningTarget, value);
			}
			catch (e)
			{
				return false;
			}

			return true;
		};

	});

});
});

jg_import.define("jgatt.motion.PropertyTween", function()
{
jg_namespace("jgatt.motion", function()
{

	var Tween = jg_import("jgatt.motion.Tween");
	var Interpolator = jg_import("jgatt.motion.interpolators.Interpolator");
	var NumberInterpolator = jg_import("jgatt.motion.interpolators.NumberInterpolator");
	var MPropertyTarget = jg_import("jgatt.properties.MPropertyTarget");
	var Property = jg_import("jgatt.properties.Property");
	var Dictionary = jg_import("jgatt.utils.Dictionary");

	this.PropertyTween = jg_extend(Tween, function(PropertyTween, base)
	{

		// Private Static Constants

		var _DEFAULT_INTERPOLATOR = new NumberInterpolator();

		// Private Static Properties

		var _runningTargets = new Dictionary();

		// Public Properties

		this.target = new Property("target", Object, null)
			.writeFilter(function(value)
			{
				if ((value != null) && !jg_has_mixin(value, MPropertyTarget))
					throw new Error("Parameter target must have the mixin jgatt.properties.MPropertyTarget.");
				return value;
			})
			.onWrite(function()
			{
				this.endTween();
			});

		this.property = new Property("property", Object, null)
			.writeFilter(function(value)
			{
				if ((value != null) && (typeof value !== "string") && !(value instanceof Property))
					throw new Error("Parameter property must be a string or an instance of jgatt.properties.Property.");
				return value;
			})
			.onWrite(function()
			{
				this.endTween();
			});

		this.startValue = new Property("startValue", Object, null)
			.onWrite(function()
			{
				this.endTween();
			});

		this.endValue = new Property("endValue", Object, null)
			.onWrite(function()
			{
				this.endTween();
			});

		this.interpolator = new Property("interpolator", Interpolator, null)
			.onWrite(function()
			{
				this.endTween();
			});

		// Private Properties

		this._runningTarget = null;
		this._runningProperty = null;
		this._runningStartValue = null;
		this._runningEndValue = null;
		this._runningInterpolator= null;

		// Constructor

		this.constructor = function(target, property, startValue, endValue, easer, interpolator)
		{
			base.constructor.call(this, easer);

			if (target != null)
				this.set(this.target, target);
			if (property != null)
				this.set(this.property, property);
			if (startValue != null)
				this.set(this.startValue, startValue);
			if (endValue != null)
				this.set(this.endValue, endValue);
			if (interpolator != null)
				this.set(this.interpolator, interpolator);
		};

		// Protected Methods

		this.beginTweenOverride = function()
		{
			var target = this.getInternal(this.target);
			if (target == null)
				return false;

			var property = this.getInternal(this.property);
			if (property == null)
				return false;

			if (typeof property === "string")
			{
				property = target[property];
				if (!(property instanceof Property))
					return false;
			}

			var endValue = this.getInternal(this.endValue);
			if (endValue == null)
				return false;

			var startValue = this.getInternal(this.startValue);
			if (startValue == null)
			{
				try
				{
					startValue = target.get(property);
				}
				catch (e)
				{
					return false;
				}
			}

			var interpolator = this.getInternal(this.interpolator);
			if (!interpolator)
				interpolator = _DEFAULT_INTERPOLATOR;

			this._runningTarget = target;
			this._runningProperty = property;
			this._runningStartValue = startValue;
			this._runningEndValue = endValue;
			this._runningInterpolator = interpolator;

			var runningProperties = _runningTargets.get(target);
			if (!runningProperties)
				runningProperties = _runningTargets.set(target, new Dictionary());

			var runningTween = runningProperties.get(property);
			runningProperties.set(property, this);

			if (runningTween)
				runningTween.endTween();

			return true;
		};

		this.endTweenOverride = function()
		{
			var target = this._runningTarget;
			var property = this._runningProperty;

			this._runningTarget = null;
			this._runningProperty = null;
			this._runningStartValue = null;
			this._runningEndValue = null;
			this._runningInterpolator = null;

			var runningProperties = _runningTargets.get(target);
			if (runningProperties.get(property) !== this)
				return;

			runningProperties.del(property);

			if (runningProperties.size() > 0)
				return;

			_runningTargets.del(target);
		};

		this.updateTweenOverride = function(position)
		{
			var value = this._runningInterpolator.interpolate(this._runningStartValue, this._runningEndValue, position);

			try
			{
				this._runningTarget.set(this._runningProperty, value);
			}
			catch (e)
			{
				return false;
			}

			return true;
		};

	});

});
});

jg_import.define("jgatt.motion.TweenRunner", function()
{
jg_namespace("jgatt.motion", function()
{

	var Tween = jg_import("jgatt.motion.Tween");
	var Dictionary = jg_import("jgatt.utils.Dictionary");

	this.TweenRunner = jg_static(function(TweenRunner)
	{

		// Private Static Properties

		var _tweenRunInfo = new Dictionary();
		var _tweenInterval = 0;
		var _tweenTime = 0;

		// Private Static Methods

		var _tweenStep = function()
		{
			var tweenTime = (new Date()).getTime() / 1000;

			var time = tweenTime - _tweenTime;
			if (time < 0)
				time = 0;
			else if (time > 0.1)
				time = 0.1;
			_tweenTime = tweenTime;

			var runInfos = _tweenRunInfo.values();
			var runInfo;
			var position;
			for (var i = 0, l = runInfos.length; i < l; i++)
			{
				runInfo = runInfos[i];

				runInfo.time += time;

				position = runInfo.time / runInfo.duration;
				if (position > 1)
					position = 1;

				if (!runInfo.tween.updateTween(position))
					position = 1;

				if (position == 1)
					TweenRunner.stop(runInfo.tween);
			}
		};

		// Public Static Methods

		TweenRunner.start = function(tween, duration)
		{
			if (tween == null)
				throw new Error("Parameter tween must be non-null.");
			if (!(tween instanceof Tween))
				throw new Error("Parameter tween must be an instance of jgatt.motion.Tween.");

			TweenRunner.stop(tween);

			if (!tween.beginTween())
				return false;

			if (!tween.updateTween(0))
			{
				tween.endTween();
			}
			else if (duration > 0)
			{
				var runInfo = _tweenRunInfo.set(tween, { tween: tween, duration: duration, time: 0 });
				if (_tweenRunInfo.size() == 1)
				{
					_tweenInterval = setInterval(_tweenStep, 1000 / 30);
					_tweenTime = (new Date()).getTime() / 1000;
				}
			}
			else
			{
				tween.updateTween(1);
				tween.endTween();
			}

			return true;
		};

		TweenRunner.stop = function(tween)
		{
			if (tween == null)
				throw new Error("Parameter tween must be non-null.");
			if (!(tween instanceof Tween))
				throw new Error("Parameter tween must be an instance of jgatt.motion.Tween.");

			var runInfo = _tweenRunInfo.get(tween);
			if (!runInfo)
				return false;

			_tweenRunInfo.del(tween);

			if (_tweenRunInfo.size() == 0)
				clearInterval(_tweenInterval);

			tween.endTween();

			return true;
		};

	});

});
});

jg_import.define("jgatt.motion.easers.CubicEaser", function()
{
jg_namespace("jgatt.motion.easers", function()
{

	var Easer = jg_import("jgatt.motion.easers.Easer");

	this.CubicEaser = jg_extend(Easer, function(CubicEaser, base)
	{

		// Constructor

		this.constructor = function(direction)
		{
			base.constructor.call(this, direction);
		};

		// Protected Methods

		this.easeOverride = function(position)
		{
			return position * position * position;
		};

	});

});
});

jg_import.define("jgatt.motion.easers.EaseDirection", function()
{
jg_namespace("jgatt.motion.easers", function()
{

	this.EaseDirection = jg_static(function(EaseDirection)
	{

		// Public Static Constants

		EaseDirection.IN = 1;
		EaseDirection.OUT = -1;
		EaseDirection.IN_OUT = 0;

	});

});
});

jg_import.define("jgatt.utils.Comparator", function()
{
jg_namespace("jgatt.utils", function()
{

	this.Comparator = jg_extend(Object, function(Comparator, base)
	{

		// Public Methods

		this.compare = function(value1, value2)
		{
			return 0;
		};

	});

});
});

jg_import.define("jgatt.utils.AlphabeticComparator", function()
{
jg_namespace("jgatt.utils", function()
{

	var Comparator = jg_import("jgatt.utils.Comparator");

	this.AlphabeticComparator = jg_extend(Comparator, function(AlphabeticComparator, base)
	{

		// Public Methods

		this.compare = function(value1, value2)
		{
			var str1 = String(value1).toLowerCase();
			var str2 = String(value2).toLowerCase();
			if (str1 < str2)
				return -1;
			if (str1 > str2)
				return 1;
			return 0;
		};

	});

});
});

jg_import.define("jgatt.utils.NaturalComparator", function()
{
jg_namespace("jgatt.utils", function()
{

	var Comparator = jg_import("jgatt.utils.Comparator");

	this.NaturalComparator = jg_extend(Comparator, function(NaturalComparator, base)
	{

		// Public Methods

		this.compare = function(value1, value2)
		{
			if (value1 < value2)
				return -1;
			if (value1 > value2)
				return 1;
			return 0;
		};

	});

});
});

jg_import.define("jgatt.utils.ArrayUtils", function()
{
jg_namespace("jgatt.utils", function()
{

	var Comparator = jg_import("jgatt.utils.Comparator");
	var NaturalComparator = jg_import("jgatt.utils.NaturalComparator");

	this.ArrayUtils = jg_static(function(ArrayUtils)
	{

		// Private Static Constants

		var _NATURAL_COMPARATOR = new NaturalComparator();

		// Public Static Methods

		ArrayUtils.indexOf = function(a, value)
		{
			if (a == null)
				throw new Error("Parameter a must be non-null.");
			if (!(a instanceof Array))
				throw new Error("Parameter a must be an array.");

			for (var i = 0, l = a.length; i < l; i++)
			{
				if (a[i] === value)
					return i;
			}

			return -1;
		};

		ArrayUtils.lastIndexOf = function(a, value)
		{
			if (a == null)
				throw new Error("Parameter a must be non-null.");
			if (!(a instanceof Array))
				throw new Error("Parameter a must be an array.");

			for (var i = a.length - 1; i >= 0; i--)
			{
				if (a[i] === value)
					return i;
			}

			return -1;
		};

		ArrayUtils.sort = function(a, comparator)
		{
			if (a == null)
				throw new Error("Parameter a must be non-null.");
			if (!(a instanceof Array))
				throw new Error("Parameter a must be an array.");
			if ((comparator != null) && !(comparator instanceof Comparator))
				throw new Error("Parameter comparator must be an instance of jgatt.utils.Comparator.");

			if (!comparator)
				comparator = _NATURAL_COMPARATOR;

			// use delegate so comparator has scope
			var compare = function(value1, value2)
			{
				return comparator.compare(value1, value2);
			};

			a.sort(compare);
		};

		ArrayUtils.binarySearch = function(a, value, comparator)
		{
			if (a == null)
				throw new Error("Parameter a must be non-null.");
			if (!(a instanceof Array))
				throw new Error("Parameter a must be an array.");
			if ((comparator != null) && !(comparator instanceof Comparator))
				throw new Error("Parameter comparator must be an instance of jgatt.utils.Comparator.");

			var high = a.length - 1;
			if (high < 0)
				return -1;

			if (!comparator)
				comparator = _NATURAL_COMPARATOR;

			var low = 0;
			var mid;
			var comp;

			while (low <= high)
			{
				mid = low + Math.floor((high - low) / 2);
				comp = comparator.compare(value, a[mid]);
				if (comp < 0)
					high = mid - 1;
				else if (comp > 0)
					low = mid + 1;
				else
					return mid;
			}

			return -low - 1;
		};

	});

});
});

jg_import.define("jgatt.utils.FunctionComparator", function()
{
jg_namespace("jgatt.utils", function()
{

	var Comparator = jg_import("jgatt.utils.Comparator");

	this.FunctionComparator = jg_extend(Comparator, function(FunctionComparator, base)
	{

		// Private Properties

		this._f = null;

		// Constructor

		this.constructor = function(f)
		{
			if (f == null)
				throw new Error("Parameter f must be non-null.");
			if (typeof f !== "function")
				throw new Error("Parameter f must be a function.");

			this._f = f;
		};

		// Public Methods

		this.compare = function(value1, value2)
		{
			return this._f(value1, value2);
		};

	});

});
});

jg_import.define("jgatt.utils.GroupComparator", function()
{
jg_namespace("jgatt.utils", function()
{

	var Comparator = jg_import("jgatt.utils.Comparator");

	this.GroupComparator = jg_extend(Comparator, function(GroupComparator, base)
	{

		// Private Properties

		this._comparators = null;

		// Constructor

		this.constructor = function(comparators)
		{
			if (comparators == null)
				throw new Error("Parameter comparators must be non-null.");
			if (!(comparators instanceof Array))
				throw new Error("Parameter comparators must be an array.");

			var comparatorsCopy = [];
			var comparator;
			for (var i = 0, l = comparators.length; i < l; i++)
			{
				comparator = comparators[i];
				if (comparator != null)
				{
					if (!(comparator instanceof Comparator))
						throw new Error("Parameter comparators must be an array containing only instances of jgatt.utils.Comparator.");
					comparatorsCopy.push(comparator);
				}
			}

			this._comparators = comparatorsCopy;
		};

		// Public Methods

		this.compare = function(value1, value2)
		{
			var comparators = this._comparators;
			var comparator;
			var result;
			for (var i = 0, l = comparators.length; i < l; i++)
			{
				comparator = comparators[i];
				result = comparator.compare(value1, value2);
				if (result != 0)
					return result;
			}
			return 0;
		};

	});

});
});

jg_import.define("jgatt.utils.NumericComparator", function()
{
jg_namespace("jgatt.utils", function()
{

	var Comparator = jg_import("jgatt.utils.Comparator");
	var NumberUtils = jg_import("jgatt.utils.NumberUtils");

	this.NumericComparator = jg_extend(Comparator, function(NumericComparator, base)
	{

		// Public Methods

		this.compare = function(value1, value2)
		{
			var num1 = NumberUtils.parseNumber(value1);
			var num2 = NumberUtils.parseNumber(value2);
			if (num1 < num2)
				return -1;
			if (num1 > num2)
				return 1;
			return 0;
		};

	});

});
});

jg_import.define("jgatt.utils.PropertyComparator", function()
{
jg_namespace("jgatt.utils", function()
{

	var MPropertyTarget = jg_import("jgatt.properties.MPropertyTarget");
	var Property = jg_import("jgatt.properties.Property");
	var Comparator = jg_import("jgatt.utils.Comparator");
	var NaturalComparator = jg_import("jgatt.utils.NaturalComparator");

	this.PropertyComparator = jg_extend(Comparator, function(PropertyComparator, base)
	{

		// Private Static Methods

		var _getValue = function(target, property)
		{
			if (target == null)
				return undefined;

			if (typeof property === "string")
			{
				var value = target[property];
				if (value instanceof Property)
					property = value;
				else
					return value;
			}

			if (jg_has_mixin(target, MPropertyTarget))
				return target.get(property);

			return undefined;
		};

		// Private Properties

		this._property = null;
		this._comparator = null;

		// Constructor

		this.constructor = function(property, comparator)
		{
			if (property == null)
				throw new Error("Parameter property must be non-null.");
			if ((typeof property !== "string") && !(property instanceof Property))
				throw new Error("Parameter property must be a string or an instance of jgatt.properties.Property.");
			if ((comparator != null) && !(comparator instanceof Comparator))
				throw new Error("Parameter comparator must be an instance of jgatt.utils.Comparator.");

			this._property = property;
			this._comparator = comparator || new NaturalComparator();
		};

		// Public Methods

		this.compare = function(value1, value2)
		{
			var property = this._property;
			value1 = _getValue(value1, property);
			value2 = _getValue(value2, property);
			return this._comparator.compare(value1, value2);
		};

	});

});
});

jg_import.define("jgatt.utils.ReverseComparator", function()
{
jg_namespace("jgatt.utils", function()
{

	var Comparator = jg_import("jgatt.utils.Comparator");
	var NaturalComparator = jg_import("jgatt.utils.NaturalComparator");

	this.ReverseComparator = jg_extend(Comparator, function(ReverseComparator, base)
	{

		// Private Properties

		this._comparator = null;

		// Constructor

		this.constructor = function(comparator)
		{
			if ((comparator != null) && !(comparator instanceof Comparator))
				throw new Error("Parameter comparator must be an instance of jgatt.utils.Comparator.");

			this._comparator = comparator || new NaturalComparator();
		};

		// Public Methods

		this.compare = function(value1, value2)
		{
			return -this._comparator.compare(value1, value2);
		};

	});

});
});

jg_import.define("jgatt.utils.SequentialNumericComparator", function()
{
jg_namespace("jgatt.utils", function()
{

	var Comparator = jg_import("jgatt.utils.Comparator");

	this.SequentialNumericComparator = jg_extend(Comparator, function(SequentialNumericComparator, base)
	{

		// Private Static Constants

		var _NUMERIC_PATTERN = /\d+/g;

		// Public Methods

		this.compare = function(value1, value2)
		{
			var str1 = String(value1);
			var str2 = String(value2);
			var arr1 = str1.match(_NUMERIC_PATTERN);
			var arr2 = str2.match(_NUMERIC_PATTERN);
			var len1 = arr1.length;
			var len2 = arr2.length;
			var len = (len1 < len2) ? len1 : len2;
			var num1;
			var num2;
			for (var i = 0; i < len; i++)
			{
				num1 = Number(arr1[i]);
				num2 = Number(arr2[i]);
				if (num1 < num2)
					return -1;
				if (num1 > num2)
					return 1;
			}
			if (len1 < len2)
				return -1;
			if (len1 > len2)
				return 1;
			return 0;
		};

	});

});
});

jg_import.define("jgatt.utils.StringUtils", function()
{
jg_namespace("jgatt.utils", function()
{

	this.StringUtils = jg_static(function(StringUtils)
	{

		// Public Static Methods

		StringUtils.escapeHTML = function(str)
		{
			if (str == null)
				return str;

			str = String(str);

			return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
		};

	});

});
});

jg_import.define("jgatt.validation.ValidateEventData", function()
{
jg_namespace("jgatt.validation", function()
{

	var EventData = jg_import("jgatt.events.EventData");

	this.ValidateEventData = jg_extend(EventData, function(ValidateEventData, base)
	{

		// Private Properties

		this.pass = null;

		// Constructor

		this.constructor = function(pass)
		{
			this.pass = pass;
		};

	});

});
});

jg_import.define("jgatt.validation.ValidatePass", function()
{
jg_namespace("jgatt.validation", function(ns)
{

	var ChainedEvent = jg_import("jgatt.events.ChainedEvent");
	var Event = jg_import("jgatt.events.Event");
	var Comparator = jg_import("jgatt.utils.Comparator");
	var ValidateEventData = jg_import("jgatt.validation.ValidateEventData");

	this.ValidatePass = jg_extend(Object, function(ValidatePass, base)
	{

		// Public Events

		this.invalidated = null;
		this.validated = null;

		// Private Properties

		this._methodName = null;
		this._priority = 0;
		this._targetComparator = null;

		// Constructor

		this.constructor = function(methodName, priority, targetComparator)
		{
			if (methodName == null)
				throw new Error("Parameter methodName must be non-null.");
			if (typeof methodName !== "string")
				throw new Error("Parameter methodName must be a string.");
			if (priority == null)
				throw new Error("Parameter priority must be non-null.");
			if (typeof priority !== "number")
				throw new Error("Parameter priority must be a number.");
			if (isNaN(priority))
				throw new Error("Parameter priority must be a valid number.");
			if ((targetComparator != null) && !(targetComparator instanceof Comparator))
				throw new Error("Parameter targetComparator must be an instance of jgatt.utils.Comparator.");

			this._methodName = methodName;
			this._priority = priority;
			this._targetComparator = targetComparator ? targetComparator : null;

			this.invalidated = ns.MValidateTarget ? new ChainedEvent("invalidated", ns.MValidateTarget.invalidated) : new Event("invalidated", ValidateEventData);
			this.validated = ns.MValidateTarget ? new ChainedEvent("validated", ns.MValidateTarget.validated) : new Event("validated", ValidateEventData);
		};

		// Public Getters/Setters

		this.methodName = function()
		{
			return this._methodName;
		};

		this.priority = function()
		{
			return this._priority;
		};

		this.targetComparator = function()
		{
			return this._targetComparator;
		};

	});

});
});

jg_import.define("jgatt.validation.ValidateQueue", function()
{
jg_namespace("jgatt.validation", function()
{

	var ArrayUtils = jg_import("jgatt.utils.ArrayUtils");
	var Dictionary = jg_import("jgatt.utils.Dictionary");
	var ErrorUtils = jg_import("jgatt.utils.ErrorUtils");

	this.ValidateQueue = jg_static(function(ValidateQueue)
	{

		// Private Static Properties

		var _passesMap = new Dictionary();
		var _passesList = [];
		var _validateInterval = 0;
		var _validateIndex = -1;
		var _isValidating = false;

		// Public Static Methods

		ValidateQueue.enqueue = function(target, pass)
		{
			var targetsMap = _passesMap.get(pass);
			if (!targetsMap)
			{
				targetsMap = _passesMap.set(pass, new Dictionary());

				var passPriority = pass.priority();
				var passAdded = false;
				var pass2;
				for (var i = 0, l = _passesList.length; i < l; i++)
				{
					pass2 = _passesList[i];
					if (passPriority < pass2.priority())
					{
						_passesList.splice(i, 0, pass);
						if (i <= _validateIndex)
							_validateIndex++;
						passAdded = true;
						break;
					}
				}
				if (!passAdded)
					_passesList.push(pass);

				if (!_validateInterval)
					_validateInterval = setInterval(ValidateQueue.validateAll, 1);
			}

			targetsMap.set(target, true);
		};

		ValidateQueue.dequeue = function(target, pass)
		{
			var targetsMap = _passesMap.get(pass);
			if (!targetsMap)
				return;

			targetsMap.del(target);
		};

		ValidateQueue.contains = function(target, pass)
		{
			var targetsMap = _passesMap.get(pass);
			if (!targetsMap)
				return false;

			return targetsMap.has(target);
		};

		ValidateQueue.validateAll = function()
		{
			if (_isValidating)
				return false;

			try
			{
				_isValidating = true;

				var targetsMap;
				var targetsList;
				var target;
				var targetComparator;
				var pass;
				var i;
				var l;

				// validate passes
				for (_validateIndex = 0; _validateIndex < _passesList.length; _validateIndex++)
				{
					pass = _passesList[_validateIndex];
					targetsMap = _passesMap.get(pass);
					targetsList = targetsMap.keys();

					targetComparator = pass.targetComparator();
					if (targetComparator)
						ArrayUtils.sort(targetsList, targetComparator);

					for (i = 0, l = targetsList.length; i < l; i++)
					{
						try
						{
							targetsList[i].validate(pass);
						}
						catch (e)
						{
							ErrorUtils.asyncThrow(e);
						}
					}
				}
				_validateIndex = -1;

				// dequeue passes that contain no targets
				for (i = _passesList.length - 1; i >= 0; i--)
				{
					pass = _passesList[i];
					targetsMap = _passesMap.get(pass);
					if (!targetsMap || (targetsMap.size() == 0))
					{
						_passesMap.del(pass);
						_passesList.splice(i, 1);
					}
				}

				// stop validating if no passes are enqueued
				if (_passesList.length == 0)
				{
					clearInterval(_validateInterval);
					_validateInterval = 0;
				}
			}
			catch (e)
			{
				clearInterval(_validateInterval);
				_validateInterval = 0;
				throw e;
			}
			finally
			{
				_isValidating = false;
			}

			return true;
		};

		ValidateQueue.isValidating = function()
		{
			return _isValidating;
		};

	});

});
});

jg_import.define("jgatt.validation.MValidateTarget", function()
{
jg_namespace("jgatt.validation", function()
{

	var Event = jg_import("jgatt.events.Event");
	var MEventTarget = jg_import("jgatt.events.MEventTarget");
	var Dictionary = jg_import("jgatt.utils.Dictionary");
	var ErrorUtils = jg_import("jgatt.utils.ErrorUtils");
	var ValidateEventData = jg_import("jgatt.validation.ValidateEventData");
	var ValidatePass = jg_import("jgatt.validation.ValidatePass");
	var ValidateQueue = jg_import("jgatt.validation.ValidateQueue");

	this.MValidateTarget = jg_static(function(MValidateTarget)
	{

		// Mixin

		this.mixin = function(base)
		{
			base = jg_mixin(this, MEventTarget, base);
		};

		// Private Static Methods

		var _resolvePass = function(target, pass)
		{
			if (pass == null)
				throw new Error("Parameter pass must be non-null.");

			if (pass instanceof ValidatePass)
				return pass;

			if (typeof pass !== "string")
				throw new Error("Parameter pass must be a string or an instance of jgatt.validation.ValidatePass.");

			var targetPass = target[pass];
			if (!(targetPass instanceof ValidatePass))
				throw new Error("Unknown pass \"" + pass + "\".");

			return targetPass;
		};

		var _passComparator = function(pass1, pass2)
		{
			var priority1 = pass1.priority();
			var priority2 = pass2.priority();
			if (priority1 < priority2)
				return -1;
			if (priority1 > priority2)
				return 1;
			return 0;
		};

		var _batchValidate = function(target, endPass)
		{
			if (target._batchValidateList)
				return false;

			var invalidPasses = target._invalidPasses;
			if (invalidPasses.size() == 0)
				return false;

			var result = false;

			try
			{
				target._batchValidateEndPass = endPass;

				var passesList = target._batchValidateList = invalidPasses.keys();
				var pass;
				var i;

				// remove passes with priorities greater than or equal to endPass priority
				if (endPass)
				{
					var endPassPriority = endPass.priority();
					for (i = passesList.length - 1; i >= 0; i--)
					{
						pass = passesList[i];
						if (pass.priority() >= endPassPriority)
							passesList.splice(i, 1);
					}
				}

				// sort passes by priority
				passesList.sort(_passComparator);

				// validate passes
				i = target._batchValidateIndex = 0;
				while (i < passesList.length)
				{
					pass = passesList[i];
					if (invalidPasses.has(pass))
					{
						try
						{
							result = target.validate(pass) || result;
						}
						catch (e)
						{
							ErrorUtils.asyncThrow(e);
						}
					}
					i = ++target._batchValidateIndex;
				}
			}
			finally
			{
				target._batchValidateList = null;
				target._batchValidateIndex = -1;
				target._batchValidateEndPass = null;
			}

			return result;
		};

		// Public Events

		this.invalidated = new Event("invalidated", ValidateEventData);
		this.validated = new Event("validated", ValidateEventData);

		// Private Properties

		this._invalidPasses = null;
		this._validatingPasses = null;
		this._batchValidateList = null;
		this._batchValidateIndex = -1;
		this._batchValidateEndPass = null;

		// Constructor

		this.constructor = function()
		{
			this._invalidPasses = new Dictionary();
			this._validatingPasses = new Dictionary();
		};

		// Public Methods

		this.invalidate = function(pass)
		{
			pass = _resolvePass(this, pass);

			if (this._invalidPasses.has(pass))
				return false;

			if (this._batchValidateList)
			{
				var passPriority = pass.priority();
				var pass2 = this._batchValidateEndPass;
				if (!pass2 || (passPriority < pass2.priority()))
				{
					var passesList = this._batchValidateList;
					var validateIndex = this._batchValidateIndex;
					var needsAppend = true;
					for (var i = validateIndex, l = passesList.length; i < l; i++)
					{
						pass2 = passesList[i];
						if (passPriority < pass2.priority())
						{
							if (i > validateIndex)
								passesList.splice(i, 0, pass);
							needsAppend = false;
							break;
						}
					}
					if (needsAppend)
						passesList.push(pass);
				}
			}

			this._invalidPasses.set(pass, true);
			ValidateQueue.enqueue(this, pass);
			this.dispatchEvent(pass.invalidated, new ValidateEventData(pass));

			return true;
		};

		this.validate = function(pass)
		{
			if (pass == null)
				return _batchValidate(this);

			pass = _resolvePass(this, pass);

			if (this._validatingPasses.has(pass))
				return false;

			this.validatePreceding(pass);

			if (!this._invalidPasses.has(pass))
				return false;

			this._validatingPasses.set(pass, true);

			var result = false;
			try
			{
				var methodName = pass.methodName();
				var method = this[methodName];
				if (typeof method !== "function")
					throw new Error("Unknown method \"" + methodName + "\".");

				method.call(this);
				result = true;
			}
			catch (e)
			{
				ErrorUtils.asyncThrow(e);
			}

			this.setValid(pass);

			return result;
		};

		this.validatePreceding = function(pass)
		{
			pass = _resolvePass(this, pass);

			if (ValidateQueue.isValidating() || this._batchValidateList)
				return false;

			return _batchValidate(this, pass);
		};

		this.setValid = function(pass)
		{
			if (pass == null)
			{
				var passesList = this._invalidPasses.keys();
				passesList.sort(_passComparator);

				var result = false;
				for (var i = 0, l = passesList.length; i < l; i++)
				{
					pass = passesList[i];
					if (invalidPasses.has(pass))
						result = this.setValid(pass) || result;
				}
				return result;
			}

			pass = _resolvePass(this, pass);

			if (!this._invalidPasses.has(pass))
				return false;

			this._invalidPasses.del(pass);
			this._validatingPasses.del(pass);
			ValidateQueue.dequeue(this, pass);
			this.dispatchEvent(pass.validated, new ValidateEventData(pass));

			return true;
		};

		this.isValid = function(pass)
		{
			if (pass == null)
				return (this._invalidPasses.size() == 0);

			pass = _resolvePass(this, pass);

			return !this._invalidPasses.has(pass);
		};

	});

});
});
