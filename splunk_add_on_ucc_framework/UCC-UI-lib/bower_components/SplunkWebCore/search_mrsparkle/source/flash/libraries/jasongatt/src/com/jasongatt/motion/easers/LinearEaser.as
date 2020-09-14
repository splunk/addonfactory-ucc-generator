package com.jasongatt.motion.easers
{

	public class LinearEaser extends AbstractEaser
	{

		// Constructor

		public function LinearEaser(direction:int = 1)
		{
			super(direction);
		}

		// Protected Methods

		protected override function easeOverride(position:Number) : Number
		{
			return position;
		}

	}

}
