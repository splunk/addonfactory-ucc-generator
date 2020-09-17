package com.jasongatt.graphics.brushes
{

	public class CurveToInstruction
	{

		// Public Properties

		public var controlX:Number;
		public var controlY:Number;
		public var anchorX:Number;
		public var anchorY:Number;

		// Constructor

		public function CurveToInstruction(controlX:Number, controlY:Number, anchorX:Number, anchorY:Number)
		{
			this.controlX = controlX;
			this.controlY = controlY;
			this.anchorX = anchorX;
			this.anchorY = anchorY;
		}

	}

}
