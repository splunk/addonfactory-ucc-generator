package com.splunk.particles.distributions
{

	public class GroupDistribution implements IDistribution
	{

		// Private Properties

		private var _distributions:Array;

		// Constructor

		public function GroupDistribution(distributions:Array = null)
		{
			this._distributions = distributions ? distributions.concat() : new Array();
		}

		// Public Getters/Setters

		public function get distributions() : Array
		{
			return this._distributions.concat();
		}
		public function set distributions(value:Array) : void
		{
			this._distributions = value ? value.concat() : new Array();
		}

		// Public Methods

		public function getRandomValue() : Number
		{
			var distributions:Array = this._distributions;
			var numDistributions:int = distributions.length;
			var distribution:IDistribution;
			var lengths:Array = new Array(numDistributions);
			var length:Number;
			var totalLength:Number = 0;
			var i:int;

			for (i = 0; i < numDistributions; i++)
			{
				distribution = distributions[i];
				length = distribution.getLength();
				lengths[i] = length;
				totalLength += length;
			}

			totalLength *= Math.random();

			for (i = 0; i < numDistributions; i++)
			{
				length = lengths[i];
				totalLength -= length;
				if (totalLength <= 0)
				{
					distribution = distributions[i];
					return distribution.getRandomValue();
				}
			}

			return 0;
		}

		public function getLength() : Number
		{
			var length:Number = 0;
			for each (var distribution:IDistribution in this._distributions)
				length += distribution.getLength();
			return length;
		}

		public function containsValue(value:Number) : Boolean
		{
			for each (var distribution:IDistribution in this._distributions)
			{
				if (distribution.containsValue(value))
					return true;
			}
			return false;
		}

	}

}
