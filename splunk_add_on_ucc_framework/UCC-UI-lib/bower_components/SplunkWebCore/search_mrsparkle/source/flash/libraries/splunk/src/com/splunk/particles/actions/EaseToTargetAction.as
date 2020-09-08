package com.splunk.particles.actions
{

	import com.jasongatt.motion.easers.IEaser;
	import com.splunk.particles.IParticle;
	import com.splunk.particles.IParticle2D;
	import flash.geom.Point;

	public class EaseToTargetAction implements IAction
	{

		// Private Properties

		private var _targetPosition:Point;
		private var _targetVelocity:Point;
		private var _duration:Number;
		private var _easer:IEaser;

		// Constructor

		public function EaseToTargetAction(targetPosition:Point = null, targetVelocity:Point = null, duration:Number = 1, easer:IEaser = null)
		{
			this._targetPosition = targetPosition ? targetPosition : new Point();
			this._targetVelocity = targetVelocity ? targetVelocity : new Point();
			this._duration = duration;
			this._easer = easer;
		}

		// Public Getters/Setters

		public function get targetPosition() : Point
		{
			return this._targetPosition;
		}
		public function set targetPosition(value:Point) : void
		{
			this._targetPosition = value ? value : new Point();
		}

		public function get targetVelocity() : Point
		{
			return this._targetVelocity;
		}
		public function set targetVelocity(value:Point) : void
		{
			this._targetVelocity = value ? value : new Point();
		}

		public function get duration() : Number
		{
			return this._duration;
		}
		public function set duration(value:Number) : void
		{
			this._duration = value;
		}

		public function get easer() : IEaser
		{
			return this._easer;
		}
		public function set easer(value:IEaser) : void
		{
			this._easer = value;
		}

		// Public Methods

		public function apply(particle:IParticle, time:Number) : void
		{
			var particle2D:IParticle2D = particle as IParticle2D;
			if (!particle2D)
				return;

			var position:Point = particle2D.position;
			var velocity:Point = particle2D.velocity;

			var targetPosition:Point = this._targetPosition;
			var targetVelocity:Point = this._targetVelocity;

			var timeRemaining:Number = this._duration - particle2D.age;
			if (timeRemaining > 0)
			{
				if (timeRemaining < time)
					timeRemaining = time;

				var targetVX:Number = (targetPosition.x - position.x) / timeRemaining - targetVelocity.x;
				var targetVY:Number = (targetPosition.y - position.y) / timeRemaining - targetVelocity.y;

				var p:Number = time / timeRemaining;
				var easer:IEaser = this._easer;
				if (easer)
					p = easer.ease(p);

				velocity.x += (targetVX - velocity.x) * p;
				velocity.y += (targetVY - velocity.y) * p;
			}
			else
			{
				velocity.x = 0;
				velocity.y = 0;
				position.x = targetPosition.x;
				position.y = targetPosition.y;

				particle2D.die = true;
			}
		}

	}

}
