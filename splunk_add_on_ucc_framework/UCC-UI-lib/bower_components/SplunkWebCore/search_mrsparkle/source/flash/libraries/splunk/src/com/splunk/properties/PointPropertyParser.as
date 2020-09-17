package com.splunk.properties
{

	import flash.geom.Point;

	public class PointPropertyParser extends AbstractPropertyParser
	{

		// Private Static Properties

		private static var _instance:PointPropertyParser;

		// Public Static Methods

		public static function getInstance() : PointPropertyParser
		{
			var instance:PointPropertyParser = PointPropertyParser._instance;
			if (!instance)
				instance = PointPropertyParser._instance = new PointPropertyParser();
			return instance;
		}

		// Protected Properties

		protected var numberPropertyParser:NumberPropertyParser;

		// Constructor

		public function PointPropertyParser()
		{
			this.numberPropertyParser = NumberPropertyParser.getInstance();
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			var values:Array = ParseUtils.prepareTuple(str);
			if (!values)
				return null;

			var point:Point = new Point();

			var numValues:int = values.length;
			if (numValues > 0)
				point.x = propertyManager.parseValue(values[0], this.numberPropertyParser);
			if (numValues > 1)
				point.y = propertyManager.parseValue(values[1], this.numberPropertyParser);

			return point;
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			var point:Point = value as Point;
			if (!point)
				return null;

			var str:String = "";
			str += this.numberPropertyParser.valueToString(propertyManager, point.x) + ",";
			str += this.numberPropertyParser.valueToString(propertyManager, point.y);
			return "(" + str + ")";
		}

	}

}
