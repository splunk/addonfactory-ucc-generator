package com.splunk.charting.scale
{

	public class LinearScale implements IScale
	{

		// Constructor

		public function LinearScale()
		{
		}

		// Public Methods

		public function valueToScale(value:Number) : Number
		{
			return value;
		}

		public function scaleToValue(scale:Number) : Number
		{
			return scale;
		}

	}

}
