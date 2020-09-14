package com.jasongatt.graphics.brushes
{

	import com.jasongatt.core.ObservableProperty;
	import flash.display.BitmapData;
	import flash.display.Graphics;
	import flash.display.Shape;
	import flash.geom.Matrix;

	public class BitmapFillBrush extends AbstractTileBrush
	{

		// Private Static Properties

		private static var _errorBitmap:BitmapData;

		// Public Static Getters/Setters

		public static function get ERROR_BITMAP() : BitmapData
		{
			var bitmap:BitmapData = BitmapFillBrush._errorBitmap;
			if (!bitmap)
			{
				var shape:Shape = new Shape();

				var graphics:Graphics = shape.graphics;

				graphics.beginFill(0x999999);
				graphics.drawRect(0, 0, 50, 50);
				graphics.endFill();

				graphics.beginFill(0xFFFFFF);
				graphics.moveTo(2, 3);
				graphics.lineTo(24, 25);
				graphics.lineTo(2, 47);
				graphics.lineTo(2, 3);
				graphics.endFill();

				graphics.beginFill(0xFFFFFF);
				graphics.moveTo(3, 2);
				graphics.lineTo(47, 2);
				graphics.lineTo(25, 24);
				graphics.lineTo(3, 2);
				graphics.endFill();

				graphics.beginFill(0xFFFFFF);
				graphics.moveTo(48, 3);
				graphics.lineTo(26, 25);
				graphics.lineTo(48, 47);
				graphics.lineTo(48, 3);
				graphics.endFill();

				graphics.beginFill(0xFFFFFF);
				graphics.moveTo(3, 48);
				graphics.lineTo(47, 48);
				graphics.lineTo(25, 26);
				graphics.lineTo(3, 48);
				graphics.endFill();

				bitmap = BitmapFillBrush._errorBitmap = new BitmapData(50, 50, false, 0xFFFFFF);
				bitmap.draw(shape);
			}
			return bitmap;
		}

		// Private Properties

		private var _bitmap:ObservableProperty;
		private var _repeat:ObservableProperty;
		private var _smooth:ObservableProperty;

		private var _cachedBitmap:BitmapData;
		private var _cachedRepeat:Boolean;
		private var _cachedSmooth:Boolean;

		// Constructor

		public function BitmapFillBrush(bitmap:BitmapData = null, repeat:Boolean = false, smooth:Boolean = false)
		{
			this._bitmap = new ObservableProperty(this, "bitmap", BitmapData, bitmap);
			this._repeat = new ObservableProperty(this, "repeat", Boolean, repeat);
			this._smooth = new ObservableProperty(this, "smooth", Boolean, smooth);

			this._cachedBitmap = bitmap;
			this._cachedRepeat = repeat;
			this._cachedSmooth = smooth;
		}

		// Public Getters/Setters

		public function get bitmap() : BitmapData
		{
			return this._bitmap.value;
		}
		public function set bitmap(value:BitmapData) : void
		{
			this._bitmap.value = this._cachedBitmap = value;
		}

		public function get repeat() : Boolean
		{
			return this._repeat.value;
		}
		public function set repeat(value:Boolean) : void
		{
			this._repeat.value = this._cachedRepeat = value;
		}

		public function get smooth() : Boolean
		{
			return this._smooth.value;
		}
		public function set smooth(value:Boolean) : void
		{
			this._smooth.value = this._cachedSmooth = value;
		}

		// Protected Methods

		protected override function draw(graphics:Graphics, matrix:Matrix, bounds:Array, instructions:Array) : void
		{
			var bitmap:BitmapData = this._cachedBitmap;
			if (!bitmap)
				return;

			var tileMatrix:Matrix = this.computeTileMatrix(bitmap.width, bitmap.height, matrix, bounds, instructions);

			graphics.beginBitmapFill(bitmap, tileMatrix, this._cachedRepeat, this._cachedSmooth);

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
