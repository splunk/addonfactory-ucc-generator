package com.splunk.charting.charts
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.layout.LayoutSprite;
	import com.jasongatt.layout.Size;
	import com.jasongatt.graphics.brushes.IBrush;
	import com.jasongatt.graphics.shapes.IShape;
	import com.splunk.utils.Style;
	import flash.display.Graphics;
	import flash.display.Shape;

	public class SeriesSwatchSprite extends LayoutSprite
	{

		// Private Properties

		private var _swatch:ObservableProperty;

		private var _layers:Array;

		// Constructor

		public function SeriesSwatchSprite(swatch:SeriesSwatch = null)
		{
			this._swatch = new ObservableProperty(this, "swatch", SeriesSwatch, swatch, this.invalidates(LayoutSprite.MEASURE));

			this._layers = new Array();

			this.snap = true;
		}

		// Public Getters/Setters

		public function get swatch() : SeriesSwatch
		{
			return this._swatch.value;
		}
		public function set swatch(value:SeriesSwatch) : void
		{
			this._swatch.value = value;
		}

		// Protected Methods

		protected override function measureOverride(availableSize:Size) : Size
		{
			var size:Size = new Size();

			var swatch:SeriesSwatch = this._swatch.value;
			if (swatch)
			{
				var availableWidth:Number = availableSize.width;
				var availableHeight:Number = availableSize.height;
				var swatchAspectRatio:Number = swatch.aspectRatio;
				if ((availableWidth == Infinity) && (availableHeight == Infinity))
				{
					if (swatchAspectRatio < 1)
					{
						size.width = 10;
						size.height = 10 / swatchAspectRatio;
					}
					else
					{
						size.width = 10 * swatchAspectRatio;
						size.height = 10;
					}
				}
				else
				{
					var availableAspectRatio:Number = availableWidth / availableHeight;
					if (availableAspectRatio < swatchAspectRatio)
					{
						size.width = availableWidth;
						size.height = availableWidth / swatchAspectRatio;
					}
					else
					{
						size.width = availableHeight * swatchAspectRatio;
						size.height = availableHeight;
					}
				}
			}

			return size;
		}

		protected override function layoutOverride(layoutSize:Size) : Size
		{
			var layers:Array = this._layers;
			var numLayers:int = layers.length;
			var numLayersRendered:int = 0;
			var layer:Shape;
			var graphics:Graphics;
			var i:int;

			var swatch:SeriesSwatch = this._swatch.value;
			if (swatch)
			{
				var shapes:Array = swatch.shapes;
				var brushes:Array = swatch.brushes;
				var styles:Array = swatch.styles;

				var numShapes:int = shapes.length;
				var numBrushes:int = brushes.length;
				var numStyles:int = styles.length;

				var shape:IShape;
				var brush:IBrush;
				var style:Style;

				for (i = 0; i < numShapes; i++)
				{
					if (i < numLayers)
					{
						layer = layers[i];
					}
					else
					{
						layer = new Shape();
						layers.push(layer);
						this.addChild(layer);
					}

					graphics = layer.graphics;
					graphics.clear();

					shape = shapes[i];
					brush = (i < numBrushes) ? brushes[i] : null;
					style = (i < numStyles) ? styles[i] : null;

					shape.draw(graphics, 0, 0, layoutSize.width, layoutSize.height, brush);
					Style.applyStyle(layer, style);
				}

				numLayersRendered = i;
			}

			for (i = layers.length - 1; i >= numLayersRendered; i--)
			{
				layer = layers.pop();
				this.removeChild(layer);
			}

			return layoutSize;
		}

	}

}
