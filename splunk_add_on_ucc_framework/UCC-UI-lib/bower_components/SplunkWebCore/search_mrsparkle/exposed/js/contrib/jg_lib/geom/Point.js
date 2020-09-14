/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Class = require("../Class");
	var NumberUtil = require("../utils/NumberUtil");

	return Class(module.id, Object, function(Point, base)
	{

		// Private Static Constants

		var _R_PAREN_CONTENTS = /^\s*\(?([^\)]+)\)?\s*$/;

		// Public Static Methods

		Point.distance = function(point1, point2)
		{
			var dx = point2.x - point1.x;
			var dy = point2.y - point1.y;

			return Math.sqrt(dx * dx + dy * dy);
		};

		Point.interpolate = function(point1, point2, ratio)
		{
			var x = NumberUtil.interpolate(point1.x, point2.x, ratio);
			var y = NumberUtil.interpolate(point1.y, point2.y, ratio);

			return new Point(x, y);
		};

		Point.fromArray = function(arr)
		{
			var length = arr.length;
			var x = (length > 0) ? arr[0] : 0;
			var y = (length > 1) ? arr[1] : 0;

			return new Point(x, y);
		};

		Point.fromString = function(str)
		{
			var match = ("" + str).match(_R_PAREN_CONTENTS);
			if (match)
				return Point.fromArray(match[1].split(","));

			return new Point();
		};

		// Public Properties

		this.x = 0;
		this.y = 0;

		// Constructor

		this.constructor = function(x, y)
		{
			this.x = (x != null) ? +x : 0;
			this.y = (y != null) ? +y : 0;
		};

		// Public Methods

		this.transform = function(matrix)
		{
			var x = this.x;
			var y = this.y;

			this.x = x * matrix.a + y * matrix.c + (+matrix.tx);
			this.y = y * matrix.d + x * matrix.b + (+matrix.ty);

			return this;
		};

		this.translate = function(dx, dy)
		{
			this.x += (+dx);
			this.y += (+dy);

			return this;
		};

		this.add = function(point)
		{
			this.x += (+point.x);
			this.y += (+point.y);

			return this;
		};

		this.subtract = function(point)
		{
			this.x -= (+point.x);
			this.y -= (+point.y);

			return this;
		};

		this.normalize = function(length)
		{
			length = (length != null) ? +length : 1;

			var norm = this.length();
			var scale = (norm > 0) ? (length / norm) : 0;

			this.x *= scale;
			this.y *= scale;

			return this;
		};

		this.length = function()
		{
			return Math.sqrt(this.x * this.x + this.y * this.y);
		};

		this.hasNaN = function()
		{
			return (isNaN(this.x) ||
			        isNaN(this.y));
		};

		this.hasInfinity = function()
		{
			return ((this.x == Infinity) || (this.x == -Infinity) ||
			        (this.y == Infinity) || (this.y == -Infinity));
		};

		this.isFinite = function()
		{
			return (((this.x - this.x) === 0) &&
			        ((this.y - this.y) === 0));
		};

		this.approxEquals = function(point, threshold)
		{
			return (NumberUtil.approxEqual(this.x, point.x, threshold) &&
			        NumberUtil.approxEqual(this.y, point.y, threshold));
		};

		this.equals = function(point)
		{
			return ((this.x == point.x) &&
			        (this.y == point.y));
		};

		this.clone = function()
		{
			return new Point(this.x, this.y);
		};

		this.toArray = function()
		{
			return [ +this.x, +this.y ];
		};

		this.toString = function()
		{
			return "(" + (+this.x) + "," + (+this.y) + ")";
		};

	});

});
