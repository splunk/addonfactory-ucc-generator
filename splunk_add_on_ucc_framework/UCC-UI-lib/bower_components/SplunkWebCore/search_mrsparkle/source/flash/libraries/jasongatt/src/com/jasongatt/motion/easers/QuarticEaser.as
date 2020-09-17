package com.jasongatt.motion.easers
{

	public class QuarticEaser extends AbstractEaser
	{

		// Constructor

		public function QuarticEaser(direction:int = 1)
		{
			super(direction);
		}

		// Protected Methods

		protected override function easeOverride(position:Number) : Number
		{
			return position * position * position * position;
		}

	}

}
