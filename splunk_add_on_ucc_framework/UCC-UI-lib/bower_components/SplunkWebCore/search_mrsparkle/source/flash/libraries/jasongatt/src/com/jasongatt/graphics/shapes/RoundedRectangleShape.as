package com.jasongatt.graphics.shapes
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.graphics.brushes.IBrush;
	import com.jasongatt.utils.NumberUtil;

	public class RoundedRectangleShape extends AbstractShape
	{

		// Private Properties

		private var _cornerRadius:ObservableProperty;
		private var _cornerRadiusTL:ObservableProperty;
		private var _cornerRadiusTR:ObservableProperty;
		private var _cornerRadiusBR:ObservableProperty;
		private var _cornerRadiusBL:ObservableProperty;

		private var _cachedCornerRadius:Number;
		private var _cachedCornerRadiusTL:Number;
		private var _cachedCornerRadiusTR:Number;
		private var _cachedCornerRadiusBR:Number;
		private var _cachedCornerRadiusBL:Number;

		// Constructor

		public function RoundedRectangleShape(cornerRadius:Number = 0, cornerRadiusTL:Number = NaN, cornerRadiusTR:Number = NaN, cornerRadiusBR:Number = NaN, cornerRadiusBL:Number = NaN)
		{
			this._cornerRadius = new ObservableProperty(this, "cornerRadius", Number, cornerRadius);
			this._cornerRadiusTL = new ObservableProperty(this, "cornerRadiusTL", Number, cornerRadiusTL);
			this._cornerRadiusTR = new ObservableProperty(this, "cornerRadiusTR", Number, cornerRadiusTR);
			this._cornerRadiusBR = new ObservableProperty(this, "cornerRadiusBR", Number, cornerRadiusBR);
			this._cornerRadiusBL = new ObservableProperty(this, "cornerRadiusBL", Number, cornerRadiusBL);

			this._cachedCornerRadius = cornerRadius;
			this._cachedCornerRadiusTL = cornerRadiusTL;
			this._cachedCornerRadiusTR = cornerRadiusTR;
			this._cachedCornerRadiusBR = cornerRadiusBR;
			this._cachedCornerRadiusBL = cornerRadiusBL;
		}

		// Public Getters/Setters

		public function get cornerRadius() : Number
		{
			return this._cornerRadius.value;
		}
		public function set cornerRadius(value:Number) : void
		{
			this._cornerRadius.value = this._cachedCornerRadius = value;
		}

		public function get cornerRadiusTL() : Number
		{
			return this._cornerRadiusTL.value;
		}
		public function set cornerRadiusTL(value:Number) : void
		{
			this._cornerRadiusTL.value = this._cachedCornerRadiusTL = value;
		}

		public function get cornerRadiusTR() : Number
		{
			return this._cornerRadiusTR.value;
		}
		public function set cornerRadiusTR(value:Number) : void
		{
			this._cornerRadiusTR.value = this._cachedCornerRadiusTR = value;
		}

		public function get cornerRadiusBR() : Number
		{
			return this._cornerRadiusBR.value;
		}
		public function set cornerRadiusBR(value:Number) : void
		{
			this._cornerRadiusBR.value = this._cachedCornerRadiusBR = value;
		}

		public function get cornerRadiusBL() : Number
		{
			return this._cornerRadiusBL.value;
		}
		public function set cornerRadiusBL(value:Number) : void
		{
			this._cornerRadiusBL.value = this._cachedCornerRadiusBL = value;
		}

		// Protected Methods

		protected override function drawOverride(width:Number, height:Number, brush:IBrush) : void
		{
			var maxRadius:Number = Math.min(width, height) / 2;

			var cornerRadius:Number = this._cachedCornerRadius;
			if (cornerRadius != cornerRadius)
				cornerRadius = 0;

			var cornerRadiusTL:Number = this._cachedCornerRadiusTL;
			if (cornerRadiusTL != cornerRadiusTL)
				cornerRadiusTL = cornerRadius;
			cornerRadiusTL = NumberUtil.minMax(cornerRadiusTL, 0, maxRadius);

			var cornerRadiusTR:Number = this._cachedCornerRadiusTR;
			if (cornerRadiusTR != cornerRadiusTR)
				cornerRadiusTR = cornerRadius;
			cornerRadiusTR = NumberUtil.minMax(cornerRadiusTR, 0, maxRadius);

			var cornerRadiusBR:Number = this._cachedCornerRadiusBR;
			if (cornerRadiusBR != cornerRadiusBR)
				cornerRadiusBR = cornerRadius;
			cornerRadiusBR = NumberUtil.minMax(cornerRadiusBR, 0, maxRadius);

			var cornerRadiusBL:Number = this._cachedCornerRadiusBL;
			if (cornerRadiusBL != cornerRadiusBL)
				cornerRadiusBL = cornerRadius;
			cornerRadiusBL = NumberUtil.minMax(cornerRadiusBL, 0, maxRadius);

			brush.moveTo(cornerRadiusTL, 0);
			brush.lineTo(width - cornerRadiusTR, 0);
			brush.curveTo(width, 0, width, cornerRadiusTR);
			brush.lineTo(width, height - cornerRadiusBR);
			brush.curveTo(width, height, width - cornerRadiusBR, height);
			brush.lineTo(cornerRadiusBL, height);
			brush.curveTo(0, height, 0, height - cornerRadiusBL);
			brush.lineTo(0, cornerRadiusTL);
			brush.curveTo(0, 0, cornerRadiusTL, 0);
		}

	}

}
