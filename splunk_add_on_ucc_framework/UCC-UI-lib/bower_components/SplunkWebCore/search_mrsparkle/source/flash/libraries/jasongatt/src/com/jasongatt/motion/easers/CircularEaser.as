package com.jasongatt.motion.easers
{

	public class CircularEaser extends AbstractEaser
	{

		// Constructor

		public function CircularEaser(direction:int = 1)
		{
			super(direction);
		}

		// Protected Methods

		protected override function easeOverride(position:Number) : Number
		{
			return 1 - Math.sqrt(1 - position * position);
		}

	}

}
