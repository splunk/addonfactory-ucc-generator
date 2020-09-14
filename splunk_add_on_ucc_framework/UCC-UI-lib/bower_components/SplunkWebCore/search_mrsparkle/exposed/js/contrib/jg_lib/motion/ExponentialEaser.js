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
	return Class(module.id, InOutEaser, function(ExponentialEaser, base)
	{

		// Protected Methods

		this.easeIn = function(ratio)
		{
			if (ratio === 0)
				return 0;

			return Math.pow(2, 10 * (ratio - 1));
		};

		this.easeOut = function(ratio)
		{
			if (ratio === 1)
				return 1;

			return 1 - Math.pow(2, -10 * ratio);
		};

	});

});
