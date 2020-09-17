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
	var MTileBrush = require("./MTileBrush");
	var Class = require("../Class");

	return Class(module.id, Brush, function(GradientFillBrush, base)
	{

		Class.mixin(this, MGradientBrush, MTileBrush);

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
		};

		this.drawBrush = function(canvas, properties, path, bounds, transform)
		{
			var tileTransform = this.getTileTransform(properties.gradientWidth, properties.gradientHeight, properties, path, bounds, transform);

			canvas.beginFill(properties.gradient.transform(tileTransform));
			this.drawPath(canvas, path);
			canvas.endFill();
		};

	});

});
