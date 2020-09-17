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

	return Class(module.id, Object, function(Outline, base)
	{

		// Private Static Constants

		var _R_PAREN_CONTENTS = /^\s*\(?([^\)]+)\)?\s*$/;

		// Public Static Methods

		Outline.interpolate = function(outline1, outline2, ratio)
		{
			var top = NumberUtil.interpolate(outline1.top, outline2.top, ratio);
			var right = NumberUtil.interpolate(outline1.right, outline2.right, ratio);
			var bottom = NumberUtil.interpolate(outline1.bottom, outline2.bottom, ratio);
			var left = NumberUtil.interpolate(outline1.left, outline2.left, ratio);

			return new Outline(top, right, bottom, left);
		};

		Outline.fromArray = function(arr)
		{
			var length = arr.length;
			var top = (length > 0) ? arr[0] : 0;
			var right = (length > 1) ? arr[1] : top;
			var bottom = (length > 2) ? arr[2] : top;
			var left = (length > 3) ? arr[3] : right;

			return new Outline(top, right, bottom, left);
		};

		Outline.fromString = function(str)
		{
			var match = ("" + str).match(_R_PAREN_CONTENTS);
			if (match)
				return Outline.fromArray(match[1].split(","));

			return new Outline();
		};

		// Public Properties

		this.top = 0;
		this.right = 0;
		this.bottom = 0;
		this.left = 0;

		// Constructor

		this.constructor = function(top, right, bottom, left)
		{
			this.top = (top != null) ? +top : 0;
			this.right = (right != null) ? +right : this.top;
			this.bottom = (bottom != null) ? +bottom : this.top;
			this.left = (left != null) ? +left : this.right;
		};

		// Public Methods

		this.hasNaN = function()
		{
			return (isNaN(this.top) ||
			        isNaN(this.right) ||
			        isNaN(this.bottom) ||
			        isNaN(this.left));
		};

		this.hasInfinity = function()
		{
			return ((this.top == Infinity) || (this.top == -Infinity) ||
			        (this.right == Infinity) || (this.right == -Infinity) ||
			        (this.bottom == Infinity) || (this.bottom == -Infinity) ||
			        (this.left == Infinity) || (this.left == -Infinity));
		};

		this.isFinite = function()
		{
			return (((this.top - this.top) === 0) &&
			        ((this.right - this.right) === 0) &&
			        ((this.bottom - this.bottom) === 0) &&
			        ((this.left - this.left) === 0));
		};

		this.approxEquals = function(outline, threshold)
		{
			return (NumberUtil.approxEqual(this.top, outline.top, threshold) &&
			        NumberUtil.approxEqual(this.right, outline.right, threshold) &&
			        NumberUtil.approxEqual(this.bottom, outline.bottom, threshold) &&
			        NumberUtil.approxEqual(this.left, outline.left, threshold));
		};

		this.equals = function(outline)
		{
			return ((this.top == outline.top) &&
			        (this.right == outline.right) &&
			        (this.bottom == outline.bottom) &&
			        (this.left == outline.left));
		};

		this.clone = function()
		{
			return new Outline(this.top, this.right, this.bottom, this.left);
		};

		this.toArray = function()
		{
			return new [ +this.top, +this.right, +this.bottom, +this.left ];
		};

		this.toString = function()
		{
			return "(" + (+this.top) + "," + (+this.right) + "," + (+this.bottom) + "," + (+this.left) + ")";
		};

	});

});
