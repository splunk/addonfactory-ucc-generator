package com.splunk.particles.collectors
{

	import com.jasongatt.utils.LinkedList;
	import com.splunk.particles.IParticle;
	import com.splunk.particles.actions.IAction;
	import com.splunk.particles.events.ParticleEvent;
	import com.splunk.particles.events.UpdateEvent;
	import com.splunk.particles.filters.IFilter;
	import flash.errors.IllegalOperationError;
	import flash.events.Event;
	import flash.events.EventDispatcher;

	[Event(name="collected", type="com.splunk.particles.events.ParticleEvent")]
	[Event(name="released", type="com.splunk.particles.events.ParticleEvent")]
	[Event(name="collectorUpdated", type="com.splunk.particles.events.UpdateEvent")]

	public class Collector implements ICollector
	{

		// Private Properties

		private var _filter:IFilter;
		private var _actions:Array;
		private var _sources:Array;
		private var _priority:Number = 0;
		private var _particles:LinkedList;

		private var _target:ICollector;
		private var _eventDispatcher:EventDispatcher;
		private var _cachedParticles:Array;

		// Constructor

		public function Collector(target:ICollector = null)
		{
			if (target && (target != this))
			{
				this._target = target;
			}
			else
			{
				this._target = this;
				this._eventDispatcher = new EventDispatcher(this);
			}

			this._actions = new Array();
			this._particles = new LinkedList();
		}

		// Public Getters/Setters

		public function get filter() : IFilter
		{
			return this._filter;
		}
		public function set filter(value:IFilter) : void
		{
			this._filter = value;
		}

		public function get actions() : Array
		{
			return this._actions.concat();
		}
		public function set actions(value:Array) : void
		{
			this._actions = value ? value.concat() : new Array();
		}

		public function get sources() : Array
		{
			var value:Array = this._sources;
			return value ? value.concat() : null;
		}
		public function set sources(value:Array) : void
		{
			this._sources = value ? value.concat() : null;
		}

		public function get priority() : Number
		{
			return this._priority;
		}
		public function set priority(value:Number) : void
		{
			this._priority = value;
		}

		public function get particles() : Array
		{
			var value:Array = this._cachedParticles;
			if (!value)
				value = this._cachedParticles = this._particles.toArray();
			return value;
		}

		// Public Methods

		public function collect(particle:IParticle) : Boolean
		{
			if (!particle)
				throw new TypeError("Parameter particle must be non-null.");

			if (this._particles.contains(particle))
				return true;

			if (particle.die)
				return false;

			var filter:IFilter = this._filter;
			if (filter && !filter.contains(particle))
				return false;

			if (particle.target)
				particle.target.release(particle);

			this._particles.addLast(particle);
			this._cachedParticles = null;

			particle.target = this._target;

			this._target.dispatchEvent(new ParticleEvent(ParticleEvent.COLLECTED, false, false, particle));

			return true;
		}

		public function release(particle:IParticle) : void
		{
			if (!particle)
				throw new TypeError("Parameter particle must be non-null.");

			if (!this._particles.contains(particle))
				return;

			this._particles.remove(particle);
			this._cachedParticles = null;

			particle.target = null;

			this._target.dispatchEvent(new ParticleEvent(ParticleEvent.RELEASED, false, false, particle));
		}

		public function updateCollector(time:Number) : void
		{
			var particles:Array = this._cachedParticles;
			if (!particles)
				particles = this._cachedParticles = this._particles.toArray();

			var deadParticles:Array = new Array();
			var particle:IParticle;

			var actions:Array = this._actions;
			var action:IAction;

			var target:ICollector = this._target;

			for each (particle in particles)
			{
				for each (action in actions)
					action.apply(particle, time);

				if (particle.die)
					deadParticles.push(particle);
			}

			for each (particle in deadParticles)
				target.release(particle);

			target.dispatchEvent(new UpdateEvent(UpdateEvent.COLLECTOR_UPDATED, false, false, time));
		}

		public function addEventListener(type:String, listener:Function, useCapture:Boolean = false, priority:int = 0, useWeakReference:Boolean = false) : void
		{
			var eventDispatcher:EventDispatcher = this._eventDispatcher;
			if (!eventDispatcher)
				throw new IllegalOperationError("Must use a separate instance of IEventDispatcher.");

			eventDispatcher.addEventListener(type, listener, useCapture, priority, useWeakReference);
		}

		public function removeEventListener(type:String, listener:Function, useCapture:Boolean = false) : void
		{
			var eventDispatcher:EventDispatcher = this._eventDispatcher;
			if (!eventDispatcher)
				throw new IllegalOperationError("Must use a separate instance of IEventDispatcher.");

			eventDispatcher.removeEventListener(type, listener, useCapture);
		}

		public function dispatchEvent(event:Event) : Boolean
		{
			var eventDispatcher:EventDispatcher = this._eventDispatcher;
			if (!eventDispatcher)
				throw new IllegalOperationError("Must use a separate instance of IEventDispatcher.");

			return eventDispatcher.dispatchEvent(event);
		}

		public function hasEventListener(type:String) : Boolean
		{
			var eventDispatcher:EventDispatcher = this._eventDispatcher;
			if (!eventDispatcher)
				throw new IllegalOperationError("Must use a separate instance of IEventDispatcher.");

			return eventDispatcher.hasEventListener(type);
		}

		public function willTrigger(type:String) : Boolean
		{
			var eventDispatcher:EventDispatcher = this._eventDispatcher;
			if (!eventDispatcher)
				throw new IllegalOperationError("Must use a separate instance of IEventDispatcher.");

			return eventDispatcher.willTrigger(type);
		}

	}

}
