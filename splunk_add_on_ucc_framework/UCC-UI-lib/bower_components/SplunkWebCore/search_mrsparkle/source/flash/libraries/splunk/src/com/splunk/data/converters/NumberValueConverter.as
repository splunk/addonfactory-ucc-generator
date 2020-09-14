package com.splunk.data.converters
{

	public class NumberValueConverter implements IValueConverter
	{

		// Private Static Properties

		private static var _instance:NumberValueConverter;

		// Public Static Methods

		public static function getInstance() : NumberValueConverter
		{
			var instance:NumberValueConverter = NumberValueConverter._instance;
			if (!instance)
				instance = NumberValueConverter._instance = new NumberValueConverter();
			return instance;
		}

		// Constructor

		public function NumberValueConverter()
		{
		}

		// Public Methods

		public function convertFrom(value:*) : *
		{
			if (value == null)
				return NaN;
			if (value is Number)
				return value;
			if (value is String)
				return value ? Number(value) : NaN;
			if (value is Boolean)
				return value ? 1 : 0;
			return NaN;
		}

	}

}
