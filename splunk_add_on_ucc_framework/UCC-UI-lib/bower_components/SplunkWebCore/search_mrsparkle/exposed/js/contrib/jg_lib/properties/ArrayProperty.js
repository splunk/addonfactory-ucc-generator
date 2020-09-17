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

	return Class(module.id, Property, function(ArrayProperty, base)
	{

		// Private Properties

		this._itemType = null;
		this._itemTypeChecker = null;
		this._itemNullValue = null;
		this._allowNull = false;
		this._itemReadFilter = null;
		this._itemWriteFilter = null;

		// Constructor

		this.constructor = function(name, itemType, defaultValue)
		{
			if ((itemType != null) && !Class.isFunction(itemType))
				throw new Error("Parameter itemType must be of type Function.");

			this._itemType = itemType || null;
			this._itemTypeChecker = itemType ? Class.getTypeChecker(itemType) : null;

			if (itemType === Number)
				this._itemNullValue = NaN;
			else if (itemType === Boolean)
				this._itemNullValue = false;
			else
				this._itemNullValue = null;

			if (defaultValue == null)
				defaultValue = [];

			// base constructor must be called after initializing _itemType so that defaultValue can be type checked
			base.constructor.call(this, name, Array, defaultValue);
		};

		// Public Accessor Methods

		this.itemType = function()
		{
			return this._itemType;
		};

		this.allowNull = function(value)
		{
			if (!arguments.length)
				return this._allowNull;

			if ((value != null) && !Class.isBoolean(value))
				throw new Error("Parameter allowNull must be of type Boolean.");

			this._allowNull = (value === true);

			return this;
		};

		this.itemReadFilter = function(value)
		{
			if (!arguments.length)
				return this._itemReadFilter;

			if ((value != null) && !Class.isFunction(value))
				throw new Error("Parameter itemReadFilter must be of type Function.");

			this._itemReadFilter = value || null;

			return this;
		};

		this.itemWriteFilter = function(value)
		{
			if (!arguments.length)
				return this._itemWriteFilter;

			if ((value != null) && !Class.isFunction(value))
				throw new Error("Parameter itemWriteFilter must be of type Function.");

			this._itemWriteFilter = value || null;

			return this;
		};

		// Public Methods

		this.get = function(target)
		{
			var value = base.get.call(this, target);

			var length = value ? value.length : 0;
			var itemNullValue = this._itemNullValue;
			var itemReadFilter = this._itemReadFilter;
			var itemValueList = [];
			var itemValue;
			var itemFilterValue;

			for (var i = 0; i < length; i++)
			{
				itemValue = value[i];

				if (itemReadFilter)
				{
					itemFilterValue = itemReadFilter.call(target, itemValue);
					if (itemFilterValue !== itemValue)
					{
						if (!this.isValidItemType(itemFilterValue))
							throw new Error("Value returned from itemReadFilter for property \"" + this.name() + "\" must be of type " + this.getItemTypeName() + ".");

						itemValue = itemFilterValue;
					}
				}

				if (itemValue == null)
					itemValue = itemNullValue;

				itemValueList.push(itemValue);
			}

			return itemValueList;
		};

		this.set = function(target, value)
		{
			var length = value ? value.length : 0;
			var allowNull = this._allowNull;
			var itemNullValue = this._itemNullValue;
			var itemWriteFilter = this._itemWriteFilter;
			var itemValueList = [];
			var itemValue;
			var itemFilterValue;

			for (var i = 0; i < length; i++)
			{
				itemValue = value[i];

				if (itemValue == null)
				{
					if (!allowNull)
						continue;

					itemValue = itemNullValue;
				}

				if (itemWriteFilter)
				{
					itemFilterValue = itemWriteFilter.call(target, itemValue);
					if (itemFilterValue !== itemValue)
					{
						if (!this.isValidItemType(itemFilterValue))
							throw new Error("Value returned from itemWriteFilter for property \"" + this.name() + "\" must be of type " + this.getItemTypeName() + ".");

						itemValue = itemFilterValue;
					}
				}

				itemValueList.push(itemValue);
			}

			base.set.call(this, target, itemValueList);
		};

		this.getTypeName = function()
		{
			return "Array<" + this.getItemTypeName() + ">";
		};

		this.getItemTypeName = function()
		{
			return this._itemType ? (Class.getName(this._itemType) || (this.name() + ".itemType")) : "*";
		};

		this.isValidType = function(value)
		{
			if (value == null)
				return true;

			if (!Class.isArray(value))
				return false;

			for (var i = 0, l = value.length; i < l; i++)
			{
				if (!this.isValidItemType(value[i]))
					return false;
			}

			return true;
		};

		this.isValidItemType = function(value)
		{
			return ((value == null) || !this._itemTypeChecker || this._itemTypeChecker(value));
		};

	});

});
