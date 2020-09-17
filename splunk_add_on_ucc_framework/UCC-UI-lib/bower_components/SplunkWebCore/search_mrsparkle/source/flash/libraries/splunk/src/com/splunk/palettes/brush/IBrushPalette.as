package com.splunk.palettes.brush
{

	import com.jasongatt.graphics.brushes.IBrush;

	public interface IBrushPalette
	{

		// Methods

		function getBrush(field:String, index:int, count:int) : IBrush;

	}

}
