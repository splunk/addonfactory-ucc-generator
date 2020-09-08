package com.splunk.properties
{

	public class StringPropertyParser extends AbstractPropertyParser
	{

		// Private Static Properties

		private static var _instance:StringPropertyParser;

		// Public Static Methods

		public static function getInstance() : StringPropertyParser
		{
			var instance:StringPropertyParser = StringPropertyParser._instance;
			if (!instance)
				instance = StringPropertyParser._instance = new StringPropertyParser();
			return instance;
		}

		// Constructor

		public function StringPropertyParser()
		{
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			return str;
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			return (value == null) ? null : String(value);
		}

	}

}
