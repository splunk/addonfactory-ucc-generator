package com.jasongatt.motion.easers
{

	public class PowerEaser extends AbstractEaser
	{

		// Public Properties

		public var power:Number;

		// Constructor

		public function PowerEaser(direction:int = 1, power:Number = 2)
		{
			super(direction);

			this.power = power;
		}

		// Protected Methods

		protected override function easeOverride(position:Number) : Number
		{
			return Math.pow(position, this.power);
		}

	}

}
