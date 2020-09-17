package com.splunk.particles.emitters
{

	import com.splunk.particles.IParticle;
	import flash.events.IEventDispatcher;

	[Event(name="emitted", type="com.splunk.particles.events.ParticleEvent")]
	[Event(name="emitterUpdated", type="com.splunk.particles.events.UpdateEvent")]

	public interface IEmitter extends IEventDispatcher
	{

		// Methods

		function emit(particle:IParticle) : void;
		function updateEmitter(time:Number) : void;

	}

}
