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
	return Class(module.id, InOutEaser, function(BounceEaser, base)
	{

		// Protected Methods

		this.easeIn = function(ratio)
		{
			return 1 - this.easeOut(1 - ratio);
		};

		this.easeOut = function(ratio)
		{
			if (ratio < (1 / 2.75))
				return 7.5625 * ratio * ratio;
			else if (ratio < (2 / 2.75))
				return (7.5625 * (ratio -= (1.5 / 2.75)) * ratio + 0.75);
			else if (ratio < (2.5 / 2.75))
				return (7.5625 * (ratio -= (2.25 / 2.75)) * ratio + 0.9375);
			else
				return (7.5625 * (ratio -= (2.625 / 2.75)) * ratio + 0.984375);
		};

	});

});
