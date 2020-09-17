package com.splunk.data
{

	public class Slice
	{

		// Public Properties

		public var startIndex:int;
		public var endIndex:int;

		// Constructor

		public function Slice(startIndex:int = 0, endIndex:int = -1)
		{
			this.startIndex = startIndex;
			this.endIndex = endIndex;
		}

	}

}
