/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Class = require("../Class");

	return Class(module.id, Object, function(Easer, base)
	{

		// Constructor

		this.constructor = function()
		{
			// noop
		};

		// Public Methods

		this.ease = function(ratio)
		{
			throw new Error("Must implement method ease.");
		};

	});

});
