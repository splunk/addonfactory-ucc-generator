package com.splunk.properties
{

	import com.splunk.time.DateTime;

	public class DateTimePropertyParser extends AbstractPropertyParser
	{

		// Private Static Properties

		private static var _instance:DateTimePropertyParser;

		// Public Static Methods

		public static function getInstance() : DateTimePropertyParser
		{
			var instance:DateTimePropertyParser = DateTimePropertyParser._instance;
			if (!instance)
				instance = DateTimePropertyParser._instance = new DateTimePropertyParser();
			return instance;
		}

		// Constructor

		public function DateTimePropertyParser()
		{
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			str = ParseUtils.trimWhiteSpace(str);
			if (!str)
				return null;

			return new DateTime(str);
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			var dateTime:DateTime = value as DateTime;
			if (!dateTime)
				return null;

			return dateTime.toString();
		}

	}

}
