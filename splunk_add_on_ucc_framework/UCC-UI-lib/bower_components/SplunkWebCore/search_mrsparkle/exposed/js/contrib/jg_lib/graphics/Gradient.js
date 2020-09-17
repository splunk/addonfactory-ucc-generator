/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Color = require("./Color");
	var Class = require("../Class");
	var Matrix = require("../geom/Matrix");
	var Point = require("../geom/Point");
	var NumberUtil = require("../utils/NumberUtil");

	return Class(module.id, Object, function(Gradient, base)
	{

		// Private Properties

		this._type = "linear";
		this._startPoint = null;
		this._endPoint = null;
		this._radius = NaN;
		this._colors = null;
		this._offsets = null;
		this._transform = null;

		// Constructor

		this.constructor = function(type, startPoint, endPoint, radius)
		{
			this._colors = [];
			this._offsets = [];

			if (type != null)
				this.type(type);
			if (startPoint != null)
				this.startPoint(startPoint);
			if (endPoint != null)
				this.endPoint(endPoint);
			if (radius != null)
				this.radius(radius);
		};

		// Public Accessor Methods

		this.type = function(value)
		{
			if (!arguments.length)
				return this._type;

			this._type = (value === "radial") ? value : "linear";

			return this;
		};

		this.startPoint = function(value)
		{
			if (!arguments.length)
				return Point.fromArray(this._getStartPoint());

			if ((value != null) && !(value instanceof Point))
				value = Point.fromArray(arguments);

			this._startPoint = (value && value.isFinite()) ? value.toArray() : null;

			return this;
		};

		this.endPoint = function(value)
		{
			if (!arguments.length)
				return Point.fromArray(this._getEndPoint());

			if ((value != null) && !(value instanceof Point))
				value = Point.fromArray(arguments);

			this._endPoint = (value && value.isFinite()) ? value.toArray() : null;

			return this;
		};

		this.radius = function(value)
		{
			if (!arguments.length)
				return this._getRadius();

			value = (value != null) ? +value : NaN;
			this._radius = (value < Infinity) ? Math.max(value, 0) : NaN;

			return this;
		};

		this.colors = function(value)
		{
			var colors;
			var color;
			var i, l;

			if (!arguments.length)
			{
				colors = this._colors.concat();
				for (i = 0, l = colors.length; i < l; i++)
					colors[i] = Color.fromArray(colors[i]);
				return colors;
			}

			if (value != null)
			{
				if (!Class.isArray(value))
					throw new Error("Parameter colors must be of type Array<" + Class.getName(Color) + ">.");

				colors = [];
				for (i = 0, l = value.length; i < l; i++)
				{
					color = value[i];
					if (color != null)
					{
						if (!(color instanceof Color))
							throw new Error("Parameter colors must be of type Array<" + Class.getName(Color) + ">.");

						colors.push(color.toArray(true));
					}
				}

				value = colors;
			}

			this._colors = value || [];

			return this;
		};

		this.offsets = function(value)
		{
			if (!arguments.length)
				return this._getOffsets();

			if (value != null)
			{
				if (!Class.isArray(value))
					throw new Error("Parameter offsets must be of type Array<Number>.");

				var offsets = [];
				var offset;
				for (var i = 0, l = value.length; i < l; i++)
				{
					offset = value[i];
					offset = (offset != null) ? +offset : NaN;
					offset = (offset <= Infinity) ? NumberUtil.minMax(offset, 0, 1) : NaN;
					offsets.push(offset);
				}

				value = offsets;
			}

			this._offsets = value || [];

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

		this.addColorStop = function(color, offset)
		{
			if (color == null)
				throw new Error("Parameter color must be non-null.");
			if (!(color instanceof Color))
				throw new Error("Parameter color must be of type " + Class.getName(Color) + ".");

			offset = (offset != null) ? +offset : NaN;
			offset = (offset <= Infinity) ? NumberUtil.minMax(offset, 0, 1) : NaN;

			var colors = this._colors;
			colors.push(color.toArray(true));

			var colorCount = colors.length;
			var offsets = this._offsets;
			for (var i = offsets.length; i < colorCount; i++)
				offsets.push(NaN);

			offsets[colorCount - 1] = offset;

			return this;
		};

		this.clearColorStops = function()
		{
			this._colors = [];
			this._offsets = [];

			return this;
		};

		this.toObject = function()
		{
			var obj = {};
			obj.type = this._type;
			obj.startPoint = this._getStartPoint();
			obj.endPoint = this._getEndPoint();
			obj.radius = this._getRadius();
			obj.colors = this._getColors();
			obj.offsets = this._getOffsets(true);
			obj.transform = this._transform ? this._transform.concat() : null;
			return obj;
		};

		// Private Methods

		this._getStartPoint = function()
		{
			if (this._startPoint)
				return this._startPoint.concat();

			if (this._type === "radial")
				return [ 0.5, 0.5 ];

			return [ 0, 0 ];
		};

		this._getEndPoint = function()
		{
			if (this._endPoint)
				return this._endPoint.concat();

			if (this._type === "radial")
				return [ 0.5, 0.5 ];

			return [ 1, 0 ];
		};

		this._getRadius = function()
		{
			if (this._radius < Infinity)
				return this._radius;

			if (this._type === "radial")
				return this._endPoint ? Math.min(this._endPoint[0], this._endPoint[1]) : 0.5;

			return 0;
		};

		this._getColors = function()
		{
			var colors = this._colors.concat();

			for (var i = 0, l = colors.length; i < l; i++)
				colors[i] = colors[i].concat();

			return colors;
		};

		this._getOffsets = function(trim)
		{
			var colorCount = this._colors.length;
			var offsets = (trim === true) ? this._offsets.slice(0, colorCount) : this._offsets.concat();
			var offsetCount = offsets.length;
			var offset;
			var lastOffset = 0;

			for (var i = 0; i < colorCount; i++)
			{
				offset = (i < offsetCount) ? offsets[i] : NaN;

				if (offset >= lastOffset)
					lastOffset = offset;
				else if (offset < lastOffset)
					offset = lastOffset;
				else
					offset = lastOffset = NumberUtil.interpolate(lastOffset, 1, Math.min(i, 1) / (colorCount - i));

				if (i < offsetCount)
					offsets[i] = offset;
				else
					offsets.push(offset);
			}

			return offsets;
		};

	});

});
