package com.jasongatt.graphics.brushes
{

	import com.jasongatt.core.ObservableArrayProperty;
	import flash.display.Graphics;
	import flash.geom.Matrix;

	public class GroupBrush extends AbstractBrush
	{

		// Private Properties

		private var _brushes:ObservableArrayProperty;

		private var _cachedBrushes:Array;

		// Constructor

		public function GroupBrush(brushes:Array = null)
		{
			brushes = brushes ? brushes.concat() : new Array();

			this._brushes = new ObservableArrayProperty(this, "brushes", brushes);

			this._cachedBrushes = brushes;
		}

		// Public Getters/Setters

		public function get brushes() : Array
		{
			return this._brushes.value.concat();
		}
		public function set brushes(value:Array) : void
		{
			this._brushes.value = this._cachedBrushes = value ? value.concat() : new Array();
		}

		// Protected Methods

		protected override function draw(graphics:Graphics, matrix:Matrix, bounds:Array, instructions:Array) : void
		{
			var brush:IBrush;
			var instruction:*;
			for each (brush in this._cachedBrushes)
			{
				brush.beginBrush(graphics, matrix, bounds);
				for each (instruction in instructions)
				{
					if (instruction is MoveToInstruction)
						brush.moveTo(instruction.x, instruction.y);
					else if (instruction is LineToInstruction)
						brush.lineTo(instruction.x, instruction.y);
					else if (instruction is CurveToInstruction)
						brush.curveTo(instruction.controlX, instruction.controlY, instruction.anchorX, instruction.anchorY);
				}
				brush.endBrush();
			}
		}

	}

}
