package com.jasongatt.motion.easers
{

	public class QuadraticEaser extends AbstractEaser
	{

		// Constructor

		public function QuadraticEaser(direction:int = 1)
		{
			super(direction);
		}

		// Protected Methods

		protected override function easeOverride(position:Number) : Number
		{
			return position * position;
		}

	}

}
