package com.splunk.charting.scale
{

	public class PowerScale implements IScale
	{

		// Public Properties

		public var power:Number;

		// Constructor

		public function PowerScale(power:Number = 2)
		{
			this.power = power;
		}

		// Public Methods

		public function valueToScale(value:Number) : Number
		{
			if (value < 0)
				return -Math.pow(-value, this.power);
			return Math.pow(value, this.power);
		}

		public function scaleToValue(scale:Number) : Number
		{
			if (scale < 0)
				return -Math.pow(-scale, 1 / this.power);
			return Math.pow(scale, 1 / this.power);
		}

	}

}
