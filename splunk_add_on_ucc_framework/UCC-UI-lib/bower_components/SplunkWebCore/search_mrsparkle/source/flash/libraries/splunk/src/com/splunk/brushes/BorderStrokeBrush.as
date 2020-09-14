package com.splunk.brushes
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.graphics.brushes.AbstractBrush;
	import com.jasongatt.graphics.brushes.CurveToInstruction;
	import com.jasongatt.graphics.brushes.LineToInstruction;
	import com.jasongatt.graphics.brushes.MoveToInstruction;
	import com.jasongatt.utils.NumberUtil;
	import flash.display.CapsStyle;
	import flash.display.Graphics;
	import flash.display.JointStyle;
	import flash.display.LineScaleMode;
	import flash.geom.Matrix;
	import flash.geom.Point;

	public class BorderStrokeBrush extends AbstractBrush
	{

		// Private Properties

		private var _thicknesses:ObservableProperty;
		private var _colors:ObservableProperty;
		private var _alphas:ObservableProperty;
		private var _pixelHinting:ObservableProperty;
		private var _scaleMode:ObservableProperty;
		private var _caps:ObservableProperty;
		private var _joints:ObservableProperty;
		private var _miterLimit:ObservableProperty;

		private var _cachedThicknesses:Array;
		private var _cachedColors:Array;
		private var _cachedAlphas:Array;
		private var _cachedPixelHinting:Boolean;
		private var _cachedScaleMode:String;
		private var _cachedCaps:String;
		private var _cachedJoints:String;
		private var _cachedMiterLimit:Number;

		// Constructor

		public function BorderStrokeBrush(thicknesses:Array = null, colors:Array = null, alphas:Array = null, pixelHinting:Boolean = false, scaleMode:String = "normal", caps:String = "round", joints:String = "round", miterLimit:Number = 3)
		{
			thicknesses = this._filterThicknesses(thicknesses);
			colors = this._filterColors(colors);
			alphas = this._filterAlphas(alphas);
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

			this._thicknesses = new ObservableProperty(this, "thicknesses", Array, thicknesses);
			this._colors = new ObservableProperty(this, "colors", Array, colors);
			this._alphas = new ObservableProperty(this, "alphas", Array, alphas);
			this._pixelHinting = new ObservableProperty(this, "pixelHinting", Boolean, pixelHinting);
			this._scaleMode = new ObservableProperty(this, "scaleMode", String, scaleMode);
			this._caps = new ObservableProperty(this, "caps", String, caps);
			this._joints = new ObservableProperty(this, "joints", String, joints);
			this._miterLimit = new ObservableProperty(this, "miterLimit", Number, miterLimit);

			this._cachedThicknesses = thicknesses;
			this._cachedColors = colors;
			this._cachedAlphas = alphas;
			this._cachedPixelHinting = pixelHinting;
			this._cachedScaleMode = scaleMode;
			this._cachedCaps = caps;
			this._cachedJoints = joints;
			this._cachedMiterLimit = miterLimit;
		}

		// Public Getters/Setters

		public function get thicknesses() : Array
		{
			return this._thicknesses.value.concat();
		}
		public function set thicknesses(value:Array) : void
		{
			this._thicknesses.value = this._cachedThicknesses = this._filterThicknesses(value);
		}

		public function get colors() : Array
		{
			return this._colors.value.concat();
		}
		public function set colors(value:Array) : void
		{
			this._colors.value = this._cachedColors = this._filterColors(value);
		}

		public function get alphas() : Array
		{
			return this._alphas.value.concat();
		}
		public function set alphas(value:Array) : void
		{
			this._alphas.value = this._cachedAlphas = this._filterAlphas(value);
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
			var x1:Number = Infinity;
			var x2:Number = -Infinity;
			var y1:Number = Infinity;
			var y2:Number = -Infinity;

			for each (var instruction:* in instructions)
			{
				if ((instruction is MoveToInstruction) || (instruction is LineToInstruction))
				{
					x1 = Math.min(x1, instruction.x);
					x2 = Math.max(x2, instruction.x);
					y1 = Math.min(y1, instruction.y);
					y2 = Math.max(y2, instruction.y);
				}
				else if (instruction is CurveToInstruction)
				{
					x1 = Math.min(x1, instruction.controlX, instruction.anchorX);
					x2 = Math.max(x2, instruction.controlX, instruction.anchorX);
					y1 = Math.min(y1, instruction.controlY, instruction.anchorY);
					y2 = Math.max(y2, instruction.controlY, instruction.anchorY);
				}
			}

			if (x1 == Infinity)
				return;

			var borderPoints:Array = [ new Point(x1, y1), new Point(x2, y1), new Point(x2, y2), new Point(x1, y2), new Point(x1, y1) ];
			var thickness:Number = NaN;
			var color:uint = NaN;
			var alpha:Number = NaN;
			var newStroke:Boolean = true;

			for (var i:int = 0; i < 4; i++)
			{
				if (this._cachedThicknesses[i] != thickness)
				{
					thickness = this._cachedThicknesses[i];
					newStroke = true;
				}

				if (thickness == 0)
					continue;

				if (this._cachedColors[i] != color)
				{
					color = this._cachedColors[i];
					newStroke = true;
				}

				if (this._cachedAlphas[i] != alpha)
				{
					alpha = this._cachedAlphas[i];
					newStroke = true;
				}

				if (newStroke)
				{
					graphics.lineStyle(thickness, color, alpha, this._cachedPixelHinting, this._cachedScaleMode, this._cachedCaps, this._cachedJoints, this._cachedMiterLimit);
					graphics.moveTo(borderPoints[i].x, borderPoints[i].y);
					newStroke = false;
				}

				graphics.lineTo(borderPoints[i + 1].x, borderPoints[i + 1].y);
			}

			graphics.lineStyle();
		}

		// Private Methods

		private function _filterThicknesses(value:Array) : Array
		{
			var length:int = value ? value.length : 0;
			var top:Number = ((length > 0) && (value[0] < Infinity)) ? Math.max(value[0], 0) : 1;
			var right:Number = ((length > 1) && (value[1] < Infinity)) ? Math.max(value[1], 0) : top;
			var bottom:Number = ((length > 2) && (value[2] < Infinity)) ? Math.max(value[2], 0) : top;
			var left:Number = ((length > 3) && (value[3] < Infinity)) ? Math.max(value[3], 0) : right;
			return [ top, right, bottom, left ];
		}

		private function _filterColors(value:Array) : Array
		{
			var length:int = value ? value.length : 0;
			var top:uint = ((length > 0) && !isNaN(value[0])) ? NumberUtil.minMax(Math.floor(value[0]), 0x000000, 0xFFFFFF) : 0x000000;
			var right:uint = ((length > 1) && !isNaN(value[1])) ? NumberUtil.minMax(Math.floor(value[1]), 0x000000, 0xFFFFFF) : top;
			var bottom:uint = ((length > 2) && !isNaN(value[2])) ? NumberUtil.minMax(Math.floor(value[2]), 0x000000, 0xFFFFFF) : top;
			var left:uint = ((length > 3) && !isNaN(value[3])) ? NumberUtil.minMax(Math.floor(value[3]), 0x000000, 0xFFFFFF) : right;
			return [ top, right, bottom, left ];
		}

		private function _filterAlphas(value:Array) : Array
		{
			var length:int = value ? value.length : 0;
			var top:Number = ((length > 0) && !isNaN(value[0])) ? NumberUtil.minMax(value[0], 0, 1) : 1;
			var right:Number = ((length > 1) && !isNaN(value[1])) ? NumberUtil.minMax(value[1], 0, 1) : top;
			var bottom:Number = ((length > 2) && !isNaN(value[2])) ? NumberUtil.minMax(value[2], 0, 1) : top;
			var left:Number = ((length > 3) && !isNaN(value[3])) ? NumberUtil.minMax(value[3], 0, 1) : right;
			return [ top, right, bottom, left ];
		}

	}

}
