package com.splunk.properties
{

	import com.splunk.utils.Style;

	public class TextBlockStylePropertyParser extends LayoutSpriteStylePropertyParser
	{

		// Private Static Properties

		private static var _instance:TextBlockStylePropertyParser;

		// Public Static Methods

		public static function getInstance() : TextBlockStylePropertyParser
		{
			var instance:TextBlockStylePropertyParser = TextBlockStylePropertyParser._instance;
			if (!instance)
				instance = TextBlockStylePropertyParser._instance = new TextBlockStylePropertyParser();
			return instance;
		}

		// Protected Properties

		protected var textFormatPropertyParser:TextFormatPropertyParser;

		// Constructor

		public function TextBlockStylePropertyParser()
		{
			this.textFormatPropertyParser = TextFormatPropertyParser.getInstance();
		}

		// Public Methods

		public override function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
			super.registerProperties(propertyManager, value);

			if (value is Style)
			{
				propertyManager.registerProperty("useBitmapRendering", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("useBitmapSmoothing", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("bitmapSmoothingSharpness", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("bitmapSmoothingQuality", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("overflowMode", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("alwaysShowSelection", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("antiAliasType", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("background", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("backgroundColor", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("border", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("borderColor", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("condenseWhite", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("defaultTextFormat", this.textFormatPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("displayAsPassword", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("embedFonts", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("gridFitType", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("htmlText", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("maxChars", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("mouseWheelEnabled", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("restrict", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("scrollH", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("scrollV", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("selectable", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("sharpness", this.numberPropertyParser, this.getProperty, this.setProperty);
				//propertyManager.registerProperty("styleSheet", this.styleSheetPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("text", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("textColor", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("thickness", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("type", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("useRichTextClipboard", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("wordWrap", this.booleanPropertyParser, this.getProperty, this.setProperty);
			}
		}

	}

}
