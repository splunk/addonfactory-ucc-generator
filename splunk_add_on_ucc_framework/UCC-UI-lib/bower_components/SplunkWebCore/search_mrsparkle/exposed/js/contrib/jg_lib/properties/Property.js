/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Class = require("../Class");
	var Map = require("../utils/Map");
	var ObjectUtil = require("../utils/ObjectUtil");
	var UID = require("../utils/UID");
	var WeakMap = require("../utils/WeakMap");

	return Class(module.id, Object, function(Property, base)
	{

		// Private Static Constants

		var _DEBUG_KEY = "__DEBUG_PROPERTIES__";

		// Public Static Properties

		Property.debug = false;

		// Private Static Properties

		var _contextMaps = new WeakMap();

		// Public Static Methods

		Property.resolve = function(target, property, strict)
		{
			if (target == null)
				throw new Error("Parameter target must be non-null.");
			if (property == null)
				throw new Error("Parameter property must be non-null.");

			if (property instanceof Property)
				return property;

			if (!Class.isString(property))
				throw new Error("Parameter property must be of type String or " + Class.getName(Property) + ".");

			var propertyName = property;
			if (propertyName.indexOf(".") < 0)
			{
				property = target[propertyName];
			}
			else
			{
				var propertyPath = propertyName.split(".");
				property = target;
				for (var i = 0, l = propertyPath.length; i < l; i++)
				{
					property = property[propertyPath[i]];
					if (property == null)
						break;
				}
			}

			if ((property != null) && (property instanceof Property))
				return property;

			if (strict !== false)
				throw new Error("Unknown property \"" + propertyName + "\".");

			return null;
		};

		// Private Static Methods

		var _debug = function(context)
		{
			var target = context.target;
			var debugMap = ObjectUtil.get(target, _DEBUG_KEY);
			if (!debugMap)
				debugMap = target[_DEBUG_KEY] = {};

			var property = context.property;
			var debugPropertyKey = property.name() + " #" + UID.get(property);
			debugMap[debugPropertyKey] = context.value;
		};

		// Private Properties

		this._name = null;
		this._type = null;
		this._typeChecker = null;
		this._nullValue = null;
		this._defaultValue = null;
		this._readOnly = false;
		this._getter = null;
		this._setter = null;
		this._readFilter = null;
		this._writeFilter = null;
		this._onRead = null;
		this._onWrite = null;

		// Constructor

		this.constructor = function(name, type, defaultValue)
		{
			if (name == null)
				throw new Error("Parameter name must be non-null.");
			if (!Class.isString(name))
				throw new Error("Parameter name must be of type String.");
			if ((type != null) && !Class.isFunction(type))
				throw new Error("Parameter type must be of type Function.");

			this._name = name;
			this._type = type || null;
			this._typeChecker = type ? Class.getTypeChecker(type) : null;

			if (type === Number)
				this._nullValue = NaN;
			else if (type === Boolean)
				this._nullValue = false;
			else
				this._nullValue = null;

			if (defaultValue == null)
				defaultValue = this._nullValue;

			if (!this.isValidType(defaultValue))
				throw new Error("Parameter defaultValue must be of type " + this.getTypeName() + ".");

			this._defaultValue = defaultValue;
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

		this.defaultValue = function()
		{
			return this._defaultValue;
		};

		this.readOnly = function(value)
		{
			if (!arguments.length)
				return this._readOnly;

			if ((value != null) && !Class.isBoolean(value))
				throw new Error("Parameter readOnly must be of type Boolean.");

			this._readOnly = (value === true);

			return this;
		};

		this.getter = function(value)
		{
			if (!arguments.length)
				return this._getter;

			if ((value != null) && !Class.isFunction(value))
				throw new Error("Parameter getter must be of type Function.");

			this._getter = value || null;

			return this;
		};

		this.setter = function(value)
		{
			if (!arguments.length)
				return this._setter;

			if ((value != null) && !Class.isFunction(value))
				throw new Error("Parameter setter must be of type Function.");

			this._setter = value || null;

			return this;
		};

		this.readFilter = function(value)
		{
			if (!arguments.length)
				return this._readFilter;

			if ((value != null) && !Class.isFunction(value))
				throw new Error("Parameter readFilter must be of type Function.");

			this._readFilter = value || null;

			return this;
		};

		this.writeFilter = function(value)
		{
			if (!arguments.length)
				return this._writeFilter;

			if ((value != null) && !Class.isFunction(value))
				throw new Error("Parameter writeFilter must be of type Function.");

			this._writeFilter = value || null;

			return this;
		};

		this.onRead = function(value)
		{
			if (!arguments.length)
				return this._onRead;

			if ((value != null) && !Class.isFunction(value))
				throw new Error("Parameter onRead must be of type Function.");

			this._onRead = value || null;

			return this;
		};

		this.onWrite = function(value)
		{
			if (!arguments.length)
				return this._onWrite;

			if ((value != null) && !Class.isFunction(value))
				throw new Error("Parameter onWrite must be of type Function.");

			this._onWrite = value || null;

			return this;
		};

		// Public Methods

		this.get = function(target)
		{
			if (this._onRead)
				this._onRead.call(target);

			var value = this.getInternal(target);

			if (this._readFilter)
			{
				var filterValue = this._readFilter.call(target, value);
				if (filterValue !== value)
				{
					if (!this.isValidType(filterValue))
						throw new Error("Value returned from readFilter for property \"" + this.name() + "\" must be of type " + this.getTypeName() + ".");

					value = filterValue;
				}
			}

			if (value == null)
				value = this._nullValue;

			return value;
		};

		this.set = function(target, value)
		{
			if (value == null)
				value = this._nullValue;

			if (this._writeFilter)
			{
				var filterValue = this._writeFilter.call(target, value);
				if (filterValue !== value)
				{
					if (!this.isValidType(filterValue))
						throw new Error("Value returned from writeFilter for property \"" + this.name() + "\" must be of type " + this.getTypeName() + ".");

					value = filterValue;
				}
			}

			if (!this.setInternal(target, value))
				return;

			if (this._onWrite)
				this._onWrite.call(target);
		};

		this.getInternal = function(target)
		{
			if (this._getter)
			{
				var value = this._getter.call(target);
				if (!this.isValidType(value))
					throw new Error("Value returned from getter for property \"" + this.name() + "\" must be of type " + this.getTypeName() + ".");

				return value;
			}

			var context = this.getContext(target, false);
			if (context)
				return this.readValue(context);

			return this._defaultValue;
		};

		this.setInternal = function(target, value)
		{
			if (this._getter)
			{
				if (this._setter)
					this._setter.call(target, value);

				return true;
			}

			var context = this.getContext(target);
			if (context.isWriting)
				return false;

			try
			{
				context.isWriting = true;

				if (this.needsWrite(context, value))
				{
					if (this._setter)
						this._setter.call(target, value);

					this.writeValue(context, value);
				}
			}
			finally
			{
				context.isWriting = false;
			}

			return true;
		};

		this.getTypeName = function()
		{
			return this._type ? (Class.getName(this._type) || (this._name + ".type")) : "*";
		};

		this.isValidType = function(value)
		{
			return ((value == null) || !this._typeChecker || this._typeChecker(value));
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

				context = { target: target, property: this };
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
			context.value = this._defaultValue;
			context.isWriting = false;
		};

		this.teardownContext = function(context)
		{
			context.value = null;
		};

		this.readValue = function(context)
		{
			return context.value;
		};

		this.writeValue = function(context, value)
		{
			context.value = value;

			if (Property.debug)
				_debug(context);
		};

		this.needsWrite = function(context, value)
		{
			return true;
		};

	});

});
