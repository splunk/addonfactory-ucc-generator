package com.splunk.particles.distributions
{

	public class PowerDistribution implements IDistribution
	{

		// Public Properties

		public var minimum:Number;
		public var maximum:Number;
		public var power:Number;

		// Constructor

		public function PowerDistribution(minimum:Number = 0, maximum:Number = 0, power:Number = 2)
		{
			this.minimum = minimum;
			this.maximum = maximum;
			this.power = power;
		}

		// Public Methods

		public function getRandomValue() : Number
		{
			var r:Number = Math.random();
			r = Math.pow(r, this.power);
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
