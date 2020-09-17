package com.splunk.particles.emitters
{

	import com.splunk.particles.Particle2D;
	import com.splunk.particles.events.UpdateEvent;

	public class MockStreamEmitter extends Emitter
	{

		// Private Properties

		private var _eps:Number;

		private var _emitCount:Number = 0;
		private var _isOpened:Boolean = false;

		// Constructor

		public function MockStreamEmitter(eps:Number = 50)
		{
			this._eps = eps;

			this.addEventListener(UpdateEvent.EMITTER_UPDATED, this._self_emitterUpdated, false, int.MAX_VALUE);
		}

		// Public Getters/Setters

		public function get eps() : Number
		{
			return this._eps;
		}
		public function set eps(value:Number) : void
		{
			this._eps = value;
		}

		// Public Methods

		public function open() : void
		{
			this._isOpened = true;
			this._emitCount = 0;
		}

		public function close() : void
		{
			this._isOpened = false;
		}

		// Private Methods

		private function _self_emitterUpdated(e:UpdateEvent) : void
		{
			if (!this._isOpened)
				return;

			var time:Number = e.time;
			var emitCount:Number = this._emitCount + this._eps * time;
			for (emitCount; emitCount >= 1; emitCount--)
				this.emit(new Particle2D());
			this._emitCount = emitCount;
		}

	}

}
