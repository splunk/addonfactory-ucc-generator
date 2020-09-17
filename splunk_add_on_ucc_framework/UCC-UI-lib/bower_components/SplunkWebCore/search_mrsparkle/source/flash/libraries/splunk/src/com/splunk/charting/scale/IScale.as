package com.splunk.charting.scale
{

	public interface IScale
	{

		// Methods

		function valueToScale(value:Number) : Number;
		function scaleToValue(scale:Number) : Number;

	}

}
