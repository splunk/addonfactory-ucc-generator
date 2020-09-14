package com.splunk.particles.actions
{

	import com.splunk.particles.IParticle;
	import com.splunk.particles.IParticle2D;
	import flash.geom.Point;

	public class MoveAction implements IAction
	{

		// Constructor

		public function MoveAction()
		{
		}

		// Public Methods

		public function apply(particle:IParticle, time:Number) : void
		{
			var particle2D:IParticle2D = particle as IParticle2D;
			if (!particle2D)
				return;

			var position:Point = particle2D.position;
			var velocity:Point = particle2D.velocity;

			position.x += velocity.x * time;
			position.y += velocity.y * time;
		}

	}

}
