/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Color = require("./Color");
	var ColorStop = require("./ColorStop");
	var Gradient = require("./Gradient");
	var Class = require("../Class");
	var Point = require("../geom/Point");
	var ObservableArrayProperty = require("../properties/ObservableArrayProperty");
	var ObservableEnumProperty = require("../properties/ObservableEnumProperty");
	var ObservableProperty = require("../properties/ObservableProperty");
	var NumberUtil = require("../utils/NumberUtil");

	return Class(module.id, function(MGradientBrush)
	{

		// Public Properties

		this.type = new ObservableEnumProperty("type", String, [ "linear", "radial" ]);

		this.startPoint = new ObservableProperty("startPoint", Point, null)
			.readFilter(function(value)
			{
				return value ? value.clone() : null;
			})
			.writeFilter(function(value)
			{
				return (value && value.isFinite()) ? value.clone() : null;
			})
			.changeComparator(function(oldValue, newValue)
			{
				if (!oldValue && !newValue)
					return false;
				if (oldValue && newValue && oldValue.equals(newValue))
					return false;
				return true;
			});

		this.endPoint = new ObservableProperty("endPoint", Point, null)
			.readFilter(function(value)
			{
				return value ? value.clone() : null;
			})
			.writeFilter(function(value)
			{
				return (value && value.isFinite()) ? value.clone() : null;
			})
			.changeComparator(function(oldValue, newValue)
			{
				if (!oldValue && !newValue)
					return false;
				if (oldValue && newValue && oldValue.equals(newValue))
					return false;
				return true;
			});

		this.radius = new ObservableProperty("radius", Number, NaN)
			.writeFilter(function(value)
			{
				return (value < Infinity) ? Math.max(value, 0) : NaN;
			});

		this.colors = new ObservableArrayProperty("colors", Color, [])
			.itemReadFilter(function(value)
			{
				return value.clone();
			})
			.itemWriteFilter(function(value)
			{
				return value ? value.clone().normalize() : new Color();
			})
			.itemChangeComparator(function(oldValue, newValue)
			{
				return !oldValue.equals(newValue);
			});

		this.offsets = new ObservableArrayProperty("offsets", Number, [])
			.itemWriteFilter(function(value)
			{
				return (value <= Infinity) ? NumberUtil.minMax(value, 0, 1) : NaN;
			});

		this.opacity = new ObservableProperty("opacity", Number, 1)
			.writeFilter(function(value)
			{
				return (value <= Infinity) ? NumberUtil.minMax(value, 0, 1) : 1;
			});

		this.gradientWidth = new ObservableProperty("gradientWidth", Number, 1)
			.writeFilter(function(value)
			{
				return (value < Infinity) ? Math.max(value, 0) : 1;
			});

		this.gradientHeight = new ObservableProperty("gradientHeight", Number, 1)
			.writeFilter(function(value)
			{
				return (value < Infinity) ? Math.max(value, 0) : 1;
			});

		this.colorStops = new ObservableArrayProperty("colorStops", ColorStop, []);

		this.contentProperty = "colorStops";

		this.isGradientBrush = true;

		// Public Methods

		this.addColorStop = function(color, offset)
		{
			if (color == null)
				throw new Error("Parameter color must be non-null.");
			if (!(color instanceof Color))
				throw new Error("Parameter color must be of type " + Class.getName(Color) + ".");

			var colors = this.getInternal(this.colors).concat();
			colors.push(color.clone().normalize());

			var colorCount = colors.length;
			var offsets = this.getInternal(this.offsets).concat();
			for (var i = offsets.length; i < colorCount; i++)
				offsets.push(NaN);

			offsets[colorCount - 1] = offset;

			this.setInternal(this.colors, colors);
			this.setInternal(this.offsets, offsets);

			return this;
		};

		this.clearColorStops = function()
		{
			this.setInternal(this.colors, []);
			this.setInternal(this.offsets, []);

			return this;
		};

		// Protected Methods

		this.getGradient = function(properties)
		{
			var gradient = new Gradient(properties.type, properties.startPoint, properties.endPoint, properties.radius);
			var colors = properties.colors.concat();
			var colorCount = colors.length;
			var color;
			var offsets = properties.offsets.concat();
			var offsetCount = offsets.length;
			var offset;
			var colorStops = properties.colorStops;
			var colorStopCount = colorStops.length;
			var colorStop;
			var opacity = properties.opacity;
			var i;

			for (i = 0; i < colorStopCount; i++)
			{
				colorStop = colorStops[i];
				color = colorStop.get(colorStop.color);
				offset = colorStop.get(colorStop.offset);

				if (i < colorCount)
					colors[i] = color;
				else
					colors.push(color);

				if (i < offsetCount)
					offsets[i] = offset;
				else
					offsets.push(offset);
			}

			colorCount = colors.length;
			offsetCount = offsets.length;

			for (i = 0; i < colorCount; i++)
			{
				color = colors[i];
				if (opacity < 1)
				{
					color = color.clone();
					color.a *= opacity;
				}
				offset = (i < offsetCount) ? offsets[i] : NaN;
				gradient.addColorStop(color, offset);
			}

			return gradient;
		};

	});

});
