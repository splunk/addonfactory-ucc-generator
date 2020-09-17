package com.splunk.controls
{

	import flash.display.Bitmap;
	import flash.display.BitmapData;
	import flash.display.DisplayObject;
	import flash.display.Sprite;
	import flash.filters.DropShadowFilter;

	public final class CursorUtils
	{

		// Public Static Methods

		public static function createBitmapCursor(pixels:Array, colors:Array, centerX:Number, centerY:Number) : DisplayObject
		{
			if (!pixels || !colors)
				return null;

			var numPixels:int = pixels.length;
			var numColors:int = colors.length;
			if ((numPixels == 0) || (numColors == 0))
				return null;

			var size:int = Math.floor(Math.sqrt(numPixels));
			var bitmapData:BitmapData = new BitmapData(size, size, true, 0x00000000);
			var x:int;
			var y:int;
			var colorIndex:int;
			var color:uint;
			for (y = 0; y < size; y++)
			{
				for (x = 0; x < size; x++)
				{
					colorIndex = pixels[y * size + x];
					if ((colorIndex >= 0) && (colorIndex < numColors))
					{
						color = colors[colorIndex];
						if (color != 0x00000000)
							bitmapData.setPixel32(x, y, color);
					}
				}
			}

			var bitmap:Bitmap = new Bitmap(bitmapData);
			bitmap.x = Math.round(-centerX);
			bitmap.y = Math.round(-centerY);

			var cursor:Sprite = new Sprite();
			cursor.mouseEnabled = false;
			cursor.mouseChildren = false;
			cursor.tabEnabled = false;
			cursor.tabChildren = false;
			cursor.filters = [ new DropShadowFilter(3, 20, 0x000000, 0.35, 4, 4, 1, 1) ];
			cursor.addChild(bitmap);

			return cursor;
		}

	}

}
