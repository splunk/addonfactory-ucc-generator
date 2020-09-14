package com.splunk.charting.properties
{

	import com.splunk.charting.labels.AbstractAxisLabels;
	import com.splunk.charting.labels.CategoryAxisLabels;
	import com.splunk.charting.labels.NumericAxisLabels;
	import com.splunk.charting.labels.TimeAxisLabels;
	import com.splunk.properties.BrushPropertyParser;
	import com.splunk.properties.DurationPropertyParser;
	import com.splunk.properties.LayoutSpritePropertyParser;
	import com.splunk.properties.ParseUtils;
	import com.splunk.properties.PropertyManager;
	import com.splunk.properties.TextBlockStylePropertyParser;
	import com.splunk.properties.TimeZonePropertyParser;

	public class AxisLabelsPropertyParser extends LayoutSpritePropertyParser
	{

		// Private Static Properties

		private static var _instance:AxisLabelsPropertyParser;

		// Public Static Methods

		public static function getInstance() : AxisLabelsPropertyParser
		{
			var instance:AxisLabelsPropertyParser = AxisLabelsPropertyParser._instance;
			if (!instance)
				instance = AxisLabelsPropertyParser._instance = new AxisLabelsPropertyParser();
			return instance;
		}

		// Protected Properties

		protected var axisPropertyParser:AxisPropertyParser;
		protected var brushPropertyParser:BrushPropertyParser;
		protected var textBlockStylePropertyParser:TextBlockStylePropertyParser;
		protected var durationPropertyParser:DurationPropertyParser;
		protected var timeZonePropertyParser:TimeZonePropertyParser;

		// Constructor

		public function AxisLabelsPropertyParser()
		{
			this.axisPropertyParser = AxisPropertyParser.getInstance();
			this.brushPropertyParser = BrushPropertyParser.getInstance();
			this.textBlockStylePropertyParser = TextBlockStylePropertyParser.getInstance();
			this.durationPropertyParser = DurationPropertyParser.getInstance();
			this.timeZonePropertyParser = TimeZonePropertyParser.getInstance();
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			switch (ParseUtils.trimWhiteSpace(str))
			{
				case "category":
					return new CategoryAxisLabels();
				case "numeric":
					return new NumericAxisLabels();
				case "time":
					return new TimeAxisLabels();
				default:
					return null;
			}
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			if (value is CategoryAxisLabels)
				return "category";
			if (value is NumericAxisLabels)
				return "numeric";
			if (value is TimeAxisLabels)
				return "time";
			return null;
		}

		public override function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
			super.registerProperties(propertyManager, value);

			if (value is AbstractAxisLabels)
			{
				propertyManager.registerProperty("placement", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("axis", this.axisPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("axisBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("axisVisibility", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("majorTickBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("majorTickSize", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("majorTickVisibility", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("minorTickBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("minorTickSize", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("minorTickVisibility", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("majorLabelStyle", this.textBlockStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("majorLabelAlignment", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("majorLabelVisibility", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("minorLabelStyle", this.textBlockStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("minorLabelAlignment", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("minorLabelVisibility", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("extendsAxisRange", this.booleanPropertyParser, this.getProperty, this.setProperty);
			}

			if (value is CategoryAxisLabels)
			{
				// no properties
			}
			else if (value is NumericAxisLabels)
			{
				propertyManager.registerProperty("majorUnit", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("minorUnit", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("actualMajorUnit", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("actualMinorUnit", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("scaleMajorUnit", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("scaleMinorUnit", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("integerUnits", this.booleanPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is TimeAxisLabels)
			{
				propertyManager.registerProperty("majorUnit", this.durationPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("minorUnit", this.durationPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("actualMajorUnit", this.durationPropertyParser, this.getProperty);
				propertyManager.registerProperty("actualMinorUnit", this.durationPropertyParser, this.getProperty);
				propertyManager.registerProperty("timeZone", this.timeZonePropertyParser, this.getProperty, this.setProperty);
			}
		}

	}

}
