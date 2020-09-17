package com.splunk.particles.properties
{

	import com.splunk.particles.distributions.GroupDistribution;
	import com.splunk.particles.distributions.LinearDistribution;
	import com.splunk.particles.distributions.PowerDistribution;
	import com.splunk.properties.AbstractPropertyParser;
	import com.splunk.properties.ArrayPropertyParser;
	import com.splunk.properties.NumberPropertyParser;
	import com.splunk.properties.ParseUtils;
	import com.splunk.properties.PropertyManager;

	public class DistributionPropertyParser extends AbstractPropertyParser
	{

		// Private Static Properties

		private static var _instance:DistributionPropertyParser;

		// Public Static Methods

		public static function getInstance() : DistributionPropertyParser
		{
			var instance:DistributionPropertyParser = DistributionPropertyParser._instance;
			if (!instance)
				instance = DistributionPropertyParser._instance = new DistributionPropertyParser();
			return instance;
		}

		// Protected Properties

		protected var numberPropertyParser:NumberPropertyParser;
		protected var distributionArrayPropertyParser:ArrayPropertyParser;

		// Constructor

		public function DistributionPropertyParser()
		{
			this.numberPropertyParser = NumberPropertyParser.getInstance();
			this.distributionArrayPropertyParser = ArrayPropertyParser.getInstance(this);
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			switch (ParseUtils.trimWhiteSpace(str))
			{
				case "group":
					return new GroupDistribution();
				case "linear":
					return new LinearDistribution();
				case "power":
					return new PowerDistribution();
				default:
					return null;
			}
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			if (value is GroupDistribution)
				return "group";
			if (value is LinearDistribution)
				return "linear";
			if (value is PowerDistribution)
				return "power";
			return null;
		}

		public override function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
			if (value is GroupDistribution)
			{
				propertyManager.registerProperty("distributions", this.distributionArrayPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is LinearDistribution)
			{
				propertyManager.registerProperty("minimum", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("maximum", this.numberPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is PowerDistribution)
			{
				propertyManager.registerProperty("minimum", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("maximum", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("power", this.numberPropertyParser, this.getProperty, this.setProperty);
			}
		}

	}

}
