package com.splunk.properties
{

	import com.splunk.palettes.color.BrightnessColorPalette;
	import com.splunk.palettes.color.FieldColorPalette;
	import com.splunk.palettes.color.ListColorPalette;
	import com.splunk.palettes.color.RandomColorPalette;

	public class ColorPalettePropertyParser extends AbstractPropertyParser
	{

		// Private Static Properties

		private static var _instance:ColorPalettePropertyParser;

		// Public Static Methods

		public static function getInstance() : ColorPalettePropertyParser
		{
			var instance:ColorPalettePropertyParser = ColorPalettePropertyParser._instance;
			if (!instance)
				instance = ColorPalettePropertyParser._instance = new ColorPalettePropertyParser();
			return instance;
		}

		// Protected Properties

		protected var numberPropertyParser:NumberPropertyParser;
		protected var booleanPropertyParser:BooleanPropertyParser;
		protected var stringPropertyParser:StringPropertyParser;
		protected var numberArrayPropertyParser:ArrayPropertyParser;
		protected var numberMapPropertyParser:MapPropertyParser;

		// Constructor

		public function ColorPalettePropertyParser()
		{
			this.numberPropertyParser = NumberPropertyParser.getInstance();
			this.booleanPropertyParser = BooleanPropertyParser.getInstance();
			this.stringPropertyParser = StringPropertyParser.getInstance();
			this.numberArrayPropertyParser = ArrayPropertyParser.getInstance(this.numberPropertyParser);
			this.numberMapPropertyParser = MapPropertyParser.getInstance(this.numberPropertyParser);
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			switch (ParseUtils.trimWhiteSpace(str))
			{
				case "brightness":
					return new BrightnessColorPalette();
				case "field":
					return new FieldColorPalette();
				case "list":
					return new ListColorPalette();
				case "random":
					return new RandomColorPalette();
				default:
					return null;
			}
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			if (value is BrightnessColorPalette)
				return "brightness";
			if (value is FieldColorPalette)
				return "field";
			if (value is ListColorPalette)
				return "list";
			if (value is RandomColorPalette)
				return "random";
			return null;
		}

		public override function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
			if (value is BrightnessColorPalette)
			{
				propertyManager.registerProperty("colorPalette", this, this.getProperty, this.setProperty);
				propertyManager.registerProperty("brightness", this.numberPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is FieldColorPalette)
			{
				propertyManager.registerProperty("fieldColors", this.numberMapPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("defaultColorPalette", this, this.getProperty, this.setProperty);
			}
			else if (value is ListColorPalette)
			{
				propertyManager.registerProperty("colors", this.numberArrayPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("interpolate", this.booleanPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is RandomColorPalette)
			{
				propertyManager.registerProperty("minimumColor", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("maximumColor", this.numberPropertyParser, this.getProperty, this.setProperty);
			}
		}

	}

}
