package com.splunk.particles.events
{

	import com.splunk.particles.IParticle;
	import flash.events.Event;

	public class ParticleEvent extends Event
	{

		// Public Static Constants

		public static const EMITTED:String = "emitted";
		public static const COLLECTED:String = "collected";
		public static const RELEASED:String = "released";

		// Private Properties

		private var _particle:IParticle;

		// Constructor

		public function ParticleEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, particle:IParticle = null)
		{
			super(type, bubbles, cancelable);

			this._particle = particle;
		}

		// Public Getters/Setters

		public function get particle() : IParticle
		{
			return this._particle;
		}

		// Public Methods

		public override function clone() : Event
		{
			return new ParticleEvent(this.type, this.bubbles, this.cancelable, this.particle);
		}

		public override function toString() : String
		{
			return this.formatToString("ParticleEvent", "type", "bubbles", "cancelable", "eventPhase", "particle");
		}

	}

}
