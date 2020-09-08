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

	return Class(module.id, Object, function(Rectangle, base)
	{

		// Private Static Constants

		var _R_PAREN_CONTENTS = /^\s*\(?([^\)]+)\)?\s*$/;

		// Public Static Methods

		Rectangle.interpolate = function(rectangle1, rectangle2, ratio)
		{
			var x = NumberUtil.interpolate(rectangle1.x, rectangle2.x, ratio);
			var y = NumberUtil.interpolate(rectangle1.y, rectangle2.y, ratio);
			var width = NumberUtil.interpolate(rectangle1.width, rectangle2.width, ratio);
			var height = NumberUtil.interpolate(rectangle1.height, rectangle2.height, ratio);

			return new Rectangle(x, y, width, height);
		};

		Rectangle.fromArray = function(arr)
		{
			var length = arr.length;
			var x = (length > 0) ? arr[0] : 0;
			var y = (length > 1) ? arr[1] : 0;
			var width = (length > 2) ? arr[2] : 0;
			var height = (length > 3) ? arr[3] : 0;

			return new Rectangle(x, y, width, height);
		};

		Rectangle.fromString = function(str)
		{
			var match = ("" + str).match(_R_PAREN_CONTENTS);
			if (match)
				return Rectangle.fromArray(match[1].split(","));

			return new Rectangle();
		};

		// Public Properties

		this.x = 0;
		this.y = 0;
		this.width = 0;
		this.height = 0;

		// Constructor

		this.constructor = function(x, y, width, height)
		{
			this.x = (x != null) ? +x : 0;
			this.y = (y != null) ? +y : 0;
			this.width = (width != null) ? +width : 0;
			this.height = (height != null) ? +height : 0;
		};

		// Public Methods

		this.hasNaN = function()
		{
			return (isNaN(this.x) ||
			        isNaN(this.y) ||
			        isNaN(this.width) ||
			        isNaN(this.height));
		};

		this.hasInfinity = function()
		{
			return ((this.x == Infinity) || (this.x == -Infinity) ||
			        (this.y == Infinity) || (this.y == -Infinity) ||
			        (this.width == Infinity) || (this.width == -Infinity) ||
			        (this.height == Infinity) || (this.height == -Infinity));
		};

		this.isFinite = function()
		{
			return (((this.x - this.x) === 0) &&
			        ((this.y - this.y) === 0) &&
			        ((this.width - this.width) === 0) &&
			        ((this.height - this.height) === 0));
		};

		this.approxEquals = function(rectangle, threshold)
		{
			return (NumberUtil.approxEqual(this.x, rectangle.x, threshold) &&
			        NumberUtil.approxEqual(this.y, rectangle.y, threshold) &&
			        NumberUtil.approxEqual(this.width, rectangle.width, threshold) &&
			        NumberUtil.approxEqual(this.height, rectangle.height, threshold));
		};

		this.equals = function(rectangle)
		{
			return ((this.x == rectangle.x) &&
			        (this.y == rectangle.y) &&
			        (this.width == rectangle.width) &&
			        (this.height == rectangle.height));
		};

		this.clone = function()
		{
			return new Rectangle(this.x, this.y, this.width, this.height);
		};

		this.toArray = function()
		{
			return [ +this.x, +this.y, +this.width, +this.height ];
		};

		this.toString = function()
		{
			return "(" + (+this.x) + "," + (+this.y) + "," + (+this.width) + "," + (+this.height) + ")";
		};

	});

});
