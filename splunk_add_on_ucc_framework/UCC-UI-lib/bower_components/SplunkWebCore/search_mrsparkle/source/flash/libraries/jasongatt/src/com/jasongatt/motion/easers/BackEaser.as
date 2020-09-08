package com.jasongatt.motion.easers
{

	public class BackEaser extends AbstractEaser
	{

		// Public Properties

		public var scale:Number;

		// Constructor

		public function BackEaser(direction:int = 1, scale:Number = 1.70158)
		{
			super(direction);

			this.scale = scale;
		}

		// Protected Methods

		protected override function easeOverride(position:Number) : Number
		{
			var s:Number = this.scale;

			return position * position * ((s + 1) * position - s);
		}

	}

}
