package com.splunk.services.search.data
{

	import com.splunk.services.namespaces.splunk;
	import com.splunk.time.DateTime;
	import flash.utils.getQualifiedClassName;

	public final class DataUtils
	{

		// Public Static Methods

		public static function parseInt(value:Object) : int
		{
			var str:String = value.toString();
			if (str)
				return int(str);
			return 0;
		}

		public static function parseUint(value:Object) : uint
		{
			var str:String = value.toString();
			if (str)
				return uint(str);
			return 0;
		}

		public static function parseNumber(value:Object) : Number
		{
			var str:String = value.toString();
			if (str)
				return Number(str);
			return NaN;
		}

		public static function parseBoolean(value:Object) : Boolean
		{
			return (value.toString() == "1");
		}

		public static function parseString(value:Object) : String
		{
			return value.toString();
		}

		public static function parseISOTime(value:Object) : DateTime
		{
			var dateTime:DateTime = new DateTime(value.toString());
			if (dateTime.time == dateTime.time)
				return dateTime;
			return null;
		}

		public static function parseUTCTime(value:Object) : DateTime
		{
			var str:String = value.toString();
			if (str)
			{
				var time:Number = Number(str);
				if (time == time)
					return new DateTime(time);
			}
			return null;
		}

		public static function parseDictionary(value:Object) : Object
		{
			var dict:Object = new Object();
			var keys:XMLList = value.splunk::dict.splunk::key;
			var name:String;
			for each (var key:XML in keys)
			{
				name = key.@name.toString();
				if (name)
					dict[name] = key.toString();
			}
			return dict;
		}

	}

}
