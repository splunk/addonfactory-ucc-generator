package com.splunk.particles
{

	import com.splunk.particles.collectors.ICollector;
	import com.splunk.particles.emitters.IEmitter;
	import flash.utils.Dictionary;

	public interface IParticle
	{

		// Getters/Setters

		function get source() : IEmitter;
		function set source(value:IEmitter) : void;

		function get target() : ICollector;
		function set target(value:ICollector) : void;

		function get mass() : Number;
		function set mass(value:Number) : void;

		function get age() : Number;
		function set age(value:Number) : void;

		function get lifetime() : Number;
		function set lifetime(value:Number) : void;

		function get die() : Boolean;
		function set die(value:Boolean) : void;

		function get metadata() : Dictionary;

	}

}
