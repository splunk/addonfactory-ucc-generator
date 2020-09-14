package com.jasongatt.motion
{

	import com.jasongatt.motion.easers.IEaser;
	import flash.events.EventDispatcher;

	[Event(name="begin", type="com.jasongatt.motion.TweenEvent")]
	[Event(name="end", type="com.jasongatt.motion.TweenEvent")]
	[Event(name="update", type="com.jasongatt.motion.TweenEvent")]

	public /*abstract*/ class AbstractTween extends EventDispatcher implements ITween
	{

		// Private Properties

		private var _easer:IEaser;

		private var _isRunning:Boolean = false;

		// Constructor

		public function AbstractTween(easer:IEaser = null)
		{
			this._easer = easer;
		}

		// Public Getters/Setters

		public function get easer() : IEaser
		{
			return this._easer;
		}
		public function set easer(value:IEaser) : void
		{
			this._easer = value;
			this.endTween();
		}

		// Public Methods

		public function beginTween() : Boolean
		{
			this.endTween();

			if (!this.beginTweenOverride())
				return false;

			this._isRunning = true;

			this.dispatchEvent(new TweenEvent(TweenEvent.BEGIN));

			return true;
		}

		public function endTween() : Boolean
		{
			if (!this._isRunning)
				return false;

			this.endTweenOverride();

			this._isRunning = false;

			this.dispatchEvent(new TweenEvent(TweenEvent.END));

			return true;
		}

		public function updateTween(position:Number) : Boolean
		{
			if (!this._isRunning)
				return false;

			var easer:IEaser = this._easer;
			if (easer)
				position = easer.ease(position);

			if (!this.updateTweenOverride(position))
				return false;

			this.dispatchEvent(new TweenEvent(TweenEvent.UPDATE));

			return true;
		}

		// Protected Methods

		protected function beginTweenOverride() : Boolean
		{
			return false;
		}

		protected function endTweenOverride() : void
		{
		}

		protected function updateTweenOverride(position:Number) : Boolean
		{
			return false;
		}

	}

}
