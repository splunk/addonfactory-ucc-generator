package com.splunk.particles.initializers
{

	import com.splunk.particles.IParticle;
	import com.splunk.particles.IParticle2D;
	import com.splunk.particles.distributions.IDistribution2D;

	public class PositionInitializer implements IInitializer
	{

		// Public Properties

		public var distribution:IDistribution2D;

		// Constructor

		public function PositionInitializer(distribution:IDistribution2D = null)
		{
			this.distribution = distribution;
		}

		// Public Methods

		public function apply(particle:IParticle) : void
		{
			var particle2D:IParticle2D = particle as IParticle2D;
			if (!particle2D)
				return;

			var distribution:IDistribution2D = this.distribution;
			if (!distribution)
				return;

			particle2D.position = distribution.getRandomPoint();
		}

	}

}
