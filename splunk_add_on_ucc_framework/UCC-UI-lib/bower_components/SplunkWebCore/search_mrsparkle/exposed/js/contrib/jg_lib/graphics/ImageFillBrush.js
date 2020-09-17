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
	var MTileBrush = require("./MTileBrush");
	var Class = require("../Class");

	return Class(module.id, Brush, function(ImageFillBrush, base)
	{

		Class.mixin(this, MImageBrush, MTileBrush);

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
		};

		this.drawBrush = function(canvas, properties, path, bounds, transform)
		{
			var pattern = properties.pattern;
			var source = properties.source;
			if (source && source.isLoaded())
				pattern.transform(this.getTileTransform(source.width(), source.height(), properties, path, bounds, transform));

			canvas.beginFill(pattern);
			this.drawPath(canvas, path);
			canvas.endFill();
		};

	});

});
