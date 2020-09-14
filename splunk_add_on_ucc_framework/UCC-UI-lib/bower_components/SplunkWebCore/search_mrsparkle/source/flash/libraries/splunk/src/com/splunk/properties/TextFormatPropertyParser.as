package com.splunk.properties
{

	import com.jasongatt.controls.ObservableTextFormat;
	import flash.text.TextFormat;

	public class TextFormatPropertyParser extends AbstractPropertyParser
	{

		// Private Static Properties

		private static var _instance:TextFormatPropertyParser;

		// Public Static Methods

		public static function getInstance() : TextFormatPropertyParser
		{
			var instance:TextFormatPropertyParser = TextFormatPropertyParser._instance;
			if (!instance)
				instance = TextFormatPropertyParser._instance = new TextFormatPropertyParser();
			return instance;
		}

		// Protected Properties

		protected var numberPropertyParser:NumberPropertyParser;
		protected var booleanPropertyParser:BooleanPropertyParser;
		protected var stringPropertyParser:StringPropertyParser;
		protected var propertyParsers:Object;

		// Constructor

		public function TextFormatPropertyParser()
		{
			this.numberPropertyParser = NumberPropertyParser.getInstance();
			this.booleanPropertyParser = BooleanPropertyParser.getInstance();
			this.stringPropertyParser = StringPropertyParser.getInstance();

			this.propertyParsers = new Object();
			this.propertyParsers.align = this.stringPropertyParser;
			this.propertyParsers.blockIndent = this.numberPropertyParser;
			this.propertyParsers.bold = this.booleanPropertyParser;
			this.propertyParsers.bullet = this.booleanPropertyParser;
			this.propertyParsers.color = this.numberPropertyParser;
			this.propertyParsers.font = this.stringPropertyParser;
			this.propertyParsers.indent = this.numberPropertyParser;
			this.propertyParsers.italic = this.booleanPropertyParser;
			this.propertyParsers.kerning = this.booleanPropertyParser;
			this.propertyParsers.leading = this.numberPropertyParser;
			this.propertyParsers.leftMargin = this.numberPropertyParser;
			this.propertyParsers.letterSpacing = this.numberPropertyParser;
			this.propertyParsers.rightMargin = this.numberPropertyParser;
			this.propertyParsers.size = this.numberPropertyParser;
			this.propertyParsers.underline = this.booleanPropertyParser;
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			str = ParseUtils.trimWhiteSpace(str);
			if (!str)
				return null;

			if (str == "textFormat")
				return new ObservableTextFormat();

			var formatProperties:Object = ParseUtils.prepareObject(str);
			if (!formatProperties)
				return null;

			var textFormat:TextFormat = new TextFormat();

			var propertyParsers:Object = this.propertyParsers;
			var propertyParser:IPropertyParser;
			var formatProperty:String;
			for (formatProperty in formatProperties)
			{
				propertyParser = propertyParsers[formatProperty];
				if (propertyParser)
					textFormat[formatProperty] = propertyManager.parseValue(formatProperties[formatProperty], propertyParser);
			}

			return textFormat;
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			if (value is ObservableTextFormat)
				return "textFormat";

			if (!(value is TextFormat))
				return null;

			var str:String = "";

			var propertyParsers:Object = this.propertyParsers;
			var propertyParser:IPropertyParser;
			var propertyName:String;
			var propertyValue:*;
			for (propertyName in propertyParsers)
			{
				propertyParser = propertyParsers[propertyName];
				propertyValue = value[propertyName];
				if (propertyValue != null)
				{
					if (str)
						str += ",";
					str += ParseUtils.escapeString(propertyName) + ":";
					if (propertyParser is StringPropertyParser)
						str += ParseUtils.escapeString(propertyParser.valueToString(propertyManager, propertyValue));
					else
						str += propertyParser.valueToString(propertyManager, propertyValue);
				}
			}

			return "{" + str + "}";
		}

		public override function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
			if (value is ObservableTextFormat)
			{
				propertyManager.registerProperty("align", this.propertyParsers.align, this.getProperty, this.setProperty);
				propertyManager.registerProperty("blockIndent", this.propertyParsers.blockIndent, this.getProperty, this.setProperty);
				propertyManager.registerProperty("bold", this.propertyParsers.bold, this.getProperty, this.setProperty);
				propertyManager.registerProperty("bullet", this.propertyParsers.bullet, this.getProperty, this.setProperty);
				propertyManager.registerProperty("color", this.propertyParsers.color, this.getProperty, this.setProperty);
				propertyManager.registerProperty("font", this.propertyParsers.font, this.getProperty, this.setProperty);
				propertyManager.registerProperty("indent", this.propertyParsers.indent, this.getProperty, this.setProperty);
				propertyManager.registerProperty("italic", this.propertyParsers.italic, this.getProperty, this.setProperty);
				propertyManager.registerProperty("kerning", this.propertyParsers.kerning, this.getProperty, this.setProperty);
				propertyManager.registerProperty("leading", this.propertyParsers.leading, this.getProperty, this.setProperty);
				propertyManager.registerProperty("leftMargin", this.propertyParsers.leftMargin, this.getProperty, this.setProperty);
				propertyManager.registerProperty("letterSpacing", this.propertyParsers.letterSpacing, this.getProperty, this.setProperty);
				propertyManager.registerProperty("rightMargin", this.propertyParsers.rightMargin, this.getProperty, this.setProperty);
				propertyManager.registerProperty("size", this.propertyParsers.size, this.getProperty, this.setProperty);
				propertyManager.registerProperty("underline", this.propertyParsers.underline, this.getProperty, this.setProperty);
			}
			else if (value is TextFormat)
			{
				propertyManager.registerProperty("align", this.propertyParsers.align, this.getProperty);
				propertyManager.registerProperty("blockIndent", this.propertyParsers.blockIndent, this.getProperty);
				propertyManager.registerProperty("bold", this.propertyParsers.bold, this.getProperty);
				propertyManager.registerProperty("bullet", this.propertyParsers.bullet, this.getProperty);
				propertyManager.registerProperty("color", this.propertyParsers.color, this.getProperty);
				propertyManager.registerProperty("font", this.propertyParsers.font, this.getProperty);
				propertyManager.registerProperty("indent", this.propertyParsers.indent, this.getProperty);
				propertyManager.registerProperty("italic", this.propertyParsers.italic, this.getProperty);
				propertyManager.registerProperty("kerning", this.propertyParsers.kerning, this.getProperty);
				propertyManager.registerProperty("leading", this.propertyParsers.leading, this.getProperty);
				propertyManager.registerProperty("leftMargin", this.propertyParsers.leftMargin, this.getProperty);
				propertyManager.registerProperty("letterSpacing", this.propertyParsers.letterSpacing, this.getProperty);
				propertyManager.registerProperty("rightMargin", this.propertyParsers.rightMargin, this.getProperty);
				propertyManager.registerProperty("size", this.propertyParsers.size, this.getProperty);
				propertyManager.registerProperty("underline", this.propertyParsers.underline, this.getProperty);
			}
		}

	}

}
