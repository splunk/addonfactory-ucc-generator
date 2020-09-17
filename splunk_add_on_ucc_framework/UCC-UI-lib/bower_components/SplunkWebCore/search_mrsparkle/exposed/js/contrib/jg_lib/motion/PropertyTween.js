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
	var MPropertyTarget = require("../properties/MPropertyTarget");
	var Property = require("../properties/Property");

	return Class(module.id, Tween, function(PropertyTween, base)
	{

		// Private Properties

		this._target = null;
		this._property = null;

		// Constructor

		this.constructor = function(target, property, duration, easer, interpolator)
		{
			if (target == null)
				throw new Error("Parameter target must be non-null.");
			if (!target.isPropertyTarget)
				throw new Error("Parameter target must have mixin " + Class.getName(MPropertyTarget) + ".");

			property = Property.resolve(target, property);

			base.constructor.call(this, duration, easer, interpolator);

			this._target = target;
			this._property = property;
		};

		// Public Accessor Methods

		this.target = function()
		{
			return this._target;
		};

		this.property = function()
		{
			return this._property;
		};

		// Protected Methods

		this.getTweenValue = function()
		{
			return this._target.get(this._property);
		};

		this.setTweenValue = function(value)
		{
			this._target.set(this._property, value);
		};

	});

});
