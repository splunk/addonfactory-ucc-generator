package com.jasongatt.motion.easers
{

	public class CubicEaser extends AbstractEaser
	{

		// Constructor

		public function CubicEaser(direction:int = 1)
		{
			super(direction);
		}

		// Protected Methods

		protected override function easeOverride(position:Number) : Number
		{
			return position * position * position;
		}

	}

}
