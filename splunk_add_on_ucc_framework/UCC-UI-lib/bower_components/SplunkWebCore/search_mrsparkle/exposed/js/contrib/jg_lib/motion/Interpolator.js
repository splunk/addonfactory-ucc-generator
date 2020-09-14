/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Class = require("../Class");

	return Class(module.id, Object, function(Interpolator, base)
	{

		// Constructor

		this.constructor = function()
		{
			// noop
		};

		// Public Methods

		this.interpolate = function(value1, value2, ratio)
		{
			throw new Error("Must implement method interpolate.");
		};

	});

});
