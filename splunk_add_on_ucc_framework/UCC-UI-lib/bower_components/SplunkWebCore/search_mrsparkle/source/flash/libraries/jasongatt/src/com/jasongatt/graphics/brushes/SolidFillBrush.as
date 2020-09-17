package com.jasongatt.graphics.brushes
{

	import com.jasongatt.core.ObservableProperty;
	import flash.display.Graphics;
	import flash.geom.Matrix;

	public class SolidFillBrush extends AbstractBrush
	{

		// Private Properties

		private var _color:ObservableProperty;
		private var _alpha:ObservableProperty;

		private var _cachedColor:uint;
		private var _cachedAlpha:Number;

		// Constructor

		public function SolidFillBrush(color:uint = 0x000000, alpha:Number = 1)
		{
			this._color = new ObservableProperty(this, "color", uint, color);
			this._alpha = new ObservableProperty(this, "alpha", Number, alpha);

			this._cachedColor = color;
			this._cachedAlpha = alpha;
		}

		// Public Getters/Setters

		public function get color() : uint
		{
			return this._color.value;
		}
		public function set color(value:uint) : void
		{
			this._color.value = this._cachedColor = value;
		}

		public function get alpha() : Number
		{
			return this._alpha.value;
		}
		public function set alpha(value:Number) : void
		{
			this._alpha.value = this._cachedAlpha = value;
		}

		// Protected Methods

		protected override function draw(graphics:Graphics, matrix:Matrix, bounds:Array, instructions:Array) : void
		{
			graphics.beginFill(this._cachedColor, this._cachedAlpha);

			for each (var instruction:* in instructions)
			{
				if (instruction is MoveToInstruction)
					graphics.moveTo(instruction.x, instruction.y);
				else if (instruction is LineToInstruction)
					graphics.lineTo(instruction.x, instruction.y);
				else if (instruction is CurveToInstruction)
					graphics.curveTo(instruction.controlX, instruction.controlY, instruction.anchorX, instruction.anchorY);
			}

			graphics.endFill();
		}

	}

}
