package com.jasongatt.layout
{

	public class Size
	{

		// Public Static Constants

		public static const AUTO:Number = NaN;

		// Public Properties

		public var width:Number;
		public var height:Number;

		// Constructor

		public function Size(width:Number = 0, height:Number = 0)
		{
			this.width = width;
			this.height = height;
		}

		// Public Methods

		public function clone() : Size
		{
			return new Size(this.width, this.height);
		}

		public function equals(toCompare:Size) : Boolean
		{
			return ((this.width == toCompare.width) && (this.height == toCompare.height));
		}

		public function toString() : String
		{
			return "(width=" + this.width + ", height=" + this.height + ")";
		}

	}

}
