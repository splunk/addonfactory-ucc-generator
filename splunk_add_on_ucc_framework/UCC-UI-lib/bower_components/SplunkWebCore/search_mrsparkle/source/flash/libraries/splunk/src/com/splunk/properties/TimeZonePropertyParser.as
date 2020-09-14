package com.splunk.properties
{

	import com.splunk.time.LocalTimeZone;
	import com.splunk.time.SimpleTimeZone;
	import com.splunk.time.SplunkTimeZone;
	import com.splunk.time.TimeZones;

	public class TimeZonePropertyParser extends AbstractPropertyParser
	{

		// Private Static Properties

		private static var _instance:TimeZonePropertyParser;

		// Public Static Methods

		public static function getInstance() : TimeZonePropertyParser
		{
			var instance:TimeZonePropertyParser = TimeZonePropertyParser._instance;
			if (!instance)
				instance = TimeZonePropertyParser._instance = new TimeZonePropertyParser();
			return instance;
		}

		// Constructor

		public function TimeZonePropertyParser()
		{
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			str = ParseUtils.trimWhiteSpace(str);
			if (!str)
				return TimeZones.LOCAL;

			if ((str == "z") || (str == "Z"))
				return TimeZones.UTC;

			var offset:Number = Number(str);
			if (offset == offset)
				return new SimpleTimeZone(offset);

			if (str.indexOf("SERIALIZED TIMEZONE FORMAT") >= 0)
				return new SplunkTimeZone(str);

			return TimeZones.LOCAL;
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			if (value is SplunkTimeZone)
				return value.serializedTimeZone;
			if (value is SimpleTimeZone)
			{
				var offset:Number = value.standardOffset;
				return (offset != 0) ? String(offset) : "Z";
			}
			return null;
		}

	}

}
