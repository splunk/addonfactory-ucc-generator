package com.splunk.palettes.brush
{

	import com.jasongatt.core.ObservableObject;
	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.graphics.brushes.IBrush;
	import com.jasongatt.graphics.brushes.SolidStrokeBrush;
	import com.splunk.palettes.color.IColorPalette;
	import flash.display.CapsStyle;
	import flash.display.JointStyle;
	import flash.display.LineScaleMode;
	import flash.events.EventDispatcher;

	public class SolidStrokeBrushPalette extends ObservableObject implements IBrushPalette
	{

		// Private Properties

		private var _thickness:ObservableProperty;
		private var _colorPalette:ObservableProperty;
		private var _alpha:ObservableProperty;
		private var _pixelHinting:ObservableProperty;
		private var _scaleMode:ObservableProperty;
		private var _caps:ObservableProperty;
		private var _joints:ObservableProperty;
		private var _miterLimit:ObservableProperty;

		private var _cachedThickness:Number;
		private var _cachedColorPalette:IColorPalette;
		private var _cachedAlpha:Number;
		private var _cachedPixelHinting:Boolean;
		private var _cachedScaleMode:String;
		private var _cachedCaps:String;
		private var _cachedJoints:String;
		private var _cachedMiterLimit:Number;

		// Constructor

		public function SolidStrokeBrushPalette(thickness:Number = 0, colorPalette:IColorPalette = null, alpha:Number = 1, pixelHinting:Boolean = false, scaleMode:String = "normal", caps:String = "round", joints:String = "round", miterLimit:Number = 3)
		{
			switch (scaleMode)
			{
				case LineScaleMode.NORMAL:
				case LineScaleMode.NONE:
				case LineScaleMode.VERTICAL:
				case LineScaleMode.HORIZONTAL:
					break;
				default:
					scaleMode = LineScaleMode.NORMAL;
					break;
			}
			switch (caps)
			{
				case CapsStyle.NONE:
				case CapsStyle.ROUND:
				case CapsStyle.SQUARE:
					break;
				default:
					caps = CapsStyle.ROUND;
					break;
			}
			switch (joints)
			{
				case JointStyle.MITER:
				case JointStyle.ROUND:
				case JointStyle.BEVEL:
					break;
				default:
					joints = JointStyle.ROUND;
					break;
			}

			this._thickness = new ObservableProperty(this, "thickness", Number, thickness);
			this._colorPalette = new ObservableProperty(this, "colorPalette", IColorPalette, colorPalette);
			this._alpha = new ObservableProperty(this, "alpha", Number, alpha);
			this._pixelHinting = new ObservableProperty(this, "pixelHinting", Boolean, pixelHinting);
			this._scaleMode = new ObservableProperty(this, "scaleMode", String, scaleMode);
			this._caps = new ObservableProperty(this, "caps", String, caps);
			this._joints = new ObservableProperty(this, "joints", String, joints);
			this._miterLimit = new ObservableProperty(this, "miterLimit", Number, miterLimit);

			this._cachedThickness = thickness;
			this._cachedColorPalette = colorPalette;
			this._cachedAlpha = alpha;
			this._cachedPixelHinting = pixelHinting;
			this._cachedScaleMode = scaleMode;
			this._cachedCaps = caps;
			this._cachedJoints = joints;
			this._cachedMiterLimit = miterLimit;
		}

		// Public Getters/Setters

		public function get thickness() : Number
		{
			return this._thickness.value;
		}
		public function set thickness(value:Number) : void
		{
			this._thickness.value = this._cachedThickness = value;
		}

		public function get colorPalette() : IColorPalette
		{
			return this._colorPalette.value;
		}
		public function set colorPalette(value:IColorPalette) : void
		{
			this._colorPalette.value = this._cachedColorPalette = value;
		}

		public function get alpha() : Number
		{
			return this._alpha.value;
		}
		public function set alpha(value:Number) : void
		{
			this._alpha.value = this._cachedAlpha = value;
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

		// Public Methods

		public function getBrush(field:String, index:int, count:int) : IBrush
		{
			var colorPalette:IColorPalette = this._cachedColorPalette;
			var color:uint = colorPalette ? colorPalette.getColor(field, index, count) : 0x000000;
			return new SolidStrokeBrush(this._cachedThickness, color, this._cachedAlpha, this._cachedPixelHinting, this._cachedScaleMode, this._cachedCaps, this._cachedJoints, this._cachedMiterLimit);
		}

	}

}
