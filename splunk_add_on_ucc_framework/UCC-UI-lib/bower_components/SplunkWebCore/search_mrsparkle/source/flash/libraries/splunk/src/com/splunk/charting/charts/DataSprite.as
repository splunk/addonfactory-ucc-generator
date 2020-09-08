package com.splunk.charting.charts
{

	import flash.display.Sprite;
	import flash.geom.Rectangle;

	public class DataSprite extends Sprite
	{

		// Public Properties

		public var chart:AbstractChart;
		public var seriesName:String;
		public var dataRowIndex:int;
		public var data:Object;
		public var fields:Array;
		public var tipBounds:Rectangle;
		public var tipPlacement:String;

		// Constructor

		public function DataSprite()
		{
			this.mouseChildren = false;
		}

	}

}
