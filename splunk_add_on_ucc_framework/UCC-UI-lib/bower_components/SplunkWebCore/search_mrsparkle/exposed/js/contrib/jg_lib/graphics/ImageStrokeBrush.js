/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Brush = require("./Brush");
	var MImageBrush = require("./MImageBrush");
	var MStrokeBrush = require("./MStrokeBrush");
	var MTileBrush = require("./MTileBrush");
	var Class = require("../Class");

	return Class(module.id, Brush, function(ImageStrokeBrush, base)
	{

		Class.mixin(this, MImageBrush, MTileBrush, MStrokeBrush);

		// Constructor

		this.constructor = function(source, opacity, repeat)
		{
			if (source != null)
				this.set(this.source, source);
			if (opacity != null)
				this.set(this.opacity, opacity);
			if (repeat != null)
				this.set(this.repeat, repeat);
		};

		// Protected Methods

		this.extendProperties = function(properties)
		{
			properties.pattern = this.getImagePattern(properties);
			properties.strokeStyle = this.getStrokeStyle(properties);
		};

		this.drawBrush = function(canvas, properties, path, bounds, transform)
		{
			var pattern = properties.pattern;
			var source = properties.source;
			if (source && source.isLoaded())
				pattern.transform(this.getTileTransform(source.width(), source.height(), properties, path, bounds, transform));

			canvas.beginStroke(pattern, properties.strokeStyle);
			this.drawPath(canvas, path);
			canvas.endStroke();
		};

	});

});
