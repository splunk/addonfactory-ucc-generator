package com.jasongatt.motion.easers
{

	public class SineEaser extends AbstractEaser
	{

		// Constructor

		public function SineEaser(direction:int = 1)
		{
			super(direction);
		}

		// Protected Methods

		protected override function easeOverride(position:Number) : Number
		{
			return 1 - Math.sin((1 - position) * Math.PI / 2);
		}

	}

}
