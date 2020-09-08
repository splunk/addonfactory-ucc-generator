package com.splunk.particles.filters
{

	import com.splunk.particles.IParticle;

	public interface IFilter
	{

		// Methods

		function contains(particle:IParticle) : Boolean;

	}

}
