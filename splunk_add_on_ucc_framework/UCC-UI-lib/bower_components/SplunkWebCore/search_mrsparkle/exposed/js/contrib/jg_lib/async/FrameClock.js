/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Clock = require("./Clock");
	var ClockEventData = require("./ClockEventData");
	var Class = require("../Class");
	var Event = require("../events/Event");
	var Global = require("../utils/Global");

	return Class(module.id, Clock, function(FrameClock, base)
	{

		// Private Static Properties

		var _instance = null;
		var _instantiating = false;
		var _timeMS = 0;
		var _isRunning = false;
		var _isTickPending = false;

		// Public Static Methods

		FrameClock.getInstance = function()
		{
			if (!_instance)
			{
				_instantiating = true;
				_instance = new FrameClock();
				_instantiating = false;
			}
			return _instance;
		};

		// Private Static Methods

		var _requestAnimationFrame =
			Global.requestAnimationFrame ||
			Global.webkitRequestAnimationFrame ||
			Global.mozRequestAnimationFrame ||
			Global.msRequestAnimationFrame ||
			Global.oRequestAnimationFrame ||
			function(callback) { setTimeout(callback, 1000 / 60); };

		var _start = function()
		{
			_isRunning = true;

			if (_isTickPending)
				return;

			_isTickPending = true;
			_timeMS = new Date().getTime();
			_requestAnimationFrame(_tick);
		};

		var _stop = function()
		{
			_isRunning = false;
		};

		var _tick = function()
		{
			if (!_isRunning)
			{
				_isTickPending = false;
				return;
			}

			var timeMS = new Date().getTime();
			var deltaTimeMS = timeMS - _timeMS;
			_timeMS = timeMS;

			_requestAnimationFrame(_tick);

			if (deltaTimeMS > 0)
			{
				var eventData = new ClockEventData(timeMS / 1000, deltaTimeMS / 1000);
				_instance.fire(_instance.tick, eventData);
				_instance.fire(_instance.frameTick, eventData);
			}
		};

		// Public Events

		this.frameTick = new Event("frameTick", ClockEventData);

		// Constructor

		this.constructor = function()
		{
			if (!_instantiating)
				throw new Error("Singleton class. Use " + Class.getName(FrameClock) + ".getInstance() to retrieve the instance of this class.");
		};

		// Public Methods

		this.on = function(event, listener, scope, priority)
		{
			base.on.call(this, event, listener, scope, priority);

			if (!_isRunning && (_instance.hasListeners(_instance.tick) || _instance.hasListeners(_instance.frameTick)))
				_start();

			return this;
		};

		this.off = function(event, listener, scope)
		{
			base.off.call(this, event, listener, scope);

			if (_isRunning && !(_instance.hasListeners(_instance.tick) || _instance.hasListeners(_instance.frameTick)))
				_stop();

			return this;
		};

	});

});
