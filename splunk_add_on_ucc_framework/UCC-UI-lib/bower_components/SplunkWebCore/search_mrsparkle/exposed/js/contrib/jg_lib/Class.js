/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var _hasOwnProperty = Object.prototype.hasOwnProperty;
	var _toString = Object.prototype.toString;

	var _classList = [];
	var _classNameList = [];
	var _classNameMap = {};
	var _classNativeCount = 0;

	var _registerClassName = function(cls, name, isNative)
	{
		_classList.push(cls);
		_classNameList.push(name);
		if (!_hasOwnProperty.call(_classNameMap, name))
			_classNameMap[name] = cls;
		if (isNative)
			_classNativeCount++;
	};

	var _anonymize = function(func)
	{
		return func;
	};

	var Class = function(name, baseClass, callback)
	{
		if (callback != null)
		{
			if (name == null)
				throw new Error("Parameter name must be non-null.");
			if (!Class.isString(name))
				throw new Error("Parameter name must be of type String.");
			if (baseClass == null)
				throw new Error("Parameter baseClass must be non-null.");
			if (!Class.isFunction(baseClass))
				throw new Error("Parameter baseClass must be of type Function.");
			if (!Class.isFunction(callback))
				throw new Error("Parameter callback must be of type Function.");
		}
		else if (baseClass != null)
		{
			callback = baseClass;
			baseClass = name;

			if (name == null)
				throw new Error("Parameter 0 must be non-null.");

			if (Class.isString(name))
				baseClass = null;
			else if (Class.isFunction(name))
				name = null;
			else
				throw new Error("Parameter 0 must be of type String or Function.");

			if (!Class.isFunction(callback))
				throw new Error("Parameter callback must be of type Function.");
		}
		else if (name != null)
		{
			callback = name;
			baseClass = null;
			name = null;

			if (!Class.isFunction(callback))
				throw new Error("Parameter callback must be of type Function.");
		}
		else
		{
			throw new Error("Expecting at least 1 parameter.");
		}

		if (baseClass != null)
		{
			var constructor = baseClass;

			var Subclass = _anonymize(function()
			{
				if (constructor !== baseClass)
					return constructor.apply(this, arguments);
				constructor.apply(this, arguments);
			});

			var Prototype = _anonymize(function(){});
			var base = Prototype.prototype = baseClass.prototype;
			var proto = Subclass.prototype = new Prototype();
			proto.constructor = Subclass;

			callback.call(proto, Subclass, base, proto);

			if (proto.constructor !== Subclass)
			{
				constructor = proto.constructor;
				proto.constructor = Subclass;
			}

			if (name)
				_registerClassName(Subclass, name);

			return Subclass;
		}
		else
		{
			var StaticClass = {};

			callback.call(StaticClass, StaticClass);

			if (name)
				_registerClassName(StaticClass, name);

			return StaticClass;
		}
	};

	Class.mixin = function(target, source)
	{
		if (target == null)
			throw new Error("Parameter target must be non-null.");
		if (source == null)
			throw new Error("Parameter source must be non-null.");

		var p;
		for (var i = 1, l = arguments.length; i < l; i++)
		{
			source = arguments[i];
			if (source == null)
				throw new Error("Parameter source must be non-null.");

			for (p in source)
			{
				if (_hasOwnProperty.call(source, p))
					target[p] = source[p];
			}
		}

		return target;
	};

	Class.fromName = function(name)
	{
		if (name == null)
			throw new Error("Parameter name must be non-null.");

		if (_hasOwnProperty.call(_classNameMap, name))
			return _classNameMap[name];

		return null;
	};

	Class.getName = function(cls)
	{
		if (cls == null)
			throw new Error("Parameter cls must be non-null.");

		for (var i = 0, l = _classList.length; i < l; i++)
		{
			if (_classList[i] === cls)
				return _classNameList[i];
		}

		return null;
	};

	Class.getClassList = function()
	{
		return _classList.slice(_classNativeCount);
	};

	Class.getClassNameList = function()
	{
		return _classNameList.slice(_classNativeCount);
	};

	Class.getTypeChecker = function(cls)
	{
		if (cls == null)
			throw new Error("Parameter cls must be non-null.");

		switch (cls)
		{
			case Array:
				return Class.isArray;
			case Boolean:
				return Class.isBoolean;
			case Date:
				return Class.isDate;
			case Function:
				return Class.isFunction;
			case Number:
				return Class.isNumber;
			case Object:
				return Class.isObject;
			case RegExp:
				return Class.isRegExp;
			case String:
				return Class.isString;
			default:
				return function(value) { return (value instanceof cls); };
		}
	};

	Class.getBaseClass = function(cls)
	{
		if (cls == null)
			throw new Error("Parameter cls must be non-null.");

		if (cls === Object)
			return null;

		var proto = cls.prototype;
		if (proto == null)
			return null;

		var baseClass = proto.constructor;
		if (_hasOwnProperty.call(proto, "constructor"))
		{
			var temp = baseClass;
			delete proto.constructor;
			baseClass = proto.constructor;
			proto.constructor = temp;
		}

		if ((baseClass == null) || (baseClass === cls))
			return null;

		return baseClass;
	};

	Class.isSubclassOf = function(cls, baseClass)
	{
		if (cls == null)
			throw new Error("Parameter cls must be non-null.");
		if (baseClass == null)
			throw new Error("Parameter baseClass must be non-null.");

		if (cls === baseClass)
			return false;

		var proto = cls.prototype;
		if (proto == null)
			return false;

		return (proto instanceof baseClass);
	};

	// The following methods are adapted from underscore.js

	Class.isArray = function(value)
	{
		return ((value instanceof Array) || (_toString.call(value) === "[object Array]"));
	};

	Class.isBoolean = function(value)
	{
		return ((typeof value === "boolean") || (_toString.call(value) === "[object Boolean]"));
	};

	Class.isDate = function(value)
	{
		return ((value instanceof Date) || (_toString.call(value) === "[object Date]"));
	};

	if (typeof /./ !== "function")
	{
		Class.isFunction = function(value)
		{
			return ((typeof value === "function") || false);
		};
	}
	else
	{
		Class.isFunction = function(value)
		{
			return ((value instanceof Function) || (_toString.call(value) === "[object Function]"));
		};
	}

	Class.isNumber = function(value)
	{
		return ((typeof value === "number") || (_toString.call(value) === "[object Number]"));
	};

	Class.isObject = function(value)
	{
		return ((value != null) && ((typeof value === "object") || (typeof value === "function")));
	};

	Class.isRegExp = function(value)
	{
		return ((value instanceof RegExp) || (_toString.call(value) === "[object RegExp]"));
	};

	Class.isString = function(value)
	{
		return ((typeof value === "string") || (_toString.call(value) === "[object String]"));
	};

	_registerClassName(Array, "Array", true);
	_registerClassName(Boolean, "Boolean", true);
	_registerClassName(Date, "Date", true);
	_registerClassName(Function, "Function", true);
	_registerClassName(Math, "Math", true);
	_registerClassName(Number, "Number", true);
	_registerClassName(Object, "Object", true);
	_registerClassName(RegExp, "RegExp", true);
	_registerClassName(String, "String", true);
	_registerClassName(Class, module.id);

	return Class;

});
