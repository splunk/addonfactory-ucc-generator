package com.jasongatt.graphics.brushes
{

	import com.jasongatt.core.ObservableProperty;
	import flash.display.CapsStyle;
	import flash.display.Graphics;
	import flash.display.JointStyle;
	import flash.display.LineScaleMode;
	import flash.events.Event;
	import flash.geom.Matrix;

	public class DashedStrokeBrush extends AbstractBrush
	{

		// Private Properties

		private var _dashSize:ObservableProperty;
		private var _dashSpacing:ObservableProperty;
		private var _thickness:ObservableProperty;
		private var _color:ObservableProperty;
		private var _alpha:ObservableProperty;
		private var _pixelHinting:ObservableProperty;
		private var _scaleMode:ObservableProperty;
		private var _caps:ObservableProperty;
		private var _joints:ObservableProperty;
		private var _miterLimit:ObservableProperty;

		private var _cachedDashSize:Number;
		private var _cachedDashSpacing:Number;
		private var _cachedThickness:Number;
		private var _cachedColor:uint;
		private var _cachedAlpha:Number;
		private var _cachedPixelHinting:Boolean;
		private var _cachedScaleMode:String;
		private var _cachedCaps:String;
		private var _cachedJoints:String;
		private var _cachedMiterLimit:Number;

		private var _lastX:Number = NaN;
		private var _lastY:Number = NaN;

		// Constructor

		public function DashedStrokeBrush(dashSize:Number = 4, dashSpacing:Number = 4, thickness:Number = 0, color:uint = 0x000000, alpha:Number = 1, pixelHinting:Boolean = false, scaleMode:String = "normal", caps:String = "round", joints:String = "round", miterLimit:Number = 3)
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

			this._dashSize = new ObservableProperty(this, "dashSize", Number, dashSize);
			this._dashSpacing = new ObservableProperty(this, "dashSpacing", Number, dashSpacing);
			this._thickness = new ObservableProperty(this, "thickness", Number, thickness);
			this._color = new ObservableProperty(this, "color", uint, color);
			this._alpha = new ObservableProperty(this, "alpha", Number, alpha);
			this._pixelHinting = new ObservableProperty(this, "pixelHinting", Boolean, pixelHinting);
			this._scaleMode = new ObservableProperty(this, "scaleMode", String, scaleMode);
			this._caps = new ObservableProperty(this, "caps", String, caps);
			this._joints = new ObservableProperty(this, "joints", String, joints);
			this._miterLimit = new ObservableProperty(this, "miterLimit", Number, miterLimit);

			this._cachedDashSize = dashSize;
			this._cachedDashSpacing = dashSpacing;
			this._cachedThickness = thickness;
			this._cachedColor = color;
			this._cachedAlpha = alpha;
			this._cachedPixelHinting = pixelHinting;
			this._cachedScaleMode = scaleMode;
			this._cachedCaps = caps;
			this._cachedJoints = joints;
			this._cachedMiterLimit = miterLimit;
		}

		// Public Getters/Setters

		public function get dashSize() : Number
		{
			return this._dashSize.value;
		}
		public function set dashSize(value:Number) : void
		{
			this._dashSize.value = this._cachedDashSize = value;
		}

		public function get dashSpacing() : Number
		{
			return this._dashSpacing.value;
		}
		public function set dashSpacing(value:Number) : void
		{
			this._dashSpacing.value = this._cachedDashSpacing = value;
		}

		public function get thickness() : Number
		{
			return this._thickness.value;
		}
		public function set thickness(value:Number) : void
		{
			this._thickness.value = this._cachedThickness = value;
		}

		public function get color() : uint
		{
			return this._color.value;
		}
		public function set color(value:uint) : void
		{
			this._color.value = this._cachedColor = value;
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

		// Protected Methods

		protected override function draw(graphics:Graphics, matrix:Matrix, bounds:Array, instructions:Array) : void
		{
			var lastX:Number = NaN;
			var lastY:Number = NaN;

			var dashSize:Number = Math.max(this._cachedDashSize, 1);
			var dashSpacing:Number = Math.max(this._cachedDashSpacing, 0);

			var x1:Number;
			var y1:Number;
			var dx:Number;
			var dy:Number;
			var radius:Number;
			var angle:Number;
			var sinAngle:Number;
			var cosAngle:Number;
			var r:Number;
			var i:int;

			graphics.lineStyle(this._cachedThickness, this._cachedColor, this._cachedAlpha, this._cachedPixelHinting, this._cachedScaleMode, this._cachedCaps, this._cachedJoints, this._cachedMiterLimit);

			for each (var instruction:* in instructions)
			{
				if (instruction is MoveToInstruction)
				{
					lastX = instruction.x;
					lastY = instruction.y;

					graphics.moveTo(lastX, lastY);
				}
				else if (instruction is LineToInstruction)
				{
					if (lastX != lastX)
						lastX = instruction.x;
					if (lastY != lastY)
						lastY = instruction.y;

					x1 = lastX;
					y1 = lastY;
					lastX = instruction.x;
					lastY = instruction.y;

					dx = lastX - x1;
					dy = lastY - y1;
					radius = Math.sqrt(dx * dx + dy * dy);
					angle = Math.atan2(dy, dx);
					sinAngle = Math.sin(angle);
					cosAngle = Math.cos(angle);

					r = 0;
					i = 0;
					while (true)
					{
						if ((i % 2) == 0)
						{
							r += dashSize;
							if (r > radius)
								r = radius;
							graphics.lineTo(x1 + r * cosAngle, y1 + r * sinAngle);
						}
						else
						{
							r += dashSpacing;
							if (r > radius)
								r = radius;
							graphics.moveTo(x1 + r * cosAngle, y1 + r * sinAngle);
						}
						if (r >= radius)
							break;
						i++;
					}
				}
				else if (instruction is CurveToInstruction)
				{
					lastX = instruction.anchorX;
					lastY = instruction.anchorY;

					graphics.curveTo(instruction.controlX, instruction.controlY, lastX, lastY);
				}
			}

			graphics.lineStyle();
		}

	}

}
