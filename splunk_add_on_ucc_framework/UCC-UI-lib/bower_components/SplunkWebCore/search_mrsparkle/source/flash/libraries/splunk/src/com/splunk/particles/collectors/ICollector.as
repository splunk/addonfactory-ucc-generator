package com.splunk.particles.collectors
{

	import com.splunk.particles.IParticle;
	import flash.events.IEventDispatcher;

	[Event(name="collected", type="com.splunk.particles.events.ParticleEvent")]
	[Event(name="released", type="com.splunk.particles.events.ParticleEvent")]
	[Event(name="collectorUpdated", type="com.splunk.particles.events.UpdateEvent")]

	public interface ICollector extends IEventDispatcher
	{

		// Getters/Setters

		function get sources() : Array;
		function set sources(value:Array) : void;

		function get priority() : Number;
		function set priority(value:Number) : void;

		function get particles() : Array;

		// Methods

		function collect(particle:IParticle) : Boolean;
		function release(particle:IParticle) : void;
		function updateCollector(time:Number) : void;

	}

}
