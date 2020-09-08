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
	var FrameClock = require("./FrameClock");
	var Class = require("../Class");
	var FunctionUtil = require("../utils/FunctionUtil");

	return Class(module.id, Clock, function(TimerClock, base)
	{

		// Private Properties

		this._tickIntervalMS = 0;
		this._maxTimeStepMS = Infinity;
		this._fixedTimeStepMS = 0;
		this._timeMS = 0;
		this._isRunning = false;
		this._timeoutTimeMS = 0;
		this._timeoutHandle = 0;
		this._frameClock = null;

		// Constructor

		this.constructor = function()
		{
			this._timeoutTick = FunctionUtil.bind(this._timeoutTick, this);
			this._frameClockTick = FunctionUtil.bind(this._frameClockTick, this);
		};

		// Public Accessor Methods

		this.tickInterval = function(value)
		{
			if (!arguments.length)
				return this._tickIntervalMS / 1000;

			if ((value != null) && !Class.isNumber(value))
				throw new Error("Parameter tickInterval must be of type Number.");

			this._tickIntervalMS = ((value > 0) && (value < Infinity)) ? (value * 1000) : 0;

			return this;
		};

		this.maxTimeStep = function(value)
		{
			if (!arguments.length)
				return this._maxTimeStepMS / 1000;

			if ((value != null) && !Class.isNumber(value))
				throw new Error("Parameter maxTimeStep must be of type Number.");

			this._maxTimeStepMS = ((value > 0) && (value < Infinity)) ? (value * 1000) : Infinity;

			return this;
		};

		this.fixedTimeStep = function(value)
		{
			if (!arguments.length)
				return this._fixedTimeStepMS / 1000;

			if ((value != null) && !Class.isNumber(value))
				throw new Error("Parameter fixedTimeStep must be of type Number.");

			this._fixedTimeStepMS = ((value > 0) && (value < Infinity)) ? (value * 1000) : 0;

			return this;
		};

		this.time = function()
		{
			return this._timeMS / 1000;
		};

		this.isRunning = function()
		{
			return this._isRunning;
		};

		// Public Methods

		this.start = function()
		{
			if (this._isRunning)
				return this;

			this._isRunning = true;

			if (this._tickIntervalMS > 0)
			{
				this._timeoutTimeMS = new Date().getTime();
				this._timeoutHandle = setTimeout(this._timeoutTick, this._tickIntervalMS);
			}
			else
			{
				this._frameClock = FrameClock.getInstance();
				this._frameClock.on(this._frameClock.tick, this._frameClockTick);
			}

			return this;
		};

		this.stop = function()
		{
			if (!this._isRunning)
				return this;

			this._isRunning = false;

			if (this._timeoutHandle)
			{
				clearTimeout(this._timeoutHandle);
				this._timeoutHandle = 0;
			}

			if (this._frameClock)
			{
				this._frameClock.off(this._frameClock.tick, this._frameClockTick);
				this._frameClock = null;
			}

			return this;
		};

		this.reset = function()
		{
			this.stop();

			this._timeMS = 0;

			return this;
		};

		// Private Methods

		this._timeoutTick = function()
		{
			var timeoutTimeMS = new Date().getTime();
			var deltaTimeMS = timeoutTimeMS - this._timeoutTimeMS;
			this._timeoutTimeMS = timeoutTimeMS;

			if (this._tickIntervalMS > 0)
			{
				this._timeoutHandle = setTimeout(this._timeoutTick, this._tickIntervalMS);
			}
			else
			{
				this._timeoutHandle = 0;

				this._frameClock = FrameClock.getInstance();
				this._frameClock.on(this._frameClock.tick, this._frameClockTick);
			}

			this._tick(deltaTimeMS);
		};

		this._frameClockTick = function(e)
		{
			if (this._tickIntervalMS > 0)
			{
				this._frameClock.off(this._frameClock.tick, this._frameClockTick);
				this._frameClock = null;

				this._timeoutTimeMS = new Date().getTime();
				this._timeoutHandle = setTimeout(this._timeoutTick, this._tickIntervalMS);
			}

			this._tick(e.deltaTime * 1000);
		};

		this._tick = function(deltaTimeMS)
		{
			if (this._fixedTimeStepMS > 0)
				deltaTimeMS = this._fixedTimeStepMS;
			else if (deltaTimeMS > this._maxTimeStepMS)
				deltaTimeMS = this._maxTimeStepMS;

			if (deltaTimeMS > 0)
			{
				this._timeMS += deltaTimeMS;
				this.fire(this.tick, new ClockEventData(this._timeMS / 1000, deltaTimeMS / 1000));
			}
		};

	});

});
