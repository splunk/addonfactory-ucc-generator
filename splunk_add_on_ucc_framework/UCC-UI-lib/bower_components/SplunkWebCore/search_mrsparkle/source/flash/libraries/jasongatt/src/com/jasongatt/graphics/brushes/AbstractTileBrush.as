package com.jasongatt.graphics.brushes
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.utils.MatrixUtil;
	import flash.display.Graphics;
	import flash.geom.Matrix;
	import flash.geom.Point;
	import flash.geom.Rectangle;

	public /*abstract*/ class AbstractTileBrush extends AbstractBrush
	{

		// Private Properties

		private var _stretchMode:ObservableProperty;
		private var _alignmentX:ObservableProperty;
		private var _alignmentY:ObservableProperty;
		private var _tileTransform:ObservableProperty;
		private var _renderTransform:ObservableProperty;
		private var _fitToDrawing:ObservableProperty;

		private var _cachedStretchMode:String;
		private var _cachedAlignmentX:Number;
		private var _cachedAlignmentY:Number;
		private var _cachedTileTransform:Matrix;
		private var _cachedRenderTransform:Matrix;
		private var _cachedFitToDrawing:Boolean;

		// Constructor

		public function AbstractTileBrush(stretchMode:String = "fill", alignmentX:Number = 0.5, alignmentY:Number = 0.5, tileTransform:Matrix = null, renderTransform:Matrix = null, fitToDrawing:Boolean = false)
		{
			switch (stretchMode)
			{
				case StretchMode.NONE:
				case StretchMode.FILL:
				case StretchMode.UNIFORM:
				case StretchMode.UNIFORM_TO_FILL:
				case StretchMode.UNIFORM_TO_WIDTH:
				case StretchMode.UNIFORM_TO_HEIGHT:
					break;
				default:
					stretchMode = StretchMode.FILL;
					break;
			}
			tileTransform = tileTransform ? tileTransform.clone() : null;
			renderTransform = renderTransform ? renderTransform.clone() : null;

			this._stretchMode = new ObservableProperty(this, "stretchMode", String, stretchMode);
			this._alignmentX = new ObservableProperty(this, "alignmentX", Number, alignmentX);
			this._alignmentY = new ObservableProperty(this, "alignmentY", Number, alignmentY);
			this._tileTransform = new ObservableProperty(this, "tileTransform", Matrix, tileTransform);
			this._renderTransform = new ObservableProperty(this, "renderTransform", Matrix, renderTransform);
			this._fitToDrawing = new ObservableProperty(this, "fitToDrawing", Boolean, fitToDrawing);

			this._cachedStretchMode = stretchMode;
			this._cachedAlignmentX = alignmentX;
			this._cachedAlignmentY = alignmentY;
			this._cachedTileTransform = tileTransform;
			this._cachedRenderTransform = renderTransform;
			this._cachedFitToDrawing = fitToDrawing;
		}

		// Public Getters/Setters

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

		// Protected Methods

		protected function computeTileMatrix(tileWidth:Number, tileHeight:Number, matrix:Matrix, bounds:Array, instructions:Array) : Matrix
		{
			var tileMatrix:Matrix;

			var tileTransform:Matrix = this._cachedTileTransform;
			if (tileTransform)
			{
				tileMatrix = tileTransform.clone();

				var p1:Point = new Point(0, 0);
				var p2:Point = new Point(tileWidth, 0);
				var p3:Point = new Point(tileWidth, tileHeight);
				var p4:Point = new Point(0, tileHeight);

				p1 = tileMatrix.transformPoint(p1);
				p2 = tileMatrix.transformPoint(p2);
				p3 = tileMatrix.transformPoint(p3);
				p4 = tileMatrix.transformPoint(p4);

				var left:Number = Math.min(p1.x, p2.x, p3.x, p4.x);
				var right:Number = Math.max(p1.x, p2.x, p3.x, p4.x);
				var top:Number = Math.min(p1.y, p2.y, p3.y, p4.y);
				var bottom:Number = Math.max(p1.y, p2.y, p3.y, p4.y);

				tileWidth = right - left;
				tileHeight = bottom - top;
				tileMatrix.translate(-left, -top);
			}
			else
			{
				tileMatrix = new Matrix();
			}

			var invertedMatrix:Matrix;
			if (matrix && MatrixUtil.hasInverse(matrix))
			{
				invertedMatrix = matrix.clone();
				invertedMatrix.invert();
			}

			var minX:Number = Infinity;
			var minY:Number = Infinity;
			var maxX:Number = -Infinity;
			var maxY:Number = -Infinity;
			var point:Point;

			if (bounds && !this._cachedFitToDrawing)
			{
				for each (point in bounds)
				{
					if (invertedMatrix)
						point = invertedMatrix.transformPoint(point);

					minX = Math.min(point.x, minX);
					minY = Math.min(point.y, minY);
					maxX = Math.max(point.x, maxX);
					maxY = Math.max(point.y, maxY);
				}
			}
			else
			{
				for each (var instruction:* in instructions)
				{
					if (instruction is MoveToInstruction)
						point = new Point(instruction.x, instruction.y);
					else if (instruction is LineToInstruction)
						point = new Point(instruction.x, instruction.y);
					else if (instruction is CurveToInstruction)
						point = new Point(instruction.anchorX, instruction.anchorY);  // control point tangents need to be properly computed
					else
						continue;

					if (invertedMatrix)
						point = invertedMatrix.transformPoint(point);

					minX = Math.min(point.x, minX);
					minY = Math.min(point.y, minY);
					maxX = Math.max(point.x, maxX);
					maxY = Math.max(point.y, maxY);
				}
			}

			if (minX == Infinity)
				minX = minY = maxX = maxY = 0;

			var width:Number = maxX - minX;
			var height:Number = maxY - minY;
			var scaleX:Number;
			var scaleY:Number;
			var offsetX:Number;
			var offsetY:Number;

			switch (this._cachedStretchMode)
			{
				case StretchMode.NONE:
					offsetX = (width - tileWidth) * this._cachedAlignmentX;
					offsetY = (height - tileHeight) * this._cachedAlignmentY;
					tileMatrix.translate(offsetX, offsetY);
					break;
				case StretchMode.UNIFORM:
					scaleX = (tileWidth > 0) ? (width / tileWidth) : 1;
					scaleY = (tileHeight > 0) ? (height / tileHeight) : 1;
					scaleX = scaleY = Math.min(scaleX, scaleY);
					offsetX = (width - tileWidth * scaleX) * this._cachedAlignmentX;
					offsetY = (height - tileHeight * scaleY) * this._cachedAlignmentY;
					tileMatrix.scale(scaleX, scaleY);
					tileMatrix.translate(offsetX, offsetY);
					break;
				case StretchMode.UNIFORM_TO_FILL:
					scaleX = (tileWidth > 0) ? (width / tileWidth) : 1;
					scaleY = (tileHeight > 0) ? (height / tileHeight) : 1;
					scaleX = scaleY = Math.max(scaleX, scaleY);
					offsetX = (width - tileWidth * scaleX) * this._cachedAlignmentX;
					offsetY = (height - tileHeight * scaleY) * this._cachedAlignmentY;
					tileMatrix.scale(scaleX, scaleY);
					tileMatrix.translate(offsetX, offsetY);
					break;
				case StretchMode.UNIFORM_TO_WIDTH:
					scaleX = scaleY = (tileWidth > 0) ? (width / tileWidth) : 1;
					offsetX = (width - tileWidth * scaleX) * this._cachedAlignmentX;
					offsetY = (height - tileHeight * scaleY) * this._cachedAlignmentY;
					tileMatrix.scale(scaleX, scaleY);
					tileMatrix.translate(offsetX, offsetY);
					break;
				case StretchMode.UNIFORM_TO_HEIGHT:
					scaleX = scaleY = (tileHeight > 0) ? (height / tileHeight) : 1;
					offsetX = (width - tileWidth * scaleX) * this._cachedAlignmentX;
					offsetY = (height - tileHeight * scaleY) * this._cachedAlignmentY;
					tileMatrix.scale(scaleX, scaleY);
					tileMatrix.translate(offsetX, offsetY);
					break;
				default:  // StrechMode.FILL
					scaleX = (tileWidth > 0) ? (width / tileWidth) : 1;
					scaleY = (tileHeight > 0) ? (height / tileHeight) : 1;
					tileMatrix.scale(scaleX, scaleY);
					break;
			}

			var renderTransform:Matrix = this._cachedRenderTransform;
			if (renderTransform)
				tileMatrix.concat(renderTransform);

			tileMatrix.translate(minX, minY);

			if (matrix)
				tileMatrix.concat(matrix);

			return tileMatrix;
		}

	}

}
