/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Class = require("../Class");
	var Matrix = require("../geom/Matrix");
	var Point = require("../geom/Point");
	var Rectangle = require("../geom/Rectangle");
	var ObservableEnumProperty = require("../properties/ObservableEnumProperty");
	var ObservableProperty = require("../properties/ObservableProperty");
	var NumberUtil = require("../utils/NumberUtil");

	return Class(module.id, function(MTileBrush)
	{

		// Private Static Methods

		var _getPointBounds = function(points, matrix, padding)
		{
			var left = Infinity;
			var right = -Infinity;
			var top = Infinity;
			var bottom = -Infinity;
			var point;

			for (var i = 0, l = points.length; i < l; i++)
			{
				point = points[i];
				if (matrix)
					point = point.clone().transform(matrix);
				if (point.x < left)
					left = point.x;
				if (point.x > right)
					right = point.x;
				if (point.y < top)
					top = point.y;
				if (point.y > bottom)
					bottom = point.y;
			}

			if (left === Infinity)
				return new Rectangle();

			if (padding > 0)
			{
				var scale = matrix ? _getMatrixScale(matrix) : new Point(1, 1);

				left -= padding * scale.x;
				right += padding * scale.x;
				top -= padding * scale.y;
				bottom += padding * scale.y;
			}

			return new Rectangle(left, top, right - left, bottom - top);
		};

		var _getMatrixScale = function(matrix)
		{
			var p1 = new Point(0, 0).transform(matrix);
			var p2 = new Point(1, 0).transform(matrix);
			var p3 = new Point(0, 1).transform(matrix);

			return new Point(Point.distance(p1, p2), Point.distance(p1, p3));
		};

		// Public Properties

		this.scaleMode = new ObservableEnumProperty("scaleMode", String, [ "fill", "uniformFill", "uniformFillWidth", "uniformFillHeight", "fit", "uniformFit", "uniformFitWidth", "uniformFitHeight", "none" ]);

		this.scaleToDrawing = new ObservableProperty("scaleToDrawing", Boolean, false);

		this.alignmentX = new ObservableProperty("alignmentX", Number, 0.5)
			.writeFilter(function(value)
			{
				return (value <= Infinity) ? NumberUtil.minMax(value, 0, 1) : 0.5;
			});

		this.alignmentY = new ObservableProperty("alignmentY", Number, 0.5)
			.writeFilter(function(value)
			{
				return (value <= Infinity) ? NumberUtil.minMax(value, 0, 1) : 0.5;
			});

		this.offsetX = new ObservableProperty("offsetX", Number, 0)
			.writeFilter(function(value)
			{
				return (value <= Infinity) ? NumberUtil.minMax(value, -1, 1) : 0;
			});

		this.offsetY = new ObservableProperty("offsetY", Number, 0)
			.writeFilter(function(value)
			{
				return (value <= Infinity) ? NumberUtil.minMax(value, -1, 1) : 0;
			});

		this.transform = new ObservableProperty("transform", Matrix, null)
			.readFilter(function(value)
			{
				return value ? value.clone() : null;
			})
			.writeFilter(function(value)
			{
				return (value && value.isFinite()) ? value.clone() : null;
			})
			.changeComparator(function(oldValue, newValue)
			{
				if (!oldValue && !newValue)
					return false;
				if (oldValue && newValue && oldValue.equals(newValue))
					return false;
				return true;
			});

		this.isTileBrush = true;

		// Protected Methods

		this.getTileTransform = function(tileWidth, tileHeight, properties, path, bounds, transform)
		{
			var mainTransform = properties.transform;
			if ((mainTransform && !mainTransform.hasInverse()) || (transform && !transform.hasInverse()))
				return new Matrix(0, 0, 0, 0, 0, 0);

			var tilePoints = [];
			tilePoints.push(new Point(0, 0));
			tilePoints.push(new Point(tileWidth, 0));
			tilePoints.push(new Point(tileWidth, tileHeight));
			tilePoints.push(new Point(0, tileHeight));

			var pathPoints = [];
			var pathPadding = 0;
			var pathOffset = 0;
			if (bounds && !properties.scaleToDrawing)
			{
				pathPoints.push(new Point(bounds.x, bounds.y));
				pathPoints.push(new Point(bounds.x + bounds.width, bounds.y));
				pathPoints.push(new Point(bounds.x + bounds.width, bounds.y + bounds.height));
				pathPoints.push(new Point(bounds.x, bounds.y + bounds.height));
			}
			else
			{
				var command;
				for (var i = 0, l = path.length; i < l; i++)
				{
					command = path[i];
					switch (command[0])
					{
						case "moveTo":
						case "lineTo":
							pathPoints.push(new Point(command[1], command[2]));
							break;
						case "curveTo":
							pathPoints.push(new Point(command[3], command[4]));
							break;
					}
				}

				if (this.isStrokeBrush)
				{
					var thickness = properties.thickness;
					pathPadding = thickness / 2;
					pathOffset = properties.pixelHinting ? (thickness % 2) / 2 : 0;
				}
			}

			var tileTransform = mainTransform ? mainTransform.clone() : new Matrix();
			var scaleMode = properties.scaleMode;
			var sourceBounds;
			var destBounds;

			if (scaleMode !== "none")
			{
				if (mainTransform)
				{
					var mainScale = _getMatrixScale(mainTransform);
					mainTransform = new Matrix(1 / mainScale.x, 0, 0, 1 / mainScale.y).concat(mainTransform);
				}

				var hasFillScaleMode = (scaleMode.toLowerCase().indexOf("fill") >= 0);
				if (hasFillScaleMode)
				{
					tileTransform.invert();
					if (mainTransform)
						mainTransform.invert();
					sourceBounds = _getPointBounds(pathPoints, mainTransform, pathPadding);
					destBounds = _getPointBounds(tilePoints);
				}
				else
				{
					sourceBounds = _getPointBounds(tilePoints, mainTransform);
					destBounds = _getPointBounds(pathPoints, null, pathPadding);
				}

				var scaleX = 1;
				var scaleY = 1;

				switch (scaleMode)
				{
					case "fill":
					case "fit":
						scaleX = (sourceBounds.width > 0) ? (destBounds.width / sourceBounds.width) : 1;
						scaleY = (sourceBounds.height > 0) ? (destBounds.height / sourceBounds.height) : 1;
						break;
					case "uniformFill":
					case "uniformFit":
						scaleX = (sourceBounds.width > 0) ? (destBounds.width / sourceBounds.width) : 1;
						scaleY = (sourceBounds.height > 0) ? (destBounds.height / sourceBounds.height) : 1;
						scaleX = scaleY = Math.min(scaleX, scaleY);
						break;
					case "uniformFillWidth":
					case "uniformFitWidth":
						scaleX = scaleY = (sourceBounds.width > 0) ? (destBounds.width / sourceBounds.width) : 1;
						break;
					case "uniformFillHeight":
					case "uniformFitHeight":
						scaleX = scaleY = (sourceBounds.height > 0) ? (destBounds.height / sourceBounds.height) : 1;
						break;
				}

				tileTransform.scale(scaleX, scaleY);
				if (hasFillScaleMode)
					tileTransform.invert();
			}

			sourceBounds = _getPointBounds(tilePoints, tileTransform);
			destBounds = _getPointBounds(pathPoints, null, pathPadding);

			var offsetX = (destBounds.width - sourceBounds.width) * properties.alignmentX + destBounds.width * properties.offsetX;
			var offsetY = (destBounds.height - sourceBounds.height) * properties.alignmentY + destBounds.height * properties.offsetY;
			tileTransform.translate((destBounds.x - sourceBounds.x) + offsetX, (destBounds.y - sourceBounds.y) + offsetY);

			if (transform)
			{
				offsetX = destBounds.x + destBounds.width / 2;
				offsetY = destBounds.y + destBounds.height / 2;
				tileTransform.translate(-offsetX, -offsetY);
				tileTransform.concat(transform);
				tileTransform.translate(offsetX, offsetY);
			}

			if (pathOffset > 0)
				tileTransform.translate(pathOffset, pathOffset);

			return tileTransform;
		};

	});

});
