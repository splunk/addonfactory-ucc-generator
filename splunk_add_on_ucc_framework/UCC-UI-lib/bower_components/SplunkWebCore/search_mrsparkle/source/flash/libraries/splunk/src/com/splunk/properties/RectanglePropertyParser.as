package com.splunk.properties
{

	import flash.geom.Rectangle;

	public class RectanglePropertyParser extends AbstractPropertyParser
	{

		// Private Static Properties

		private static var _instance:RectanglePropertyParser;

		// Public Static Methods

		public static function getInstance() : RectanglePropertyParser
		{
			var instance:RectanglePropertyParser = RectanglePropertyParser._instance;
			if (!instance)
				instance = RectanglePropertyParser._instance = new RectanglePropertyParser();
			return instance;
		}

		// Protected Properties

		protected var numberPropertyParser:NumberPropertyParser;

		// Constructor

		public function RectanglePropertyParser()
		{
			this.numberPropertyParser = NumberPropertyParser.getInstance();
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			var values:Array = ParseUtils.prepareTuple(str);
			if (!values)
				return null;

			var rectangle:Rectangle = new Rectangle();

			var numValues:int = values.length;
			if (numValues > 0)
				rectangle.x = propertyManager.parseValue(values[0], this.numberPropertyParser);
			if (numValues > 1)
				rectangle.y = propertyManager.parseValue(values[1], this.numberPropertyParser);
			if (numValues > 2)
				rectangle.width = propertyManager.parseValue(values[2], this.numberPropertyParser);
			if (numValues > 3)
				rectangle.height = propertyManager.parseValue(values[3], this.numberPropertyParser);

			return rectangle;
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			var rectangle:Rectangle = value as Rectangle;
			if (!rectangle)
				return null;

			var str:String = "";
			str += this.numberPropertyParser.valueToString(propertyManager, rectangle.x) + ",";
			str += this.numberPropertyParser.valueToString(propertyManager, rectangle.y) + ",";
			str += this.numberPropertyParser.valueToString(propertyManager, rectangle.width) + ",";
			str += this.numberPropertyParser.valueToString(propertyManager, rectangle.height);
			return "(" + str + ")";
		}

	}

}
