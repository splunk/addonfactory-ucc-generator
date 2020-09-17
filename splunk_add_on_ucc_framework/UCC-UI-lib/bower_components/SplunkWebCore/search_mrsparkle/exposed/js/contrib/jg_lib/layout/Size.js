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

	return Class(module.id, Object, function(Size, base)
	{

		// Private Static Constants

		var _R_PAREN_CONTENTS = /^\s*\(?([^\)]+)\)?\s*$/;

		// Public Static Methods

		Size.interpolate = function(size1, size2, ratio)
		{
			var width = NumberUtil.interpolate(size1.width, size2.width, ratio);
			var height = NumberUtil.interpolate(size1.height, size2.height, ratio);

			return new Size(width, height);
		};

		Size.fromArray = function(arr)
		{
			var length = arr.length;
			var width = (length > 0) ? arr[0] : 0;
			var height = (length > 1) ? arr[1] : 0;

			return new Size(width, height);
		};

		Size.fromString = function(str)
		{
			var match = ("" + str).match(_R_PAREN_CONTENTS);
			if (match)
				return Size.fromArray(match[1].split(","));

			return new Size();
		};

		// Public Properties

		this.width = 0;
		this.height = 0;

		// Constructor

		this.constructor = function(width, height)
		{
			this.width = (width != null) ? +width : 0;
			this.height = (height != null) ? +height : 0;
		};

		// Public Methods

		this.hasNaN = function()
		{
			return (isNaN(this.width) ||
			        isNaN(this.height));
		};

		this.hasInfinity = function()
		{
			return ((this.width == Infinity) || (this.width == -Infinity) ||
			        (this.height == Infinity) || (this.height == -Infinity));
		};

		this.isFinite = function()
		{
			return (((this.width - this.width) === 0) &&
			        ((this.height - this.height) === 0));
		};

		this.approxEquals = function(size, threshold)
		{
			return (NumberUtil.approxEqual(this.width, size.width, threshold) &&
			        NumberUtil.approxEqual(this.height, size.height, threshold));
		};

		this.equals = function(size)
		{
			return ((this.width == size.width) &&
			        (this.height == size.height));
		};

		this.clone = function()
		{
			return new Size(this.width, this.height);
		};

		this.toArray = function()
		{
			return [ +this.width, +this.height ];
		};

		this.toString = function()
		{
			return "(" + (+this.width) + "," + (+this.height) + ")";
		};

	});

});
