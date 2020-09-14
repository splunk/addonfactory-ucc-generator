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

	return Class(module.id, InOutEaser, function(PowerEaser, base)
	{

		// Private Properties

		this._exponent = 2;

		// Constructor

		this.constructor = function(easeInRatio, exponent)
		{
			base.constructor.call(this, easeInRatio);

			if (exponent != null)
				this.exponent(exponent);
		};

		// Public Accessor Methods

		this.exponent = function(value)
		{
			if (!arguments.length)
				return this._exponent;

			if ((value != null) && !Class.isNumber(value))
				throw new Error("Parameter exponent must be of type Number.");

			this._exponent = ((value != null) && (value > 0) && (value < Infinity)) ? value : 2;

			return this;
		};

		// Protected Methods

		this.easeIn = function(ratio)
		{
			return Math.pow(ratio, this._exponent);
		};

		this.easeOut = function(ratio)
		{
			return 1 - Math.pow(1 - ratio, this._exponent);
		};

	});

});
