package com.splunk.particles.properties
{

	import com.splunk.particles.emitters.Emitter;
	import com.splunk.particles.emitters.EventsEmitter;
	import com.splunk.particles.emitters.MockStreamEmitter;
	import com.splunk.particles.emitters.ResultsEmitter;
	import com.splunk.properties.AbstractPropertyParser;
	import com.splunk.properties.ArrayPropertyParser;
	import com.splunk.properties.NumberPropertyParser;
	import com.splunk.properties.ParseUtils;
	import com.splunk.properties.PropertyManager;
	import com.splunk.properties.StringPropertyParser;

	public class EmitterPropertyParser extends AbstractPropertyParser
	{

		// Private Static Properties

		private static var _instance:EmitterPropertyParser;

		// Public Static Methods

		public static function getInstance() : EmitterPropertyParser
		{
			var instance:EmitterPropertyParser = EmitterPropertyParser._instance;
			if (!instance)
				instance = EmitterPropertyParser._instance = new EmitterPropertyParser();
			return instance;
		}

		// Protected Properties

		protected var numberPropertyParser:NumberPropertyParser;
		protected var stringPropertyParser:StringPropertyParser;
		protected var initializerArrayPropertyParser:ArrayPropertyParser;

		// Constructor

		public function EmitterPropertyParser()
		{
			this.numberPropertyParser = NumberPropertyParser.getInstance();
			this.stringPropertyParser = StringPropertyParser.getInstance();
			this.initializerArrayPropertyParser = ArrayPropertyParser.getInstance(InitializerPropertyParser.getInstance());
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			switch (ParseUtils.trimWhiteSpace(str))
			{
				case "events":
					return new EventsEmitter();
				case "mockStream":
					return new MockStreamEmitter();
				case "results":
					return new ResultsEmitter();
				default:
					return null;
			}
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			if (value is EventsEmitter)
				return "events";
			if (value is MockStreamEmitter)
				return "mockStream";
			if (value is ResultsEmitter)
				return "results";
			return null;
		}

		public override function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
			if (value is Emitter)
			{
				propertyManager.registerProperty("initializers", this.initializerArrayPropertyParser, this.getProperty, this.setProperty);
			}

			if (value is EventsEmitter)
			{
				propertyManager.registerProperty("hostPath", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("basePath", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("sessionKey", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("jobID", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("count", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("bufferSize", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("bufferTime", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("dropThreshold", this.numberPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is MockStreamEmitter)
			{
				propertyManager.registerProperty("eps", this.numberPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is ResultsEmitter)
			{
				propertyManager.registerProperty("hostPath", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("basePath", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("sessionKey", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("jobID", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("count", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("bufferSize", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("bufferTime", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("dropThreshold", this.numberPropertyParser, this.getProperty, this.setProperty);
			}
		}

	}

}
