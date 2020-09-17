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

	return Class(module.id, Object, function(Matrix, base)
	{

		// Private Static Constants

		var _R_PAREN_CONTENTS = /^\s*\(?([^\)]+)\)?\s*$/;

		// Public Static Methods

		Matrix.interpolate = function(matrix1, matrix2, ratio)
		{
			var a = NumberUtil.interpolate(matrix1.a, matrix2.a, ratio);
			var b = NumberUtil.interpolate(matrix1.b, matrix2.b, ratio);
			var c = NumberUtil.interpolate(matrix1.c, matrix2.c, ratio);
			var d = NumberUtil.interpolate(matrix1.d, matrix2.d, ratio);
			var tx = NumberUtil.interpolate(matrix1.tx, matrix2.tx, ratio);
			var ty = NumberUtil.interpolate(matrix1.ty, matrix2.ty, ratio);

			return new Matrix(a, b, c, d, tx, ty);
		};

		Matrix.fromArray = function(arr)
		{
			var length = arr.length;
			var a = (length > 0) ? arr[0] : 1;
			var b = (length > 1) ? arr[1] : 0;
			var c = (length > 2) ? arr[2] : 0;
			var d = (length > 3) ? arr[3] : 1;
			var tx = (length > 4) ? arr[4] : 0;
			var ty = (length > 5) ? arr[5] : 0;

			return new Matrix(a, b, c, d, tx, ty);
		};

		Matrix.fromString = function(str)
		{
			var match = ("" + str).match(_R_PAREN_CONTENTS);
			if (match)
				return Matrix.fromArray(match[1].split(","));

			return new Matrix();
		};

		// Public Properties

		this.a = 1;
		this.b = 0;
		this.c = 0;
		this.d = 1;
		this.tx = 0;
		this.ty = 0;

		// Constructor

		this.constructor = function(a, b, c, d, tx, ty)
		{
			this.a = (a != null) ? +a : 1;
			this.b = (b != null) ? +b : 0;
			this.c = (c != null) ? +c : 0;
			this.d = (d != null) ? +d : 1;
			this.tx = (tx != null) ? +tx : 0;
			this.ty = (ty != null) ? +ty : 0;
		};

		// Public Methods

		this.translate = function(dx, dy)
		{
			this.tx += (+dx);
			this.ty += (+dy);

			return this;
		};

		this.scale = function(scaleX, scaleY)
		{
			if (scaleY == null)
				scaleY = scaleX;

			this.a *= scaleX;
			this.b *= scaleY;
			this.c *= scaleX;
			this.d *= scaleY;
			this.tx *= scaleX;
			this.ty *= scaleY;

			return this;
		};

		this.rotate = function(angle)
		{
			angle = (angle / 180) * Math.PI;

			var cosAngle = Math.cos(angle);
			var sinAngle = Math.sin(angle);
			var a = this.a;
			var b = this.b;
			var c = this.c;
			var d = this.d;
			var tx = this.tx;
			var ty = this.ty;

			this.a = a * cosAngle - b * sinAngle;
			this.b = b * cosAngle + a * sinAngle;
			this.c = c * cosAngle - d * sinAngle;
			this.d = d * cosAngle + c * sinAngle;
			this.tx = tx * cosAngle - ty * sinAngle;
			this.ty = ty * cosAngle + tx * sinAngle;

			return this;
		};

		this.skew = function(skewX, skewY)
		{
			skewX = (skewX / 180) * Math.PI;
			skewY = (skewY / 180) * Math.PI;

			var tanSkewX = Math.tan(skewX);
			var tanSkewY = Math.tan(skewY);
			var a = this.a;
			var b = this.b;
			var c = this.c;
			var d = this.d;
			var tx = this.tx;
			var ty = this.ty;

			this.a = +a + b * tanSkewX;
			this.b = +b + a * tanSkewY;
			this.c = +c + d * tanSkewX;
			this.d = +d + c * tanSkewY;
			this.tx = +tx + ty * tanSkewX;
			this.ty = +ty + tx * tanSkewY;

			return this;
		};

		this.concat = function(matrix)
		{
			var a1 = this.a;
			var b1 = this.b;
			var c1 = this.c;
			var d1 = this.d;
			var tx1 = this.tx;
			var ty1 = this.ty;

			var a2 = matrix.a;
			var b2 = matrix.b;
			var c2 = matrix.c;
			var d2 = matrix.d;
			var tx2 = matrix.tx;
			var ty2 = matrix.ty;

			this.a = a1 * a2 + b1 * c2;
			this.b = b1 * d2 + a1 * b2;
			this.c = c1 * a2 + d1 * c2;
			this.d = d1 * d2 + c1 * b2;
			this.tx = tx1 * a2 + ty1 * c2 + (+tx2);
			this.ty = ty1 * d2 + tx1 * b2 + (+ty2);

			return this;
		};

		this.invert = function()
		{
			var det = this.determinant();
			var a = this.a / det;
			var b = this.b / det;
			var c = this.c / det;
			var d = this.d / det;
			var tx = this.tx;
			var ty = this.ty;

			this.a = d;
			this.b = -b;
			this.c = -c;
			this.d = a;
			this.tx = c * ty - d * tx;
			this.ty = b * tx - a * ty;

			return this;
		};

		this.identity = function()
		{
			this.a = 1;
			this.b = 0;
			this.c = 0;
			this.d = 1;
			this.tx = 0;
			this.ty = 0;

			return this;
		};

		this.determinant = function()
		{
			return (this.a * this.d) - (this.b * this.c);
		};

		this.hasInverse = function()
		{
			var det = Math.abs(this.determinant());

			return ((det > 0) && (det < Infinity));
		};

		this.hasNaN = function()
		{
			return (isNaN(this.a) ||
			        isNaN(this.b) ||
			        isNaN(this.c) ||
			        isNaN(this.d) ||
			        isNaN(this.tx) ||
			        isNaN(this.ty));
		};

		this.hasInfinity = function()
		{
			return ((this.a == Infinity) || (this.a == -Infinity) ||
			        (this.b == Infinity) || (this.b == -Infinity) ||
			        (this.c == Infinity) || (this.c == -Infinity) ||
			        (this.d == Infinity) || (this.d == -Infinity) ||
			        (this.tx == Infinity) || (this.tx == -Infinity) ||
			        (this.ty == Infinity) || (this.ty == -Infinity));
		};

		this.isFinite = function()
		{
			return (((this.a - this.a) === 0) &&
			        ((this.b - this.b) === 0) &&
			        ((this.c - this.c) === 0) &&
			        ((this.d - this.d) === 0) &&
			        ((this.tx - this.tx) === 0) &&
			        ((this.ty - this.ty) === 0));
		};

		this.isIdentity = function()
		{
			return ((this.a == 1) &&
			        (this.b == 0) &&
			        (this.c == 0) &&
			        (this.d == 1) &&
			        (this.tx == 0) &&
			        (this.ty == 0));
		};

		this.approxEquals = function(matrix, threshold)
		{
			return (NumberUtil.approxEqual(this.a, matrix.a, threshold) &&
			        NumberUtil.approxEqual(this.b, matrix.b, threshold) &&
			        NumberUtil.approxEqual(this.c, matrix.c, threshold) &&
			        NumberUtil.approxEqual(this.d, matrix.d, threshold) &&
			        NumberUtil.approxEqual(this.tx, matrix.tx, threshold) &&
			        NumberUtil.approxEqual(this.ty, matrix.ty, threshold));
		};

		this.equals = function(matrix)
		{
			return ((this.a == matrix.a) &&
			        (this.b == matrix.b) &&
			        (this.c == matrix.c) &&
			        (this.d == matrix.d) &&
			        (this.tx == matrix.tx) &&
			        (this.ty == matrix.ty));
		};

		this.clone = function()
		{
			return new Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty);
		};

		this.toArray = function()
		{
			return [ +this.a, +this.b, +this.c, +this.d, +this.tx, +this.ty ];
		};

		this.toString = function()
		{
			return "(" + (+this.a) + "," + (+this.b) + "," + (+this.c) + "," + (+this.d) + "," + (+this.tx) + "," + (+this.ty) + ")";
		};

	});

});
