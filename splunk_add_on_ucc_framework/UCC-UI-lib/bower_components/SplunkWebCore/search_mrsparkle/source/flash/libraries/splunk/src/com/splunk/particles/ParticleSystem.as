package com.splunk.particles
{

	import com.jasongatt.motion.clocks.ClockEvent;
	import com.jasongatt.motion.clocks.FrameClock;
	import com.jasongatt.motion.clocks.IClock;
	import com.jasongatt.utils.LinkedList;
	import com.splunk.particles.collectors.ICollector;
	import com.splunk.particles.emitters.IEmitter;
	import com.splunk.particles.events.ParticleEvent;
	import flash.utils.Dictionary;

	public class ParticleSystem
	{

		// Private Properties

		private var _clock:IClock;

		private var _emitters:LinkedList;
		private var _collectors:LinkedList;
		private var _particles:LinkedList;
		private var _defaultClock:FrameClock;

		// Constructor

		public function ParticleSystem()
		{
			this._emitters = new LinkedList();
			this._collectors = new LinkedList();
			this._particles = new LinkedList();

			this._defaultClock = new FrameClock(true);
			this._defaultClock.addEventListener(ClockEvent.TICK, this._clock_tick);
		}

		// Public Getters/Setters

		public function get clock() : IClock
		{
			return this._clock;
		}
		public function set clock(value:IClock) : void
		{
			if (this._clock == value)
				return;

			if (this._clock)
			{
				this._clock.removeEventListener(ClockEvent.TICK, this._clock_tick);
			}
			else
			{
				this._defaultClock.removeEventListener(ClockEvent.TICK, this._clock_tick);
				this._defaultClock.stop();
			}

			this._clock = value;

			if (this._clock)
			{
				this._clock.addEventListener(ClockEvent.TICK, this._clock_tick, false, 0, true);
			}
			else
			{
				this._defaultClock.addEventListener(ClockEvent.TICK, this._clock_tick);
				this._defaultClock.start();
			}
		}

		// Public Methods

		public function addEmitter(emitter:IEmitter) : void
		{
			if (!emitter)
				throw new TypeError("Parameter emitter must be non-null.");

			if (!this._emitters.contains(emitter))
				emitter.addEventListener(ParticleEvent.EMITTED, this._emitter_emitted, false, int.MAX_VALUE);

			this._emitters.addLast(emitter);
		}

		public function removeEmitter(emitter:IEmitter) : void
		{
			if (!emitter)
				throw new TypeError("Parameter emitter must be non-null.");

			if (!this._emitters.contains(emitter))
				return;

			emitter.removeEventListener(ParticleEvent.EMITTED, this._emitter_emitted);

			this._emitters.remove(emitter);
		}

		public function addCollector(collector:ICollector) : void
		{
			if (!collector)
				throw new TypeError("Parameter collector must be non-null.");

			this._collectors.addLast(collector);
		}

		public function removeCollector(collector:ICollector, source:IEmitter = null) : void
		{
			if (!collector)
				throw new TypeError("Parameter collector must be non-null.");

			this._collectors.remove(collector);
		}

		// Private Methods

		private function _emitter_emitted(e:ParticleEvent) : void
		{
			var particle:IParticle = e.particle;
			if (!particle)
				return;

			this._particles.addLast(particle);
		}

		private function _clock_tick(e:ClockEvent) : void
		{
			var time:Number = e.time;

			var emitters:Array = this._emitters.toArray();
			for each (var emitter:IEmitter in emitters)
				emitter.updateEmitter(time);

			var collectors:Array = this._collectors.toArray();
			var globalCollectors:Array = new Array();
			var sourceCollectorsMap:Dictionary = new Dictionary();
			var sourceCollectors:Array;
			var numCollectors:int;
			var collector:ICollector;
			var collector2:ICollector;
			var priority:Number;
			var priority2:Number;
			var sources:Array;
			var source:IEmitter;
			var i:int;

			for each (collector in collectors)
			{
				priority = collector.priority;
				if (priority != priority)
					priority = -Infinity;

				sources = collector.sources;
				if (sources)
				{
					for each (source in sources)
					{
						sourceCollectors = sourceCollectorsMap[source];
						if (!sourceCollectors)
							sourceCollectors = sourceCollectorsMap[source] = new Array();

						numCollectors = sourceCollectors.length;
						for (i = 0; i < numCollectors; i++)
						{
							collector2 = sourceCollectors[i];
							priority2 = collector2.priority;
							if (priority2 != priority2)
								priority2 = -Infinity;

							if (priority > priority2)
							{
								sourceCollectors.splice(i, 0, collector);
								break;
							}
						}
						if (i == numCollectors)
							sourceCollectors.push(collector);
					}
				}
				else
				{
					numCollectors = globalCollectors.length;
					for (i = 0; i < numCollectors; i++)
					{
						collector2 = globalCollectors[i];
						priority2 = collector2.priority;
						if (priority2 != priority2)
							priority2 = -Infinity;

						if (priority > priority2)
						{
							globalCollectors.splice(i, 0, collector);
							break;
						}
					}
					if (i == numCollectors)
						globalCollectors.push(collector);
				}
			}

			var particles:Array = this._particles.toArray();
			var collected:Boolean;

			this._particles = new LinkedList();

			for each (var particle:IParticle in particles)
			{
				source = particle.source;
				if (source)
				{
					collected = false;

					sourceCollectors = sourceCollectorsMap[source];
					if (sourceCollectors)
					{
						for each (collector in sourceCollectors)
						{
							if (collector.collect(particle))
							{
								collected = true;
								break;
							}
						}
					}

					if (!collected)
					{
						for each (collector in globalCollectors)
						{
							if (collector.collect(particle))
								break;
						}
					}
				}
			}

			for each (collector in collectors)
				collector.updateCollector(time);
		}

	}

}
