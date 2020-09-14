/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Brush = require("./Brush");
	var MSolidBrush = require("./MSolidBrush");
	var MStrokeBrush = require("./MStrokeBrush");
	var Class = require("../Class");

	return Class(module.id, Brush, function(SolidStrokeBrush, base)
	{

		Class.mixin(this, MSolidBrush, MStrokeBrush);

		// Constructor

		this.constructor = function(color, opacity)
		{
			if (color != null)
				this.set(this.color, color);
			if (opacity != null)
				this.set(this.opacity, opacity);
		};

		// Protected Methods

		this.extendProperties = function(properties)
		{
			properties.solidColor = this.getSolidColor(properties);
			properties.strokeStyle = this.getStrokeStyle(properties);
		};

		this.drawBrush = function(canvas, properties, path, bounds, transform)
		{
			canvas.beginStroke(properties.solidColor, properties.strokeStyle);
			this.drawPath(canvas, path);
			canvas.endStroke();
		};

	});

});
