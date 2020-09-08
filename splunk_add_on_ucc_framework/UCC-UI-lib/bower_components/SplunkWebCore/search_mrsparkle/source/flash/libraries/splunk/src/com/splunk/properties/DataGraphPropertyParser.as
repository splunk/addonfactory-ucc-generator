package com.splunk.properties
{

	import com.splunk.data.IDataGraph;
	import com.splunk.data.ResultsDataGraph;

	public class DataGraphPropertyParser extends AbstractPropertyParser
	{

		// Private Static Properties

		private static var _instance:DataGraphPropertyParser;

		// Public Static Methods

		public static function getInstance() : DataGraphPropertyParser
		{
			var instance:DataGraphPropertyParser = DataGraphPropertyParser._instance;
			if (!instance)
				instance = DataGraphPropertyParser._instance = new DataGraphPropertyParser();
			return instance;
		}

		// Protected Properties

		protected var numberPropertyParser:NumberPropertyParser;
		protected var booleanPropertyParser:BooleanPropertyParser;
		protected var stringPropertyParser:StringPropertyParser;

		// Constructor

		public function DataGraphPropertyParser()
		{
			this.numberPropertyParser = NumberPropertyParser.getInstance();
			this.booleanPropertyParser = BooleanPropertyParser.getInstance();
			this.stringPropertyParser = StringPropertyParser.getInstance();
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			switch (ParseUtils.trimWhiteSpace(str))
			{
				case "results":
					return new ResultsDataGraph();
				default:
					return null;
			}
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			if (value is ResultsDataGraph)
				return "results";
			return null;
		}

		public override function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
			if (value is ResultsDataGraph)
			{
				propertyManager.registerProperty("hostPath", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("basePath", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("sessionKey", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("jobID", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("offset", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("count", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("search", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("preview", this.booleanPropertyParser, this.getProperty, this.setProperty);
			}
		}

	}

}
