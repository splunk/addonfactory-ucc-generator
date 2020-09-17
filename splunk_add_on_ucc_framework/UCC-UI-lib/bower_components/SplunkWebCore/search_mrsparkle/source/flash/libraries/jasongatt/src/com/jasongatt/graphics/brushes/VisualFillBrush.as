package com.jasongatt.graphics.brushes
{

	import com.jasongatt.core.ObservableProperty;
	import flash.display.BitmapData;
	import flash.display.DisplayObject;
	import flash.display.Shape;
	import flash.events.Event;
	import flash.geom.Matrix;
	import flash.geom.Rectangle;

	public class VisualFillBrush extends BitmapFillBrush
	{

		// Private Properties

		private var _visual:ObservableProperty;

		private var _cachedVisual:DisplayObject;
		private var _bitmap:BitmapData;
		private var _oldBitmap:BitmapData;
		private var _beacon:Shape;

		// Constructor

		public function VisualFillBrush(visual:DisplayObject = null)
		{
			this._visual = new ObservableProperty(this, "visual", DisplayObject, visual, this._updateVisual);

			this._updateVisual();
		}

		// Public Getters/Setters

		public function get visual() : DisplayObject
		{
			return this._visual.value;
		}
		public function set visual(value:DisplayObject) : void
		{
			this._visual.value = value;
		}

		// Private Methods

		private function _updateVisual(e:Event = null) : void
		{
			this._cachedVisual = this._visual.value;

			this._updateBitmap();
		}

		private function _updateBitmap(e:Event = null) : void
		{
			if (this._oldBitmap)
			{
				this._oldBitmap.dispose();
				this._oldBitmap = null;
			}

			var visual:DisplayObject = this._cachedVisual;
			if (!visual)
			{
				if (this._beacon)
				{
					this._beacon.removeEventListener(Event.ENTER_FRAME, this._updateBitmap);
					this._beacon = null;
				}

				if (this._bitmap)
				{
					this._bitmap.dispose();
					this._bitmap = null;
					super.bitmap = null;
				}

				return;
			}

			var visualBounds:Rectangle = visual.getBounds(visual);
			var visualWidth:Number = Math.ceil(visualBounds.width);
			var visualHeight:Number = Math.ceil(visualBounds.height);

			var bitmap:BitmapData = this._bitmap;
			if (bitmap && (bitmap.width == visualWidth) && (bitmap.height == visualHeight))
			{
				bitmap.fillRect(bitmap.rect, 0x00000000);
			}
			else
			{
				if (!this._beacon)
				{
					this._beacon = new Shape();
					this._beacon.addEventListener(Event.ENTER_FRAME, this._updateBitmap);
				}

				this._oldBitmap = bitmap;

				bitmap = this._bitmap = new BitmapData(visualWidth, visualHeight, true, 0x00000000);
				super.bitmap = bitmap;
			}

			bitmap.draw(visual, new Matrix(1, 0, 0, 1, -visualBounds.x, -visualBounds.y));
		}

	}

}
