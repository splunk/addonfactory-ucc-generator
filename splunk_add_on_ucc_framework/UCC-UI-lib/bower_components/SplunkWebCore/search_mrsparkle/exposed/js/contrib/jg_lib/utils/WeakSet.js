/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var UID = require("./UID");
	var Class = require("../Class");

	return Class(module.id, Object, function(WeakSet, base)
	{

		// Private Static Constants

		var _WEAK_SET_KEY = "__weakSet_" + UID.random() + "__";

		// Private Static Properties

		var _hasOwnProperty = Object.prototype.hasOwnProperty;

		// Private Properties

		this._uid = null;

		// Constructor

		this.constructor = function(entries)
		{
			this._uid = UID.get(this);

			if (entries != null)
			{
				for (var i = 0, l = entries.length; i < l; i++)
					this.add(entries[i]);
			}
		};

		// Public Methods

		this.add = function(key)
		{
			if (key == null)
				throw new Error("Parameter key must be non-null.");

			var weakSet;
			if (_hasOwnProperty.call(key, _WEAK_SET_KEY))
			{
				weakSet = key[_WEAK_SET_KEY];
			}
			else
			{
				if (!Class.isObject(key))
					throw new Error("Parameter key must be of type Object.");

				weakSet = key[_WEAK_SET_KEY] = { _entries: {}, _size: 0 };
			}

			if (weakSet._entries.hasOwnProperty(this._uid))
				return this;

			weakSet._entries[this._uid] = true;
			weakSet._size++;
			return this;
		};

		this.del = function(key)
		{
			if ((key == null) || !_hasOwnProperty.call(key, _WEAK_SET_KEY))
				return this;

			var weakSet = key[_WEAK_SET_KEY];
			if (!weakSet._entries.hasOwnProperty(this._uid))
				return this;

			delete weakSet._entries[this._uid];
			weakSet._size--;
			if (weakSet._size === 0)
				delete key[_WEAK_SET_KEY];

			return this;
		};

		this.has = function(key)
		{
			if ((key == null) || !_hasOwnProperty.call(key, _WEAK_SET_KEY))
				return false;

			var weakSet = key[_WEAK_SET_KEY];
			if (!weakSet._entries.hasOwnProperty(this._uid))
				return false;

			return true;
		};

	});

});
