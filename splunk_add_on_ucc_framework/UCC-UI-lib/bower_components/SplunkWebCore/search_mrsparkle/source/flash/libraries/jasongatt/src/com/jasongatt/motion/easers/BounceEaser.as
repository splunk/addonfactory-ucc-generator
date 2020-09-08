package com.jasongatt.motion.easers
{

	public class BounceEaser extends AbstractEaser
	{

		// Constructor

		public function BounceEaser(direction:int = 1)
		{
			super(direction);
		}

		// Protected Methods

		protected override function easeOverride(position:Number) : Number
		{
			position = 1 - position;

			if (position < (1 / 2.75))
				position = 7.5625 * position * position;
			else if (position < (2 / 2.75))
				position = (7.5625 * (position -= (1.5 / 2.75)) * position + 0.75);
			else if (position < (2.5 / 2.75))
				position = (7.5625 * (position -= (2.25 / 2.75)) * position + 0.9375);
			else
				position = (7.5625 * (position -= (2.625 / 2.75)) * position + 0.984375);

			return 1 - position;
		}

	}

}
