package com.jasongatt.motion.easers
{

	public class QuinticEaser extends AbstractEaser
	{

		// Constructor

		public function QuinticEaser(direction:int = 1)
		{
			super(direction);
		}

		// Protected Methods

		protected override function easeOverride(position:Number) : Number
		{
			return position * position * position * position * position;
		}

	}

}
