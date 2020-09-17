package com.splunk.properties
{

	import com.jasongatt.motion.easers.AbstractEaser;
	import com.jasongatt.motion.easers.BackEaser;
	import com.jasongatt.motion.easers.BounceEaser;
	import com.jasongatt.motion.easers.CircularEaser;
	import com.jasongatt.motion.easers.CubicEaser;
	import com.jasongatt.motion.easers.ElasticEaser;
	import com.jasongatt.motion.easers.LinearEaser;
	import com.jasongatt.motion.easers.PowerEaser;
	import com.jasongatt.motion.easers.QuadraticEaser;
	import com.jasongatt.motion.easers.QuarticEaser;
	import com.jasongatt.motion.easers.QuinticEaser;
	import com.jasongatt.motion.easers.SineEaser;

	public class EaserPropertyParser extends AbstractPropertyParser
	{

		// Private Static Properties

		private static var _instance:EaserPropertyParser;

		// Public Static Methods

		public static function getInstance() : EaserPropertyParser
		{
			var instance:EaserPropertyParser = EaserPropertyParser._instance;
			if (!instance)
				instance = EaserPropertyParser._instance = new EaserPropertyParser();
			return instance;
		}

		// Protected Properties

		protected var numberPropertyParser:NumberPropertyParser;

		// Constructor

		public function EaserPropertyParser()
		{
			this.numberPropertyParser = NumberPropertyParser.getInstance();
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			switch (ParseUtils.trimWhiteSpace(str))
			{
				case "back":
					return new BackEaser();
				case "bounce":
					return new BounceEaser();
				case "circular":
					return new CircularEaser();
				case "cubic":
					return new CubicEaser();
				case "elastic":
					return new ElasticEaser();
				case "linear":
					return new LinearEaser();
				case "power":
					return new PowerEaser();
				case "quadratic":
					return new QuadraticEaser();
				case "quartic":
					return new QuarticEaser();
				case "quintic":
					return new QuinticEaser();
				case "sine":
					return new SineEaser();
				default:
					return null;
			}
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			if (value is BackEaser)
				return "back";
			if (value is BounceEaser)
				return "bounce";
			if (value is CircularEaser)
				return "circular";
			if (value is CubicEaser)
				return "cubic";
			if (value is ElasticEaser)
				return "elastic";
			if (value is LinearEaser)
				return "linear";
			if (value is PowerEaser)
				return "power";
			if (value is QuadraticEaser)
				return "quadratic";
			if (value is QuarticEaser)
				return "quartic";
			if (value is QuinticEaser)
				return "quintic";
			if (value is SineEaser)
				return "sine";
			return null;
		}

		public override function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
			if (value is AbstractEaser)
			{
				propertyManager.registerProperty("direction", this.numberPropertyParser, this.getProperty, this.setProperty);
			}

			if (value is BackEaser)
			{
				propertyManager.registerProperty("scale", this.numberPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is BounceEaser)
			{
				// no properties
			}
			else if (value is CircularEaser)
			{
				// no properties
			}
			else if (value is CubicEaser)
			{
				// no properties
			}
			else if (value is ElasticEaser)
			{
				propertyManager.registerProperty("amplitude", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("period", this.numberPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is LinearEaser)
			{
				// no properties
			}
			else if (value is PowerEaser)
			{
				propertyManager.registerProperty("power", this.numberPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is QuadraticEaser)
			{
				// no properties
			}
			else if (value is QuarticEaser)
			{
				// no properties
			}
			else if (value is QuinticEaser)
			{
				// no properties
			}
			else if (value is SineEaser)
			{
				// no properties
			}
		}

	}

}
