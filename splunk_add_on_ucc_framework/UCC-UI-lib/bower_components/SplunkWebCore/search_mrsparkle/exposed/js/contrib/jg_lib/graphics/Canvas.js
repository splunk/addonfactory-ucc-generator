/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Color = require("./Color");
	var Gradient = require("./Gradient");
	var Pattern = require("./Pattern");
	var StrokeStyle = require("./StrokeStyle");
	var Class = require("../Class");
	var Element = require("../display/Element");

	return Class(module.id, Element, function(Canvas, base)
	{

		// Private Static Constants

		var _DEFAULT_STROKE_STYLE = new StrokeStyle();

		// Private Static Methods

		var _hasInverse = function(matrix)
		{
			var det = Math.abs((matrix[0] * matrix[3]) - (matrix[1] * matrix[2]));
			return ((det > 0) && (det < Infinity));
		};

		// Private Properties

		this._context = null;
		this._patternBufferCanvas = null;
		this._patternBufferContext = null;
		this._strokePathHandle = null;
		this._fillPathHandle = null;
		this._drawingList = null;
		this._drawnStack = null;
		this._pathX = 0;
		this._pathY = 0;

		// Constructor

		this.constructor = function(width, height)
		{
			base.constructor.call(this, "canvas");

			this._context = this.element.getContext ? this.element.getContext("2d") : null;
			this._drawingList = [];
			this._drawnStack = [];

			this.setSize(width || 0, height || 0);
		};

		// Public Accessor Methods

		this.width = function(value)
		{
			if (!arguments.length)
				return this.element.width;

			this.setSize(value, this.element.height);

			return this;
		};

		this.height = function(value)
		{
			if (!arguments.length)
				return this.element.height;

			this.setSize(this.element.width, value);

			return this;
		};

		// Public Methods

		this.setSize = function(width, height)
		{
			width = +width;
			height = +height;

			width = ((width > 0) && (width < Infinity)) ? Math.floor(width) : 0;
			height = ((height > 0) && (height < Infinity)) ? Math.floor(height) : 0;

			var element = this.element;
			if ((element.width === width) && (element.height === height))
				return this;

			element.width = width;
			element.height = height;

			this.redraw();

			return this;
		};

		this.beginStroke = function(style, strokeStyle)
		{
			if (style == null)
				throw new Error("Parameter style must be non-null.");

			var methodName;
			if (style instanceof Color)
			{
				methodName = "drawSolidStroke";
				style = { color: style.toArray(true) };
			}
			else if (style instanceof Gradient)
			{
				methodName = "drawGradientStroke";
				style = style.toObject();
				if (style.transform && !_hasInverse(style.transform))
					methodName = null;
			}
			else if (style instanceof Pattern)
			{
				methodName = "drawPatternStroke";
				style = style.toObject();
				if (style.transform && !_hasInverse(style.transform))
					methodName = null;
			}
			else
			{
				throw new Error("Parameter style must be of type " + Class.getName(Color) + ", " + Class.getName(Gradient) + ", or " + Class.getName(Pattern) + ".");
			}

			if (strokeStyle == null)
				_DEFAULT_STROKE_STYLE.toObject(style);
			else if (strokeStyle instanceof StrokeStyle)
				strokeStyle.toObject(style);
			else
				throw new Error("Parameter strokeStyle must be of type " + Class.getName(StrokeStyle) + ".");

			this.endStroke();

			if (methodName)
				this._strokePathHandle = this.beginPath(methodName, style);

			return this;
		};

		this.endStroke = function()
		{
			if (!this._strokePathHandle)
				return this;

			this.endPath(this._strokePathHandle);
			this._strokePathHandle = null;

			return this;
		};

		this.beginFill = function(style)
		{
			if (style == null)
				throw new Error("Parameter style must be non-null.");

			var methodName;
			if (style instanceof Color)
			{
				methodName = "drawSolidFill";
				style = { color: style.toArray(true) };
			}
			else if (style instanceof Gradient)
			{
				methodName = "drawGradientFill";
				style = style.toObject();
				if (style.transform && !_hasInverse(style.transform))
					methodName = null;
			}
			else if (style instanceof Pattern)
			{
				methodName = "drawPatternFill";
				style = style.toObject();
				if (style.transform && !_hasInverse(style.transform))
					methodName = null;
			}
			else
			{
				throw new Error("Parameter style must be of type " + Class.getName(Color) + ", " + Class.getName(Gradient) + ", or " + Class.getName(Pattern) + ".");
			}

			this.endFill();

			if (methodName)
				this._fillPathHandle = this.beginPath(methodName, style);

			return this;
		};

		this.endFill = function()
		{
			if (!this._fillPathHandle)
				return this;

			this.endPath(this._fillPathHandle);
			this._fillPathHandle = null;

			return this;
		};

		this.moveTo = function(x, y)
		{
			x = +x;
			y = +y;

			x = ((x > -Infinity) && (x < Infinity)) ? x : 0;
			y = ((y > -Infinity) && (y < Infinity)) ? y : 0;

			this._pathX = x;
			this._pathY = y;

			var command = [ "moveTo", x, y ];
			var drawingList = this._drawingList;
			var path;
			for (var i = 0, l = drawingList.length; i < l; i++)
			{
				path = drawingList[i].path;
				if (path[path.length - 1][0] === "moveTo")
					path[path.length - 1] = command;
				else
					path.push(command);
			}

			return this;
		};

		this.lineTo = function(x, y)
		{
			x = +x;
			y = +y;

			x = ((x > -Infinity) && (x < Infinity)) ? x : 0;
			y = ((y > -Infinity) && (y < Infinity)) ? y : 0;

			this._pathX = x;
			this._pathY = y;

			var command = [ "lineTo", x, y ];
			var drawingList = this._drawingList;
			for (var i = 0, l = drawingList.length; i < l; i++)
				drawingList[i].path.push(command);

			return this;
		};

		this.curveTo = function(cx, cy, x, y)
		{
			cx = +cx;
			cy = +cy;
			x = +x;
			y = +y;

			cx = ((cx > -Infinity) && (cx < Infinity)) ? cx : 0;
			cy = ((cy > -Infinity) && (cy < Infinity)) ? cy : 0;
			x = ((x > -Infinity) && (x < Infinity)) ? x : 0;
			y = ((y > -Infinity) && (y < Infinity)) ? y : 0;

			this._pathX = x;
			this._pathY = y;

			var command = [ "curveTo", cx, cy, x, y ];
			var drawingList = this._drawingList;
			for (var i = 0, l = drawingList.length; i < l; i++)
				drawingList[i].path.push(command);

			return this;
		};

		this.clear = function()
		{
			this._strokePathHandle = null;
			this._fillPathHandle = null;
			this._drawingList = [];

			if (this._drawnStack.length === 0)
				return this;

			this._drawnStack = [];

			var context = this._context;
			if (!context)
				return this;

			context.clearRect(0, 0, context.canvas.width, context.canvas.height);

			return this;
		};

		this.redraw = function()
		{
			var drawnStack = this._drawnStack;
			if (drawnStack.length === 0)
				return this;

			var context = this._context;
			if (!context)
				return this;

			context.clearRect(0, 0, context.canvas.width, context.canvas.height);

			var pathData;
			for (var i = 0, l = drawnStack.length; i < l; i++)
			{
				pathData = drawnStack[i];
				this[pathData.name](pathData.style, pathData.path);
			}

			return this;
		};

		this.getPathData = function()
		{
			return this._drawnStack.concat();
		};

		// Protected Methods

		this.beginPath = function(name, style)
		{
			var pathData = {};
			pathData.name = name;
			pathData.style = style;
			pathData.path = [ [ "moveTo", this._pathX, this._pathY ] ];

			this._drawingList.push(pathData);

			return pathData;
		};

		this.endPath = function(handle)
		{
			var drawingList = this._drawingList;
			var pathData;
			for (var i = 0, l = drawingList.length; i < l; i++)
			{
				pathData = drawingList[i];
				if (pathData === handle)
				{
					drawingList.splice(i, 1);
					if (pathData.path.length > 1)
					{
						this[pathData.name](pathData.style, pathData.path);
						this._drawnStack.push(pathData);
					}
					break;
				}
			}
		};

		this.drawSolidStroke = function(style, path)
		{
			var context = this._context;
			if (!context)
				return;

			var color = this._createColor(context, style);

			context.save();

			this._drawStroke(context, style, path);

			context.strokeStyle = color;
			context.stroke();
			context.restore();
		};

		this.drawGradientStroke = function(style, path)
		{
			var context = this._context;
			if (!context)
				return;

			var gradient = this._createGradient(context, style);
			var transform = style.transform;
			if (gradient && transform)
				gradient = this._transformPattern(gradient, transform);

			context.save();

			this._drawStroke(context, style, path);

			context.strokeStyle = gradient || "rgba(0, 0, 0, 1)";
			context.stroke();
			context.restore();
		};

		this.drawPatternStroke = function(style, path)
		{
			var context = this._context;
			if (!context)
				return;

			var pattern = this._createPattern(context, style);
			var transform = style.transform;
			if (pattern && transform)
				pattern = this._transformPattern(pattern, transform);

			context.save();

			this._drawStroke(context, style, path);

			context.globalAlpha = style.opacity;
			context.strokeStyle = pattern || "rgba(0, 0, 0, 1)";
			context.stroke();
			context.restore();
		};

		this.drawSolidFill = function(style, path)
		{
			var context = this._context;
			if (!context)
				return;

			var color = this._createColor(context, style);

			context.save();

			this._drawFill(context, style, path);

			context.fillStyle = color;
			context.fill();
			context.restore();
		};

		this.drawGradientFill = function(style, path)
		{
			var context = this._context;
			if (!context)
				return;

			var gradient = this._createGradient(context, style);
			var transform = style.transform;

			context.save();

			this._drawFill(context, style, path);

			if (gradient && transform)
				context.setTransform(transform[0], transform[1], transform[2], transform[3], transform[4], transform[5]);

			context.fillStyle = gradient || "rgba(0, 0, 0, 1)";
			context.fill();
			context.restore();
		};

		this.drawPatternFill = function(style, path)
		{
			var context = this._context;
			if (!context)
				return;

			var pattern = this._createPattern(context, style);
			var transform = style.transform;

			context.save();

			this._drawFill(context, style, path);

			if (pattern && transform)
				context.setTransform(transform[0], transform[1], transform[2], transform[3], transform[4], transform[5]);

			context.globalAlpha = style.opacity;
			context.fillStyle = pattern || "rgba(0, 0, 0, 1)";
			context.fill();
			context.restore();
		};

		// Private Methods

		this._drawStroke = function(context, style, path)
		{
			var offset = style.pixelHinting ? (style.thickness % 2) / 2 : 0;
			var hasPath = false;
			var command;
			var startX;
			var startY;
			var endX;
			var endY;

			context.beginPath();

			for (var i = 0, l = path.length; i < l; i++)
			{
				command = path[i];
				switch (command[0])
				{
					case "moveTo":
						if (hasPath && (startX === endX) && (startY === endY))
							context.closePath();
						hasPath = false;
						startX = command[1];
						startY = command[2];
						context.moveTo(startX + offset, startY + offset);
						break;
					case "lineTo":
						hasPath = true;
						endX = command[1];
						endY = command[2];
						context.lineTo(endX + offset, endY + offset);
						break;
					case "curveTo":
						hasPath = true;
						endX = command[3];
						endY = command[4];
						context.quadraticCurveTo(command[1] + offset, command[2] + offset, endX + offset, endY + offset);
						break;
				}
			}

			if (hasPath && (startX === endX) && (startY === endY))
				context.closePath();

			context.lineWidth = style.thickness;
			context.lineCap = (style.caps === "none") ? "butt" : style.caps;
			context.lineJoin = style.joints;
			context.miterLimit = style.miterLimit;

			if (style.dashArray && context.setLineDash)
			{
				context.setLineDash(style.dashArray);
				context.lineDashOffset = -style.dashOffset;
			}
		};

		this._drawFill = function(context, style, path)
		{
			var command;

			context.beginPath();

			for (var i = 0, l = path.length; i < l; i++)
			{
				command = path[i];
				switch (command[0])
				{
					case "moveTo":
						context.moveTo(command[1], command[2]);
						break;
					case "lineTo":
						context.lineTo(command[1], command[2]);
						break;
					case "curveTo":
						context.quadraticCurveTo(command[1], command[2], command[3], command[4]);
						break;
				}
			}
		};

		this._createColor = function(context, style)
		{
			var color = style.color;
			return "rgba(" + color[0] + ", " + color[1] + ", " + color[2] + ", " + color[3] + ")";
		};

		this._createGradient = function(context, style)
		{
			var colors = style.colors;
			var colorCount = colors.length;
			if (colorCount === 0)
				return null;

			var startPoint = style.startPoint;
			var endPoint = style.endPoint;
			var gradient;
			if (style.type === "radial")
			{
				var radius = style.radius;
				var x1 = startPoint[0];
				var y1 = startPoint[1];
				var x2 = endPoint[0];
				var y2 = endPoint[1];
				var dx = (x1 - x2);
				var dy = (y1 - y2);
				var dist = Math.sqrt(dx * dx + dy * dy);
				var maxDist = radius * 0.99;
				if (dist > maxDist)
				{
					var scale = maxDist / dist;
					x1 = x2 + dx * scale;
					y1 = y2 + dy * scale;
				}
				gradient = context.createRadialGradient(x1, y1, 0, x2, y2, radius);
			}
			else
			{
				gradient = context.createLinearGradient(startPoint[0], startPoint[1], endPoint[0], endPoint[1]);
			}

			var offsets = style.offsets;
			var color;
			for (var i = 0; i < colorCount; i++)
			{
				color = colors[i];
				gradient.addColorStop(offsets[i], "rgba(" + color[0] + ", " + color[1] + ", " + color[2] + ", " + color[3] + ")");
			}

			return gradient;
		};

		this._createPattern = function(context, style)
		{
			var source = style.source;
			if (!source)
				return null;

			return context.createPattern(source, style.repeat ? "repeat" : "no-repeat");
		};

		this._transformPattern = function(pattern, matrix)
		{
			var bufferCanvas = this._patternBufferCanvas;
			if (!bufferCanvas)
			{
				bufferCanvas = this._patternBufferCanvas = document.createElement("canvas");
				this._patternBufferContext = bufferCanvas.getContext ? bufferCanvas.getContext("2d") : null;
			}

			var bufferContext = this._patternBufferContext;
			if (!bufferContext)
				return null;

			var width = bufferCanvas.width = this.element.width;
			var height = bufferCanvas.height = this.element.height;

			bufferContext.save();

			bufferContext.rect(0, 0, width, height);
			bufferContext.setTransform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);
			bufferContext.fillStyle = pattern;
			bufferContext.fill();

			pattern = bufferContext.createPattern(bufferCanvas, "no-repeat");

			bufferContext.clearRect(0, 0, width, height);
			bufferContext.restore();

			return pattern;
		};

	});

});
