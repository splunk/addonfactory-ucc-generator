package com.splunk.charting.properties
{

	import com.splunk.charting.controls.DataSpriteTip;
	import com.splunk.properties.LayoutSpritePropertyParser;
	import com.splunk.properties.LayoutSpriteStylePropertyParser;
	import com.splunk.properties.ParseUtils;
	import com.splunk.properties.PropertyManager;
	import com.splunk.properties.TextBlockStylePropertyParser;

	public class DataSpriteTipPropertyParser extends LayoutSpritePropertyParser
	{

		// Private Static Properties

		private static var _instance:DataSpriteTipPropertyParser;

		// Public Static Methods

		public static function getInstance() : DataSpriteTipPropertyParser
		{
			var instance:DataSpriteTipPropertyParser = DataSpriteTipPropertyParser._instance;
			if (!instance)
				instance = DataSpriteTipPropertyParser._instance = new DataSpriteTipPropertyParser();
			return instance;
		}

		// Protected Properties

		protected var layoutSpriteStylePropertyParser:LayoutSpriteStylePropertyParser;
		protected var textBlockStylePropertyParser:TextBlockStylePropertyParser;

		// Constructor

		public function DataSpriteTipPropertyParser()
		{
			this.layoutSpriteStylePropertyParser = LayoutSpriteStylePropertyParser.getInstance();
			this.textBlockStylePropertyParser = TextBlockStylePropertyParser.getInstance();
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			if (ParseUtils.trimWhiteSpace(str) == "dataSpriteTip")
				return new DataSpriteTip();
			return null;
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			if (value is DataSpriteTip)
				return "dataSpriteTip";
			return null;
		}

		public override function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
			super.registerProperties(propertyManager, value);

			if (value is DataSpriteTip)
			{
				propertyManager.registerProperty("swatchStyle", this.layoutSpriteStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("fieldStyle", this.textBlockStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("valueStyle", this.textBlockStylePropertyParser, this.getProperty, this.setProperty);
			}
		}

	}

}
