/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var StrokeStyle = require("./StrokeStyle");
	var Class = require("../Class");
	var ObservableArrayProperty = require("../properties/ObservableArrayProperty");
	var ObservableEnumProperty = require("../properties/ObservableEnumProperty");
	var ObservableProperty = require("../properties/ObservableProperty");

	return Class(module.id, function(MStrokeBrush)
	{

		// Public Properties

		this.thickness = new ObservableProperty("thickness", Number, 1)
			.writeFilter(function(value)
			{
				return ((value > 0) && (value < Infinity)) ? value : 1;
			});

		this.caps = new ObservableEnumProperty("caps", String, [ "none", "round", "square" ]);

		this.joints = new ObservableEnumProperty("joints", String, [ "miter", "round", "bevel" ]);

		this.miterLimit = new ObservableProperty("miterLimit", Number, 10)
			.writeFilter(function(value)
			{
				return ((value > 0) && (value < Infinity)) ? value : 10;
			});

		this.dashArray = new ObservableArrayProperty("dashArray", Number, [])
			.itemWriteFilter(function(value)
			{
				return ((value > 0) && (value < Infinity)) ? value : 1;
			});

		this.dashOffset = new ObservableProperty("dashOffset", Number, 0)
			.writeFilter(function(value)
			{
				return ((value > -Infinity) && (value < Infinity)) ? value : 0;
			});

		this.pixelHinting = new ObservableProperty("pixelHinting", Boolean, true);

		this.isStrokeBrush = true;

		// Protected Methods

		this.getStrokeStyle = function(properties)
		{
			return new StrokeStyle()
				.thickness(properties.thickness)
				.caps(properties.caps)
				.joints(properties.joints)
				.miterLimit(properties.miterLimit)
				.dashArray(properties.dashArray)
				.dashOffset(properties.dashOffset)
				.pixelHinting(properties.pixelHinting);
		};

	});

});
