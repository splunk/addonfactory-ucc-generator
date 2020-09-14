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

	return Class(module.id, Object, function(Map, base)
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
					this.set(entries[i][0], entries[i][1]);
			}
		};

		// Public Methods

		this.get = function(key)
		{
			var uid = UID.get(key, false);
			if (!uid || !this._entries.hasOwnProperty(uid))
				return void(0);

			return this._entries[uid][1];
		};

		this.set = function(key, value)
		{
			var uid = UID.get(key);
			if (this._entries.hasOwnProperty(uid))
			{
				this._entries[uid][1] = value;
				return this;
			}

			this._entries[uid] = [ key, value ];
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
					keys.push(entries[uid][0]);
			}
			return keys;
		};

		this.values = function()
		{
			var values = [];
			var entries = this._entries;
			for (var uid in entries)
			{
				if (entries.hasOwnProperty(uid))
					values.push(entries[uid][1]);
			}
			return values;
		};

		this.pairs = function()
		{
			var pairs = [];
			var entries = this._entries;
			for (var uid in entries)
			{
				if (entries.hasOwnProperty(uid))
					pairs.push(entries[uid].concat());
			}
			return pairs;
		};

		this.entries = function()
		{
			return this.pairs();
		};

	});

});
