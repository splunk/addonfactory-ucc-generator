package com.splunk.particles.distributions
{

	import flash.geom.Point;

	public interface IDistribution2D
	{

		// Methods

		function getRandomPoint() : Point;
		function getArea() : Number;
		function containsPoint(point:Point) : Boolean;

	}

}
