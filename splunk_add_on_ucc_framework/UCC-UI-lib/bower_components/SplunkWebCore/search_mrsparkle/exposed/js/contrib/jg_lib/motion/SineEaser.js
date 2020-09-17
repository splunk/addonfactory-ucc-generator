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
	return Class(module.id, InOutEaser, function(SineEaser, base)
	{

		// Protected Methods

		this.easeIn = function(ratio)
		{
			return 1 - Math.sin((1 - ratio) * Math.PI / 2);
		};

		this.easeOut = function(ratio)
		{
			return Math.sin(ratio * Math.PI / 2);
		};

	});

});
