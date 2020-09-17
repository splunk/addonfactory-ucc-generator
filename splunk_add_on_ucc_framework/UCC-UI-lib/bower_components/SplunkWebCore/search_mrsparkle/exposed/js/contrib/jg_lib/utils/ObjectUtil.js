/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Class = require("../Class");

	return Class(module.id, function(ObjectUtil)
	{

		// Private Static Properties

		var _hasOwnProperty = Object.prototype.hasOwnProperty;

		// Public Static Methods

		ObjectUtil.extend = function(obj, source)
		{
			var p;
			for (var i = 1, l = arguments.length; i < l; i++)
			{
				source = arguments[i];
				for (p in source)
				{
					if (_hasOwnProperty.call(source, p))
						obj[p] = source[p];
				}
			}
			return obj;
		};

		ObjectUtil.get = function(obj, key)
		{
			return _hasOwnProperty.call(obj, key) ? obj[key] : void(0);
		};

		ObjectUtil.has = function(obj, key)
		{
			return _hasOwnProperty.call(obj, key);
		};

		ObjectUtil.keys = function(obj)
		{
			var keys = [];
			for (var key in obj)
			{
				if (_hasOwnProperty.call(obj, key))
					keys.push(key);
			}
			return keys;
		};

		ObjectUtil.values = function(obj)
		{
			var values = [];
			for (var key in obj)
			{
				if (_hasOwnProperty.call(obj, key))
					values.push(obj[key]);
			}
			return values;
		};

		ObjectUtil.pairs = function(obj)
		{
			var pairs = [];
			for (var key in obj)
			{
				if (_hasOwnProperty.call(obj, key))
					pairs.push([ key, obj[key] ]);
			}
			return pairs;
		};

		ObjectUtil.isEmpty = function(obj)
		{
			for (var key in obj)
			{
				if (_hasOwnProperty.call(obj, key))
					return false;
			}
			return true;
		};

	});

});
