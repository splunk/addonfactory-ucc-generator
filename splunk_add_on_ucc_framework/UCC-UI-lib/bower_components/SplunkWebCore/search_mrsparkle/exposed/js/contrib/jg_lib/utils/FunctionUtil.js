/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Class = require("../Class");

	return Class(module.id, function(FunctionUtil)
	{

		// Private Static Properties

		var _slice = Array.prototype.slice;

		// Public Static Methods

		FunctionUtil.bind = function(func, scope)
		{
			if (arguments.length < 3)
				return function() { return func.apply(scope, arguments); };

			var args = _slice.call(arguments, 2);
			return function() { return func.apply(scope, args.concat(_slice.call(arguments))); };
		};

	});

});
