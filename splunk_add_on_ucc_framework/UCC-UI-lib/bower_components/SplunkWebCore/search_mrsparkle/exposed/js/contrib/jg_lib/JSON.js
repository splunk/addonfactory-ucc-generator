/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Class = require("./Class");
	var Text = require("./Text");
	var Global = require("./utils/Global");
	var StringUtil = require("./utils/StringUtil");

	return Class(module.id, function(JSON)
	{

		Class.mixin(JSON, Text);

		// Private Static Constants

		var _R_EXT = /\.json$/i;
		var _R_VALID_CHARS = /^[\],:{}\s]*$/;
		var _R_VALID_BRACES = /(?:^|:|,)(?:\s*\[)+/g;
		var _R_VALID_ESCAPE = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g;
		var _R_VALID_TOKENS = /"[^"\\\r\n]*"|true|false|null|-?(?:\d\d*\.|)\d+(?:[eE][\-+]?\d+|)/g;

		// Public Static Methods

		JSON.resourceFormatName = function(name)
		{
			return name.replace(_R_EXT, "");
		};

		JSON.resourceFormatURL = function(url)
		{
			return url + ".json";
		};

		JSON.resourceParse = function(source, context, onComplete, onError)
		{
			onComplete(JSON.parse(source));
		};

		JSON.resourceCompile = function(source, context, onComplete, onError)
		{
			var compiledSource = "";
			compiledSource += "define(function(require) {\n";
			compiledSource += "\n";
			compiledSource += "\tvar JSON = require(\"" + StringUtil.escapeJS(module.id) + "\");\n";
			compiledSource += "\n";
			compiledSource += "\treturn JSON.parse(\"" + StringUtil.escapeJS(source) + "\");\n";
			compiledSource += "\n";
			compiledSource += "});\n";

			onComplete(compiledSource);
		};

		JSON.parse = function(text)
		{
			// borrowed from jQuery's parseJSON method

			if (text == null)
				return null;
			if (!Class.isString(text))
				throw new Error("Parameter text must be of type String.");

			// make sure leading/trailing whitespace is removed (IE can't handle it)
			text = StringUtil.trim(text);

			// attempt to parse using the native JSON parser first
			if (Global.JSON && Global.JSON.parse)
				return Global.JSON.parse(text);

			// make sure the incoming text is actual JSON
			// logic borrowed from http://json.org/json2.js
			if (_R_VALID_CHARS.test(text.replace(_R_VALID_ESCAPE, "@").replace(_R_VALID_TOKENS, "]").replace(_R_VALID_BRACES, "")))
				return (new Function("return " + text))();

			throw new Error("Invalid JSON: " + text);
		};

	});

});
