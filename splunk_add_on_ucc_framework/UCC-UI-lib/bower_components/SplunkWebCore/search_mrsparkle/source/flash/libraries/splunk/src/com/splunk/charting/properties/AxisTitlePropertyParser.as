package com.splunk.charting.properties
{

	import com.splunk.charting.labels.AxisTitle;
	import com.splunk.properties.ParseUtils;
	import com.splunk.properties.PropertyManager;
	import com.splunk.properties.TextBlockPropertyParser;

	public class AxisTitlePropertyParser extends TextBlockPropertyParser
	{

		// Private Static Properties

		private static var _instance:AxisTitlePropertyParser;

		// Public Static Methods

		public static function getInstance() : AxisTitlePropertyParser
		{
			var instance:AxisTitlePropertyParser = AxisTitlePropertyParser._instance;
			if (!instance)
				instance = AxisTitlePropertyParser._instance = new AxisTitlePropertyParser();
			return instance;
		}

		// Constructor

		public function AxisTitlePropertyParser()
		{
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			if (ParseUtils.trimWhiteSpace(str) == "axisTitle")
				return new AxisTitle();
			return null;
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			if (value is AxisTitle)
				return "axisTitle";
			return null;
		}

		public override function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
			super.registerProperties(propertyManager, value);

			if (value is AxisTitle)
			{
				propertyManager.registerProperty("placement", this.stringPropertyParser, this.getProperty, this.setProperty);
			}
		}

	}

}
