package com.splunk.charting.properties
{

	import com.splunk.charting.labels.GridLines;
	import com.splunk.properties.BrushPropertyParser;
	import com.splunk.properties.LayoutSpritePropertyParser;
	import com.splunk.properties.ParseUtils;
	import com.splunk.properties.PropertyManager;

	public class GridLinesPropertyParser extends LayoutSpritePropertyParser
	{

		// Private Static Properties

		private static var _instance:GridLinesPropertyParser;

		// Public Static Methods

		public static function getInstance() : GridLinesPropertyParser
		{
			var instance:GridLinesPropertyParser = GridLinesPropertyParser._instance;
			if (!instance)
				instance = GridLinesPropertyParser._instance = new GridLinesPropertyParser();
			return instance;
		}

		// Protected Properties

		protected var axisLabelsPropertyParser:AxisLabelsPropertyParser;
		protected var brushPropertyParser:BrushPropertyParser;

		// Constructor

		public function GridLinesPropertyParser()
		{
			this.axisLabelsPropertyParser = AxisLabelsPropertyParser.getInstance();
			this.brushPropertyParser = BrushPropertyParser.getInstance();
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			if (ParseUtils.trimWhiteSpace(str) == "gridLines")
				return new GridLines();
			return null;
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			if (value is GridLines)
				return "gridLines";
			return null;
		}

		public override function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
			super.registerProperties(propertyManager, value);

			if (value is GridLines)
			{
				propertyManager.registerProperty("axisLabels", this.axisLabelsPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("majorLineBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("minorLineBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("showMajorLines", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("showMinorLines", this.booleanPropertyParser, this.getProperty, this.setProperty);
			}
		}

	}

}
