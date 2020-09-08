/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var ImageSource = require("./ImageSource");
	var Class = require("../Class");
	var Matrix = require("../geom/Matrix");
	var NumberUtil = require("../utils/NumberUtil");

	return Class(module.id, Object, function(Pattern, base)
	{

		// Private Properties

		this._source = null;
		this._opacity = 1;
		this._repeat = true;
		this._transform = null;

		// Constructor

		this.constructor = function(source, opacity, repeat)
		{
			if (source != null)
				this.source(source);
			if (opacity != null)
				this.opacity(opacity);
			if (repeat != null)
				this.repeat(repeat);
		};

		// Public Accessor Methods

		this.source = function(value)
		{
			if (!arguments.length)
				return this._source;

			this._source = (value != null) ? value : null;

			return this;
		};

		this.opacity = function(value)
		{
			if (!arguments.length)
				return this._opacity;

			value = (value != null) ? +value : 1;
			this._opacity = (value <= Infinity) ? NumberUtil.minMax(value, 0, 1) : 1;

			return this;
		};

		this.repeat = function(value)
		{
			if (!arguments.length)
				return this._repeat;

			this._repeat = (value !== false);

			return this;
		};

		this.transform = function(value)
		{
			if (!arguments.length)
				return this._transform ? Matrix.fromArray(this._transform) : null;

			if ((value != null) && !(value instanceof Matrix))
				throw new Error("Parameter transform must be of type " + Class.getName(Matrix) + ".");

			this._transform = (value && value.isFinite()) ? value.toArray() : null;

			return this;
		};

		// Public Methods

		this.toObject = function()
		{
			var source = this._source;
			if (source)
			{
				if (source instanceof ImageSource)
					source = source.toRaw(false);
				else if (source.isDOMTarget)
					source = source.getDOMElement();
			}

			var obj = {};
			obj.source = source;
			obj.opacity = this._opacity;
			obj.repeat = this._repeat;
			obj.transform = this._transform ? this._transform.concat() : null;
			return obj;
		};

	});

});
