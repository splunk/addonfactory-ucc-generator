/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Brush = require("./Brush");
	var MGradientBrush = require("./MGradientBrush");
	var MStrokeBrush = require("./MStrokeBrush");
	var MTileBrush = require("./MTileBrush");
	var Class = require("../Class");

	return Class(module.id, Brush, function(GradientStrokeBrush, base)
	{

		Class.mixin(this, MGradientBrush, MTileBrush, MStrokeBrush);

		// Constructor

		this.constructor = function(type, startPoint, endPoint, radius)
		{
			if (type != null)
				this.set(this.type, type);
			if (startPoint != null)
				this.set(this.startPoint, startPoint);
			if (endPoint != null)
				this.set(this.endPoint, endPoint);
			if (radius != null)
				this.set(this.radius, radius);
		};

		// Protected Methods

		this.extendProperties = function(properties)
		{
			properties.gradient = this.getGradient(properties);
			properties.strokeStyle = this.getStrokeStyle(properties);
		};

		this.drawBrush = function(canvas, properties, path, bounds, transform)
		{
			var tileTransform = this.getTileTransform(properties.gradientWidth, properties.gradientHeight, properties, path, bounds, transform);

			canvas.beginStroke(properties.gradient.transform(tileTransform), properties.strokeStyle);
			this.drawPath(canvas, path);
			canvas.endStroke();
		};

	});

});
