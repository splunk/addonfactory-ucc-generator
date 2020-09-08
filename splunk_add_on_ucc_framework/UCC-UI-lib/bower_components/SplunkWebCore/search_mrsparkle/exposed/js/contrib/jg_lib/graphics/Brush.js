/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Canvas = require("./Canvas");
	var Class = require("../Class");
	var MEventTarget = require("../events/MEventTarget");
	var MListenerTarget = require("../events/MListenerTarget");
	var MObservableTarget = require("../events/MObservableTarget");
	var Matrix = require("../geom/Matrix");
	var Rectangle = require("../geom/Rectangle");
	var MPropertyTarget = require("../properties/MPropertyTarget");
	var Property = require("../properties/Property");

	return Class(module.id, Object, function(Brush, base)
	{

		Class.mixin(this, MEventTarget, MListenerTarget, MObservableTarget, MPropertyTarget);

		// Private Properties

		this._brushContext = null;
		this._cachedProperties = null;
		this._hasChangeListener = false;

		// Constructor

		this.constructor = function()
		{
			// noop
		};

		// Public Methods

		this.beginBrush = function(canvas, bounds, transform)
		{
			if (canvas == null)
				throw new Error("Parameter canvas must be non-null.");
			if (!(canvas instanceof Canvas))
				throw new Error("Parameter canvas must be of type " + Class.getName(Canvas) + ".");
			if ((bounds != null) && !(bounds instanceof Rectangle))
				throw new Error("Parameter bounds must be of type " + Class.getName(Rectangle) + ".");
			if ((transform != null) && !(transform instanceof Matrix))
				throw new Error("Parameter transform must be of type " + Class.getName(Matrix) + ".");

			this.endBrush();

			if (!this._cachedProperties)
			{
				if (!this._hasChangeListener)
				{
					this.on(this.change, this._selfChange, this, Infinity);
					this._hasChangeListener = true;
				}

				this._cachedProperties = this._getProperties();
				this.extendProperties(this._cachedProperties);
			}

			var brushContext = {};
			brushContext.canvas = canvas;
			brushContext.properties = this._cachedProperties;
			brushContext.path = [];
			brushContext.bounds = (bounds && bounds.isFinite()) ? bounds.clone() : null;
			brushContext.transform = (transform && transform.isFinite()) ? transform.clone() : null;

			this._brushContext = brushContext;

			return this;
		};

		this.endBrush = function()
		{
			var brushContext = this._brushContext;
			if (!brushContext)
				return this;

			this.drawBrush(brushContext.canvas, brushContext.properties, brushContext.path, brushContext.bounds, brushContext.transform);

			this._brushContext = null;

			return this;
		};

		this.moveTo = function(x, y)
		{
			var brushContext = this._brushContext;
			if (!brushContext)
				return this;

			x = +x;
			y = +y;

			x = ((x > -Infinity) && (x < Infinity)) ? x : 0;
			y = ((y > -Infinity) && (y < Infinity)) ? y : 0;

			brushContext.path.push([ "moveTo", x, y ]);

			return this;
		};

		this.lineTo = function(x, y)
		{
			var brushContext = this._brushContext;
			if (!brushContext)
				return this;

			x = +x;
			y = +y;

			x = ((x > -Infinity) && (x < Infinity)) ? x : 0;
			y = ((y > -Infinity) && (y < Infinity)) ? y : 0;

			brushContext.path.push([ "lineTo", x, y ]);

			return this;
		};

		this.curveTo = function(cx, cy, x, y)
		{
			var brushContext = this._brushContext;
			if (!brushContext)
				return this;

			cx = +cx;
			cy = +cy;
			x = +x;
			y = +y;

			cx = ((cx > -Infinity) && (cx < Infinity)) ? cx : 0;
			cy = ((cy > -Infinity) && (cy < Infinity)) ? cy : 0;
			x = ((x > -Infinity) && (x < Infinity)) ? x : 0;
			y = ((y > -Infinity) && (y < Infinity)) ? y : 0;

			brushContext.path.push([ "curveTo", cx, cy, x, y ]);

			return this;
		};

		this.dispose = function()
		{
			this.listenOff();
			this.off();

			this._brushContext = null;
			this._cachedProperties = null;
		};

		// Protected Methods

		this.extendProperties = function(properties)
		{
		};

		this.drawBrush = function(canvas, properties, path, bounds, transform)
		{
		};

		this.drawPath = function(canvasOrBrush, path)
		{
			var command;
			for (var i = 0, l = path.length; i < l; i++)
			{
				command = path[i];
				switch (command[0])
				{
					case "moveTo":
						canvasOrBrush.moveTo(command[1], command[2]);
						break;
					case "lineTo":
						canvasOrBrush.lineTo(command[1], command[2]);
						break;
					case "curveTo":
						canvasOrBrush.curveTo(command[1], command[2], command[3], command[4]);
						break;
				}
			}
		};

		// Private Methods

		this._getProperties = function()
		{
			var properties = {};
			var property;
			for (var p in this)
			{
				property = this[p];
				if (property instanceof Property)
					properties[p] = this.getInternal(property);
			}
			return properties;
		};

		this._selfChange = function(e)
		{
			this._cachedProperties = null;
		};

	});

});
