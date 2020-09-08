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
	return Class(module.id, InOutEaser, function(BackEaser, base)
	{

		// Private Properties

		this._scale = 1.70158;

		// Constructor

		this.constructor = function(easeInRatio, scale)
		{
			base.constructor.call(this, easeInRatio);

			if (scale != null)
				this.scale(scale);
		};

		// Public Accessor Methods

		this.scale = function(value)
		{
			if (!arguments.length)
				return this._scale;

			if ((value != null) && !Class.isNumber(value))
				throw new Error("Parameter scale must be of type Number.");

			this._scale = ((value != null) && (value < Infinity)) ? Math.max(value, 0) : 1.70158;

			return this;
		};

		// Protected Methods

		this.easeIn = function(ratio)
		{
			if (ratio === 1)
				return 1;

			var s = this._scale;

			return ratio * ratio * ((s + 1) * ratio - s);
		};

		this.easeOut = function(ratio)
		{
			return 1 - this.easeIn(1 - ratio);
		};

	});

});
