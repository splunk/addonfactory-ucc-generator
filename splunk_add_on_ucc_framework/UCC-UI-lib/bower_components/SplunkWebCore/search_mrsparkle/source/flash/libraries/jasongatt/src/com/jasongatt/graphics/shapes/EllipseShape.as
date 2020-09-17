package com.jasongatt.graphics.shapes
{

	import com.jasongatt.graphics.brushes.DrawingUtils;
	import com.jasongatt.graphics.brushes.IBrush;

	public class EllipseShape extends AbstractShape
	{

		// Constructor

		public function EllipseShape()
		{
		}

		// Protected Methods

		protected override function drawOverride(width:Number, height:Number, brush:IBrush) : void
		{
			var radiusX:Number = width / 2;
			var radiusY:Number = height / 2;

			DrawingUtils.drawEllipse(brush, radiusX, radiusY, radiusX, radiusY);
		}

	}

}
