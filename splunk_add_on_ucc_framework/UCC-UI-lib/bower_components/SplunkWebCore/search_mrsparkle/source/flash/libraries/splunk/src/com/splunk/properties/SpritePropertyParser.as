package com.splunk.properties
{

	import flash.display.Sprite;

	public class SpritePropertyParser extends AbstractPropertyParser
	{

		// Private Static Properties

		private static var _instance:SpritePropertyParser;

		// Public Static Methods

		public static function getInstance() : SpritePropertyParser
		{
			var instance:SpritePropertyParser = SpritePropertyParser._instance;
			if (!instance)
				instance = SpritePropertyParser._instance = new SpritePropertyParser();
			return instance;
		}

		// Protected Properties

		protected var numberPropertyParser:NumberPropertyParser;
		protected var booleanPropertyParser:BooleanPropertyParser;
		protected var stringPropertyParser:StringPropertyParser;
		protected var filterArrayPropertyParser:ArrayPropertyParser;

		// Constructor

		public function SpritePropertyParser()
		{
			this.numberPropertyParser = NumberPropertyParser.getInstance();
			this.booleanPropertyParser = BooleanPropertyParser.getInstance();
			this.stringPropertyParser = StringPropertyParser.getInstance();
			this.filterArrayPropertyParser = ArrayPropertyParser.getInstance(FilterPropertyParser.getInstance());
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			if (ParseUtils.trimWhiteSpace(str) == "sprite")
				return new Sprite();
			return null;
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			if (value is Sprite)
				return "sprite";
			return null;
		}

		public override function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
			if (value is Sprite)
			{
				propertyManager.registerProperty("x", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("y", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("width", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("height", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("scaleX", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("scaleY", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("rotation", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("alpha", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("visible", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("blendMode", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("filters", this.filterArrayPropertyParser, this.getProperty, this.setProperty);
			}
		}

	}

}
