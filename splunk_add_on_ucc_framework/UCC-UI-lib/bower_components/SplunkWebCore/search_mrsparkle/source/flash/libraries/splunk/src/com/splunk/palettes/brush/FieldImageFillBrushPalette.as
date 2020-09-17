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

	public class FieldImageFillBrushPalette extends ObservableObject implements IBrushPalette
	{

		// Private Properties

		private var _fieldSources:ObservableProperty;
		private var _sourcePath:ObservableProperty;
		private var _sourceExtension:ObservableProperty;
		private var _useFieldAsSource:ObservableProperty;
		private var _urlEncodeField:ObservableProperty;
		private var _repeat:ObservableProperty;
		private var _smooth:ObservableProperty;
		private var _stretchMode:ObservableProperty;
		private var _alignmentX:ObservableProperty;
		private var _alignmentY:ObservableProperty;
		private var _tileTransform:ObservableProperty;
		private var _renderTransform:ObservableProperty;
		private var _fitToDrawing:ObservableProperty;
		private var _defaultBrushPalette:ObservableProperty;

		private var _cachedFieldBrushMap:Object;
		private var _cachedSourcePath:String;
		private var _cachedSourceExtension:String;
		private var _cachedUseFieldAsSource:Boolean;
		private var _cachedUrlEncodeField:Boolean;
		private var _cachedRepeat:Boolean;
		private var _cachedSmooth:Boolean;
		private var _cachedStretchMode:String;
		private var _cachedAlignmentX:Number;
		private var _cachedAlignmentY:Number;
		private var _cachedTileTransform:Matrix;
		private var _cachedRenderTransform:Matrix;
		private var _cachedFitToDrawing:Boolean;
		private var _cachedDefaultBrushPalette:IBrushPalette;

		// Constructor

		public function FieldImageFillBrushPalette(fieldSources:Object = null, sourcePath:String = null, sourceExtension:String = null, useFieldAsSource:Boolean = false, urlEncodeField:Boolean = true)
		{
			fieldSources = this._cloneFieldSources(fieldSources);

			var repeat:Boolean = false;
			var smooth:Boolean = false;
			var stretchMode:String = StretchMode.FILL;
			var alignmentX:Number = 0.5;
			var alignmentY:Number = 0.5;
			var tileTransform:Matrix = null;
			var renderTransform:Matrix = null;
			var fitToDrawing:Boolean = false;
			var defaultBrushPalette:IBrushPalette = null;

			this._fieldSources = new ObservableProperty(this, "fieldSources", Object, fieldSources, this._updateFieldBrushMap);
			this._sourcePath = new ObservableProperty(this, "sourcePath", String, sourcePath, this._updateFieldBrushMap);
			this._sourceExtension = new ObservableProperty(this, "sourceExtension", String, sourceExtension, this._updateFieldBrushMap);
			this._useFieldAsSource = new ObservableProperty(this, "useFieldAsSource", Boolean, useFieldAsSource, this._updateFieldBrushMap);
			this._urlEncodeField = new ObservableProperty(this, "urlEncodeField", Boolean, urlEncodeField, this._updateFieldBrushMap);
			this._repeat = new ObservableProperty(this, "repeat", Boolean, repeat);
			this._smooth = new ObservableProperty(this, "smooth", Boolean, smooth);
			this._stretchMode = new ObservableProperty(this, "stretchMode", String, stretchMode);
			this._alignmentX = new ObservableProperty(this, "alignmentX", Number, alignmentX);
			this._alignmentY = new ObservableProperty(this, "alignmentY", Number, alignmentY);
			this._tileTransform = new ObservableProperty(this, "tileTransform", Matrix, tileTransform);
			this._renderTransform = new ObservableProperty(this, "renderTransform", Matrix, renderTransform);
			this._fitToDrawing = new ObservableProperty(this, "fitToDrawing", Boolean, fitToDrawing);
			this._defaultBrushPalette = new ObservableProperty(this, "defaultBrushPalette", IBrushPalette, defaultBrushPalette);

			this._cachedSourcePath = sourcePath;
			this._cachedSourceExtension = sourceExtension;
			this._cachedUseFieldAsSource = useFieldAsSource;
			this._cachedUrlEncodeField = urlEncodeField;
			this._cachedRepeat = repeat;
			this._cachedSmooth = smooth;
			this._cachedStretchMode = stretchMode;
			this._cachedAlignmentX = alignmentX;
			this._cachedAlignmentY = alignmentY;
			this._cachedTileTransform = tileTransform;
			this._cachedRenderTransform = renderTransform;
			this._cachedFitToDrawing = fitToDrawing;
			this._cachedDefaultBrushPalette = defaultBrushPalette;

			this._updateFieldBrushMap();
		}

		// Public Getters/Setters

		public function get fieldSources() : Object
		{
			return this._cloneFieldSources(this._fieldSources.value);
		}
		public function set fieldSources(value:Object) : void
		{
			this._fieldSources.value = this._cloneFieldSources(value);
		}

		public function get sourcePath() : String
		{
			return this._sourcePath.value;
		}
		public function set sourcePath(value:String) : void
		{
			this._sourcePath.value = this._cachedSourcePath = value;
		}

		public function get sourceExtension() : String
		{
			return this._sourceExtension.value;
		}
		public function set sourceExtension(value:String) : void
		{
			this._sourceExtension.value = this._cachedSourceExtension = value;
		}

		public function get useFieldAsSource() : Boolean
		{
			return this._useFieldAsSource.value;
		}
		public function set useFieldAsSource(value:Boolean) : void
		{
			this._useFieldAsSource.value = this._cachedUseFieldAsSource = value;
		}

		public function get urlEncodeField() : Boolean
		{
			return this._urlEncodeField.value;
		}
		public function set urlEncodeField(value:Boolean) : void
		{
			this._urlEncodeField.value = this._cachedUrlEncodeField = value;
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

		public function get defaultBrushPalette() : IBrushPalette
		{
			return this._defaultBrushPalette.value;
		}
		public function set defaultBrushPalette(value:IBrushPalette) : void
		{
			this._defaultBrushPalette.value = this._cachedDefaultBrushPalette = value;
		}

		// Public Methods

		public function getBrush(field:String, index:int, count:int) : IBrush
		{
			if (field)
			{
				var brush:ImageFillBrush = this._cachedFieldBrushMap[field];
				if (!brush && this._cachedUseFieldAsSource)
				{
					var sourcePath:String = this._cachedSourcePath;
					if (!sourcePath)
						sourcePath = "";

					var sourceExtension:String = this._cachedSourceExtension;
					if (!sourceExtension)
						sourceExtension = "";

					var source:String = this._cachedUrlEncodeField ? this._encode(field) : field;

					brush = this._cachedFieldBrushMap[field] = new ImageFillBrush(sourcePath + source + sourceExtension);
					brush.addEventListener(ChangedEvent.CHANGED, this._brush_changed, false, int.MIN_VALUE, true);
				}

				if (brush)
				{
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
			}

			var defaultBrushPalette:IBrushPalette = this._cachedDefaultBrushPalette;
			if (defaultBrushPalette)
				return defaultBrushPalette.getBrush(field, index, count);

			return null;
		}

		// Private Methods

		private function _encode(str:String) : String
		{
			if (!str)
				return str;

			str = escape(str);
			str = str.replace(/\//g, "%2F");
			str = str.replace(/\*/g, "%2A");

			return str;
		}

		private function _cloneFieldSources(fieldSources:Object) : Object
		{
			var fieldSources2:Object = new Object();

			var field:String;
			var source:String;
			for (field in fieldSources)
			{
				source = fieldSources[field] as String;
				if (source)
					fieldSources2[field] = source;
			}

			return fieldSources2;
		}

		private function _updateFieldBrushMap(e:Event = null) : void
		{
			var fieldSources:Object = this._fieldSources.value;

			var sourcePath:String = this._cachedSourcePath;
			if (!sourcePath)
				sourcePath = "";

			var sourceExtension:String = this._cachedSourceExtension;
			if (!sourceExtension)
				sourceExtension = "";

			var brush:ImageFillBrush;
			for each (brush in this._cachedFieldBrushMap)
			{
				brush.removeEventListener(ChangedEvent.CHANGED, this._brush_changed);
				brush.source = null;
			}

			var fieldBrushMap:Object = this._cachedFieldBrushMap = new Object();
			var field:String;
			var source:String;
			for (field in fieldSources)
			{
				source = fieldSources[field];
				brush = new ImageFillBrush(sourcePath + source + sourceExtension);
				brush.addEventListener(ChangedEvent.CHANGED, this._brush_changed, false, int.MIN_VALUE, true);
				fieldBrushMap[field] = brush;
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
