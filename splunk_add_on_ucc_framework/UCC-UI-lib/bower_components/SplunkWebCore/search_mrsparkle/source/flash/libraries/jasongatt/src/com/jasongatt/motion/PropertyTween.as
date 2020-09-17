package com.jasongatt.motion
{

	import com.jasongatt.motion.easers.IEaser;
	import com.jasongatt.motion.interpolators.IInterpolator;
	import com.jasongatt.motion.interpolators.NumberInterpolator;
	import flash.utils.Dictionary;

	public class PropertyTween extends AbstractTween
	{

		// Private Static Constants

		private static const _DEFAULT_INTERPOLATOR:IInterpolator = new NumberInterpolator();

		// Private Static Properties

		private static var _runningTargets:Dictionary = new Dictionary();

		// Private Properties

		private var _target:Object;
		private var _propertyName:String;
		private var _startValue:*;
		private var _endValue:*;
		private var _interpolator:IInterpolator;

		private var _runningTarget:Object;
		private var _runningPropertyName:String;
		private var _runningStartValue:*;
		private var _runningEndValue:*;
		private var _runningInterpolator:IInterpolator;

		// Constructor

		public function PropertyTween(target:Object = null, propertyName:String = null, startValue:* = null, endValue:* = null, easer:IEaser = null, interpolator:IInterpolator = null)
		{
			super(easer);

			this._target = target;
			this._propertyName = propertyName;
			this._startValue = startValue;
			this._endValue = endValue;
			this._interpolator = interpolator;
		}

		// Public Getters/Setters

		public function get target() : Object
		{
			return this._target;
		}
		public function set target(value:Object) : void
		{
			this._target = value;
			this.endTween();
		}

		public function get propertyName(): String
		{
			return this._propertyName;
		}
		public function set propertyName(value:String) : void
		{
			this._propertyName = value;
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
			var target:Object = this._target;
			if (!target)
				return false;

			var propertyName:String = this._propertyName;
			if (!propertyName)
				return false;

			var endValue:* = this._endValue;
			if (endValue == null)
				return false;

			var startValue:* = this._startValue;
			if (startValue == null)
			{
				try
				{
					startValue = target[propertyName];
				}
				catch (e:Error)
				{
					return false;
				}
			}

			var interpolator:IInterpolator = this._interpolator;
			if (!interpolator)
				interpolator = PropertyTween._DEFAULT_INTERPOLATOR;

			this._runningTarget = target;
			this._runningPropertyName = propertyName;
			this._runningStartValue = startValue;
			this._runningEndValue = endValue;
			this._runningInterpolator = interpolator;

			var runningProperties:Object = PropertyTween._runningTargets[target];
			if (!runningProperties)
				runningProperties = PropertyTween._runningTargets[target] = new Object();

			var runningTween:PropertyTween = runningProperties[propertyName];
			runningProperties[propertyName] = this;

			if (runningTween)
				runningTween.endTween();

			return true;
		}

		protected override function endTweenOverride() : void
		{
			var target:Object = this._runningTarget;
			var propertyName:String = this._runningPropertyName;

			this._runningTarget = null;
			this._runningPropertyName = null;
			this._runningStartValue = null;
			this._runningEndValue = null;
			this._runningInterpolator = null;

			var runningProperties:Object = PropertyTween._runningTargets[target];
			if (runningProperties[propertyName] != this)
				return;

			delete runningProperties[propertyName];

			for (propertyName in runningProperties)
				return;

			delete PropertyTween._runningTargets[target];
		}

		protected override function updateTweenOverride(position:Number) : Boolean
		{
			var value:* = this._runningInterpolator.interpolate(this._runningStartValue, this._runningEndValue, position);

			try
			{
				this._runningTarget[this._runningPropertyName] = value;
			}
			catch (e:Error)
			{
				return false;
			}

			return true;
		}

	}

}
