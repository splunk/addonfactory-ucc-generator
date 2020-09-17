package com.splunk.charting.distortion
{

	public class PowerDistortion implements IDistortion
	{

		// Private Property

		private var _power:Number;

		// Constructor

		public function PowerDistortion(power:Number = 2)
		{
			this._power = power;
		}

		// Public Getters/Setters

		public function get power() : Number
		{
			return this._power;
		}
		public function set power(value:Number) : void
		{
			this._power = value;
		}

		// Public Methods

		public function positionToDistortion(position:Number) : Number
		{
			if (position < 0)
				return -Math.pow(Math.abs(position), this._power);
			return Math.pow(position, this._power);
		}

		public function distortionToPosition(distortion:Number) : Number
		{
			if (distortion < 0)
				return -Math.pow(Math.abs(distortion), 1 / this._power);
			return Math.pow(distortion, 1 / this._power);
		}

	}

}
