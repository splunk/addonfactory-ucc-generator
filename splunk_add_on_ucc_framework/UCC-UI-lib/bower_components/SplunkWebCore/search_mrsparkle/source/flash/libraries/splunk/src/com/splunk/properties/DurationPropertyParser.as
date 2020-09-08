package com.splunk.properties
{

	import com.splunk.time.Duration;

	public class DurationPropertyParser extends AbstractPropertyParser
	{

		// Private Static Properties

		private static var _instance:DurationPropertyParser;

		// Public Static Methods

		public static function getInstance() : DurationPropertyParser
		{
			var instance:DurationPropertyParser = DurationPropertyParser._instance;
			if (!instance)
				instance = DurationPropertyParser._instance = new DurationPropertyParser();
			return instance;
		}

		// Constructor

		public function DurationPropertyParser()
		{
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			str = ParseUtils.trimWhiteSpace(str);
			if (!str)
				return null;

			return new Duration(str);
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			var duration:Duration = value as Duration;
			if (!duration)
				return null;

			return duration.toString();
		}

	}

}
