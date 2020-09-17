package com.jasongatt.graphics.shapes
{

	import com.jasongatt.graphics.brushes.IBrush;
	import flash.display.Graphics;
	import flash.geom.Matrix;

	public interface IShape
	{

		// Methods

		function draw(graphics:Graphics, x:Number, y:Number, width:Number, height:Number, brush:IBrush = null, matrix:Matrix = null, bounds:Array = null) : void;

	}

}
