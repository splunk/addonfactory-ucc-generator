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
	return Class(module.id, InOutEaser, function(ElasticEaser, base)
	{

		// Private Properties

		this._amplitude = 1.70158;
		this._period = 0.3;

		// Constructor

		this.constructor = function(easeInRatio, amplitude, period)
		{
			base.constructor.call(this, easeInRatio);

			if (amplitude != null)
				this.amplitude(amplitude);
			if (period != null)
				this.period(period);
		};

		// Public Accessor Methods

		this.amplitude = function(value)
		{
			if (!arguments.length)
				return this._amplitude;

			if ((value != null) && !Class.isNumber(value))
				throw new Error("Parameter amplitude must be of type Number.");

			this._amplitude = ((value != null) && (value < Infinity)) ? Math.max(value, 1) : 1.70158;

			return this;
		};

		this.period = function(value)
		{
			if (!arguments.length)
				return this._period;

			if ((value != null) && !Class.isNumber(value))
				throw new Error("Parameter period must be of type Number.");

			this._period = ((value != null) && (value > 0) && (value < Infinity)) ? value : 0.3;

			return this;
		};

		// Protected Methods

		this.easeIn = function(ratio)
		{
			if ((ratio === 0) || (ratio === 1))
				return ratio;

			var a = this._amplitude;
			var p = this._period;
			var s = p / (2 * Math.PI) * Math.asin(1 / a);

			ratio--;

			return -a * Math.pow(2, 10 * ratio) * Math.sin((ratio - s) * (2 * Math.PI) / p);
		};

		this.easeOut = function(ratio)
		{
			return 1 - this.easeIn(1 - ratio);
		};

	});

});
