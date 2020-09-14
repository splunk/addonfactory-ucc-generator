package com.splunk.particles.distributions
{

	public class LinearDistribution implements IDistribution
	{

		// Public Properties

		public var minimum:Number;
		public var maximum:Number;

		// Constructor

		public function LinearDistribution(minimum:Number = 0, maximum:Number = 0)
		{
			this.minimum = minimum;
			this.maximum = maximum;
		}

		// Public Methods

		public function getRandomValue() : Number
		{
			var r:Number = Math.random();
			return this.minimum * (1 - r) + this.maximum * r;
		}

		public function getLength() : Number
		{
			return Math.abs(this.maximum - this.minimum) + 1;
		}

		public function containsValue(value:Number) : Boolean
		{
			var minimum:Number = this.minimum;
			var maximum:Number = this.maximum;
			if (minimum > maximum)
			{
				var temp:Number = minimum;
				minimum = maximum;
				maximum = temp;
			}
			return ((value >= minimum) && (value <= maximum));
		}

	}

}
