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
	var Class = require("../Class");

	return Class(module.id, Brush, function(SolidFillBrush, base)
	{

		Class.mixin(this, MSolidBrush);

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
		};

		this.drawBrush = function(canvas, properties, path, bounds, transform)
		{
			canvas.beginFill(properties.solidColor);
			this.drawPath(canvas, path);
			canvas.endFill();
		};

	});

});
