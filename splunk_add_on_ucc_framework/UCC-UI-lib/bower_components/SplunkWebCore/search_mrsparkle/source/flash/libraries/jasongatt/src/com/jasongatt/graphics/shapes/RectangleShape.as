package com.jasongatt.graphics.shapes
{

	import com.jasongatt.graphics.brushes.IBrush;

	public class RectangleShape extends AbstractShape
	{

		// Constructor

		public function RectangleShape()
		{
		}

		// Protected Methods

		protected override function drawOverride(width:Number, height:Number, brush:IBrush) : void
		{
			brush.moveTo(0, 0);
			brush.lineTo(width, 0);
			brush.lineTo(width, height);
			brush.lineTo(0, height);
			brush.lineTo(0, 0);
		}

	}

}
