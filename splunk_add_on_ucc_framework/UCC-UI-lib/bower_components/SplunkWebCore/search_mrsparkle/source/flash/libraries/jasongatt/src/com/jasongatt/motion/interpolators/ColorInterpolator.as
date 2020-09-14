package com.jasongatt.motion.interpolators
{

	import com.jasongatt.utils.NumberUtil;

	public class ColorInterpolator implements IInterpolator
	{

		// Constructor

		public function ColorInterpolator()
		{
		}

		// Public Methods

		public function interpolate(value1:*, value2:*, position:Number) : *
		{
			position = NumberUtil.minMax(position, 0, 1);

			var color1:uint = uint(value1);
			var color2:uint = uint(value2);

			var r1:uint = (color1 >> 16) & 0xFF;
			var g1:uint = (color1 >> 8) & 0xFF;
			var b1:uint = color1 & 0xFF;

			var r2:uint = (color2 >> 16) & 0xFF;
			var g2:uint = (color2 >> 8) & 0xFF;
			var b2:uint = color2 & 0xFF;

			var r:uint = Math.round(NumberUtil.interpolate(r1, r2, position));
			var g:uint = Math.round(NumberUtil.interpolate(g1, g2, position));
			var b:uint = Math.round(NumberUtil.interpolate(b1, b2, position));

			return (r << 16) | (g << 8) | b;
		}

	}

}
