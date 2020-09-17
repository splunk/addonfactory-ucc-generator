package com.splunk.particles.actions
{

	import com.splunk.particles.IParticle;

	public interface IAction
	{

		// Methods

		function apply(particle:IParticle, time:Number) : void;

	}

}
