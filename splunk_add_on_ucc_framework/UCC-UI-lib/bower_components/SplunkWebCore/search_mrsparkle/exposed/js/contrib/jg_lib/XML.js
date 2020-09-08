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

	return Class(module.id, function(XML)
	{

		Class.mixin(XML, Text);

		// Private Static Constants

		var _R_EXT = /\.xml$/i;

		// Public Static Methods

		XML.resourceFormatName = function(name)
		{
			return name.replace(_R_EXT, "");
		};

		XML.resourceFormatURL = function(url)
		{
			return url + ".xml";
		};

		XML.resourceParse = function(source, context, onComplete, onError)
		{
			onComplete(XML.parse(source));
		};

		XML.resourceCompile = function(source, context, onComplete, onError)
		{
			var compiledSource = "";
			compiledSource += "define(function(require) {\n";
			compiledSource += "\n";
			compiledSource += "\tvar XML = require(\"" + StringUtil.escapeJS(module.id) + "\");\n";
			compiledSource += "\n";
			compiledSource += "\treturn XML.parse(\"" + StringUtil.escapeJS(source) + "\");\n";
			compiledSource += "\n";
			compiledSource += "});\n";

			onComplete(compiledSource);
		};

		XML.parse = function(text)
		{
			// borrowed from jQuery's parseXML method

			if (text == null)
				return null;
			if (!Class.isString(text))
				throw new Error("Parameter text must be of type String.");

			var xml, tmp;

			try
			{
				if (Global.DOMParser)
				{
					tmp = new Global.DOMParser();
					xml = tmp.parseFromString(text , "text/xml");
				}
				else if (Global.ActiveXObject)
				{
					xml = new Global.ActiveXObject("Microsoft.XMLDOM");
					xml.async = "false";
					xml.loadXML(text);
				}
			}
			catch (e)
			{
				xml = null;
			}

			if (!xml || !xml.documentElement || xml.getElementsByTagName("parsererror").length)
				throw new Error("Invalid XML: " + text);

			return xml;
		};

	});

});
