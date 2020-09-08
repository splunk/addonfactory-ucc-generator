/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Global = require("./Global");
	var Class = require("../Class");

	return Class(module.id, function(ErrorUtil)
	{

		// Public Static Methods

		ErrorUtil.nonBlockingThrow = function(err)
		{
			if (Global.console && Global.console.error)
			{
				try
				{
					Global.console.error(err);
					return;
				}
				catch (e)
				{
					// ignore console errors
				}
			}

			setTimeout(function() { throw err; }, 0);
		};

	});

});
