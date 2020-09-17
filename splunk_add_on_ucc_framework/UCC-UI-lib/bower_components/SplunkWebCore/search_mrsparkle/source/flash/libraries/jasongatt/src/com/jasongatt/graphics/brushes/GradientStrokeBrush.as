package com.jasongatt.graphics.brushes
{

	import com.jasongatt.core.ObservableProperty;
	import flash.display.CapsStyle;
	import flash.display.GradientType;
	import flash.display.Graphics;
	import flash.display.InterpolationMethod;
	import flash.display.JointStyle;
	import flash.display.LineScaleMode;
	import flash.display.SpreadMethod;
	import flash.geom.Matrix;

	public class GradientStrokeBrush extends AbstractTileBrush
	{

		// Private Properties

		private var _type:ObservableProperty;
		private var _colors:ObservableProperty;
		private var _alphas:ObservableProperty;
		private var _ratios:ObservableProperty;
		private var _spreadMethod:ObservableProperty;
		private var _interpolationMethod:ObservableProperty;
		private var _focalPointRatio:ObservableProperty;
		private var _gradientWidth:ObservableProperty;
		private var _gradientHeight:ObservableProperty;
		private var _thickness:ObservableProperty;
		private var _pixelHinting:ObservableProperty;
		private var _scaleMode:ObservableProperty;
		private var _caps:ObservableProperty;
		private var _joints:ObservableProperty;
		private var _miterLimit:ObservableProperty;

		private var _cachedType:String;
		private var _cachedColors:Array;
		private var _cachedAlphas:Array;
		private var _cachedRatios:Array;
		private var _cachedSpreadMethod:String;
		private var _cachedInterpolationMethod:String;
		private var _cachedFocalPointRatio:Number;
		private var _cachedGradientWidth:Number;
		private var _cachedGradientHeight:Number;
		private var _cachedThickness:Number;
		private var _cachedPixelHinting:Boolean;
		private var _cachedScaleMode:String;
		private var _cachedCaps:String;
		private var _cachedJoints:String;
		private var _cachedMiterLimit:Number;

		// Constructor

		public function GradientStrokeBrush(type:String = "linear", colors:Array = null, alphas:Array = null, ratios:Array = null, spreadMethod:String = "pad", interpolationMethod:String = "rgb", focalPointRatio:Number = 0)
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
			colors = colors ? colors.concat() : new Array();
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
			var thickness:Number = 0;
			var pixelHinting:Boolean = false;
			var scaleMode:String = LineScaleMode.NORMAL;
			var caps:String = CapsStyle.ROUND;
			var joints:String = JointStyle.ROUND;
			var miterLimit:Number = 3;

			this._type = new ObservableProperty(this, "type", String, type);
			this._colors = new ObservableProperty(this, "colors", Array, colors);
			this._alphas = new ObservableProperty(this, "alphas", Array, alphas);
			this._ratios = new ObservableProperty(this, "ratios", Array, ratios);
			this._spreadMethod = new ObservableProperty(this, "spreadMethod", String, spreadMethod);
			this._interpolationMethod = new ObservableProperty(this, "interpolationMethod", String, interpolationMethod);
			this._focalPointRatio = new ObservableProperty(this, "focalPointRatio", Number, focalPointRatio);
			this._gradientWidth = new ObservableProperty(this, "gradientWidth", Number, gradientWidth);
			this._gradientHeight = new ObservableProperty(this, "gradientHeight", Number, gradientHeight);
			this._thickness = new ObservableProperty(this, "thickness", Number, thickness);
			this._pixelHinting = new ObservableProperty(this, "pixelHinting", Boolean, pixelHinting);
			this._scaleMode = new ObservableProperty(this, "scaleMode", String, scaleMode);
			this._caps = new ObservableProperty(this, "caps", String, caps);
			this._joints = new ObservableProperty(this, "joints", String, joints);
			this._miterLimit = new ObservableProperty(this, "miterLimit", Number, miterLimit);

			this._cachedType = type;
			this._cachedColors = colors;
			this._cachedAlphas = alphas;
			this._cachedRatios = ratios;
			this._cachedSpreadMethod = spreadMethod;
			this._cachedInterpolationMethod = interpolationMethod;
			this._cachedFocalPointRatio = focalPointRatio;
			this._cachedGradientWidth = gradientWidth;
			this._cachedGradientHeight = gradientHeight;
			this._cachedThickness = thickness;
			this._cachedPixelHinting = pixelHinting;
			this._cachedScaleMode = scaleMode;
			this._cachedCaps = caps;
			this._cachedJoints = joints;
			this._cachedMiterLimit = miterLimit;
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

		public function get colors() : Array
		{
			return this._colors.value.concat();
		}
		public function set colors(value:Array) : void
		{
			this._colors.value = this._cachedColors = value ? value.concat() : new Array();
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

		public function get thickness() : Number
		{
			return this._thickness.value;
		}
		public function set thickness(value:Number) : void
		{
			this._thickness.value = this._cachedThickness = value;
		}

		public function get pixelHinting() : Boolean
		{
			return this._pixelHinting.value;
		}
		public function set pixelHinting(value:Boolean) : void
		{
			this._pixelHinting.value = this._cachedPixelHinting = value;
		}

		public function get scaleMode() : String
		{
			return this._scaleMode.value;
		}
		public function set scaleMode(value:String) : void
		{
			switch (value)
			{
				case LineScaleMode.NORMAL:
				case LineScaleMode.NONE:
				case LineScaleMode.VERTICAL:
				case LineScaleMode.HORIZONTAL:
					break;
				default:
					value = LineScaleMode.NORMAL;
					break;
			}
			this._scaleMode.value = this._cachedScaleMode = value;
		}

		public function get caps() : String
		{
			return this._caps.value;
		}
		public function set caps(value:String) : void
		{
			switch (value)
			{
				case CapsStyle.NONE:
				case CapsStyle.ROUND:
				case CapsStyle.SQUARE:
					break;
				default:
					value = CapsStyle.ROUND;
					break;
			}
			this._caps.value = this._cachedCaps = value;
		}

		public function get joints() : String
		{
			return this._joints.value;
		}
		public function set joints(value:String) : void
		{
			switch (value)
			{
				case JointStyle.MITER:
				case JointStyle.ROUND:
				case JointStyle.BEVEL:
					break;
				default:
					value = JointStyle.ROUND;
					break;
			}
			this._joints.value = this._cachedJoints = value;
		}

		public function get miterLimit() : Number
		{
			return this._miterLimit.value;
		}
		public function set miterLimit(value:Number) : void
		{
			this._miterLimit.value = this._cachedMiterLimit = value;
		}

		// Protected Methods

		protected override function draw(graphics:Graphics, matrix:Matrix, bounds:Array, instructions:Array) : void
		{
			var gradientWidth:Number = Math.max(this._cachedGradientWidth, 0);
			var gradientHeight:Number = Math.max(this._cachedGradientHeight, 0);

			var tileMatrix:Matrix = new Matrix();
			tileMatrix.createGradientBox(gradientWidth, gradientHeight, 0, 0, 0);
			tileMatrix.concat(this.computeTileMatrix(gradientWidth, gradientHeight, matrix, bounds, instructions));

			graphics.lineStyle(this._cachedThickness, 0x000000, 1, this._cachedPixelHinting, this._cachedScaleMode, this._cachedCaps, this._cachedJoints, this._cachedMiterLimit);
			graphics.lineGradientStyle(this._cachedType, this._cachedColors, this._cachedAlphas, this._cachedRatios, tileMatrix, this._cachedSpreadMethod, this._cachedInterpolationMethod, this._cachedFocalPointRatio);

			for each (var instruction:* in instructions)
			{
				if (instruction is MoveToInstruction)
					graphics.moveTo(instruction.x, instruction.y);
				else if (instruction is LineToInstruction)
					graphics.lineTo(instruction.x, instruction.y);
				else if (instruction is CurveToInstruction)
					graphics.curveTo(instruction.controlX, instruction.controlY, instruction.anchorX, instruction.anchorY);
			}

			graphics.lineStyle();
		}

	}

}
