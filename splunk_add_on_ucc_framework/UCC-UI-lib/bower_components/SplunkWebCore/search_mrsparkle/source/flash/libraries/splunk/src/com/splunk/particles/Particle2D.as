package com.splunk.particles
{

	import flash.geom.Point;

	public class Particle2D extends Particle implements IParticle2D
	{

		// Private Properties

		private var _position:Point;
		private var _velocity:Point;

		// Constructor

		public function Particle2D(position:Point = null, velocity:Point = null)
		{
			this._position = position ? position : new Point();
			this._velocity = velocity ? velocity : new Point();
		}

		// Public Getters/Setters

		public function get position() : Point
		{
			return this._position;
		}
		public function set position(value:Point) : void
		{
			this._position = value ? value : new Point();
		}

		public function get velocity() : Point
		{
			return this._velocity;
		}
		public function set velocity(value:Point) : void
		{
			this._velocity = value ? value : new Point();
		}

	}

}
