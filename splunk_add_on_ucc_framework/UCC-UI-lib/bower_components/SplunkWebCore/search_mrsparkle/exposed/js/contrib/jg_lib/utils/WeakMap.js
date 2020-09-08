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

	return Class(module.id, Object, function(WeakMap, base)
	{

		// Private Static Constants

		var _WEAK_MAP_KEY = "__weakMap_" + UID.random() + "__";

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
					this.set(entries[i][0], entries[i][1]);
			}
		};

		// Public Methods

		this.get = function(key)
		{
			if ((key == null) || !_hasOwnProperty.call(key, _WEAK_MAP_KEY))
				return void(0);

			var weakMap = key[_WEAK_MAP_KEY];
			if (!weakMap._entries.hasOwnProperty(this._uid))
				return void(0);

			return weakMap._entries[this._uid];
		};

		this.set = function(key, value)
		{
			if (key == null)
				throw new Error("Parameter key must be non-null.");

			var weakMap;
			if (_hasOwnProperty.call(key, _WEAK_MAP_KEY))
			{
				weakMap = key[_WEAK_MAP_KEY];
			}
			else
			{
				if (!Class.isObject(key))
					throw new Error("Parameter key must be of type Object.");

				weakMap = key[_WEAK_MAP_KEY] = { _entries: {}, _size: 0 };
			}

			if (weakMap._entries.hasOwnProperty(this._uid))
			{
				weakMap._entries[this._uid] = value;
				return this;
			}

			weakMap._entries[this._uid] = value;
			weakMap._size++;
			return this;
		};

		this.del = function(key)
		{
			if ((key == null) || !_hasOwnProperty.call(key, _WEAK_MAP_KEY))
				return this;

			var weakMap = key[_WEAK_MAP_KEY];
			if (!weakMap._entries.hasOwnProperty(this._uid))
				return this;

			delete weakMap._entries[this._uid];
			weakMap._size--;
			if (weakMap._size === 0)
				delete key[_WEAK_MAP_KEY];

			return this;
		};

		this.has = function(key)
		{
			if ((key == null) || !_hasOwnProperty.call(key, _WEAK_MAP_KEY))
				return false;

			var weakMap = key[_WEAK_MAP_KEY];
			if (!weakMap._entries.hasOwnProperty(this._uid))
				return false;

			return true;
		};

	});

});
