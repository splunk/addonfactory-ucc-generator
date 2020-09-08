package com.splunk.charting.properties
{

	import com.splunk.charting.axes.AbstractAxis;
	import com.splunk.charting.axes.CategoryAxis;
	import com.splunk.charting.axes.NumericAxis;
	import com.splunk.charting.axes.IAxis;
	import com.splunk.charting.axes.TimeAxis;
	import com.splunk.properties.AbstractPropertyParser;
	import com.splunk.properties.ArrayPropertyParser;
	import com.splunk.properties.BooleanPropertyParser;
	import com.splunk.properties.ComparatorPropertyParser;
	import com.splunk.properties.DateTimePropertyParser;
	import com.splunk.properties.NumberPropertyParser;
	import com.splunk.properties.ParseUtils;
	import com.splunk.properties.PropertyManager;
	import com.splunk.properties.StringPropertyParser;

	public class AxisPropertyParser extends AbstractPropertyParser
	{

		// Private Static Properties

		private static var _instance:AxisPropertyParser;

		// Public Static Methods

		public static function getInstance() : AxisPropertyParser
		{
			var instance:AxisPropertyParser = AxisPropertyParser._instance;
			if (!instance)
				instance = AxisPropertyParser._instance = new AxisPropertyParser();
			return instance;
		}

		// Protected Properties

		protected var numberPropertyParser:NumberPropertyParser;
		protected var booleanPropertyParser:BooleanPropertyParser;
		protected var stringPropertyParser:StringPropertyParser;
		protected var stringArrayPropertyParser:ArrayPropertyParser;
		protected var scalePropertyParser:ScalePropertyParser;
		protected var dateTimePropertyParser:DateTimePropertyParser;
		protected var comparatorPropertyParser:ComparatorPropertyParser;

		// Constructor

		public function AxisPropertyParser()
		{
			this.numberPropertyParser = NumberPropertyParser.getInstance();
			this.booleanPropertyParser = BooleanPropertyParser.getInstance();
			this.stringPropertyParser = StringPropertyParser.getInstance();
			this.stringArrayPropertyParser = ArrayPropertyParser.getInstance(this.stringPropertyParser);
			this.scalePropertyParser = ScalePropertyParser.getInstance();
			this.dateTimePropertyParser = DateTimePropertyParser.getInstance();
			this.comparatorPropertyParser = ComparatorPropertyParser.getInstance();
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			switch (ParseUtils.trimWhiteSpace(str))
			{
				case "category":
					return new CategoryAxis();
				case "numeric":
					return new NumericAxis();
				case "time":
					return new TimeAxis();
				default:
					return null;
			}
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			if (value is CategoryAxis)
				return "category";
			if (value is NumericAxis)
				return "numeric";
			if (value is TimeAxis)
				return "time";
			return null;
		}

		public override function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
			if (value is IAxis)
			{
				propertyManager.registerProperty("minimum", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("maximum", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("containedMinimum", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("containedMaximum", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("extendedMinimum", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("extendedMaximum", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("actualMinimum", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("actualMaximum", this.numberPropertyParser, this.getProperty);
			}

			if (value is AbstractAxis)
			{
				//propertyManager.registerProperty("distortion", this.distortionPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("reverse", this.booleanPropertyParser, this.getProperty, this.setProperty);
			}

			if (value is CategoryAxis)
			{
				propertyManager.registerProperty("categories", this.stringArrayPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("comparator", this.comparatorPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("containedCategories", this.stringArrayPropertyParser, this.getProperty);
				propertyManager.registerProperty("actualCategories", this.stringArrayPropertyParser, this.getProperty);
			}
			else if (value is NumericAxis)
			{
				propertyManager.registerProperty("minimumNumber", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("maximumNumber", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("scale", this.scalePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("includeZero", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("containedMinimumNumber", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("containedMaximumNumber", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("extendedMinimumNumber", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("extendedMaximumNumber", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("actualMinimumNumber", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("actualMaximumNumber", this.numberPropertyParser, this.getProperty);
			}
			else if (value is TimeAxis)
			{
				propertyManager.registerProperty("minimumTime", this.dateTimePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("maximumTime", this.dateTimePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("containedMinimumTime", this.dateTimePropertyParser, this.getProperty);
				propertyManager.registerProperty("containedMaximumTime", this.dateTimePropertyParser, this.getProperty);
				propertyManager.registerProperty("extendedMinimumTime", this.dateTimePropertyParser, this.getProperty);
				propertyManager.registerProperty("extendedMaximumTime", this.dateTimePropertyParser, this.getProperty);
				propertyManager.registerProperty("actualMinimumTime", this.dateTimePropertyParser, this.getProperty);
				propertyManager.registerProperty("actualMaximumTime", this.dateTimePropertyParser, this.getProperty);
			}
		}

	}

}
