/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Easer = require("./Easer");
	var Class = require("../Class");
	var NumberUtil = require("../utils/NumberUtil");

	return Class(module.id, Easer, function(InOutEaser, base)
	{

		// Private Properties

		this._easeInRatio = 0;

		// Constructor

		this.constructor = function(easeInRatio)
		{
			if (easeInRatio != null)
				this.easeInRatio(easeInRatio);
		};

		// Public Accessor Methods

		this.easeInRatio = function(value)
		{
			if (!arguments.length)
				return this._easeInRatio;

			if ((value != null) && !Class.isNumber(value))
				throw new Error("Parameter easeInRatio must be of type Number.");

			this._easeInRatio = ((value != null) && (value <= Infinity)) ? NumberUtil.minMax(value, 0, 1) : 0;

			return this;
		};

		// Public Methods

		this.ease = function(ratio)
		{
			var easeInRatio = this._easeInRatio;
			if (easeInRatio === 1)
				return this.easeIn(ratio);

			if (easeInRatio === 0)
				return this.easeOut(ratio);

			if (ratio < easeInRatio)
				return this.easeIn(ratio / easeInRatio) * easeInRatio;

			return easeInRatio + this.easeOut((ratio - easeInRatio) / (1 - easeInRatio)) * (1 - easeInRatio);
		};

		// Protected Methods

		this.easeIn = function(ratio)
		{
			throw new Error("Must implement method easeIn.");
		};

		this.easeOut = function(ratio)
		{
			throw new Error("Must implement method easeOut.");
		};

	});

});
