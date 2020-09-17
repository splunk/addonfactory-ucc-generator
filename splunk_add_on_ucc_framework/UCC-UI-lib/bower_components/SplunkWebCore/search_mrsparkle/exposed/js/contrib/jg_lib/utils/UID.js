/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Class = require("../Class");

	return Class(module.id, function(UID)
	{

		// Private Static Constants

		var _UID_KEY;  // value initialized below

		// Private Static Properties

		var _hasOwnProperty = Object.prototype.hasOwnProperty;
		var _uidCount = 0;

		// Public Static Methods

		UID.get = function(value, create)
		{
			if (value == null)
				return ("" + value);

			var type = (typeof value);
			switch (type)
			{
				case "object":
				case "function":
					if (_hasOwnProperty.call(value, _UID_KEY))
						return value[_UID_KEY];
					if (create === false)
						return null;
					return (value[_UID_KEY] = type + (++_uidCount));
				default:
					return (type + value);
			}
		};

		UID.random = function(digits, radix)
		{
			digits = (digits != null) ? +digits : 16;
			radix = (radix != null) ? +radix : 16;

			var str = "";
			for (var i = 0; i < digits; i++)
				str += Math.floor(radix * Math.random()).toString(radix);
			return str;
		};

		// Initialization

		_UID_KEY = "__uid_" + UID.random() + "__";

	});

});
