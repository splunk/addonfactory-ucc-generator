package com.splunk.particles.properties
{

	import com.splunk.particles.filters.FieldFilter;
	import com.splunk.properties.AbstractPropertyParser;
	import com.splunk.properties.ParseUtils;
	import com.splunk.properties.PropertyManager;
	import com.splunk.properties.StringPropertyParser;

	public class FilterPropertyParser extends AbstractPropertyParser
	{

		// Private Static Properties

		private static var _instance:FilterPropertyParser;

		// Public Static Methods

		public static function getInstance() : FilterPropertyParser
		{
			var instance:FilterPropertyParser = FilterPropertyParser._instance;
			if (!instance)
				instance = FilterPropertyParser._instance = new FilterPropertyParser();
			return instance;
		}

		// Protected Properties

		protected var stringPropertyParser:StringPropertyParser;

		// Constructor

		public function FilterPropertyParser()
		{
			this.stringPropertyParser = StringPropertyParser.getInstance();
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			switch (ParseUtils.trimWhiteSpace(str))
			{
				case "field":
					return new FieldFilter();
				default:
					return null;
			}
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			if (value is FieldFilter)
				return "field";
			return null;
		}

		public override function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
			if (value is FieldFilter)
			{
				propertyManager.registerProperty("fieldName", this.stringPropertyParser, this.getProperty, this.setProperty);
			}
		}

	}

}
