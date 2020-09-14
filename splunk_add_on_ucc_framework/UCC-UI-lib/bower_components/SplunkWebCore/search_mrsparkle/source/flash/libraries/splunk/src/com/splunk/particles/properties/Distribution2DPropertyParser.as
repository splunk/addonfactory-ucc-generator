package com.splunk.particles.properties
{

	import com.splunk.particles.distributions.GroupDistribution2D;
	import com.splunk.particles.distributions.RectangleDistribution2D;
	import com.splunk.particles.distributions.VectorDistribution2D;
	import com.splunk.properties.AbstractPropertyParser;
	import com.splunk.properties.ArrayPropertyParser;
	import com.splunk.properties.NumberPropertyParser;
	import com.splunk.properties.ParseUtils;
	import com.splunk.properties.PropertyManager;

	public class Distribution2DPropertyParser extends AbstractPropertyParser
	{

		// Private Static Properties

		private static var _instance:Distribution2DPropertyParser;

		// Public Static Methods

		public static function getInstance() : Distribution2DPropertyParser
		{
			var instance:Distribution2DPropertyParser = Distribution2DPropertyParser._instance;
			if (!instance)
				instance = Distribution2DPropertyParser._instance = new Distribution2DPropertyParser();
			return instance;
		}

		// Protected Properties

		protected var numberPropertyParser:NumberPropertyParser;
		protected var distribution2DArrayPropertyParser:ArrayPropertyParser;

		// Constructor

		public function Distribution2DPropertyParser()
		{
			this.numberPropertyParser = NumberPropertyParser.getInstance();
			this.distribution2DArrayPropertyParser = ArrayPropertyParser.getInstance(this);
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			switch (ParseUtils.trimWhiteSpace(str))
			{
				case "group":
					return new GroupDistribution2D();
				case "rectangle":
					return new RectangleDistribution2D();
				case "vector":
					return new VectorDistribution2D();
				default:
					return null;
			}
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			if (value is GroupDistribution2D)
				return "group";
			if (value is RectangleDistribution2D)
				return "rectangle";
			if (value is VectorDistribution2D)
				return "vector";
			return null;
		}

		public override function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
			if (value is GroupDistribution2D)
			{
				propertyManager.registerProperty("distributions", this.distribution2DArrayPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is RectangleDistribution2D)
			{
				propertyManager.registerProperty("x", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("y", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("width", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("height", this.numberPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is VectorDistribution2D)
			{
				propertyManager.registerProperty("length", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("lengthVariance", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("angle", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("angleVariance", this.numberPropertyParser, this.getProperty, this.setProperty);
			}
		}

	}

}
