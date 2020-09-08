package com.splunk.properties
{

	import com.splunk.data.IDataTable;
	import com.splunk.data.ResultsDataTable;
	import com.splunk.data.TimelineDataTable;
	import com.splunk.data.ViewDataTable;

	public class DataTablePropertyParser extends AbstractPropertyParser
	{

		// Private Static Properties

		private static var _instance:DataTablePropertyParser;

		// Public Static Methods

		public static function getInstance() : DataTablePropertyParser
		{
			var instance:DataTablePropertyParser = DataTablePropertyParser._instance;
			if (!instance)
				instance = DataTablePropertyParser._instance = new DataTablePropertyParser();
			return instance;
		}

		// Protected Properties

		protected var numberPropertyParser:NumberPropertyParser;
		protected var booleanPropertyParser:BooleanPropertyParser;
		protected var stringPropertyParser:StringPropertyParser;
		protected var stringArrayPropertyParser:ArrayPropertyParser;
		protected var sliceArrayPropertyParser:ArrayPropertyParser;

		// Constructor

		public function DataTablePropertyParser()
		{
			this.numberPropertyParser = NumberPropertyParser.getInstance();
			this.booleanPropertyParser = BooleanPropertyParser.getInstance();
			this.stringPropertyParser = StringPropertyParser.getInstance();
			this.stringArrayPropertyParser = ArrayPropertyParser.getInstance(this.stringPropertyParser);
			this.sliceArrayPropertyParser = ArrayPropertyParser.getInstance(SlicePropertyParser.getInstance());
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			switch (ParseUtils.trimWhiteSpace(str))
			{
				case "results":
					return new ResultsDataTable();
				case "timeline":
					return new TimelineDataTable();
				case "view":
					return new ViewDataTable();
				default:
					return null;
			}
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			if (value is ResultsDataTable)
				return "results";
			if (value is TimelineDataTable)
				return "timeline";
			if (value is ViewDataTable)
				return "view";
			return null;
		}

		public override function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
			if (value is IDataTable)
			{
				propertyManager.registerProperty("numRows", this.numberPropertyParser, this.getProperty);
				propertyManager.registerProperty("numColumns", this.numberPropertyParser, this.getProperty);
			}

			if (value is ResultsDataTable)
			{
				propertyManager.registerProperty("hostPath", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("basePath", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("sessionKey", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("jobID", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("offset", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("count", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("search", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("preview", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("fieldListMode", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("fieldShowList", this.stringArrayPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("fieldHideList", this.stringArrayPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is TimelineDataTable)
			{
				propertyManager.registerProperty("hostPath", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("basePath", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("sessionKey", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("jobID", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("offset", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("count", this.numberPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is ViewDataTable)
			{
				propertyManager.registerProperty("table", this, this.getProperty, this.setProperty);
				propertyManager.registerProperty("rows", this.sliceArrayPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("columns", this.sliceArrayPropertyParser, this.getProperty, this.setProperty);
			}
		}

	}

}
