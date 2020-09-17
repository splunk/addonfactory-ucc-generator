package com.jasongatt.motion
{

	import com.jasongatt.motion.clocks.ClockEvent;
	import com.jasongatt.motion.clocks.FrameClock;
	import com.jasongatt.motion.clocks.IClock;
	import flash.utils.Dictionary;

	public final class TweenRunner
	{

		// Private Static Properties

		private static var _tweenRunInfo:Dictionary = new Dictionary();
		private static var _defaultClock:FrameClock = new FrameClock();

		// Public Static Methods

		public static function start(tween:ITween, duration:Number, clock:IClock = null) : Boolean
		{
			if (!tween)
				throw new TypeError("Parameter tween must be non-null.");

			TweenRunner.stop(tween);

			if (!tween.beginTween())
				return false;

			if (!tween.updateTween(0))
			{
				tween.endTween();
			}
			else if (duration > 0)
			{
				if (!clock)
				{
					clock = TweenRunner._defaultClock;
					TweenRunner._defaultClock.start();
				}

				var runInfo:RunInfo = TweenRunner._tweenRunInfo[tween] = new RunInfo(tween, clock, duration);
				clock.addEventListener(ClockEvent.TICK, runInfo.onTick);
			}
			else
			{
				tween.updateTween(1);
				tween.endTween();
			}

			return true;
		}

		public static function stop(tween:ITween) : Boolean
		{
			if (!tween)
				throw new TypeError("Parameter tween must be non-null.");

			var runInfo:RunInfo = TweenRunner._tweenRunInfo[tween];
			if (!runInfo)
				return false;

			delete TweenRunner._tweenRunInfo[tween];

			var clock:IClock = runInfo.clock;
			clock.removeEventListener(ClockEvent.TICK, runInfo.onTick);
			if (clock == TweenRunner._defaultClock)
			{
				if (!clock.hasEventListener(ClockEvent.TICK))
					TweenRunner._defaultClock.stop();
			}

			tween.endTween();

			return true;
		}

	}

}

import com.jasongatt.motion.ITween;
import com.jasongatt.motion.TweenRunner;
import com.jasongatt.motion.clocks.ClockEvent;
import com.jasongatt.motion.clocks.IClock;

class RunInfo
{

	// Public Properties

	public var tween:ITween;
	public var clock:IClock;
	public var duration:Number;
	public var time:Number = 0;

	// Constructor

	public function RunInfo(tween:ITween, clock:IClock, duration:Number)
	{
		this.tween = tween;
		this.clock = clock;
		this.duration = duration;
	}

	// Public Methods

	public function onTick(e:ClockEvent) : void
	{
		this.time += e.time;

		var position:Number = this.time / this.duration;
		if (position > 1)
			position = 1;

		if (!this.tween.updateTween(position))
			position = 1;

		if (position == 1)
			TweenRunner.stop(this.tween);
	}

}
