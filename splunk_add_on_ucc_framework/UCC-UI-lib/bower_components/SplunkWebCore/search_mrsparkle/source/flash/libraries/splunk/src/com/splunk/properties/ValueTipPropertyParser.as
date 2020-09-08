package com.splunk.properties
{

	import com.splunk.controls.ValueTip;

	public class ValueTipPropertyParser extends LayoutSpritePropertyParser
	{

		// Private Static Properties

		private static var _instance:ValueTipPropertyParser;

		// Public Static Methods

		public static function getInstance() : ValueTipPropertyParser
		{
			var instance:ValueTipPropertyParser = ValueTipPropertyParser._instance;
			if (!instance)
				instance = ValueTipPropertyParser._instance = new ValueTipPropertyParser();
			return instance;
		}

		// Protected Properties

		protected var textBlockStylePropertyParser:TextBlockStylePropertyParser;

		// Constructor

		public function ValueTipPropertyParser()
		{
			this.textBlockStylePropertyParser = TextBlockStylePropertyParser.getInstance();
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			if (ParseUtils.trimWhiteSpace(str) == "valueTip")
				return new ValueTip();
			return null;
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			if (value is ValueTip)
				return "valueTip";
			return null;
		}

		public override function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
			super.registerProperties(propertyManager, value);

			if (value is ValueTip)
			{
				propertyManager.registerProperty("valueStyle", this.textBlockStylePropertyParser, this.getProperty, this.setProperty);
			}
		}

	}

}
