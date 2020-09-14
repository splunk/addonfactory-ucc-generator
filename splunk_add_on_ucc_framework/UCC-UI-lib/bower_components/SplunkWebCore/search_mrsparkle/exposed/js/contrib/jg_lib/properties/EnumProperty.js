/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Property = require("./Property");
	var Class = require("../Class");
	var Set = require("../utils/Set");

	return Class(module.id, Property, function(EnumProperty, base)
	{

		// Private Properties

		this._valueList = null;
		this._valueSet = null;
		this._strict = false;

		// Constructor

		this.constructor = function(name, type, values, defaultValue)
		{
			if (values == null)
				throw new Error("Parameter values must be non-null.");
			if (!Class.isArray(values))
				throw new Error("Parameter values must be of type Array.");
			if (values.length < 1)
				throw new Error("Parameter values must be non-empty.");

			if (defaultValue === void(0))
				defaultValue = values[0];

			base.constructor.call(this, name, type, defaultValue);

			var valueList = [];
			var valueSet = new Set();
			var value;
			for (var i = 0, l = values.length; i < l; i++)
			{
				value = values[i];

				if (value == null)
				{
					if (type === Number)
						value = NaN;
					else if (type === Boolean)
						value = false;
					else
						value = null;
				}

				if (valueSet.has(value))
					continue;

				if (!this.isValidType(value))
					throw new Error("Parameter values must be of type Array<" + this.getTypeName() + ">.");

				valueList.push(value);
				valueSet.add(value);
			}

			this._valueList = valueList;
			this._valueSet = valueSet;

			if (!valueSet.has(this.defaultValue()))
				throw new Error("Parameter defaultValue must be one of " + this.getEnumString() + ".");
		};

		// Public Accessor Methods

		this.values = function()
		{
			return this._valueList.concat();
		};

		this.strict = function(value)
		{
			if (!arguments.length)
				return this._strict;

			if ((value != null) && !Class.isBoolean(value))
				throw new Error("Parameter strict must be of type Boolean.");

			this._strict = (value === true);

			return this;
		};

		// Public Methods

		this.setInternal = function(target, value)
		{
			if (!this._valueSet.has(value))
			{
				if (this._strict)
					throw new Error("Value assigned to property \"" + this.name() + "\" must be one of " + this.getEnumString() + ".");

				value = this.defaultValue();
			}

			return base.setInternal.call(this, target, value);
		};

		this.getEnumString = function()
		{
			var str = "";
			var valueList = this._valueList;
			var value;
			for (var i = 0, l = valueList.length; i < l; i++)
			{
				value = valueList[i];
				if (str)
					str += "|";
				str += Class.isString(value) ? ("\"" + value + "\"") : String(value);
			}
			return str;
		};

	});

});
