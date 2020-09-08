package com.splunk.particles
{

	import flash.geom.Point;

	public interface IParticle2D extends IParticle
	{

		// Getters/Setters

		function get position() : Point;
		function set position(value:Point) : void;

		function get velocity() : Point;
		function set velocity(value:Point) : void;

	}

}
