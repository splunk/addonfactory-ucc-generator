package com.splunk.palettes.brush
{

	import com.jasongatt.core.ObservableArrayProperty;
	import com.jasongatt.core.ObservableObject;
	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.graphics.brushes.GradientFillBrush;
	import com.jasongatt.graphics.brushes.IBrush;
	import com.jasongatt.graphics.brushes.StretchMode;
	import com.splunk.palettes.color.IColorPalette;
	import flash.display.GradientType;
	import flash.display.InterpolationMethod;
	import flash.display.SpreadMethod;
	import flash.events.EventDispatcher;
	import flash.geom.Matrix;

	public class GradientFillBrushPalette extends ObservableObject implements IBrushPalette
	{

		// Private Properties

		private var _type:ObservableProperty;
		private var _colorPalettes:ObservableArrayProperty;
		private var _alphas:ObservableProperty;
		private var _ratios:ObservableProperty;
		private var _spreadMethod:ObservableProperty;
		private var _interpolationMethod:ObservableProperty;
		private var _focalPointRatio:ObservableProperty;
		private var _gradientWidth:ObservableProperty;
		private var _gradientHeight:ObservableProperty;
		private var _stretchMode:ObservableProperty;
		private var _alignmentX:ObservableProperty;
		private var _alignmentY:ObservableProperty;
		private var _tileTransform:ObservableProperty;
		private var _renderTransform:ObservableProperty;
		private var _fitToDrawing:ObservableProperty;

		private var _cachedType:String;
		private var _cachedColorPalettes:Array;
		private var _cachedAlphas:Array;
		private var _cachedRatios:Array;
		private var _cachedSpreadMethod:String;
		private var _cachedInterpolationMethod:String;
		private var _cachedFocalPointRatio:Number;
		private var _cachedGradientWidth:Number;
		private var _cachedGradientHeight:Number;
		private var _cachedStretchMode:String;
		private var _cachedAlignmentX:Number;
		private var _cachedAlignmentY:Number;
		private var _cachedTileTransform:Matrix;
		private var _cachedRenderTransform:Matrix;
		private var _cachedFitToDrawing:Boolean;

		// Constructor

		public function GradientFillBrushPalette(type:String = "linear", colorPalettes:Array = null, alphas:Array = null, ratios:Array = null, spreadMethod:String = "pad", interpolationMethod:String = "rgb", focalPointRatio:Number = 0)
		{
			switch (type)
			{
				case GradientType.LINEAR:
				case GradientType.RADIAL:
					break;
				default:
					type = GradientType.LINEAR;
					break;
			}
			colorPalettes = colorPalettes ? colorPalettes.concat() : new Array();
			alphas = alphas ? alphas.concat() : new Array();
			ratios = ratios ? ratios.concat() : new Array();
			switch (spreadMethod)
			{
				case SpreadMethod.PAD:
				case SpreadMethod.REFLECT:
				case SpreadMethod.REPEAT:
					break;
				default:
					spreadMethod = SpreadMethod.PAD;
					break;
			}
			switch (interpolationMethod)
			{
				case InterpolationMethod.LINEAR_RGB:
				case InterpolationMethod.RGB:
					break;
				default:
					interpolationMethod = InterpolationMethod.RGB;
					break;
			}

			var gradientWidth:Number = 100;
			var gradientHeight:Number = 100;
			var stretchMode:String = StretchMode.FILL;
			var alignmentX:Number = 0.5;
			var alignmentY:Number = 0.5;
			var tileTransform:Matrix = null;
			var renderTransform:Matrix = null;
			var fitToDrawing:Boolean = false;

			this._type = new ObservableProperty(this, "type", String, type);
			this._colorPalettes = new ObservableArrayProperty(this, "colorPalettes", colorPalettes);
			this._alphas = new ObservableProperty(this, "alphas", Array, alphas);
			this._ratios = new ObservableProperty(this, "ratios", Array, ratios);
			this._spreadMethod = new ObservableProperty(this, "spreadMethod", String, spreadMethod);
			this._interpolationMethod = new ObservableProperty(this, "interpolationMethod", String, interpolationMethod);
			this._focalPointRatio = new ObservableProperty(this, "focalPointRatio", Number, focalPointRatio);
			this._gradientWidth = new ObservableProperty(this, "gradientWidth", Number, gradientWidth);
			this._gradientHeight = new ObservableProperty(this, "gradientHeight", Number, gradientHeight);
			this._stretchMode = new ObservableProperty(this, "stretchMode", String, stretchMode);
			this._alignmentX = new ObservableProperty(this, "alignmentX", Number, alignmentX);
			this._alignmentY = new ObservableProperty(this, "alignmentY", Number, alignmentY);
			this._tileTransform = new ObservableProperty(this, "tileTransform", Matrix, tileTransform);
			this._renderTransform = new ObservableProperty(this, "renderTransform", Matrix, renderTransform);
			this._fitToDrawing = new ObservableProperty(this, "fitToDrawing", Boolean, fitToDrawing);

			this._cachedType = type;
			this._cachedColorPalettes = colorPalettes;
			this._cachedAlphas = alphas;
			this._cachedRatios = ratios;
			this._cachedSpreadMethod = spreadMethod;
			this._cachedInterpolationMethod = interpolationMethod;
			this._cachedFocalPointRatio = focalPointRatio;
			this._cachedGradientWidth = gradientWidth;
			this._cachedGradientHeight = gradientHeight;
			this._cachedStretchMode = stretchMode;
			this._cachedAlignmentX = alignmentX;
			this._cachedAlignmentY = alignmentY;
			this._cachedTileTransform = tileTransform;
			this._cachedRenderTransform = renderTransform;
			this._cachedFitToDrawing = fitToDrawing;
		}

		// Public Getters/Setters

		public function get type() : String
		{
			return this._type.value;
		}
		public function set type(value:String) : void
		{
			switch (value)
			{
				case GradientType.LINEAR:
				case GradientType.RADIAL:
					break;
				default:
					value = GradientType.LINEAR;
					break;
			}
			this._type.value = this._cachedType = value;
		}

		public function get colorPalettes() : Array
		{
			return this._colorPalettes.value.concat();
		}
		public function set colorPalettes(value:Array) : void
		{
			this._colorPalettes.value = this._cachedColorPalettes = value ? value.concat() : new Array();
		}

		public function get alphas() : Array
		{
			return this._alphas.value.concat();
		}
		public function set alphas(value:Array) : void
		{
			this._alphas.value = this._cachedAlphas = value ? value.concat() : new Array();
		}

		public function get ratios() : Array
		{
			return this._ratios.value.concat();
		}
		public function set ratios(value:Array) : void
		{
			this._ratios.value = this._cachedRatios = value ? value.concat() : new Array();
		}

		public function get spreadMethod() : String
		{
			return this._spreadMethod.value;
		}
		public function set spreadMethod(value:String) : void
		{
			switch (value)
			{
				case SpreadMethod.PAD:
				case SpreadMethod.REFLECT:
				case SpreadMethod.REPEAT:
					break;
				default:
					value = SpreadMethod.PAD;
					break;
			}
			this._spreadMethod.value = this._cachedSpreadMethod = value;
		}

		public function get interpolationMethod() : String
		{
			return this._interpolationMethod.value;
		}
		public function set interpolationMethod(value:String) : void
		{
			switch (value)
			{
				case InterpolationMethod.LINEAR_RGB:
				case InterpolationMethod.RGB:
					break;
				default:
					value = InterpolationMethod.RGB;
					break;
			}
			this._interpolationMethod.value = this._cachedInterpolationMethod = value;
		}

		public function get focalPointRatio() : Number
		{
			return this._focalPointRatio.value;
		}
		public function set focalPointRatio(value:Number) : void
		{
			this._focalPointRatio.value = this._cachedFocalPointRatio = value;
		}

		public function get gradientWidth() : Number
		{
			return this._gradientWidth.value;
		}
		public function set gradientWidth(value:Number) : void
		{
			this._gradientWidth.value = this._cachedGradientWidth = value;
		}

		public function get gradientHeight() : Number
		{
			return this._gradientHeight.value;
		}
		public function set gradientHeight(value:Number) : void
		{
			this._gradientHeight.value = this._cachedGradientHeight = value;
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
			var colors:Array = new Array();
			for each (var colorPalette:IColorPalette in this._cachedColorPalettes)
				colors.push(colorPalette.getColor(field, index, count));

			var brush:GradientFillBrush = new GradientFillBrush(this._cachedType, colors, this._cachedAlphas, this._cachedRatios, this._cachedSpreadMethod, this._cachedInterpolationMethod, this._cachedFocalPointRatio);
			brush.gradientWidth = this._cachedGradientWidth;
			brush.gradientHeight = this._cachedGradientHeight;
			brush.stretchMode = this._cachedStretchMode;
			brush.alignmentX = this._cachedAlignmentX;
			brush.alignmentY = this._cachedAlignmentY;
			brush.tileTransform = this._cachedTileTransform;
			brush.renderTransform = this._cachedRenderTransform;
			brush.fitToDrawing = this._cachedFitToDrawing;

			return brush;
		}

	}

}
