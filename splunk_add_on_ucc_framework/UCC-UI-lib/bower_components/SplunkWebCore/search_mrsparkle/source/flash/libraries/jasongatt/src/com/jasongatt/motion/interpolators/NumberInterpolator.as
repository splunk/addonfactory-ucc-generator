package com.jasongatt.motion.interpolators
{

	import com.jasongatt.utils.NumberUtil;

	public class NumberInterpolator implements IInterpolator
	{

		// Public Properties

		public var snap:Number;

		// Constructor

		public function NumberInterpolator(snap:Number = 0)
		{
			this.snap = snap;
		}

		// Public Methods

		public function interpolate(value1:*, value2:*, position:Number) : *
		{
			var number1:Number = Number(value1);
			var number2:Number = Number(value2);

			var number:Number = NumberUtil.interpolate(number1, number2, position);

			var snap:Number = this.snap;
			if (snap > 0)
				number = Math.round(number / snap) * snap;

			return number;
		}

	}

}
