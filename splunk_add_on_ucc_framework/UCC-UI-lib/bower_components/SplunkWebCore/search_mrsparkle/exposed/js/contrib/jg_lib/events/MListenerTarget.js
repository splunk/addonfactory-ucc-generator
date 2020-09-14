/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Event = require("./Event");
	var MEventTarget = require("./MEventTarget");
	var Class = require("../Class");
	var TrieMap = require("../utils/TrieMap");
	var WeakMap = require("../utils/WeakMap");

	return Class(module.id, function(MListenerTarget)
	{

		// Private Static Properties

		var _listeningMaps = new WeakMap();

		// Private Static Methods

		var _getListeningMap = function(target, create)
		{
			var listeningMap = _listeningMaps.get(target);
			if (!listeningMap)
			{
				if (create === false)
					return null;

				listeningMap = new TrieMap();
				_listeningMaps.set(target, listeningMap);
			}

			return listeningMap;
		};

		var _delListeningMap = function(target)
		{
			_listeningMaps.del(target);
		};

		// Public Properties

		this.isListenerTarget = true;

		// Public Methods

		this.listenOn = function(target, event, listener, scope, priority)
		{
			if (target == null)
				throw new Error("Parameter target must be non-null.");
			if (!target.isEventTarget)
				throw new Error("Parameter target must have mixin " + Class.getName(MEventTarget) + ".");

			event = Event.resolve(target, event);

			if (listener == null)
				throw new Error("Parameter listener must be non-null.");
			if (!Class.isFunction(listener))
				throw new Error("Parameter listener must be of type Function.");
			if ((priority != null) && !Class.isNumber(priority))
				throw new Error("Parameter priority must be of type Number.");

			if (scope == null)
				scope = this;

			var listeningMap = _getListeningMap(this);
			var listeningKeys = [ target, event, listener, scope ];
			listeningMap.set(listeningKeys, listeningKeys);

			target.on(event, listener, scope, priority);

			return this;
		};

		this.listenOff = function(target, event, listener, scope)
		{
			var listeningKeys = null;

			if (scope != null)
			{
				if (target == null)
					throw new Error("Parameter target must be non-null.");
				if (!target.isEventTarget)
					throw new Error("Parameter target must have mixin " + Class.getName(MEventTarget) + ".");

				event = Event.resolve(target, event);

				if (listener == null)
					throw new Error("Parameter listener must be non-null.");
				if (!Class.isFunction(listener))
					throw new Error("Parameter listener must be of type Function.");

				listeningKeys = [ target, event, listener, scope ];
			}
			else if (listener != null)
			{
				if (target == null)
					throw new Error("Parameter target must be non-null.");
				if (!target.isEventTarget)
					throw new Error("Parameter target must have mixin " + Class.getName(MEventTarget) + ".");

				event = Event.resolve(target, event);

				if (!Class.isFunction(listener))
					throw new Error("Parameter listener must be of type Function.");

				listeningKeys = [ target, event, listener, this ];
			}
			else if (event != null)
			{
				if (target == null)
					throw new Error("Parameter target must be non-null.");
				if (!target.isEventTarget)
					throw new Error("Parameter target must have mixin " + Class.getName(MEventTarget) + ".");

				event = Event.resolve(target, event);

				listeningKeys = [ target, event ];
			}
			else if (target != null)
			{
				if (!target.isEventTarget)
					throw new Error("Parameter target must have mixin " + Class.getName(MEventTarget) + ".");

				listeningKeys = [ target ];
			}

			var listeningMap = _getListeningMap(this, false);
			if (!listeningMap)
				return this;

			var listeningList = listeningMap.values(listeningKeys);
			listeningMap.clear(listeningKeys);
			if (listeningMap.size() === 0)
				_delListeningMap(this);

			for (var i = 0, l = listeningList.length; i < l; i++)
			{
				listeningKeys = listeningList[i];
				listeningKeys[0].off(listeningKeys[1], listeningKeys[2], listeningKeys[3]);
			}

			return this;
		};

		this.isListening = function(target, event)
		{
			var listeningKeys = null;

			if (event != null)
			{
				if (target == null)
					throw new Error("Parameter target must be non-null.");
				if (!target.isEventTarget)
					throw new Error("Parameter target must have mixin " + Class.getName(MEventTarget) + ".");

				event = Event.resolve(target, event);

				listeningKeys = [ target, event ];
			}
			else if (target != null)
			{
				if (!target.isEventTarget)
					throw new Error("Parameter target must have mixin " + Class.getName(MEventTarget) + ".");

				listeningKeys = [ target ];
			}

			var listeningMap = _getListeningMap(this, false);
			if (!listeningMap)
				return false;

			return (listeningMap.size(listeningKeys) > 0);
		};

	});

});
