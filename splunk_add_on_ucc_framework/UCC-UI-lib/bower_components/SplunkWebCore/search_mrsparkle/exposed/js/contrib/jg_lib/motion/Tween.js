/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Easer = require("./Easer");
	var Interpolator = require("./Interpolator");
	var NumberInterpolator = require("./NumberInterpolator");
	var Class = require("../Class");
	var Clock = require("../async/Clock");
	var FrameClock = require("../async/FrameClock");
	var Event = require("../events/Event");
	var EventData = require("../events/EventData");
	var MEventTarget = require("../events/MEventTarget");

	return Class(module.id, Object, function(Tween, base)
	{

		Class.mixin(this, MEventTarget);

		// Private Static Constants

		var _RUNNING = "running";
		var _PAUSED = "paused";
		var _STOPPED = "stopped";

		// Public Events

		this.tweenStart = new Event("tweenStart", EventData);
		this.tweenEnd = new Event("tweenEnd", EventData);

		// Private Properties

		this._duration = 0;
		this._easer = null;
		this._interpolator = null;
		this._clock = FrameClock.getInstance();
		this._runTime = 0;
		this._runStartValue = null;
		this._runEndValue = null;
		this._runState = _STOPPED;

		// Constructor

		this.constructor = function(duration, easer, interpolator)
		{
			this._interpolator = new NumberInterpolator();

			if (duration != null)
				this.duration(duration);
			if (easer != null)
				this.easer(easer);
			if (interpolator != null)
				this.interpolator(interpolator);
		};

		// Public Accessor Methods

		this.duration = function(value)
		{
			if (!arguments.length)
				return this._duration;

			if ((value != null) && !Class.isNumber(value))
				throw new Error("Parameter duration must be of type Number.");

			this.stop();

			this._duration = (value < Infinity) ? Math.max(value, 0) : 0;

			return this;
		};

		this.easer = function(value)
		{
			if (!arguments.length)
				return (this._easer && (this._easer instanceof FunctionEaser)) ? this._easer.func : this._easer;

			if ((value != null) && !(value instanceof Easer))
			{
				if (!Class.isFunction(value))
					throw new Error("Parameter easer must be of type Function or " + Class.getName(Easer) + ".");

				value = new FunctionEaser(value);
			}

			this.stop();

			this._easer = value || null;

			return this;
		};

		this.interpolator = function(value)
		{
			if (!arguments.length)
				return (this._interpolator instanceof FunctionInterpolator) ? this._interpolator.func : this._interpolator;

			if ((value != null) && !(value instanceof Interpolator))
			{
				if (!Class.isFunction(value))
					throw new Error("Parameter interpolator must be of type Function or " + Class.getName(Interpolator) + ".");

				value = new FunctionInterpolator(value);
			}

			this.stop();

			this._interpolator = value || new NumberInterpolator();

			return this;
		};

		this.clock = function(value)
		{
			if (!arguments.length)
				return this._clock;

			if ((value != null) && !(value instanceof Clock))
				throw new Error("Parameter clock must be of type " + Class.getName(Clock) + ".");

			this.stop();

			this._clock = value || FrameClock.getInstance();

			return this;
		};

		this.isRunning = function()
		{
			return (this._runState === _RUNNING);
		};

		this.isPaused = function()
		{
			return (this._runState === _PAUSED);
		};

		this.isStopped = function()
		{
			return (this._runState === _STOPPED);
		};

		// Public Methods

		this.to = function(endValue)
		{
			this.fromTo(this.getTweenValue(), endValue);

			return this;
		};

		this.fromTo = function(startValue, endValue)
		{
			this.stop();

			var ratio = 0;
			var easer = this._easer;
			if (easer)
				ratio = easer.ease(ratio);

			this.setTweenValue(this._interpolator.interpolate(startValue, endValue, ratio));

			this._runStartValue = startValue;
			this._runEndValue = endValue;
			this._runState = _RUNNING;

			this._clock.on(this._clock.tick, this._clockTick, this);

			this.fire(this.tweenStart);

			return this;
		};

		this.stop = function()
		{
			if (this._runState === _STOPPED)
				return this;

			this._clock.off(this._clock.tick, this._clockTick, this);

			this._runTime = 0;
			this._runStartValue = null;
			this._runEndValue = null;
			this._runState = _STOPPED;

			this.fire(this.tweenEnd);

			return this;
		};

		this.pause = function()
		{
			if (this._runState !== _RUNNING)
				return this;

			this._clock.off(this._clock.tick, this._clockTick, this);

			this._runState = _PAUSED;

			return this;
		};

		this.resume = function()
		{
			if (this._runState !== _PAUSED)
				return this;

			this._runState = _RUNNING;

			this._clock.on(this._clock.tick, this._clockTick, this);

			return this;
		};

		// Protected Methods

		this.getTweenValue = function()
		{
			throw new Error("Must implement method getTweenValue.");
		};

		this.setTweenValue = function(value)
		{
			throw new Error("Must implement method setTweenValue.");
		};

		// Private Methods

		this._clockTick = function(e)
		{
			try
			{
				this._runTime += e.deltaTime;

				var isDone = false;
				var ratio = this._runTime / this._duration;
				if (ratio >= 1)
				{
					ratio = 1;
					isDone = true;
				}

				var easer = this._easer;
				if (easer)
					ratio = easer.ease(ratio);

				this.setTweenValue(this._interpolator.interpolate(this._runStartValue, this._runEndValue, ratio));
			}
			catch (e)
			{
				isDone = true;
				throw e;
			}
			finally
			{
				if (isDone)
					this.stop();
			}
		};

		// Private Nested Classes

		var FunctionEaser = Class(Easer, function(FunctionEaser, base)
		{

			// Public Properties

			this.func = null;

			// Constructor

			this.constructor = function(func)
			{
				this.func = func;
			};

			// Public Methods

			this.ease = function(ratio)
			{
				var func = this.func;
				return func(ratio);
			};

		});

		var FunctionInterpolator = Class(Interpolator, function(FunctionInterpolator, base)
		{

			// Public Properties

			this.func = null;

			// Constructor

			this.constructor = function(func)
			{
				this.func = func;
			};

			// Public Methods

			this.interpolate = function(value1, value2, ratio)
			{
				var func = this.func;
				return func(value1, value2, ratio);
			};

		});

	});

});
