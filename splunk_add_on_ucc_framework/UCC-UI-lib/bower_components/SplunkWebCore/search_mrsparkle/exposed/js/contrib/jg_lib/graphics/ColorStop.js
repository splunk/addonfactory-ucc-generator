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
	var MEventTarget = require("../events/MEventTarget");
	var MObservableTarget = require("../events/MObservableTarget");
	var MPropertyTarget = require("../properties/MPropertyTarget");
	var ObservableProperty = require("../properties/ObservableProperty");
	var NumberUtil = require("../utils/NumberUtil");

	return Class(module.id, Object, function(ColorStop, base)
	{

		Class.mixin(this, MEventTarget, MObservableTarget, MPropertyTarget);

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

		this.offset = new ObservableProperty("offset", Number, NaN)
			.writeFilter(function(value)
			{
				return (value <= Infinity) ? NumberUtil.minMax(value, 0, 1) : NaN;
			});

		// Constructor

		this.constructor = function(color, offset)
		{
			if (color != null)
				this.set(this.color, color);
			if (offset != null)
				this.set(this.offset, offset);
		};

	});

});
