/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Class = require("../Class");

	return Class(module.id, Object, function(StrokeStyle, base)
	{

		// Private Properties

		this._thickness = 1;
		this._caps = "none";
		this._joints = "miter";
		this._miterLimit = 10;
		this._dashArray = null;
		this._dashOffset = 0;
		this._pixelHinting = true;

		// Constructor

		this.constructor = function(thickness, caps, joints, miterLimit)
		{
			if (thickness != null)
				this.thickness(thickness);
			if (caps != null)
				this.caps(caps);
			if (joints != null)
				this.joints(joints);
			if (miterLimit != null)
				this.miterLimit(miterLimit);
		};

		// Public Accessor Methods

		this.thickness = function(value)
		{
			if (!arguments.length)
				return this._thickness;

			value = +value;
			this._thickness = ((value > 0) && (value < Infinity)) ? value : 1;

			return this;
		};

		this.caps = function(value)
		{
			if (!arguments.length)
				return this._caps;

			this._caps = ((value === "round") || (value === "square")) ? value : "none";

			return this;
		};

		this.joints = function(value)
		{
			if (!arguments.length)
				return this._joints;

			this._joints = ((value === "round") || (value === "bevel")) ? value : "miter";

			return this;
		};

		this.miterLimit = function(value)
		{
			if (!arguments.length)
				return this._miterLimit;

			value = +value;
			this._miterLimit = ((value > 0) && (value < Infinity)) ? value : 10;

			return this;
		};

		this.dashArray = function(value)
		{
			if (!arguments.length)
				return this._dashArray ? this._dashArray.concat() : null;

			if ((value != null) && !Class.isArray(value))
				throw new Error("Parameter dashArray must be of type Array<Number>.");

			var dashCount = value ? value.length : 0;
			if (dashCount > 0)
			{
				value = value.concat();

				var dash;
				for (var i = 0; i < dashCount; i++)
				{
					dash = +value[i];
					value[i] = ((dash > 0) && (dash < Infinity)) ? dash : 1;
				}

				if ((dashCount % 2) > 0)
					value = value.concat(value);
			}

			this._dashArray = (dashCount > 0) ? value : null;

			return this;
		};

		this.dashOffset = function(value)
		{
			if (!arguments.length)
				return this._dashOffset;

			value = +value;
			this._dashOffset = ((value > -Infinity) && (value < Infinity)) ? value : 0;

			return this;
		};

		this.pixelHinting = function(value)
		{
			if (!arguments.length)
				return this._pixelHinting;

			this._pixelHinting = (value !== false);

			return this;
		};

		// Public Methods

		this.toObject = function(obj)
		{
			obj = obj || {};
			obj.thickness = this._thickness;
			obj.caps = this._caps;
			obj.joints = this._joints;
			obj.miterLimit = this._miterLimit;
			obj.dashArray = this._dashArray ? this._dashArray.concat() : null;
			obj.dashOffset = this._dashOffset;
			obj.pixelHinting = this._pixelHinting;
			return obj;
		};

	});

});
