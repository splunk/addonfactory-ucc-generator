package com.splunk.particles
{

	import com.splunk.particles.collectors.ICollector;
	import com.splunk.particles.emitters.IEmitter;
	import flash.utils.Dictionary;

	public class Particle implements IParticle
	{

		// Private Properties

		private var _source:IEmitter;
		private var _target:ICollector;
		private var _mass:Number = 1;
		private var _age:Number = 0;
		private var _lifetime:Number = Infinity;
		private var _die:Boolean = false;
		private var _metadata:Dictionary;

		// Constructor

		public function Particle()
		{
			this._metadata = new Dictionary();
		}

		// Public Getters/Setters

		public function get source() : IEmitter
		{
			return this._source;
		}
		public function set source(value:IEmitter) : void
		{
			this._source = value;
		}

		public function get target() : ICollector
		{
			return this._target;
		}
		public function set target(value:ICollector) : void
		{
			this._target = value;
		}

		public function get mass() : Number
		{
			return this._mass;
		}
		public function set mass(value:Number) : void
		{
			this._mass = value;
		}

		public function get age() : Number
		{
			return this._age;
		}
		public function set age(value:Number) : void
		{
			this._age = value;
		}

		public function get lifetime() : Number
		{
			return this._lifetime;
		}
		public function set lifetime(value:Number) : void
		{
			this._lifetime = value;
		}

		public function get die() : Boolean
		{
			return this._die;
		}
		public function set die(value:Boolean) : void
		{
			this._die = value;
		}

		public function get metadata() : Dictionary
		{
			return this._metadata;
		}

	}

}
