package com.splunk.properties
{

	public class BooleanPropertyParser extends AbstractPropertyParser
	{

		// Private Static Properties

		private static var _instance:BooleanPropertyParser;

		// Public Static Methods

		public static function getInstance() : BooleanPropertyParser
		{
			var instance:BooleanPropertyParser = BooleanPropertyParser._instance;
			if (!instance)
				instance = BooleanPropertyParser._instance = new BooleanPropertyParser();
			return instance;
		}

		// Constructor

		public function BooleanPropertyParser()
		{
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			str = ParseUtils.trimWhiteSpace(str);
			if (str)
				str = str.toLowerCase();
			return ((str == "true") || (str == "t") || (str == "1"));
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			return value ? "true" : "false";
		}

	}

}
