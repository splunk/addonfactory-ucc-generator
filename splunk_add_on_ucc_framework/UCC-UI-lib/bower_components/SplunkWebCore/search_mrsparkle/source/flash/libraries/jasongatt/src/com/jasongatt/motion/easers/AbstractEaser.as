package com.jasongatt.motion.easers
{

	public /*abstract*/ class AbstractEaser implements IEaser
	{

		// Public Properties

		public var direction:int;

		// Constructor

		public function AbstractEaser(direction:int = 1)
		{
			this.direction = direction;
		}

		// Public Methods

		public function ease(position:Number) : Number
		{
			if (this.direction > 0)
				return this.easeOverride(position);
			else if (this.direction < 0)
				return 1 - this.easeOverride(1 - position);

			if (position < 0.5)
				return this.easeOverride(position * 2) / 2;
			return 0.5 + (1 - this.easeOverride(2 - position * 2)) / 2;
		}

		// Protected Methods

		protected function easeOverride(position:Number) : Number
		{
			return position;
		}

	}

}
