/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Tween = require("./Tween");
	var Class = require("../Class");

	return Class(module.id, Tween, function(MethodTween, base)
	{

		// Private Properties

		this._target = null;
		this._getter = null;
		this._setter = null;

		// Constructor

		this.constructor = function(target, duration, easer, interpolator)
		{
			if (target == null)
				throw new Error("Parameter target must be non-null.");

			base.constructor.call(this, duration, easer, interpolator);

			this._target = target;
		};

		// Public Accessor Methods

		this.target = function()
		{
			return this._target;
		};

		this.getter = function(value)
		{
			if (!arguments.length)
				return this._getter;

			if ((value != null) && !Class.isFunction(value))
				throw new Error("Parameter getter must be of type Function.");

			this.stop();

			this._getter = value || null;

			return this;
		};

		this.setter = function(value)
		{
			if (!arguments.length)
				return this._setter;

			if ((value != null) && !Class.isFunction(value))
				throw new Error("Parameter setter must be of type Function.");

			this.stop();

			this._setter = value || null;

			return this;
		};

		// Protected Methods

		this.getTweenValue = function()
		{
			if (!this._getter)
				throw new Error("Parameter getter must be non-null.");

			return this._getter.call(this._target);
		};

		this.setTweenValue = function(value)
		{
			if (!this._setter)
				throw new Error("Parameter setter must be non-null.");

			this._setter.call(this._target, value);
		};

	});

});
