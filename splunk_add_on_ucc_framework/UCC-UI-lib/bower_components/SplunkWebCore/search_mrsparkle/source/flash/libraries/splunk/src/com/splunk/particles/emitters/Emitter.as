package com.splunk.particles.emitters
{

	import com.splunk.particles.IParticle;
	import com.splunk.particles.events.ParticleEvent;
	import com.splunk.particles.events.UpdateEvent;
	import com.splunk.particles.initializers.IInitializer;
	import flash.errors.IllegalOperationError;
	import flash.events.Event;
	import flash.events.EventDispatcher;

	[Event(name="emitted", type="com.splunk.particles.events.ParticleEvent")]
	[Event(name="emitterUpdated", type="com.splunk.particles.events.UpdateEvent")]

	public class Emitter implements IEmitter
	{

		// Private Properties

		private var _initializers:Array;

		private var _target:IEmitter;
		private var _eventDispatcher:EventDispatcher;

		// Constructor

		public function Emitter(target:IEmitter = null)
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

			this._initializers = new Array();
		}

		// Public Getters/Setters

		public function get initializers() : Array
		{
			return this._initializers.concat();
		}
		public function set initializers(value:Array) : void
		{
			this._initializers = value ? value.concat() : new Array();
		}

		// Public Methods

		public function emit(particle:IParticle) : void
		{
			if (!particle)
				throw new TypeError("Parameter particle must be non-null.");

			if (particle.target)
				particle.target.release(particle);

			particle.source = this._target;
			particle.age = 0;
			particle.die = false;

			for each (var initializer:IInitializer in this._initializers)
				initializer.apply(particle);

			this._target.dispatchEvent(new ParticleEvent(ParticleEvent.EMITTED, false, false, particle));
		}

		public function updateEmitter(time:Number) : void
		{
			this._target.dispatchEvent(new UpdateEvent(UpdateEvent.EMITTER_UPDATED, false, false, time));
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
