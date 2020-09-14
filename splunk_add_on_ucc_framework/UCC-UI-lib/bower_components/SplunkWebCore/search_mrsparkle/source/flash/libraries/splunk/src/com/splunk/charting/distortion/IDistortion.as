package com.splunk.charting.distortion
{

	public interface IDistortion
	{

		// Methods

		function positionToDistortion(position:Number) : Number;
		function distortionToPosition(distortion:Number) : Number;

	}

}
