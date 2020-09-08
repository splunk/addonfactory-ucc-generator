package com.jasongatt.motion
{

	import com.jasongatt.motion.easers.IEaser;
	import com.jasongatt.motion.interpolators.IInterpolator;
	import com.jasongatt.motion.interpolators.NumberInterpolator;
	import flash.utils.Dictionary;

	public class MethodTween extends AbstractTween
	{

		// Private Static Constants

		private static const _DEFAULT_INTERPOLATOR:IInterpolator = new NumberInterpolator();

		// Private Static Properties

		private static var _runningSetters:Dictionary = new Dictionary();

		// Private Properties

		private var _getter:Function;
		private var _setter:Function;
		private var _startValue:*;
		private var _endValue:*;
		private var _interpolator:IInterpolator;

		private var _runningGetter:Function;
		private var _runningSetter:Function;
		private var _runningStartValue:*;
		private var _runningEndValue:*;
		private var _runningInterpolator:IInterpolator;

		// Constructor

		public function MethodTween(getter:Function = null, setter:Function = null, startValue:* = null, endValue:* = null, easer:IEaser = null, interpolator:IInterpolator = null)
		{
			super(easer);

			this._getter = getter;
			this._setter = setter;
			this._startValue = startValue;
			this._endValue = endValue;
			this._interpolator = interpolator;
		}

		// Public Getters/Setters

		public function get getter() : Function
		{
			return this._getter;
		}
		public function set getter(value:Function) : void
		{
			this._getter = value;
			this.endTween();
		}

		public function get setter() : Function
		{
			return this._setter;
		}
		public function set setter(value:Function) : void
		{
			this._setter = value;
			this.endTween();
		}

		public function get startValue() : *
		{
			return this._startValue;
		}
		public function set startValue(value:*) : void
		{
			this._startValue = value;
			this.endTween();
		}

		public function get endValue() : *
		{
			return this._endValue;
		}
		public function set endValue(value:*) : void
		{
			this._endValue = value;
			this.endTween();
		}

		public function get interpolator() : IInterpolator
		{
			return this._interpolator;
		}
		public function set interpolator(value:IInterpolator) : void
		{
			this._interpolator = value;
			this.endTween();
		}

		// Protected Methods

		protected override function beginTweenOverride() : Boolean
		{
			var getter:Function = this._getter;
			if (getter == null)
				return false;

			var setter:Function = this._setter;
			if (setter == null)
				return false;

			var endValue:* = this._endValue;
			if (endValue == null)
				return false;

			var startValue:* = this._startValue;
			if (startValue == null)
			{
				try
				{
					startValue = getter();
				}
				catch (e:Error)
				{
					return false;
				}
			}

			var interpolator:IInterpolator = this._interpolator;
			if (!interpolator)
				interpolator = MethodTween._DEFAULT_INTERPOLATOR;

			this._runningGetter = getter;
			this._runningSetter = setter;
			this._runningStartValue = startValue;
			this._runningEndValue = endValue;
			this._runningInterpolator = interpolator;

			var runningTween:MethodTween = MethodTween._runningSetters[setter];
			MethodTween._runningSetters[setter] = this;

			if (runningTween)
				runningTween.endTween();

			return true;
		}

		protected override function endTweenOverride() : void
		{
			var setter:Function = this._runningSetter;

			this._runningGetter = null;
			this._runningSetter = null;
			this._runningStartValue = null;
			this._runningEndValue = null;
			this._runningInterpolator = null;

			if (MethodTween._runningSetters[setter] != this)
				return;

			delete MethodTween._runningSetters[setter];
		}

		protected override function updateTweenOverride(position:Number) : Boolean
		{
			var value:* = this._runningInterpolator.interpolate(this._runningStartValue, this._runningEndValue, position);

			try
			{
				this._runningSetter(value);
			}
			catch (e:Error)
			{
				return false;
			}

			return true;
		}

	}

}
