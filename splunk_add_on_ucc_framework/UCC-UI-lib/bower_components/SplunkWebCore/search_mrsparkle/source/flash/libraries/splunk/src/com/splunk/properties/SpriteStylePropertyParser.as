package com.splunk.properties
{

	import com.splunk.utils.Style;

	public class SpriteStylePropertyParser extends StylePropertyParser
	{

		// Private Static Properties

		private static var _instance:SpriteStylePropertyParser;

		// Public Static Methods

		public static function getInstance() : SpriteStylePropertyParser
		{
			var instance:SpriteStylePropertyParser = SpriteStylePropertyParser._instance;
			if (!instance)
				instance = SpriteStylePropertyParser._instance = new SpriteStylePropertyParser();
			return instance;
		}

		// Protected Properties

		protected var numberPropertyParser:NumberPropertyParser;
		protected var booleanPropertyParser:BooleanPropertyParser;
		protected var stringPropertyParser:StringPropertyParser;
		protected var filterArrayPropertyParser:ArrayPropertyParser;

		// Constructor

		public function SpriteStylePropertyParser()
		{
			this.numberPropertyParser = NumberPropertyParser.getInstance();
			this.booleanPropertyParser = BooleanPropertyParser.getInstance();
			this.stringPropertyParser = StringPropertyParser.getInstance();
			this.filterArrayPropertyParser = ArrayPropertyParser.getInstance(FilterPropertyParser.getInstance());
		}

		// Public Methods

		public override function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
			super.registerProperties(propertyManager, value);

			if (value is Style)
			{
				propertyManager.registerProperty("x", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("y", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("scaleX", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("scaleY", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("rotation", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("visible", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("width", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("height", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("alpha", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("blendMode", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("filters", this.filterArrayPropertyParser, this.getProperty, this.setProperty);
			}
		}

	}

}
