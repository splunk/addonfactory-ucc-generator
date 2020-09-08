package com.splunk.particles.distributions
{

	import flash.geom.Point;

	public class GroupDistribution2D implements IDistribution2D
	{

		// Private Properties

		private var _distributions:Array;

		// Constructor

		public function GroupDistribution2D(distributions:Array = null)
		{
			this._distributions = distributions ? distributions.concat() : new Array();
		}

		// Public Getters/Setters

		public function get distributions() : Array
		{
			return this._distributions.concat();
		}
		public function set distributions(value:Array) : void
		{
			this._distributions = value ? value.concat() : new Array();
		}

		// Public Methods

		public function getRandomPoint() : Point
		{
			var distributions:Array = this._distributions;
			var numDistributions:int = distributions.length;
			var distribution:IDistribution2D;
			var areas:Array = new Array(numDistributions);
			var area:Number;
			var totalArea:Number = 0;
			var i:int;

			for (i = 0; i < numDistributions; i++)
			{
				distribution = distributions[i];
				area = distribution.getArea();
				areas[i] = area;
				totalArea += area;
			}

			totalArea *= Math.random();

			for (i = 0; i < numDistributions; i++)
			{
				area = areas[i];
				totalArea -= area;
				if (totalArea <= 0)
				{
					distribution = distributions[i];
					return distribution.getRandomPoint();
				}
			}

			return new Point();
		}

		public function getArea() : Number
		{
			var area:Number = 0;
			for each (var distribution:IDistribution2D in this._distributions)
				area += distribution.getArea();
			return area;
		}

		public function containsPoint(point:Point) : Boolean
		{
			for each (var distribution:IDistribution2D in this._distributions)
			{
				if (distribution.containsPoint(point))
					return true;
			}
			return false;
		}

	}

}
