package com.splunk.charting.properties
{

	import com.splunk.charting.scale.LogScale;
	import com.splunk.properties.AbstractPropertyParser;
	import com.splunk.properties.NumberPropertyParser;
	import com.splunk.properties.ParseUtils;
	import com.splunk.properties.PropertyManager;

	public class ScalePropertyParser extends AbstractPropertyParser
	{

		// Private Static Properties

		private static var _instance:ScalePropertyParser;

		// Public Static Methods

		public static function getInstance() : ScalePropertyParser
		{
			var instance:ScalePropertyParser = ScalePropertyParser._instance;
			if (!instance)
				instance = ScalePropertyParser._instance = new ScalePropertyParser();
			return instance;
		}

		// Protected Properties

		protected var numberPropertyParser:NumberPropertyParser;

		// Constructor

		public function ScalePropertyParser()
		{
			this.numberPropertyParser = NumberPropertyParser.getInstance();
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			str = ParseUtils.trimWhiteSpace(str);
			if (!str)
				return null;

			if (str.indexOf("log") == 0)
			{
				var base:Number = 10;
				var baseString:String = str.substring(3);
				if (baseString)
				{
					base = Number(baseString);
					if (base != base)
						base = 10;
				}
				return new LogScale(base);
			}

			return null;
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			if (value is LogScale)
				return "log" + String(value.base);
			return null;
		}

		public override function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
			if (value is LogScale)
			{
				propertyManager.registerProperty("base", this.numberPropertyParser, this.getProperty, this.setProperty);
			}
		}

	}

}
