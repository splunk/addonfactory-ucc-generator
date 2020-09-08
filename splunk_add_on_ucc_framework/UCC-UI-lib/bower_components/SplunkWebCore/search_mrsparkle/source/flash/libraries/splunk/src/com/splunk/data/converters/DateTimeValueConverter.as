package com.splunk.data.converters
{

	import com.splunk.time.DateTime;

	public class DateTimeValueConverter implements IValueConverter
	{

		// Private Static Properties

		private static var _instance:DateTimeValueConverter;

		// Public Static Methods

		public static function getInstance() : DateTimeValueConverter
		{
			var instance:DateTimeValueConverter = DateTimeValueConverter._instance;
			if (!instance)
				instance = DateTimeValueConverter._instance = new DateTimeValueConverter();
			return instance;
		}

		// Constructor

		public function DateTimeValueConverter()
		{
		}

		// Public Methods

		public function convertFrom(value:*) : *
		{
			if (value == null)
				return null;
			if (value is DateTime)
				return (value.time == value.time) ? value : null;
			if (value is Date)
				return (value.time == value.time) ? new DateTime(value.time / 1000) : null;
			if (value is String)
			{
				if (!value)
					return null;
				var num:Number = Number(value);
				if (num == num)
					return new DateTime(num);
				var date:DateTime = new DateTime(value);
				if (date.time == date.time)
					return date;
				return null;
			}
			if (value is Number)
				return (value == value) ? new DateTime(value) : null;
			return null;
		}

	}

}
