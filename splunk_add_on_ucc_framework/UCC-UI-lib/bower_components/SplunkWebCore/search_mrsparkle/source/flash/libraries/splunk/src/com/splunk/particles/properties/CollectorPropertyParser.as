package com.splunk.particles.properties
{

	import com.splunk.particles.collectors.Collector;
	import com.splunk.properties.AbstractPropertyParser;
	import com.splunk.properties.ArrayPropertyParser;
	import com.splunk.properties.NumberPropertyParser;
	import com.splunk.properties.ParseUtils;
	import com.splunk.properties.PropertyManager;

	public class CollectorPropertyParser extends AbstractPropertyParser
	{

		// Private Static Properties

		private static var _instance:CollectorPropertyParser;

		// Public Static Methods

		public static function getInstance() : CollectorPropertyParser
		{
			var instance:CollectorPropertyParser = CollectorPropertyParser._instance;
			if (!instance)
				instance = CollectorPropertyParser._instance = new CollectorPropertyParser();
			return instance;
		}

		// Protected Properties

		protected var numberPropertyParser:NumberPropertyParser;
		protected var filterPropertyParser:FilterPropertyParser;
		protected var actionArrayPropertyParser:ArrayPropertyParser;
		protected var emitterArrayPropertyParser:ArrayPropertyParser;

		// Constructor

		public function CollectorPropertyParser()
		{
			this.numberPropertyParser = NumberPropertyParser.getInstance();
			this.filterPropertyParser = FilterPropertyParser.getInstance();
			this.actionArrayPropertyParser = ArrayPropertyParser.getInstance(ActionPropertyParser.getInstance());
			this.emitterArrayPropertyParser = ArrayPropertyParser.getInstance(EmitterPropertyParser.getInstance());
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			switch (ParseUtils.trimWhiteSpace(str))
			{
				case "collector":
					return new Collector();
				default:
					return null;
			}
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			if (value is Collector)
				return "collector";
			return null;
		}

		public override function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
			if (value is Collector)
			{
				propertyManager.registerProperty("filter", this.filterPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("actions", this.actionArrayPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("sources", this.emitterArrayPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("priority", this.numberPropertyParser, this.getProperty, this.setProperty);
			}
		}

	}

}
