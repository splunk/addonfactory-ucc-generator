/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Interpolator = require("./Interpolator");
	var Class = require("../Class");
	var NumberUtil = require("../utils/NumberUtil");

	return Class(module.id, Interpolator, function(NumberInterpolator, base)
	{

		// Private Properties

		this._roundTo = 0;

		// Constructor

		this.constructor = function(roundTo)
		{
			if (roundTo != null)
				this.roundTo(roundTo);
		};

		// Public Accessor Methods

		this.roundTo = function(value)
		{
			if (!arguments.length)
				return this._roundTo;

			if ((value != null) && !Class.isNumber(value))
				throw new Error("Parameter roundTo must be of type Number.");

			this._roundTo = ((value != null) && (value > 0) && (value < Infinity)) ? value : 0;

			return this;
		};

		// Public Methods

		this.interpolate = function(value1, value2, ratio)
		{
			var num = NumberUtil.interpolate(value1, value2, ratio);

			var roundTo = this._roundTo;
			if (roundTo > 0)
				num = NumberUtil.roundTo(num, roundTo);

			return num;
		};

	});

});
