package com.splunk.charting.scale
{

	import com.jasongatt.utils.NumberUtil;

	public class LogScale implements IScale
	{

		// Private Properties

		private var _base:Number;

		private var _baseMultiplier:Number;

		// Constructor

		public function LogScale(base:Number = 10)
		{
			this.base = base;
		}

		// Public Getters/Setters

		public function get base() : Number
		{
			return this._base;
		}
		public function set base(value:Number) : void
		{
			this._base = value;
			this._baseMultiplier = Math.log(this._base);
		}

		// Public Methods

		public function valueToScale(value:Number) : Number
		{
			if (this._base <= 1)
				return 0;

			var scale:Number = 0;

			var isNegative:Boolean = (value < 0);

			if (isNegative)
				value = -value;

			if (value < this._base)
				value += (this._base - value) / this._base;
			scale = Math.log(value) / this._baseMultiplier;

			scale = NumberUtil.toPrecision(scale, -1);

			if (isNegative)
				scale = -scale;

			return scale;
		}

		public function scaleToValue(scale:Number) : Number
		{
			if (this._base <= 1)
				return 0;

			var value:Number = 0;

			var isNegative:Boolean = (scale < 0);

			if (isNegative)
				scale = -scale;

			value = Math.exp(scale * this._baseMultiplier);
			if (value < this._base)
				value = this._base * (value - 1) / (this._base - 1);

			value = NumberUtil.toPrecision(value, -1);

			if (isNegative)
				value = -value;

			return value;
		}

	}

}
