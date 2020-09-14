package com.jasongatt.motion.easers
{

	public class ElasticEaser extends AbstractEaser
	{

		// Public Properties

		public var amplitude:Number;
		public var period:Number;

		// Constructor

		public function ElasticEaser(direction:int = 1, amplitude:Number = 1, period:Number = 0.3)
		{
			super(direction);

			this.amplitude = amplitude;
			this.period = period;
		}

		// Protected Methods

		protected override function easeOverride(position:Number) : Number
		{
			var a:Number = this.amplitude;
			var p:Number = this.period;

			var s:Number = p / 4;
			if (a < 1)
				a = 1;
			else
				s = p / (2 * Math.PI) * Math.asin(1 / a);
			position--;

			return -a * Math.pow(2, 10 * position) * Math.sin((position - s) * (2 * Math.PI) / p);
		}

	}

}
