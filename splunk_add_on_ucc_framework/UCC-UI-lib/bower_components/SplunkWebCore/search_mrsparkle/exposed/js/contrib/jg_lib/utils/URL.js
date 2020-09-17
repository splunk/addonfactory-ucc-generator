/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Class = require("../Class");

	/**
	 * <protocol>://<host>:<port>/<path>?<query>#<hash>
	 * 
	 * host supports IPv6 notation: '[2001:db8::ff00:42:8329]'
	 * path includes leading '/'
	 * query includes leading '?'
	 * hash includes leading '$'
	 */
	return Class(module.id, Object, function(URL)
	{

		// Private Static Constants

		var _R_PROTOCOL = /[^\:\/\?#]*/;
		var _R_HOST = /(?:[^\[\:\/\?#]*\[[^\]]*\])*[^\:\/\?#]*/;
		var _R_PORT = /[^\/\?#]*/;
		var _R_PATH = /[^\?#]*/;
		var _R_QUERY = /[^#]*/;
		var _R_HASH = /.*/;

		var _R_URL = new RegExp("^" +
			"(?:(" + _R_PROTOCOL.source + ")\\:\\/\\/" +
				"(?:(" + _R_HOST.source + ")" +
					"(?:\\:(" + _R_PORT.source + "))?" +
				")?" +
			")?" +
			"(" + _R_PATH.source + ")" +
			"(\\?" + _R_QUERY.source + ")?" +
			"(#" + _R_HASH.source + ")?" +
			"$");

		var _R_VALID_PROTOCOL = new RegExp("^" + _R_PROTOCOL.source + "$");
		var _R_VALID_HOST = new RegExp("^" + _R_HOST.source + "$");
		var _R_VALID_PORT = new RegExp("^\\d*$");
		var _R_VALID_PATH = new RegExp("^" + _R_PATH.source + "$");
		var _R_VALID_QUERY = new RegExp("^" + _R_QUERY.source + "$");

		var _R_BEGIN_SLASH = /^\//;
		var _R_BEGIN_DOT = /^\.\//;
		var _R_BEGIN_DOTS = /^\.\.\//;
		var _R_BEGIN_QUERY = /^\?/;
		var _R_BEGIN_HASH = /^#/;

		var _R_TRIM = /^[\s\xA0\u2028\u2029\uFEFF]+|[\n\r\t\v\f\b\u2028\u2029]+|[\s\xA0\u2028\u2029\uFEFF]+$/g;
		var _R_BACKSLASH = /\\/g;
		var _R_DOT = /(^|\/)\.\.?(\/|$)/;
		var _R_END_DOT = /(^|\/)\.\.?$/;

		// Public Static Methods

		URL.fromString = function(str)
		{
			return new URL(str);
		};

		// Private Static Methods

		var _normalizeURLString = function(str)
		{
			return str.replace(_R_TRIM, "").replace(_R_BACKSLASH, "/");
		};

		var _normalizePath = function(path)
		{
			if (!_R_DOT.test(path))
				return path;

			if (_R_END_DOT.test(path))
				path += "/";

			var isRootPath = _R_BEGIN_SLASH.test(path);
			var isDotPath = (!isRootPath && _R_BEGIN_DOT.test(path));
			if (isRootPath)
				path = path.substring(1);
			else if (isDotPath)
				path = path.substring(2);

			var pathParts = path.split("/");
			var normalizedParts = [];
			var part;

			for (var i = 0, l = pathParts.length; i < l; i++)
			{
				part = pathParts[i];
				if ((part === "..") && (normalizedParts.length > 0) && (normalizedParts[normalizedParts.length - 1] !== ".."))
					normalizedParts.pop();
				else if (part !== ".")
					normalizedParts.push(part);
			}

			path = normalizedParts.join("/");
			if (isRootPath)
				path = "/" + path;
			else if (isDotPath && !_R_BEGIN_DOTS.test(path))
				path = "./" + path;

			return path;
		};

		// Private Properties

		this._protocol = "";
		this._host = "";
		this._port = "";
		this._path = "";
		this._query = "";
		this._hash = "";

		// Constructor

		this.constructor = function(url)
		{
			url = (url != null) ? ("" + url) : "";
			url = url ? _normalizeURLString(url) : "";

			var match = url ? url.match(_R_URL) : null;
			if (match)
			{
				var protocol = match[1];
				var host = match[2];
				var port = match[3];
				var path = match[4];
				var query = match[5];
				var hash = match[6];

				if (protocol)
				{
					this._protocol = protocol;
					if (host)
					{
						this._host = host;
						if (port && _R_VALID_PORT.test(port))
							this._port = port;
					}
					if (!path || !_R_BEGIN_SLASH.test(path))
						path = "/" + path;
				}

				if (path)
					this._path = _normalizePath(path);
				if (query && (query !== "?"))
					this._query = query;
				if (hash && (hash !== "#"))
					this._hash = hash;
			}
		};

		// Public Accessor Methods

		this.protocol = function(value)
		{
			if (!arguments.length)
				return this._protocol;

			value = (value != null) ? ("" + value) : "";
			value = value ? _normalizeURLString(value) : "";

			if (value && !_R_VALID_PROTOCOL.test(value))
				throw new Error("Invalid protocol.");

			this._protocol = value;

			if (!value)
				this._host = this._port = "";
			else if (!this._path || !_R_BEGIN_SLASH.test(this._path))
				this._path = _normalizePath("/" + this._path);

			return this;
		};

		this.host = function(value)
		{
			if (!arguments.length)
				return this._host;

			value = (value != null) ? ("" + value) : "";
			value = value ? _normalizeURLString(value) : "";

			if (value && !_R_VALID_HOST.test(value))
				throw new Error("Invalid host.");
			if (value && !this._protocol)
				throw new Error("Protocol must be defined before host.");

			this._host = value;

			if (!value)
				this._port = "";

			return this;
		};

		this.port = function(value)
		{
			if (!arguments.length)
				return this._port;

			value = (value != null) ? ("" + value) : "";
			value = value ? _normalizeURLString(value) : "";

			if (value && !_R_VALID_PORT.test(value))
				throw new Error("Invalid port.");
			if (value && !this._host)
				throw new Error("Host must be defined before port.");

			this._port = value;

			return this;
		};

		this.path = function(value)
		{
			if (!arguments.length)
				return this._path;

			value = (value != null) ? ("" + value) : "";
			value = value ? _normalizeURLString(value) : "";

			if (value && !_R_VALID_PATH.test(value))
				throw new Error("Invalid path.");

			if (this._protocol && (!value || !_R_BEGIN_SLASH.test(value)))
				value = "/" + value;

			this._path = value ? _normalizePath(value) : value;

			return this;
		};

		this.query = function(value)
		{
			if (!arguments.length)
				return this._query;

			value = (value != null) ? ("" + value) : "";
			value = value ? _normalizeURLString(value) : "";

			if (value && !_R_VALID_QUERY.test(value))
				throw new Error("Invalid query.");

			if (value && !_R_BEGIN_QUERY.test(value))
				value = "?" + value;
			else if (value === "?")
				value = "";

			this._query = value;

			return this;
		};

		this.hash = function(value)
		{
			if (!arguments.length)
				return this._hash;

			value = (value != null) ? ("" + value) : "";
			value = value ? _normalizeURLString(value) : "";

			if (value && !_R_BEGIN_HASH.test(value))
				value = "#" + value;
			else if (value === "#")
				value = "";

			this._hash = value;

			return this;
		};

		// Public Methods

		this.absolute = function(baseURL)
		{
			if (this._protocol)
				return this;

			baseURL = (baseURL instanceof URL) ? baseURL : new URL(baseURL);

			var selfPath = this._path;

			this.protocol(baseURL.protocol()).host(baseURL.host()).port(baseURL.port());

			if (_R_BEGIN_SLASH.test(selfPath))
				return this;

			var basePath = baseURL.path();
			var slashIndex = basePath.lastIndexOf("/");
			if (slashIndex < 0)
				return this;

			selfPath = basePath.substring(0, slashIndex + 1) + selfPath;

			return this.path(selfPath);
		};

		this.relative = function(baseURL)
		{
			baseURL = (baseURL instanceof URL) ? baseURL : new URL(baseURL);

			if ((this._protocol !== baseURL.protocol()) || (this._host !== baseURL.host()) || (this._port !== baseURL.port()))
				return this;

			var selfPath = this._path;
			var basePath = baseURL.path();
			if (_R_BEGIN_SLASH.test(selfPath) !== _R_BEGIN_SLASH.test(basePath))
				return this;

			selfPath = selfPath.replace(_R_BEGIN_DOT, "");
			basePath = basePath.replace(_R_BEGIN_DOT, "");

			var selfParts = selfPath.split("/");
			var baseParts = basePath.split("/");
			baseParts.pop();

			var i, l;
			for (i = 0, l = Math.min(selfParts.length, baseParts.length); i < l; i++)
			{
				if (selfParts[i] !== baseParts[i])
				{
					if (baseParts[i] === "..")
						return this;
					break;
				}
			}

			selfParts = selfParts.slice(i);
			baseParts = baseParts.slice(i);

			for (i = 0, l = baseParts.length; i < l; i++)
				baseParts[i] = "..";

			selfPath = baseParts.concat(selfParts).join("/");

			return this.protocol("").host("").port("").path(selfPath);
		};

		this.clear = function()
		{
			this._protocol = "";
			this._host = "";
			this._port = "";
			this._path = "";
			this._query = "";
			this._hash = "";

			return this;
		};

		this.equals = function(url)
		{
			return (this.toString() === url.toString());
		};

		this.clone = function()
		{
			return new URL(this.toString());
		};

		this.toString = function()
		{
			var str = "";

			if (this._protocol)
			{
				str += this._protocol + "://";
				if (this._host)
				{
					str += this._host;
					if (this._port)
						str += ":" + this._port;
				}
			}

			str += this._path;
			str += this._query;
			str += this._hash;

			return str;
		};

	});

});
