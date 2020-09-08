package com.splunk.palettes.brush
{

	import com.jasongatt.core.ChangedEvent;
	import com.jasongatt.core.ObservableObject;
	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.core.PropertyChangedEvent;
	import com.jasongatt.graphics.brushes.IBrush;
	import com.jasongatt.graphics.brushes.ImageFillBrush;
	import com.jasongatt.graphics.brushes.StretchMode;
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.geom.Matrix;

	public class ImageFillBrushPalette extends ObservableObject implements IBrushPalette
	{

		// Private Properties

		private var _sources:ObservableProperty;
		private var _sourcePath:ObservableProperty;
		private var _repeat:ObservableProperty;
		private var _smooth:ObservableProperty;
		private var _stretchMode:ObservableProperty;
		private var _alignmentX:ObservableProperty;
		private var _alignmentY:ObservableProperty;
		private var _tileTransform:ObservableProperty;
		private var _renderTransform:ObservableProperty;
		private var _fitToDrawing:ObservableProperty;

		private var _cachedBrushes:Array;
		private var _cachedRepeat:Boolean;
		private var _cachedSmooth:Boolean;
		private var _cachedStretchMode:String;
		private var _cachedAlignmentX:Number;
		private var _cachedAlignmentY:Number;
		private var _cachedTileTransform:Matrix;
		private var _cachedRenderTransform:Matrix;
		private var _cachedFitToDrawing:Boolean;

		// Constructor

		public function ImageFillBrushPalette(sources:Array = null, sourcePath:String = null)
		{
			sources = sources ? sources.concat() : new Array();

			var repeat:Boolean = false;
			var smooth:Boolean = false;
			var stretchMode:String = StretchMode.FILL;
			var alignmentX:Number = 0.5;
			var alignmentY:Number = 0.5;
			var tileTransform:Matrix = null;
			var renderTransform:Matrix = null;
			var fitToDrawing:Boolean = false;

			this._sources = new ObservableProperty(this, "sources", Array, sources, this._updateBrushCache);
			this._sourcePath = new ObservableProperty(this, "sourcePath", String, sourcePath, this._updateBrushCache);
			this._repeat = new ObservableProperty(this, "repeat", Boolean, repeat);
			this._smooth = new ObservableProperty(this, "smooth", Boolean, smooth);
			this._stretchMode = new ObservableProperty(this, "stretchMode", String, stretchMode);
			this._alignmentX = new ObservableProperty(this, "alignmentX", Number, alignmentX);
			this._alignmentY = new ObservableProperty(this, "alignmentY", Number, alignmentY);
			this._tileTransform = new ObservableProperty(this, "tileTransform", Matrix, tileTransform);
			this._renderTransform = new ObservableProperty(this, "renderTransform", Matrix, renderTransform);
			this._fitToDrawing = new ObservableProperty(this, "fitToDrawing", Boolean, fitToDrawing);

			this._cachedRepeat = repeat;
			this._cachedSmooth = smooth;
			this._cachedStretchMode = stretchMode;
			this._cachedAlignmentX = alignmentX;
			this._cachedAlignmentY = alignmentY;
			this._cachedTileTransform = tileTransform;
			this._cachedRenderTransform = renderTransform;
			this._cachedFitToDrawing = fitToDrawing;

			this._updateBrushCache();
		}

		// Public Getters/Setters

		public function get sources() : Array
		{
			return this._sources.value.concat();
		}
		public function set sources(value:Array) : void
		{
			this._sources.value = value ? value.concat() : new Array();
		}

		public function get sourcePath() : String
		{
			return this._sourcePath.value;
		}
		public function set sourcePath(value:String) : void
		{
			this._sourcePath.value = value;
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

		public function get stretchMode() : String
		{
			return this._stretchMode.value;
		}
		public function set stretchMode(value:String) : void
		{
			switch (value)
			{
				case StretchMode.NONE:
				case StretchMode.FILL:
				case StretchMode.UNIFORM:
				case StretchMode.UNIFORM_TO_FILL:
				case StretchMode.UNIFORM_TO_WIDTH:
				case StretchMode.UNIFORM_TO_HEIGHT:
					break;
				default:
					value = StretchMode.FILL;
					break;
			}
			this._stretchMode.value = this._cachedStretchMode = value;
		}

		public function get alignmentX() : Number
		{
			return this._alignmentX.value;
		}
		public function set alignmentX(value:Number) : void
		{
			this._alignmentX.value = this._cachedAlignmentX = value;
		}

		public function get alignmentY() : Number
		{
			return this._alignmentY.value;
		}
		public function set alignmentY(value:Number) : void
		{
			this._alignmentY.value = this._cachedAlignmentY = value;
		}

		public function get tileTransform() : Matrix
		{
			var value:Matrix = this._tileTransform.value;
			return value ? value.clone() : null;
		}
		public function set tileTransform(value:Matrix) : void
		{
			this._tileTransform.value = this._cachedTileTransform = value ? value.clone() : null;
		}

		public function get renderTransform() : Matrix
		{
			var value:Matrix = this._renderTransform.value;
			return value ? value.clone() : null;
		}
		public function set renderTransform(value:Matrix) : void
		{
			this._renderTransform.value = this._cachedRenderTransform = value ? value.clone() : null;
		}

		public function get fitToDrawing() : Boolean
		{
			return this._fitToDrawing.value;
		}
		public function set fitToDrawing(value:Boolean) : void
		{
			this._fitToDrawing.value = this._cachedFitToDrawing = value;
		}

		// Public Methods

		public function getBrush(field:String, index:int, count:int) : IBrush
		{
			var brushes:Array = this._cachedBrushes;
			var numBrushes:int = brushes.length;

			if (numBrushes == 0)
				return null;

			index = Math.max(index, 0);

			var brush:ImageFillBrush = brushes[index % numBrushes];
			brush.repeat = this._cachedRepeat;
			brush.smooth = this._cachedSmooth;
			brush.stretchMode = this._cachedStretchMode;
			brush.alignmentX = this._cachedAlignmentX;
			brush.alignmentY = this._cachedAlignmentY;
			brush.tileTransform = this._cachedTileTransform;
			brush.renderTransform = this._cachedRenderTransform;
			brush.fitToDrawing = this._cachedFitToDrawing;

			return brush;
		}

		// Private Methods

		private function _updateBrushCache(e:Event = null) : void
		{
			var sources:Array = this._sources.value;
			var sourcePath:String = this._sourcePath.value;
			if (!sourcePath)
				sourcePath = "";

			var brush:ImageFillBrush;
			for each (brush in this._cachedBrushes)
			{
				brush.removeEventListener(ChangedEvent.CHANGED, this._brush_changed);
				brush.source = null;
			}

			var brushes:Array = this._cachedBrushes = new Array();
			for each (var source:String in sources)
			{
				brush = new ImageFillBrush(sourcePath + source);
				brush.addEventListener(ChangedEvent.CHANGED, this._brush_changed, false, int.MIN_VALUE, true);
				brushes.push(brush);
			}
		}

		private function _brush_changed(e:ChangedEvent) : void
		{
			var pce:PropertyChangedEvent = e as PropertyChangedEvent;
			if (!pce || (pce.propertyName != "bitmap"))
				return;

			this.dispatchEvent(new ChangedEvent(ChangedEvent.CHANGED, false, false, this));
		}

	}

}
