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

	return Class(module.id, Object, function(Color, base)
	{

		// Private Static Constants

		var _R_COLOR = /^\s*(?:(?:(?:#|0x)([0-9A-F]*))|([^\(\)]+)|(?:(?:(?:rgba|(rgb))\s*)?\(([^\(\)]*)\)))\s*$/i;
		var _R_PERCENT = /([^%]*)%\s*$/;

		// Public Static Methods

		Color.interpolate = function(color1, color2, ratio)
		{
			var r = NumberUtil.interpolate(color1.r, color2.r, ratio);
			var g = NumberUtil.interpolate(color1.g, color2.g, ratio);
			var b = NumberUtil.interpolate(color1.b, color2.b, ratio);
			var a = NumberUtil.interpolate(color1.a, color2.a, ratio);

			return new Color(r, g, b, a).normalize();
		};

		Color.fromNumber = function(num)
		{
			num = +num;
			num = (num > 0x000000) ? Math.min(Math.floor(num), 0xFFFFFF) : 0x000000;

			var r = (num >> 16) & 0xFF;
			var g = (num >> 8) & 0xFF;
			var b = num & 0xFF;

			return new Color(r, g, b);
		};

		Color.fromArray = function(arr)
		{
			var length = arr.length;
			var r = (length > 0) ? arr[0] : 0;
			var g = (length > 1) ? arr[1] : 0;
			var b = (length > 2) ? arr[2] : 0;
			var a = (length > 3) ? arr[3] : 1;

			return new Color(r, g, b, a);
		};

		Color.fromString = function(str)
		{
			var match = ("" + str).match(_R_COLOR);
			if (!match)
				return new Color();

			// #RGB #RRGGBB 0xRGB 0xRRGGBB
			if (match[1] != null)
				return Color.fromNumber(_parseHex(match[1]));

			// R,G,B,A
			if (match[2] != null)
				return Color.fromArray(_parseRGBA(match[2]));

			// (R,G,B,A) rgba(R,G,B,A) rgb(R,G,B)
			if (match[4] != null)
				return Color.fromArray(_parseRGBA(match[4], (match[3] != null)));

			return new Color();
		};

		// Private Static Methods

		var _parseHex = function(str)
		{
			if (!str)
				return 0x000000;

			if (str.length === 3)
			{
				var rgb = str.split("");
				rgb[0] = rgb[0] + rgb[0];
				rgb[1] = rgb[1] + rgb[1];
				rgb[2] = rgb[2] + rgb[2];
				str = rgb.join("");
			}

			return parseInt(str, 16);
		};

		var _parseRGBA = function(str, ignoreAlpha)
		{
			var arr = str.split(",");
			var length = arr.length;
			var maxLength = (ignoreAlpha === true) ? 3 : 4;
			var match;

			if (length > maxLength)
			{
				arr.splice(maxLength, length - maxLength);
				length = maxLength;
			}

			for (var i = 0; i < length; i++)
			{
				str = arr[i];
				match = str.match(_R_PERCENT);
				if (match)
					arr[i] = (i < 3) ? Math.round(255 * (match[1] / 100)) : (match[1] / 100);
				else
					arr[i] = +str;
			}

			return arr;
		};

		// Public Properties

		this.r = 0;
		this.g = 0;
		this.b = 0;
		this.a = 1;

		// Constructor

		this.constructor = function(r, g, b, a)
		{
			this.r = (r != null) ? +r : 0;
			this.g = (g != null) ? +g : 0;
			this.b = (b != null) ? +b : 0;
			this.a = (a != null) ? +a : 1;
		};

		// Public Methods

		this.lighten = function(ratio)
		{
			ratio = Math.max(ratio, 0);

			var r = NumberUtil.interpolate(this.r, 255, ratio);
			var g = NumberUtil.interpolate(this.g, 255, ratio);
			var b = NumberUtil.interpolate(this.b, 255, ratio);

			this.r = (r > 0) ? Math.min(Math.round(r), 255) : 0;
			this.g = (g > 0) ? Math.min(Math.round(g), 255) : 0;
			this.b = (b > 0) ? Math.min(Math.round(b), 255) : 0;

			return this;
		};

		this.darken = function(ratio)
		{
			ratio = Math.max(ratio, 0);

			var r = NumberUtil.interpolate(this.r, 0, ratio);
			var g = NumberUtil.interpolate(this.g, 0, ratio);
			var b = NumberUtil.interpolate(this.b, 0, ratio);

			this.r = (r > 0) ? Math.min(Math.round(r), 255) : 0;
			this.g = (g > 0) ? Math.min(Math.round(g), 255) : 0;
			this.b = (b > 0) ? Math.min(Math.round(b), 255) : 0;

			return this;
		};

		this.invert = function()
		{
			var r = 255 - this.r;
			var g = 255 - this.g;
			var b = 255 - this.b;

			this.r = (r > 0) ? Math.min(Math.round(r), 255) : 0;
			this.g = (g > 0) ? Math.min(Math.round(g), 255) : 0;
			this.b = (b > 0) ? Math.min(Math.round(b), 255) : 0;

			return this;
		};

		this.normalize = function()
		{
			var r = +this.r;
			var g = +this.g;
			var b = +this.b;
			var a = +this.a;

			this.r = (r > 0) ? Math.min(Math.round(r), 255) : 0;
			this.g = (g > 0) ? Math.min(Math.round(g), 255) : 0;
			this.b = (b > 0) ? Math.min(Math.round(b), 255) : 0;
			this.a = (a > 0) ? Math.min(a, 1) : 0;

			return this;
		};

		this.hasNaN = function()
		{
			return (isNaN(this.r) ||
			        isNaN(this.g) ||
			        isNaN(this.b) ||
			        isNaN(this.a));
		};

		this.hasInfinity = function()
		{
			return ((this.r == Infinity) || (this.r == -Infinity) ||
			        (this.g == Infinity) || (this.g == -Infinity) ||
			        (this.b == Infinity) || (this.b == -Infinity) ||
			        (this.a == Infinity) || (this.a == -Infinity));
		};

		this.isFinite = function()
		{
			return (((this.r - this.r) === 0) &&
			        ((this.g - this.g) === 0) &&
			        ((this.b - this.b) === 0) &&
			        ((this.a - this.a) === 0));
		};

		this.approxEquals = function(color, threshold)
		{
			return (NumberUtil.approxEqual(this.r, color.r, threshold) &&
			        NumberUtil.approxEqual(this.g, color.g, threshold) &&
			        NumberUtil.approxEqual(this.b, color.b, threshold) &&
			        NumberUtil.approxEqual(this.a, color.a, threshold));
		};

		this.equals = function(color)
		{
			return ((this.r == color.r) &&
			        (this.g == color.g) &&
			        (this.b == color.b) &&
			        (this.a == color.a));
		};

		this.clone = function()
		{
			return new Color(this.r, this.g, this.b, this.a);
		};

		this.toNumber = function()
		{
			var r = +this.r;
			var g = +this.g;
			var b = +this.b;

			r = (r > 0) ? Math.min(Math.round(r), 255) : 0;
			g = (g > 0) ? Math.min(Math.round(g), 255) : 0;
			b = (b > 0) ? Math.min(Math.round(b), 255) : 0;

			return ((r << 16) | (g << 8) | b);
		};

		this.toArray = function(normalize)
		{
			var r = +this.r;
			var g = +this.g;
			var b = +this.b;
			var a = +this.a;

			if (normalize === true)
			{
				r = (r > 0) ? Math.min(Math.round(r), 255) : 0;
				g = (g > 0) ? Math.min(Math.round(g), 255) : 0;
				b = (b > 0) ? Math.min(Math.round(b), 255) : 0;
				a = (a > 0) ? Math.min(a, 1) : 0;
			}

			return [ r, g, b, a ];
		};

		this.toString = function(format, normalize)
		{
			if (format === "hex")
			{
				var hex = this.toNumber().toString(16).toUpperCase();
				for (var i = hex.length; i < 6; i++)
					hex = "0" + hex;
				return "#" + hex;
			}

			var r = +this.r;
			var g = +this.g;
			var b = +this.b;
			var a = +this.a;

			if ((format === true) || (normalize === true))
			{
				r = (r > 0) ? Math.min(Math.round(r), 255) : 0;
				g = (g > 0) ? Math.min(Math.round(g), 255) : 0;
				b = (b > 0) ? Math.min(Math.round(b), 255) : 0;
				a = (a > 0) ? Math.min(a, 1) : 0;
			}

			if (format === "rgba")
				return "rgba(" + r + "," + g + "," + b + "," + a + ")";

			if (format === "rgb")
				return "rgb(" + r + "," + g + "," + b + ")";

			return "(" + r + "," + g + "," + b + "," + a + ")";
		};

	});

});
