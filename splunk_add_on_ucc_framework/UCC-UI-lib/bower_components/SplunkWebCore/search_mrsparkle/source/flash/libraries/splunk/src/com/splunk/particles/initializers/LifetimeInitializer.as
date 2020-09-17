package com.splunk.particles.initializers
{

	import com.splunk.particles.IParticle;
	import com.splunk.particles.distributions.IDistribution;

	public class LifetimeInitializer implements IInitializer
	{

		// Public Properties

		public var distribution:IDistribution;

		// Constructor

		public function LifetimeInitializer(distribution:IDistribution = null)
		{
			this.distribution = distribution;
		}

		// Public Methods

		public function apply(particle:IParticle) : void
		{
			var distribution:IDistribution = this.distribution;
			if (!distribution)
				return;

			particle.lifetime = distribution.getRandomValue();
		}

	}

}
