/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Class = require("./Class");
	var Global = require("./utils/Global");
	var StringUtil = require("./utils/StringUtil");
	var TrieMap = require("./utils/TrieMap");
	var URL = require("./utils/URL");

	/**
	 * Portions adapted from the text plugin by James Burke.
	 */
	return Class(module.id, function(Text)
	{

		// Private Static Constants

		var _R_ABSOLUTE_URL = /^(?:[^\:\/]+:\/)?\//;
		var _R_NEWLINE = /\r\n|\r/g;

		// Private Static Properties

		var _moduleConfig = module.config ? module.config() : {};
		var _buildMap = new TrieMap();

		// Public Static Methods

		Text.normalize = function(resourceName, normalize)
		{
			return normalize(this.resourceFormatName(resourceName));
		};

		Text.load = function(resourceName, parentRequire, onLoad, config)
		{
			if (config.isBuild && _R_ABSOLUTE_URL.test(resourceName))
			{
				onLoad();
				return;
			}

			var url = new URL(parentRequire.toUrl(this.resourceFormatURL(resourceName))).toString();
			var self = this;

			var context =
			{
				name: resourceName,
				url: url,
				parentRequire: parentRequire,
				config: config
			};

			var onSourceLoaded = function(source)
			{
				try
				{
					source = source.replace(_R_NEWLINE, "\n");
					if (!config.isBuild)
						self.resourceParse(source, context, onResourceParsed, onError);
					else
						self.resourceCompile(source, context, onResourceCompiled, onError);
				}
				catch (e)
				{
					onError(e);
				}
			};

			var onResourceParsed = function(resource)
			{
				onLoad(resource);
			};

			var onResourceCompiled = function(compiledSource)
			{
				_buildMap.set([self.resourceCompile, resourceName], compiledSource);

				onLoad();
			};

			var onError = function(e)
			{
				onLoad.error(e);
			};

			try
			{
				if (_moduleConfig.load)
					_moduleConfig.load(url, onSourceLoaded, onError);
				else
					_loadSource(url, onSourceLoaded, onError);
			}
			catch (e)
			{
				onError(e);
			}
		};

		Text.write = function(pluginName, resourceName, write)
		{
			var compiledSource = _buildMap.get([this.resourceCompile, resourceName]);
			if (!compiledSource)
				return;

			write.asModule(pluginName + "!" + resourceName, compiledSource);
		};

		Text.resourceFormatName = function(name)
		{
			return name;
		};

		Text.resourceFormatURL = function(url)
		{
			return url;
		};

		Text.resourceParse = function(source, context, onComplete, onError)
		{
			onComplete(source);
		};

		Text.resourceCompile = function(source, context, onComplete, onError)
		{
			var compiledSource = "";
			compiledSource += "define(function() {\n";
			compiledSource += "\n";
			compiledSource += "\treturn \"" + StringUtil.escapeJS(source) + "\";\n";
			compiledSource += "\n";
			compiledSource += "});\n";

			onComplete(compiledSource);
		};

		// Private Static Methods

		var _loadSource = function(url, onLoad, onError)
		{
			if (Global.window)
				_loadSource = _loadSourceXHR;
			else if (Global.process && Global.process.versions && !!Global.process.versions.node && requirejs.nodeRequire)
				_loadSource = _loadSourceNode;
			else if (Global.Packages && Global.java)
				_loadSource = _loadSourceRhino;
			else
				_loadSource = _loadSourceUnsupported;

			_loadSource(url, onLoad, onError);
		};

		var _loadSourceXHR = function(url, onLoad, onError)
		{
			var xhr = _createXHR();
			xhr.open("GET", url, true);

			xhr.onreadystatechange = function()
			{
				try
				{
					if (xhr.readyState !== 4)
						return;

					var status = xhr.status;
					if ((status >= 400) && (status < 600))
					{
						onError(new Error("HTTP " + status + ": " + url));
						return;
					}

					onLoad(xhr.responseText);
				}
				catch (e)
				{
					onError(e);
				}
			};

			xhr.send(null);
		};

		var _loadSourceNode = function(url, onLoad, onError)
		{
			var fs = requirejs.nodeRequire("fs");
			var source = fs.readFileSync(url, "utf8");

			// remove BOM (Byte Order Mark) from UTF-8 files
			if (source && (source.charAt(0) === "\uFEFF"))
				source = source.substring(1);

			onLoad(source);
		};

		var _loadSourceRhino = function(url, onLoad, onError)
		{
			var source = "";

			var java = Global.java;
			var file = new java.io.File(url);
			var input = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file), "utf-8"));

			try
			{
				var line = input.readLine();
				if (line != null)
				{
					var stringBuffer = new java.lang.StringBuffer();
					var lineSeparator = java.lang.System.getProperty("line.separator");

					// remove BOM (Byte Order Mark) from UTF-8 files
					if (line.length() && (line.charAt(0) === 0xFEFF))
						line = line.substring(1);

					stringBuffer.append(line);

					while ((line = input.readLine()) != null)
					{
						stringBuffer.append(lineSeparator);
						stringBuffer.append(line);
					}

					// make sure we return a JavaScript string and not a Java string
					source = String(stringBuffer.toString());
				}
			}
			finally
			{
				input.close();
			}

			onLoad(source);
		};

		var _loadSourceUnsupported = function(url, onLoad, onError)
		{
			throw new Error("Environment not supported. Use require.config to setup a custom \"load\" function for the module \"" + module.id + "\".");
		};

		var _createXHR = function()
		{
			if (_createMicrosoftXMLHTTP())
				_createXHR = _createMicrosoftXMLHTTP;
			else if (_createMsxml2XMLHTTP())
				_createXHR = _createMsxml2XMLHTTP;
			else if (_createMsxml2XMLHTTP40())
				_createXHR = _createMsxml2XMLHTTP40;
			else if (_createXMLHttpRequest())
				_createXHR = _createXMLHttpRequest;
			else
				_createXHR = _createXHRUnsupported;

			return _createXHR();
		};

		var _createXMLHttpRequest = function()
		{
			try { return new Global.XMLHttpRequest(); } catch (e) { return null; }
		};

		var _createMicrosoftXMLHTTP = function()
		{
			try { return new Global.ActiveXObject("Microsoft.XMLHTTP"); } catch (e) { return null; }
		};

		var _createMsxml2XMLHTTP = function()
		{
			try { return new Global.ActiveXObject("Msxml2.XMLHTTP"); } catch (e) { return null; }
		};

		var _createMsxml2XMLHTTP40 = function()
		{
			try { return new Global.ActiveXObject("Msxml2.XMLHTTP.4.0"); } catch (e) { return null; }
		};

		var _createXHRUnsupported = function()
		{
			throw new Error("XMLHttpRequest not supported. Use require.config to setup a custom \"load\" function for the module \"" + module.id + "\".");
		};

	});

});
