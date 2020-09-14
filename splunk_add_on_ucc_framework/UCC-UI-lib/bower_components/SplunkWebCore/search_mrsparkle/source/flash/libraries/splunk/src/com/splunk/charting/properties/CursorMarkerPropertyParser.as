package com.splunk.charting.properties
{

	import com.splunk.charting.controls.CursorMarker;
	import com.splunk.properties.BrushPropertyParser;
	import com.splunk.properties.LayoutSpritePropertyParser;
	import com.splunk.properties.ParseUtils;
	import com.splunk.properties.PropertyManager;
	import com.splunk.properties.SpriteStylePropertyParser;
	import com.splunk.properties.TextBlockStylePropertyParser;

	public class CursorMarkerPropertyParser extends LayoutSpritePropertyParser
	{

		// Private Static Properties

		private static var _instance:CursorMarkerPropertyParser;

		// Public Static Methods

		public static function getInstance() : CursorMarkerPropertyParser
		{
			var instance:CursorMarkerPropertyParser = CursorMarkerPropertyParser._instance;
			if (!instance)
				instance = CursorMarkerPropertyParser._instance = new CursorMarkerPropertyParser();
			return instance;
		}

		// Protected Properties

		protected var brushPropertyParser:BrushPropertyParser;
		protected var spriteStylePropertyParser:SpriteStylePropertyParser;
		protected var textBlockStylePropertyParser:TextBlockStylePropertyParser;

		// Constructor

		public function CursorMarkerPropertyParser()
		{
			this.brushPropertyParser = BrushPropertyParser.getInstance();
			this.spriteStylePropertyParser = SpriteStylePropertyParser.getInstance();
			this.textBlockStylePropertyParser = TextBlockStylePropertyParser.getInstance();
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			if (ParseUtils.trimWhiteSpace(str) == "cursorMarker")
				return new CursorMarker();
			return null;
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			if (value is CursorMarker)
				return "cursorMarker";
			return null;
		}

		public override function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
			super.registerProperties(propertyManager, value);

			if (value is CursorMarker)
			{
				propertyManager.registerProperty("fillBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("lineBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("valueStyle", this.textBlockStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("backgroundBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("backgroundStyle", this.spriteStylePropertyParser, this.getProperty, this.setProperty);
			}
		}

	}

}
