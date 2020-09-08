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
	var ErrorUtil = require("./utils/ErrorUtil");
	var Global = require("./utils/Global");
	var ObjectUtil = require("./utils/ObjectUtil");
	var StringUtil = require("./utils/StringUtil");
	var URL = require("./utils/URL");

	var _require = arguments[0];  // alias require to hide from webpack

	/**
	 * Portions adapted from the require-css plugin by Guy Bedford.
	 */
	return Class(module.id, Object, function(CSS, base)
	{

		Class.mixin(CSS, Text);

		// Private Static Constants

		var _R_EXT = /\.css$/i;
		var _R_QUALIFIED_URI = /^(\/|[^\:\/]*:|#)/;
		var _R_RELATIVE_URI = /^\.\.?(\/|$)/;
		var _R_XMLNS_URI = /\/\*$|^\*$/;
		var _R_SUBPATH = /(\/.*)?$/;
		var _R_ENDSLASH = /\/$/;
		var _R_URL = /url\s*\(\s*("([^"]*)"|'([^']*)'|[^\)]*)\s*\)/ig;
		var _R_IMPORT = /@import\s*("([^"]*)"|'([^']*)'|(url\s*\(\s*("([^"]*)"|'([^']*)'|[^\)]*)\s*\)))([^;]*);/ig;
		var _R_NAMESPACE = /@namespace\s+([^\s]+)\s+("([^"]*)"|'([^']*)'|(url\s*\(\s*("([^"]*)"|'([^']*)'|[^\)]*)\s*\)))[^;]*;\s*/ig;
		var _R_NAMESPACE_SELECTOR = /(\w+)\|(\w+)/g;
		var _R_CLASS_FORMAT = /[^\w]/g;
		var _R_SELECTOR_COUNT = /(\,[^\,\{\}]+[\,\{])|(\{)/g;

		// Private Static Properties

		var _moduleConfig = module.config ? module.config() : {};
		var _join = Array.prototype.join;
		var _head = null;
		var _style = null;
		var _styleSelectorCount = 0;

		// Public Static Methods

		CSS.resourceFormatName = function(name)
		{
			return name.replace(_R_EXT, "");
		};

		CSS.resourceFormatURL = function(url)
		{
			return url + ".css";
		};

		CSS.resourceParse = function(source, context, onComplete, onError)
		{
			var onPreprocessComplete = function(processedSource)
			{
				_resolveNamespaces(processedSource, context, onNamespacesResolved, onError);
			};

			var onNamespacesResolved = function(resolvedSource)
			{
				_resolveImports(resolvedSource, context, onImportsResolved, onError);
			};

			var onImportsResolved = function(resolvedSource)
			{
				onComplete(new CSS(StringUtil.trim(resolvedSource), context.name, true));
			};

			this.resourcePreprocess(source, context, onPreprocessComplete, onError);
		};

		CSS.resourceCompile = function(source, context, onComplete, onError)
		{
			var onPreprocessComplete = function(processedSource)
			{
				_resolveNamespaces(processedSource, context, onNamespacesResolved, onError);
			};

			var onNamespacesResolved = function(resolvedSource)
			{
				_resolveImports(resolvedSource, context, onImportsResolved, onError);
			};

			var onImportsResolved = function(resolvedSource)
			{
				try
				{
					if (_moduleConfig.compress)
						_moduleConfig.compress(resolvedSource, onSourceCompressed, onError);
					else
						_compressSource(resolvedSource, onSourceCompressed, onError);
				}
				catch (e)
				{
					onError(e);
				}
			};

			var onSourceCompressed = function(compressedSource)
			{
				compressedSource = StringUtil.escapeJS(StringUtil.trim(compressedSource));

				var pluginName = StringUtil.escapeJS(module.id);
				var resourceName = StringUtil.escapeJS(context.name);

				var compiledSource = "";
				compiledSource += "define(function(require) {\n";
				compiledSource += "\n";
				compiledSource += "\tvar CSS = require(\"" + pluginName + "\");\n";
				compiledSource += "\n";
				compiledSource += "\treturn new CSS(\"" + compressedSource + "\", \"" + resourceName + "\");\n";
				compiledSource += "\n";
				compiledSource += "});\n";

				onComplete(compiledSource);
			};

			this.resourcePreprocess(source, context, onPreprocessComplete, onError);
		};

		CSS.resourcePreprocess = function(source, context, onComplete, onError)
		{
			onComplete(source);
		};

		CSS.formatClassName = function(className)
		{
			className = _join.call(arguments, "-");
			return className.replace(_R_CLASS_FORMAT, "-");
		};

		// Private Static Methods

		var _resolveNamespaces = function(source, context, onComplete, onError)
		{
			var onNamespacesLoaded = function()
			{
				var namespaceMap = context.namespaceMap;

				source = source.replace(_R_NAMESPACE_SELECTOR, function(match)
				{
					var prefix = arguments[1];
					var ns = ObjectUtil.get(namespaceMap, prefix);
					if (!ns)
						return match;

					var name = arguments[2];
					var uri = ns.uri;
					var map = ns.map;
					var path;

					if (map)
					{
						path = ObjectUtil.get(map, name);
						if (!path || _R_QUALIFIED_URI.test(path))
							path = uri.substring(0, uri.length - 1) + name;
						else if (_R_RELATIVE_URI.test(path))
							path = _absoluteModuleName(path, uri);
					}
					else
					{
						path = uri ? (uri + "/" + name) : name;
					}

					return "." + CSS.formatClassName(path);
				});

				onComplete(source);
			};

			source = _extractNamespaces(source, context);

			_loadNamespaces(context.namespaceList, onNamespacesLoaded, onError);
		};

		var _extractNamespaces = function(source, context)
		{
			var namespaceList = context.namespaceList = [];
			var namespaceMap = context.namespaceMap = {};
			var resourceName = context.name;

			return source.replace(_R_NAMESPACE, function(match)
			{
				var uri = StringUtil.trim(arguments[3] || arguments[4] || arguments[7] || arguments[8] || arguments[6]);
				if (!uri || _R_QUALIFIED_URI.test(uri))
					return match;

				if (_R_RELATIVE_URI.test(uri))
					uri = _absoluteModuleName(uri, resourceName);

				uri = uri.replace(_R_ENDSLASH, "");

				var prefix = arguments[1];
				var ns = { prefix: prefix, uri: uri, map: null };

				namespaceList.push(ns);
				namespaceMap[prefix] = ns;

				return "";
			});
		};

		var _loadNamespaces = function(namespaceList, onLoad, onError)
		{
			var jsonPluginName = module.id.replace(/CSS$/, "JSON");
			var pathList = [];
			var refList = [];
			var ns;
			var uri;
			var path;

			var onNamespacesLoaded = function()
			{
				for (var i = 0, l = arguments.length; i < l; i++)
					refList[i].map = arguments[i] || {};

				onLoad();
			};

			for (var i = 0, l = namespaceList.length; i < l; i++)
			{
				ns = namespaceList[i];
				uri = ns.uri;
				if (_R_XMLNS_URI.test(uri))
				{
					path = uri.substring(0, uri.length - 1) + "xmlns";
					pathList.push(jsonPluginName + "!" + path);
					refList.push(ns);
				}
			}

			if (pathList.length > 0)
				_require(pathList, onNamespacesLoaded, onError);
			else
				onLoad();
		};

		var _resolveImports = function(source, context, onComplete, onError)
		{
			var onImportsLoaded = function()
			{
				var importList = context.importList;
				var importInfo;
				var importSource;

				for (var i = importList.length - 1; i >= 0; i--)
				{
					importInfo = importList[i];
					importSource = _relativeURLs(importInfo.css.source(), context.url);
					if (importInfo.media && importSource)
						importSource = "@media " + importInfo.media + " {\n" + importSource + "\n}";

					source = source.substring(0, importInfo.startIndex) + importSource + source.substring(importInfo.endIndex);
				}

				onComplete(source);
			};

			_extractImports(source, context);

			_loadImports(context.importList, onImportsLoaded, onError);
		};

		var _extractImports = function(source, context)
		{
			var importList = context.importList = [];
			var resourceName = context.name;
			var match;
			var url;
			var media;
			var startIndex;
			var endIndex;

			while (match = _R_IMPORT.exec(source))
			{
				url = StringUtil.trim(match[2] || match[3] || match[6] || match[7] || match[5]);
				if (!url)
					continue;

				url = _absoluteModuleName(url, resourceName);
				media = StringUtil.trim(match[8]);
				endIndex = _R_IMPORT.lastIndex;
				startIndex = endIndex - match[0].length;

				importList.push({ url: url, media: media, startIndex: startIndex, endIndex: endIndex, css: null });
			}
		};

		var _loadImports = function(importList, onLoad, onError)
		{
			var cssPluginName = module.id;
			var pathList = [];

			var onImportsLoaded = function()
			{
				for (var i = 0, l = arguments.length; i < l; i++)
					importList[i].css = arguments[i];

				onLoad();
			};

			for (var i = 0, l = importList.length; i < l; i++)
				pathList.push(cssPluginName + "!" + importList[i].url);

			if (pathList.length > 0)
				_require(pathList, onImportsLoaded, onError);
			else
				onLoad();
		};

		var _compressSource = function(source, onComplete, onError)
		{
			if (Global.process && Global.process.versions && !!Global.process.versions.node && requirejs.nodeRequire)
			{
				var csso;

				try
				{
					csso = requirejs.nodeRequire("csso");
				}
				catch (e)
				{
					_logOnce("CSS compression module not installed. Use \"npm install csso -g\" to enable. " +
					         "Or use require.config to setup a custom \"compress\" function for the module \"" + module.id + "\".");

					onComplete(source);
					return;
				}

				try
				{
					onComplete(csso.justDoIt(source));
				}
				catch (e)
				{
					onError(e);
				}
			}
			else
			{
				_logOnce("CSS compression not supported. Use require.config to setup a custom \"compress\" function for the module \"" + module.id + "\".");

				onComplete(source);
			}
		};

		var _absoluteModuleName = function(moduleName, baseModuleName)
		{
			moduleName = new URL(moduleName).absolute(baseModuleName).toString();
			if (_R_RELATIVE_URI.test(moduleName) && !_R_RELATIVE_URI.test(baseModuleName))
				moduleName = new URL(baseModuleName.replace(_R_SUBPATH, "/../" + moduleName)).toString();
			return moduleName;
		};

		var _absoluteURLs = function(source, baseURL)
		{
			baseURL = new URL(baseURL);

			return source.replace(_R_URL, function(match)
			{
				var url = StringUtil.trim(arguments[2] || arguments[3] || arguments[1]);
				if (!url)
					return match;

				var normalizedURL = new URL(url).absolute(baseURL).toString();
				if (normalizedURL === url)
					return match;

				return match.substring(0, 3) + match.substring(3).replace(url, normalizedURL);
			});
		};

		var _relativeURLs = function(source, baseURL)
		{
			baseURL = new URL(baseURL);

			return source.replace(_R_URL, function(match)
			{
				var url = StringUtil.trim(arguments[2] || arguments[3] || arguments[1]);
				if (!url)
					return match;

				var normalizedURL = new URL(url).relative(baseURL).toString();
				if (normalizedURL === url)
					return match;

				return match.substring(0, 3) + match.substring(3).replace(url, normalizedURL);
			});
		};

		var _countSelectors = function(source)
		{
			var count = 0;
			var match;
			while (match = _R_SELECTOR_COUNT.exec(source))
				count += match[1] ? 2 : 1;
			return count;
		};

		var _logOnce = function(message)
		{
			if (Global.console && Global.console.log)
				Global.console.log(message);
			_logOnce = function(){};
		};

		// Private Properties

		this._source = null;
		this._path = null;
		this._insertLabel = false;
		this._isInjected = false;

		// Constructor

		this.constructor = function(source, path, insertLabel)
		{
			if (source == null)
				throw new Error("Parameter source must be non-null.");
			if (!Class.isString(source))
				throw new Error("Parameter source must be of type String.");
			if ((path != null) && !Class.isString(path))
				throw new Error("Parameter path must be of type String.");

			if (path)
				source = _absoluteURLs(source, _require.toUrl(path + ".css"));

			this._source = source;
			this._path = path || "";
			this._insertLabel = (insertLabel === true);
		};

		// Public Accessor Methods

		this.source = function()
		{
			return this._source;
		};

		this.path = function()
		{
			return this._path;
		};

		// Public Methods

		this.inject = function()
		{
			if (this._isInjected)
				return this;

			this._isInjected = true;

			var source = this._source;
			if (!source)
				return this;

			var selectorCount = _countSelectors(source);

			if (!_style || ((_styleSelectorCount > 0) && ((_styleSelectorCount + selectorCount) > 4095)))
			{
				_styleSelectorCount = 0;

				_style = Global.document.createElement("style");
				_style.type = "text/css";

				if (!_head)
					_head = Global.document.getElementsByTagName("head")[0];
				_head.appendChild(_style);
			}

			try
			{
				if (this._insertLabel && this._path)
					source = "/* injected: " + this._path.replace("*/", "*\\/") + " */\n\n" + source + "\n\n";
				else
					source += "\n";

				if (_style.styleSheet)
					_style.styleSheet.cssText += source;
				else
					_style.appendChild(Global.document.createTextNode(source));

				_styleSelectorCount += selectorCount;
			}
			catch (e)
			{
				if (this._path)
					ErrorUtil.nonBlockingThrow(new Error("Failed to inject CSS resource \"" + this._path + "\". Style sheet limit may have been reached for this client."));
				else
					ErrorUtil.nonBlockingThrow(new Error("Failed to inject CSS. Style sheet limit may have been reached for this client."));
			}

			return this;
		};

	});

});
