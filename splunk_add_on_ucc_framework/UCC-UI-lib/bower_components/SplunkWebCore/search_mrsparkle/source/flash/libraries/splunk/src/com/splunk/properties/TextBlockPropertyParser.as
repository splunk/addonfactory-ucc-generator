package com.splunk.properties
{

	import com.jasongatt.controls.TextBlock;

	public class TextBlockPropertyParser extends LayoutSpritePropertyParser
	{

		// Private Static Properties

		private static var _instance:TextBlockPropertyParser;

		// Public Static Methods

		public static function getInstance() : TextBlockPropertyParser
		{
			var instance:TextBlockPropertyParser = TextBlockPropertyParser._instance;
			if (!instance)
				instance = TextBlockPropertyParser._instance = new TextBlockPropertyParser();
			return instance;
		}

		// Protected Properties

		protected var textFormatPropertyParser:TextFormatPropertyParser;

		// Constructor

		public function TextBlockPropertyParser()
		{
			this.textFormatPropertyParser = TextFormatPropertyParser.getInstance();
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			if (ParseUtils.trimWhiteSpace(str) == "textBlock")
				return new TextBlock();
			return null;
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			if (value is TextBlock)
				return "textBlock";
			return null;
		}

		public override function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
			super.registerProperties(propertyManager, value);

			if (value is TextBlock)
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
				propertyManager.registerProperty("bottomScrollV", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("caretIndex", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("condenseWhite", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("defaultTextFormat", this.textFormatPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("displayAsPassword", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("embedFonts", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("gridFitType", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("htmlText", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("length", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("maxChars", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("maxScrollH", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("maxScrollV", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("mouseWheelEnabled", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("numLines", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("restrict", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("scrollH", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("scrollV", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("selectable", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("selectionBeginIndex", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("selectionEndIndex", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("sharpness", this.numberPropertyParser, this.getProperty, this.setProperty);
				//propertyManager.registerProperty("styleSheet", this.styleSheetPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("text", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("textColor", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("textHeight", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("textWidth", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("thickness", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("type", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("useRichTextClipboard", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("wordWrap", this.booleanPropertyParser, this.getProperty, this.setProperty);
			}
		}

	}

}
