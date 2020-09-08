package com.splunk.particles.properties
{

	import com.splunk.particles.layout.CenteredDistributedStackLayoutPolicy;
	import com.splunk.properties.LayoutPolicyPropertyParser;
	import com.splunk.properties.NumberPropertyParser;
	import com.splunk.properties.ParseUtils;
	import com.splunk.properties.PropertyManager;

	public class ExtendedLayoutPolicyPropertyParser extends LayoutPolicyPropertyParser
	{

		// Private Static Properties

		private static var _instance:ExtendedLayoutPolicyPropertyParser;

		// Public Static Methods

		public static function getInstance() : ExtendedLayoutPolicyPropertyParser
		{
			var instance:ExtendedLayoutPolicyPropertyParser = ExtendedLayoutPolicyPropertyParser._instance;
			if (!instance)
				instance = ExtendedLayoutPolicyPropertyParser._instance = new ExtendedLayoutPolicyPropertyParser();
			return instance;
		}

		// Protected Properties

		protected var numberPropertyParser:NumberPropertyParser;

		// Constructor

		public function ExtendedLayoutPolicyPropertyParser()
		{
			this.numberPropertyParser = NumberPropertyParser.getInstance();
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			if (ParseUtils.trimWhiteSpace(str) == "centeredDistributedStack")
				return new CenteredDistributedStackLayoutPolicy();
			return super.stringToValue(propertyManager, str);
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			if (value is CenteredDistributedStackLayoutPolicy)
				return "centeredDistributedStack";
			return super.valueToString(propertyManager, value);
		}

		public override function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
			if (value is CenteredDistributedStackLayoutPolicy)
			{
				propertyManager.registerProperty("orientation", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("centerIndex", this.numberPropertyParser, this.getProperty, this.setProperty);
			}
			else
			{
				super.registerProperties(propertyManager, value);
			}
		}

	}

}
