package com.jasongatt.graphics.shapes
{

	import com.jasongatt.graphics.brushes.IBrush;

	public class DiamondShape extends AbstractShape
	{

		// Constructor

		public function DiamondShape()
		{
		}

		// Protected Methods

		protected override function drawOverride(width:Number, height:Number, brush:IBrush) : void
		{
			var halfWidth:Number = width / 2;
			var halfHeight:Number = height / 2;

			brush.moveTo(halfWidth, 0);
			brush.lineTo(width, halfHeight);
			brush.lineTo(halfWidth, height);
			brush.lineTo(0, halfHeight);
			brush.lineTo(halfWidth, 0);
		}

	}

}
