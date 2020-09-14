/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Brush = require("./Brush");
	var Class = require("../Class");
	var ObservableArrayProperty = require("../properties/ObservableArrayProperty");

	return Class(module.id, Brush, function(GroupBrush, base)
	{

		// Public Properties

		this.brushes = new ObservableArrayProperty("brushes", Brush, []);

		this.contentProperty = "brushes";

		// Constructor

		this.constructor = function(brushes)
		{
			if (brushes != null)
				this.set(this.brushes, brushes);
		};

		// Public Methods

		this.addBrush = function(brush)
		{
			if (brush == null)
				throw new Error("Parameter brush must be non-null.");
			if (!(brush instanceof Brush))
				throw new Error("Parameter brush must be of type " + Class.getName(Brush) + ".");

			var brushes = this.getInternal(this.brushes).concat();
			brushes.push(brush);
			this.setInternal(this.brushes, brushes);

			return this;
		};

		this.clearBrushes = function()
		{
			this.setInternal(this.brushes, []);

			return this;
		};

		// Protected Methods

		this.drawBrush = function(canvas, properties, path, bounds, transform)
		{
			var brushes = properties.brushes;
			var brush;
			for (var i = 0, l = brushes.length; i < l; i++)
			{
				brush = brushes[i];
				brush.beginBrush(canvas, bounds, transform);
				this.drawPath(brush, path);
				brush.endBrush();
			}
		};

	});

});
