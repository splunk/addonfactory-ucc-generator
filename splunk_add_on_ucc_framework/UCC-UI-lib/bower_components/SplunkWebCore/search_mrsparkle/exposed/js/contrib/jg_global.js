/**
 * Global functions for defining classes and managing resources.
 * 
 * The following functions are declared globally:
 * 
 *     jg_namespace
 *     jg_import
 *     jg_extend
 *     jg_static
 *     jg_mixin
 *     jg_has_mixin
 * 
 * Copyright (c) 2012 Jason Gatt
 * 
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 */
(function(global, evalScript)
{

  // prevent duplicate definitions
  if (global.jg_namespace && global.jg_import)
    return;

	// Private Variables

	var _namespaces = {};
	var _imported = {};
	var _loading = {};
	var _sourcePaths = {};
	var _resourceTypeInfo = {};
	var _resourceInfo = {};
	var _resourceDependencyList = [];
	var _mixinCount = 0;
	var _mixinDependencies = null;

	// Private Functions

	var _normalizePath = function(path)
	{
		return (path.substring(path.length - 6) === ":class") ? path.substring(0, path.length - 6) : path;
	};

	var _getPathInfo = function(path)
	{
		var pathInfo = {};
		pathInfo.path = path;

		var typeIndex = path.indexOf(":");
		pathInfo.classPath = (typeIndex < 0) ? path : path.substring(0, typeIndex);
		pathInfo.type = (typeIndex < 0) ? "class" : path.substring(typeIndex + 1);
		if (!pathInfo.classPath || !pathInfo.type)
			return null;

		var namespaceIndex = pathInfo.classPath.lastIndexOf(".");
		pathInfo.namespace = (namespaceIndex < 0) ? "" : pathInfo.classPath.substring(0, namespaceIndex);
		pathInfo.className = (namespaceIndex < 0) ? pathInfo.classPath : pathInfo.classPath.substring(namespaceIndex + 1);
		pathInfo.name = (pathInfo.type === "class") ? pathInfo.className : (pathInfo.className + ":" + pathInfo.type);

		return pathInfo;
	};

	var _getSourcePath = function(path)
	{
		path += ".";

		var sourcePathList = [];
		var sourcePath;
		var url;

		for (sourcePath in _sourcePaths)
		{
			if (_sourcePaths.hasOwnProperty(sourcePath))
				sourcePathList.push(sourcePath);
		}
		sourcePathList.sort();

		for (var i = sourcePathList.length - 1; i >= 0; i--)
		{
			sourcePath = sourcePathList[i];
			if (path.substring(0, sourcePath.length) === sourcePath)
			{
				url = _sourcePaths[sourcePath] + path.substring(sourcePath.length).replace(/\./g, "/");
				return url.substring(0, url.length - 1);
			}
		}

		url = path.replace(/\./g, "/");
		return url.substring(0, url.length - 1);
	};

	var _appendConstructor = function(baseConstructor, mixinConstructor)
	{
		var constructor = function()
		{
			baseConstructor.apply(this, arguments);
			mixinConstructor.call(this);
		};
		return constructor;
	};

	// Global Functions

	var jg_namespace = global.jg_namespace = function(path, closure)
	{
		if (path == null)
			throw new Error("Parameter path must be non-null.");
		if (typeof path !== "string")
			throw new Error("Parameter path must be a string.");
		if ((closure != null) && (typeof closure !== "function"))
			throw new Error("Parameter closure must be a function.");

		var ns = _namespaces[path];
		if (!ns)
		{
			var subPaths = path ? path.split(".") : [];
			var subPath;
			var scope;

			ns = global;
			for (var i = 0, l = subPaths.length; i < l; i++)
			{
				subPath = subPaths[i];
				scope = ns[subPath];
				if (!scope)
					scope = ns[subPath] = {};
				ns = scope;
			}

			_namespaces[path] = ns;
		}

		if (closure)
			closure.call(ns, ns);

		return ns;
	};

	var jg_import = global.jg_import = function(path)
	{
		if (path == null)
			throw new Error("Parameter path must be non-null.");
		if (typeof path !== "string")
			throw new Error("Parameter path must be a string.");
		if (!path)
			throw new Error("Parameter path must be non-empty.");

		path = _normalizePath(path);

		var resource = _imported[path];
		if (resource == null)
		{
			if (_loading[path])
				throw new Error("Recursive dependency on resource " + path + ".");

			var resourceInfo = _getPathInfo(path);
			if (!resourceInfo)
				throw new Error("Invalid resource path \"" + path + "\".");

			var ns = jg_namespace(resourceInfo.namespace);
			resource = ns[resourceInfo.name];
			if (resource == null)
			{
				var typeInfo = _resourceTypeInfo[resourceInfo.type];
				if (!typeInfo)
					throw new Error("Unknown resource type \"" + resourceInfo.type + "\". Ensure the resource type is registered via jg_import.registerResourceType().");

				try
				{
					_loading[path] = true;

					resourceInfo.url = _getSourcePath(resourceInfo.classPath) + typeInfo.extension;
					resourceInfo.source = null;

					try
					{
						var xhr = global.ActiveXObject ? new global.ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
						xhr.open("GET", resourceInfo.url, false);
						xhr.send(null);
						if ((xhr.status == 200) || (xhr.status == 0))
							resourceInfo.source = xhr.responseText;
					}
					catch (e)
					{
					}

					if (resourceInfo.source == null)
						throw new Error("Failed to load resource " + path + " from url " + resourceInfo.url + ". Ensure the correct source path is set for this resource via jg_import.setSourcePath().");

					var resourceInfoCopy = {};
					for (var p in resourceInfo)
					{
						if (resourceInfo.hasOwnProperty(p))
							resourceInfoCopy[p] = resourceInfo[p];
					}

					try
					{
						var result = typeInfo.parser.call(resourceInfoCopy, resourceInfoCopy);
						resource = ns[resourceInfo.name];
						if (resource == null)
							resource = result;
					}
					catch (e)
					{
						if ((e != null) && e.__jg_import_Error)
							throw e;

						var message = (e instanceof Error) ? e.message : String(e);
						e = new Error("Error in resource " + path + ": " + message);
						e.__jg_import_Error = true;
						throw e;
					}

					if (resource == null)
						throw new Error("Failed to define resource " + path + ".");

					ns[resourceInfo.name] = resource;
				}
				finally
				{
					delete _loading[path];
				}
			}

			resourceInfo.resource = resource;

			_resourceInfo[path] = resourceInfo;
			_resourceDependencyList.push(path);

			_imported[path] = resource;
		}

		return resource;
	};

	jg_import.define = function(path, closure)
	{
		if (path == null)
			throw new Error("Parameter path must be non-null.");
		if (typeof path !== "string")
			throw new Error("Parameter path must be a string.");
		if (!path)
			throw new Error("Parameter path must be non-empty.");
		if (closure == null)
			throw new Error("Parameter closure must be non-null.");
		if (typeof closure !== "function")
			throw new Error("Parameter closure must be a function.");

		path = _normalizePath(path);

		var resource = _imported[path];
		if (resource == null)
		{
			var resourceInfo = _getPathInfo(path);
			if (!resourceInfo)
				throw new Error("Invalid resource path \"" + path + "\".");

			var ns = jg_namespace(resourceInfo.namespace);
			resource = ns[resourceInfo.name];
			if (resource == null)
			{
				var result = closure.call(ns, ns);
				resource = ns[resourceInfo.name];
				if (resource == null)
					resource = result;

				if (resource == null)
					throw new Error("Failed to define resource " + path + ".");

				ns[resourceInfo.name] = resource;
			}

			if (!_loading[path] && (_imported[path] == null))
			{
				resourceInfo.resource = resource;

				_resourceInfo[path] = resourceInfo;
				_resourceDependencyList.push(path);

				_imported[path] = resource;
			}
		}

		return resource;
	};

	jg_import.setSourcePath = function(path, url)
	{
		if (path == null)
			throw new Error("Parameter path must be non-null.");
		if (typeof path !== "string")
			throw new Error("Parameter path must be a string.");
		if (url == null)
			throw new Error("Parameter url must be non-null.");
		if (typeof url !== "string")
			throw new Error("Parameter url must be a string.");

		if (path && (path.charAt(path.length - 1) !== "."))
			path += ".";
		if (url && (url.charAt(url.length - 1) !== "/"))
			url += "/";

		_sourcePaths[path] = url;
	};

	jg_import.registerResourceType = function(type, extension, parser)
	{
		if (type == null)
			throw new Error("Parameter type must be non-null.");
		if (typeof type !== "string")
			throw new Error("Parameter type must be a string.");
		if (!type)
			throw new Error("Parameter type must be non-empty.");
		if (extension == null)
			throw new Error("Parameter extension must be non-null.");
		if (typeof extension !== "string")
			throw new Error("Parameter extension must be a string.");
		if (parser == null)
			throw new Error("Parameter parser must be non-null.");
		if (typeof parser !== "function")
			throw new Error("Parameter parser must be a function.");

		var typeInfo = {};
		typeInfo.extension = extension;
		typeInfo.parser = parser;

		_resourceTypeInfo[type] = typeInfo;
	};

	jg_import.getResourceInfo = function(path)
	{
		if ((path != null) && (typeof path !== "string"))
			throw new Error("Parameter path must be a string.");

		if (!path)
		{
			var resourceInfoList = [];
			for (var i = 0, l = _resourceDependencyList.length; i < l; i++)
				resourceInfoList.push(jg_import.getResourceInfo(_resourceDependencyList[i]));
			return resourceInfoList;
		}

		path = _normalizePath(path);

		var resourceInfo = _resourceInfo[path];
		if (!resourceInfo)
			return null;

		var resourceInfoCopy = {};
		for (var p in resourceInfo)
		{
			if (resourceInfo.hasOwnProperty(p))
				resourceInfoCopy[p] = resourceInfo[p];
		}

		return resourceInfoCopy;
	};

	var jg_extend = global.jg_extend = function(baseClass, closure)
	{
		if (baseClass == null)
			throw new Error("Parameter baseClass must be non-null.");
		if (typeof baseClass !== "function")
			throw new Error("Parameter baseClass must be a class.");
		if ((closure != null) && (typeof closure !== "function"))
			throw new Error("Parameter closure must be a function.");

		var constructor = baseClass;
		var base = baseClass.prototype;

		baseClass = function(){};
		baseClass.prototype = base;

		var c = function()
		{
			constructor.apply(this, arguments);
		};
		var proto = c.prototype = new baseClass();
		proto.constructor = c;

		if (closure)
		{
			closure.call(proto, c, base, proto);

			if (c.prototype !== proto)
				throw new Error("Class member \"prototype\" cannot be overridden.");

			if (proto.constructor !== c)
			{
				if (typeof proto.constructor !== "function")
					throw new Error("Instance member \"constructor\" must be a function.");

				constructor = proto.constructor;
				proto.constructor = c;
			}
		}

		return c;
	};

	var jg_static = global.jg_static = function(closure)
	{
		if ((closure != null) && (typeof closure !== "function"))
			throw new Error("Parameter closure must be a function.");

		var c = {};

		if (closure)
			closure.call(c, c);

		return c;
	};

	var jg_mixin = global.jg_mixin = function(target, source, base)
	{
		if (target == null)
			throw new Error("Parameter target must be non-null.");
		if (source == null)
			throw new Error("Parameter source must be non-null.");

		var id = source.__jg_mixin_id;
		if (!id)
			id = source.__jg_mixin_id = "m" + (++_mixinCount);

		id = "__jg_has_mixin_" + id;

		if (target[id])
			return base;

		var baseConstructor = ((base != null) && base.hasOwnProperty("constructor") && (typeof base.constructor === "function")) ? base.constructor : function(){};
		var baseClass = function(){};
		baseClass.prototype = (base != null) ? base : Object.prototype;

		base = new baseClass();
		base.constructor = baseConstructor;

		var member;

		var mixin = source.mixin;
		if ((mixin != null) && (typeof mixin === "function"))
		{
			var mixinBase = new baseClass();
			for (member in target)
			{
				if (target.hasOwnProperty(member))
					mixinBase[member] = target[member];
			}
			mixinBase.constructor = baseConstructor;

			try
			{
				if (!_mixinDependencies)
					_mixinDependencies = [];

				_mixinDependencies.push(base);

				var constructor = target.constructor;

				mixin.call(target, mixinBase, target);

				if (target.constructor !== constructor)
					throw new Error("Target member \"constructor\" cannot be overridden.");
			}
			finally
			{
				_mixinDependencies.pop();
				if (_mixinDependencies.length == 0)
					_mixinDependencies = null;
			}
		}

		for (member in source)
		{
			if (source.hasOwnProperty(member) && (member !== "mixin") && (member !== "constructor") && (member.substring(0, 2) !== "__"))
				target[member] = source[member];
		}

		for (member in target)
		{
			if (target.hasOwnProperty(member) && (member !== "constructor"))
				base[member] = target[member];
		}

		var sourceConstructor = (source.hasOwnProperty("constructor") && (typeof source.constructor === "function")) ? source.constructor : null;
		if (sourceConstructor)
		{
			base.constructor = _appendConstructor(base.constructor, sourceConstructor);

			if (_mixinDependencies)
			{
				var dependentMixin;
				for (var i = _mixinDependencies.length - 1; i >= 0; i--)
				{
					dependentMixin = _mixinDependencies[i];
					dependentMixin.constructor = _appendConstructor(dependentMixin.constructor, sourceConstructor);
				}
			}
		}

		target[id] = true;

		return base;
	};

	var jg_has_mixin = global.jg_has_mixin = function(target, source)
	{
		if (target == null)
			throw new Error("Parameter target must be non-null.");
		if (source == null)
			throw new Error("Parameter source must be non-null.");

		var id = source.__jg_mixin_id;
		if (!id)
			return false;

		id = "__jg_has_mixin_" + id;

		return (target[id] == true);
	};

	// Register class resource type

	jg_import.registerResourceType("class", ".js", function(resourceInfo)
	{
		evalScript(global, resourceInfo.source);
	});

})(this, function(global, script) { eval.call(global, script); });
