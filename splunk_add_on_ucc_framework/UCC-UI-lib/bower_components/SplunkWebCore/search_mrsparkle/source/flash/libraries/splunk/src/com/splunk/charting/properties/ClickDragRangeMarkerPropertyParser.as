package com.splunk.charting.properties
{

	import com.splunk.charting.controls.ClickDragRangeMarker;
	import com.splunk.properties.BrushPropertyParser;
	import com.splunk.properties.LayoutSpritePropertyParser;
	import com.splunk.properties.LayoutSpriteStylePropertyParser;
	import com.splunk.properties.ParseUtils;
	import com.splunk.properties.PropertyManager;
	import com.splunk.properties.SpriteStylePropertyParser;
	import com.splunk.properties.TextBlockStylePropertyParser;

	public class ClickDragRangeMarkerPropertyParser extends LayoutSpritePropertyParser
	{

		// Private Static Properties

		private static var _instance:ClickDragRangeMarkerPropertyParser;

		// Public Static Methods

		public static function getInstance() : ClickDragRangeMarkerPropertyParser
		{
			var instance:ClickDragRangeMarkerPropertyParser = ClickDragRangeMarkerPropertyParser._instance;
			if (!instance)
				instance = ClickDragRangeMarkerPropertyParser._instance = new ClickDragRangeMarkerPropertyParser();
			return instance;
		}

		// Protected Properties

		protected var brushPropertyParser:BrushPropertyParser;
		protected var spriteStylePropertyParser:SpriteStylePropertyParser;
		protected var layoutSpriteStylePropertyParser:LayoutSpriteStylePropertyParser;
		protected var textBlockStylePropertyParser:TextBlockStylePropertyParser;

		// Constructor

		public function ClickDragRangeMarkerPropertyParser()
		{
			this.brushPropertyParser = BrushPropertyParser.getInstance();
			this.spriteStylePropertyParser = SpriteStylePropertyParser.getInstance();
			this.layoutSpriteStylePropertyParser = LayoutSpriteStylePropertyParser.getInstance();
			this.textBlockStylePropertyParser = TextBlockStylePropertyParser.getInstance();
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			if (ParseUtils.trimWhiteSpace(str) == "clickDragRangeMarker")
				return new ClickDragRangeMarker();
			return null;
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			if (value is ClickDragRangeMarker)
				return "clickDragRangeMarker";
			return null;
		}

		public override function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
			super.registerProperties(propertyManager, value);

			if (value is ClickDragRangeMarker)
			{
				propertyManager.registerProperty("minimumFillBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("minimumLineBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("minimumValueStyle", this.textBlockStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("maximumFillBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("maximumLineBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("maximumValueStyle", this.textBlockStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("rangeFillBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("rangeValueStyle", this.textBlockStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("backgroundBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("backgroundStyle", this.spriteStylePropertyParser, this.getProperty, this.setProperty);
			}
		}

	}

}
