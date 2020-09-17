package com.splunk.properties
{

	public class NumberPropertyParser extends AbstractPropertyParser
	{

		// Private Static Properties

		private static var _instance:NumberPropertyParser;

		// Public Static Methods

		public static function getInstance() : NumberPropertyParser
		{
			var instance:NumberPropertyParser = NumberPropertyParser._instance;
			if (!instance)
				instance = NumberPropertyParser._instance = new NumberPropertyParser();
			return instance;
		}

		// Constructor

		public function NumberPropertyParser()
		{
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			str = ParseUtils.trimWhiteSpace(str);
			return str ? Number(str) : NaN;
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			return (value is Number) ? String(value) : String(NaN);
		}

	}

}
