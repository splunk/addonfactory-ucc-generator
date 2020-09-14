package com.splunk.palettes.shape
{

	import com.jasongatt.graphics.shapes.IShape;

	public interface IShapePalette
	{

		// Methods

		function getShape(field:String, index:int, count:int) : IShape;

	}

}
