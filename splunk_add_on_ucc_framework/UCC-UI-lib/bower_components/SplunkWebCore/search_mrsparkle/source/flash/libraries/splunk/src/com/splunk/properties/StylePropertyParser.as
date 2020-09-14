package com.splunk.properties
{

	import com.splunk.utils.Style;

	public class StylePropertyParser extends AbstractPropertyParser
	{

		// Private Static Properties

		private static var _instance:StylePropertyParser;

		// Public Static Methods

		public static function getInstance() : StylePropertyParser
		{
			var instance:StylePropertyParser = StylePropertyParser._instance;
			if (!instance)
				instance = StylePropertyParser._instance = new StylePropertyParser();
			return instance;
		}

		// Constructor

		public function StylePropertyParser()
		{
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			if (ParseUtils.trimWhiteSpace(str) == "style")
				return new Style();
			return null;
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			if (value is Style)
				return "style";
			return null;
		}

		// Protected Methods

		protected override function setProperty(target:*, propertyName:String, value:*) : void
		{
			if (value == null)
				delete target[propertyName];
			else
				target[propertyName] = value;
		}

	}

}
