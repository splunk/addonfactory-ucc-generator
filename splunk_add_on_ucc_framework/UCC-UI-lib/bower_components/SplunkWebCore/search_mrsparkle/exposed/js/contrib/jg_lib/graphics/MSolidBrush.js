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
	var ObservableProperty = require("../properties/ObservableProperty");
	var NumberUtil = require("../utils/NumberUtil");

	return Class(module.id, function(MSolidBrush)
	{

		// Public Properties

		this.color = new ObservableProperty("color", Color, new Color())
			.readFilter(function(value)
			{
				return value.clone();
			})
			.writeFilter(function(value)
			{
				return value ? value.clone().normalize() : new Color();
			})
			.changeComparator(function(oldValue, newValue)
			{
				return !oldValue.equals(newValue);
			});

		this.opacity = new ObservableProperty("opacity", Number, 1)
			.writeFilter(function(value)
			{
				return (value <= Infinity) ? NumberUtil.minMax(value, 0, 1) : 1;
			});

		this.isSolidBrush = true;

		// Protected Methods

		this.getSolidColor = function(properties)
		{
			var color = properties.color;
			var opacity = properties.opacity;
			if (opacity < 1)
			{
				color = color.clone();
				color.a *= opacity;
			}
			return color;
		};

	});

});
