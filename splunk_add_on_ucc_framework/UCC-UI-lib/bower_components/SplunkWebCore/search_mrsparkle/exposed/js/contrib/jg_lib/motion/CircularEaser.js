/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var InOutEaser = require("./InOutEaser");
	var Class = require("../Class");

	/**
	 * Adapted from the easing functions by Robert Penner.
	 */
	return Class(module.id, InOutEaser, function(CircularEaser, base)
	{

		// Protected Methods

		this.easeIn = function(ratio)
		{
			return 1 - Math.sqrt(1 - ratio * ratio);
		};

		this.easeOut = function(ratio)
		{
			return 1 - this.easeIn(1 - ratio);
		};

	});

});
