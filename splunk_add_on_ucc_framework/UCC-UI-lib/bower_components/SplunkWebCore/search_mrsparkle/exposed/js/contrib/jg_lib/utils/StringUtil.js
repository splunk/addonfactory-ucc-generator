/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Class = require("../Class");

	return Class(module.id, function(StringUtil)
	{

		// Private Static Constants

		var _R_TRIM = /^[\s\xA0\u2028\u2029\uFEFF]+|[\s\xA0\u2028\u2029\uFEFF]+$/g;
		var _R_UNESCAPE_HTML = /&(?:(#x[a-fA-F0-9]+)|(#[0-9]+)|([a-z]+));/g;
		var _R_UNESCAPE_JS = /\\(?:(u[a-fA-F0-9]{4})|(x[a-fA-F0-9]{2})|([1-7][0-7]{0,2}|[0-7]{2,3})|([\w\W]))/g;
		var _R_AMP = /&/g;
		var _R_LT = /</g;
		var _R_GT = />/g;
		var _R_QUOT = /"/g;
		var _R_APOS = /'/g;
		var _R_BACKSLASH = /\\/g;
		var _R_NEWLINE = /[\n]/g;
		var _R_RETURN = /[\r]/g;
		var _R_TAB = /[\t]/g;
		var _R_VTAB = /[\v]/g;
		var _R_FEED = /[\f]/g;
		var _R_BACKSPACE = /[\b]/g;
		var _R_LINESEP = /[\u2028]/g;
		var _R_PARASEP = /[\u2029]/g;

		var _UNESCAPE_HTML_MAP =
		{
			"amp": "&",
			"lt": "<",
			"gt": ">",
			"quot": "\"",
			"apos": "'",
			"nbsp": "\u00A0",
			"ensp": "\u2002",
			"emsp": "\u2003",
			"thinsp": "\u2009",
			"zwnj": "\u200C",
			"zwj": "\u200D",
			"lrm": "\u200E",
			"rlm": "\u200F"
		};

		var _UNESCAPE_JS_MAP =
		{
			"b": "\b",
			"f": "\f",
			"n": "\n",
			"r": "\r",
			"t": "\t",
			"v": "\v",
			"0": "\0"
		};

		// Public Static Methods

		StringUtil.trim = function(str)
		{
			if (str == null)
				return str;

			return ("" + str).replace(_R_TRIM, "");
		};

		StringUtil.escapeHTML = function(str)
		{
			if (str == null)
				return str;

			return ("" + str)
				.replace(_R_AMP, "&amp;")
				.replace(_R_LT, "&lt;")
				.replace(_R_GT, "&gt;")
				.replace(_R_QUOT, "&quot;")
				.replace(_R_APOS, "&#39;");
		};

		StringUtil.unescapeHTML = function(str)
		{
			if (str == null)
				return str;

			return ("" + str).replace(_R_UNESCAPE_HTML, function(match)
			{
				// named character escape
				var esc = arguments[3];
				if (esc)
					return _UNESCAPE_HTML_MAP.hasOwnProperty(esc) ? _UNESCAPE_HTML_MAP[esc] : match;

				// decimal escape code
				esc = arguments[2];
				if (esc)
					return StringUtil.fromCodePoint(parseInt(esc.substring(1), 10));

				// hex escape code
				esc = arguments[1];
				if (esc)
					return StringUtil.fromCodePoint(parseInt(esc.substring(2), 16));

				return match;
			});
		};

		StringUtil.escapeJS = function(str)
		{
			if (str == null)
				return str;

			return ("" + str)
				.replace(_R_BACKSLASH, "\\\\")
				.replace(_R_QUOT, "\\\"")
				.replace(_R_APOS, "\\'")
				.replace(_R_NEWLINE, "\\n")
				.replace(_R_RETURN, "\\r")
				.replace(_R_TAB, "\\t")
				.replace(_R_VTAB, "\\v")
				.replace(_R_FEED, "\\f")
				.replace(_R_BACKSPACE, "\\b")
				.replace(_R_LINESEP, "\\u2028")
				.replace(_R_PARASEP, "\\u2029");
		};

		StringUtil.unescapeJS = function(str)
		{
			if (str == null)
				return str;

			return ("" + str).replace(_R_UNESCAPE_JS, function(match)
			{
				// single character escape
				var esc = arguments[4];
				if (esc)
					return _UNESCAPE_JS_MAP.hasOwnProperty(esc) ? _UNESCAPE_JS_MAP[esc] : esc;

				// octal escape code
				esc = arguments[3];
				if (esc)
					return StringUtil.fromCodePoint(parseInt(esc, 8));

				// hex or unicode escape code
				esc = arguments[2] || arguments[1];
				if (esc)
					return StringUtil.fromCodePoint(parseInt(esc.substring(1), 16));

				return match;
			});
		};

		StringUtil.fromCodePoint = function(codePoint)
		{
			// algorithm borrowed from punycode.js by Mathias Bynens

			var str = "";

			for (var i = 0, l = arguments.length; i < l; i++)
			{
				codePoint = +arguments[i];
				if (codePoint > 0xFFFF)
				{
					codePoint -= 0x10000;
					str += String.fromCharCode(codePoint >>> 10 & 0x3FF | 0xD800);
					codePoint = 0xDC00 | codePoint & 0x3FF;
				}
				str += String.fromCharCode(codePoint);
			}

			return str;
		};

	});

});
