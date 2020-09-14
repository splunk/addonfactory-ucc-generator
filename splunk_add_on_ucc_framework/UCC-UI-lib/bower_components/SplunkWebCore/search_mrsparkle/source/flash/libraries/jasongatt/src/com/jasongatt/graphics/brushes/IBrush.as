package com.jasongatt.graphics.brushes
{

	import flash.display.Graphics;
	import flash.geom.Matrix;

	public interface IBrush
	{

		// Methods

		function beginBrush(graphics:Graphics, matrix:Matrix = null, bounds:Array = null) : void;
		function endBrush() : void;
		function moveTo(x:Number, y:Number) : void;
		function lineTo(x:Number, y:Number) : void;
		function curveTo(controlX:Number, controlY:Number, anchorX:Number, anchorY:Number) : void;

	}

}
