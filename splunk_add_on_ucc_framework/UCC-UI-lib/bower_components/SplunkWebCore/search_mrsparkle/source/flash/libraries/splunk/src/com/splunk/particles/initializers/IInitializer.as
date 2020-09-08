package com.splunk.particles.initializers
{

	import com.splunk.particles.IParticle;

	public interface IInitializer
	{

		// Methods

		function apply(particle:IParticle) : void;

	}

}
