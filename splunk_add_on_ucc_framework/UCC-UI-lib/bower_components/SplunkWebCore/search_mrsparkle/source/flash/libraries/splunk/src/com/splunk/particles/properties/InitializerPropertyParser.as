package com.splunk.particles.properties
{

	import com.splunk.particles.initializers.LifetimeInitializer;
	import com.splunk.particles.initializers.MassInitializer;
	import com.splunk.particles.initializers.PositionInitializer;
	import com.splunk.particles.initializers.VelocityInitializer;
	import com.splunk.properties.AbstractPropertyParser;
	import com.splunk.properties.ParseUtils;
	import com.splunk.properties.PropertyManager;

	public class InitializerPropertyParser extends AbstractPropertyParser
	{

		// Private Static Properties

		private static var _instance:InitializerPropertyParser;

		// Public Static Methods

		public static function getInstance() : InitializerPropertyParser
		{
			var instance:InitializerPropertyParser = InitializerPropertyParser._instance;
			if (!instance)
				instance = InitializerPropertyParser._instance = new InitializerPropertyParser();
			return instance;
		}

		// Protected Properties

		protected var distributionPropertyParser:DistributionPropertyParser;
		protected var distribution2DPropertyParser:Distribution2DPropertyParser;

		// Constructor

		public function InitializerPropertyParser()
		{
			this.distributionPropertyParser = DistributionPropertyParser.getInstance();
			this.distribution2DPropertyParser = Distribution2DPropertyParser.getInstance();
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			switch (ParseUtils.trimWhiteSpace(str))
			{
				case "lifetime":
					return new LifetimeInitializer();
				case "mass":
					return new MassInitializer();
				case "position":
					return new PositionInitializer();
				case "velocity":
					return new VelocityInitializer();
				default:
					return null;
			}
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			if (value is LifetimeInitializer)
				return "lifetime";
			if (value is MassInitializer)
				return "mass";
			if (value is PositionInitializer)
				return "position";
			if (value is VelocityInitializer)
				return "velocity";
			return null;
		}

		public override function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
			if (value is LifetimeInitializer)
			{
				propertyManager.registerProperty("distribution", this.distributionPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is MassInitializer)
			{
				propertyManager.registerProperty("distribution", this.distributionPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is PositionInitializer)
			{
				propertyManager.registerProperty("distribution", this.distribution2DPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is VelocityInitializer)
			{
				propertyManager.registerProperty("distribution", this.distribution2DPropertyParser, this.getProperty, this.setProperty);
			}
		}

	}

}
