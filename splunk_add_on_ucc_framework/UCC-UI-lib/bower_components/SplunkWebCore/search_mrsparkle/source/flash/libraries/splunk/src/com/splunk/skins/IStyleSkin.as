package com.splunk.skins
{

	import com.splunk.utils.Style;

	public interface IStyleSkin extends ISkin
	{

		// Methods

		function getStyle(state:String = null) : Style;

	}

}
