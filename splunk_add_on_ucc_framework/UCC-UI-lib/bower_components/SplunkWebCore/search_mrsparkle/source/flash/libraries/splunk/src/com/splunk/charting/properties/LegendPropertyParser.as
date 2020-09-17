package com.splunk.charting.properties
{

	import com.splunk.charting.legend.AbstractLegend;
	import com.splunk.charting.legend.ExternalLegend;
	import com.splunk.charting.legend.ILegend;
	import com.splunk.charting.legend.Legend;
	import com.splunk.properties.ArrayPropertyParser;
	import com.splunk.properties.BrushPalettePropertyParser;
	import com.splunk.properties.LayoutSpritePropertyParser;
	import com.splunk.properties.LayoutSpriteStylePropertyParser;
	import com.splunk.properties.ParseUtils;
	import com.splunk.properties.PropertyManager;
	import com.splunk.properties.TextBlockStylePropertyParser;

	public class LegendPropertyParser extends LayoutSpritePropertyParser
	{

		// Private Static Properties

		private static var _instance:LegendPropertyParser;

		// Public Static Methods

		public static function getInstance() : LegendPropertyParser
		{
			var instance:LegendPropertyParser = LegendPropertyParser._instance;
			if (!instance)
				instance = LegendPropertyParser._instance = new LegendPropertyParser();
			return instance;
		}

		// Protected Properties

		protected var layoutSpriteStylePropertyParser:LayoutSpriteStylePropertyParser;
		protected var textBlockStylePropertyParser:TextBlockStylePropertyParser;
		protected var brushPalettePropertyParser:BrushPalettePropertyParser;
		protected var stringArrayPropertyParser:ArrayPropertyParser;

		// Constructor

		public function LegendPropertyParser()
		{
			this.layoutSpriteStylePropertyParser = LayoutSpriteStylePropertyParser.getInstance();
			this.textBlockStylePropertyParser = TextBlockStylePropertyParser.getInstance();
			this.brushPalettePropertyParser = BrushPalettePropertyParser.getInstance();
			this.stringArrayPropertyParser = ArrayPropertyParser.getInstance(this.stringPropertyParser);
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			switch (ParseUtils.trimWhiteSpace(str))
			{
				case "legend":
					return new Legend();
				case "externalLegend":
					return new ExternalLegend();
				default:
					return null;
			}
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			if (value is Legend)
				return "legend";
			if (value is ExternalLegend)
				return "externalLegend";
			return null;
		}

		public override function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
			super.registerProperties(propertyManager, value);

			if (value is ILegend)
			{
				propertyManager.registerProperty("numLabels", this.numberPropertyParser, this.getProperty);
			}

			if (value is AbstractLegend)
			{
				propertyManager.registerProperty("labels", this.stringArrayPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("defaultSwatchBrushPalette", this.brushPalettePropertyParser, this.getProperty, this.setProperty);
			}

			if (value is Legend)
			{
				propertyManager.registerProperty("masterLegend", this, this.getProperty, this.setProperty);
				propertyManager.registerProperty("placement", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("orientation", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("swatchPlacement", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("swatchStyle", this.layoutSpriteStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("labelStyle", this.textBlockStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("itemStyle", this.layoutSpriteStylePropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is ExternalLegend)
			{
				propertyManager.registerProperty("isConnected", this.booleanPropertyParser, this.getProperty);
			}
		}

	}

}
