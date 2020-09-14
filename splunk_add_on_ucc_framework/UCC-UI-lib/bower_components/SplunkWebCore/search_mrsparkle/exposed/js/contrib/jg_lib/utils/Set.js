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

	return Class(module.id, Object, function(Set, base)
	{

		// Private Properties

		this._entries = null;
		this._size = 0;

		// Constructor

		this.constructor = function(entries)
		{
			this._entries = {};

			if (entries != null)
			{
				for (var i = 0, l = entries.length; i < l; i++)
					this.add(entries[i]);
			}
		};

		// Public Methods

		this.add = function(key)
		{
			var uid = UID.get(key);
			if (this._entries.hasOwnProperty(uid))
				return this;

			this._entries[uid] = key;
			this._size++;
			return this;
		};

		this.del = function(key)
		{
			var uid = UID.get(key, false);
			if (!uid || !this._entries.hasOwnProperty(uid))
				return this;

			delete this._entries[uid];
			this._size--;
			return this;
		};

		this.has = function(key)
		{
			var uid = UID.get(key, false);
			if (!uid || !this._entries.hasOwnProperty(uid))
				return false;

			return true;
		};

		this.size = function()
		{
			return this._size;
		};

		this.clear = function()
		{
			if (this._size === 0)
				return this;

			this._entries = {};
			this._size = 0;
			return this;
		};

		this.keys = function()
		{
			var keys = [];
			var entries = this._entries;
			for (var uid in entries)
			{
				if (entries.hasOwnProperty(uid))
					keys.push(entries[uid]);
			}
			return keys;
		};

		this.values = function()
		{
			return this.keys();
		};

		this.entries = function()
		{
			return this.keys();
		};

	});

});
