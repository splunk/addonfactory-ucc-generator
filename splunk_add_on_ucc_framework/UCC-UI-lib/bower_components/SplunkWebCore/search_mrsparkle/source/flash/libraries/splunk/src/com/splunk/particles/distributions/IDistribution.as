package com.splunk.particles.distributions
{

	public interface IDistribution
	{

		// Methods

		function getRandomValue() : Number;
		function getLength() : Number;
		function containsValue(value:Number) : Boolean;

	}

}
