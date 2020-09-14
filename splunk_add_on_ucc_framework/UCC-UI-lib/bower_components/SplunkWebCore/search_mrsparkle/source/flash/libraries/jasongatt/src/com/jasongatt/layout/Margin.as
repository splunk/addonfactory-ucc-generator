package com.jasongatt.layout
{

	public class Margin
	{

		// Public Properties

		public var left:Number;
		public var right:Number;
		public var top:Number;
		public var bottom:Number;

		// Constructor

		public function Margin(left:Number = 0, right:Number = 0, top:Number = 0, bottom:Number = 0)
		{
			this.left = left;
			this.right = right;
			this.top = top;
			this.bottom = bottom;
		}

		// Public Methods

		public function clone() : Margin
		{
			return new Margin(this.left, this.right, this.top, this.bottom);
		}

		public function equals(toCompare:Margin) : Boolean
		{
			return ((this.left == toCompare.left) && (this.right == toCompare.right) && (this.top == toCompare.top) && (this.bottom == toCompare.bottom));
		}

		public function toString() : String
		{
			return "(left=" + this.left + ", right=" + this.right + ", top=" + this.top + ", bottom=" + this.bottom + ")";
		}

	}

}
