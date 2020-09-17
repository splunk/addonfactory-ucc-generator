package com.splunk.particles.actions
{

	import com.splunk.particles.IParticle;

	public class AgeAction implements IAction
	{

		// Constructor

		public function AgeAction()
		{
		}

		// Public Methods

		public function apply(particle:IParticle, time:Number) : void
		{
			particle.age += time;
			if (particle.age >= particle.lifetime)
				particle.die = true;
		}

	}

}
