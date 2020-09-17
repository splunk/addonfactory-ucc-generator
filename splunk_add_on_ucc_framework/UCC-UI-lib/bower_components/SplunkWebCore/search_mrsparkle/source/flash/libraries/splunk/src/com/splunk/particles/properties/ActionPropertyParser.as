package com.splunk.particles.properties
{

	import com.splunk.particles.actions.AgeAction;
	import com.splunk.particles.actions.EaseToTargetAction;
	import com.splunk.particles.actions.KillZoneAction;
	import com.splunk.particles.actions.MoveAction;
	import com.splunk.properties.AbstractPropertyParser;
	import com.splunk.properties.BooleanPropertyParser;
	import com.splunk.properties.EaserPropertyParser;
	import com.splunk.properties.NumberPropertyParser;
	import com.splunk.properties.ParseUtils;
	import com.splunk.properties.PointPropertyParser;
	import com.splunk.properties.PropertyManager;

	public class ActionPropertyParser extends AbstractPropertyParser
	{

		// Private Static Properties

		private static var _instance:ActionPropertyParser;

		// Public Static Methods

		public static function getInstance() : ActionPropertyParser
		{
			var instance:ActionPropertyParser = ActionPropertyParser._instance;
			if (!instance)
				instance = ActionPropertyParser._instance = new ActionPropertyParser();
			return instance;
		}

		// Protected Properties

		protected var numberPropertyParser:NumberPropertyParser;
		protected var booleanPropertyParser:BooleanPropertyParser;
		protected var pointPropertyParser:PointPropertyParser;
		protected var easerPropertyParser:EaserPropertyParser;
		protected var distribution2DPropertyParser:Distribution2DPropertyParser;

		// Constructor

		public function ActionPropertyParser()
		{
			this.numberPropertyParser = NumberPropertyParser.getInstance();
			this.booleanPropertyParser = BooleanPropertyParser.getInstance();
			this.pointPropertyParser = PointPropertyParser.getInstance();
			this.easerPropertyParser = EaserPropertyParser.getInstance();
			this.distribution2DPropertyParser = Distribution2DPropertyParser.getInstance();
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			switch (ParseUtils.trimWhiteSpace(str))
			{
				case "age":
					return new AgeAction();
				case "easeToTarget":
					return new EaseToTargetAction();
				case "killZone":
					return new KillZoneAction();
				case "move":
					return new MoveAction();
				default:
					return null;
			}
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			if (value is AgeAction)
				return "age";
			if (value is EaseToTargetAction)
				return "easeToTarget";
			if (value is KillZoneAction)
				return "killZone";
			if (value is MoveAction)
				return "move";
			return null;
		}

		public override function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
			if (value is AgeAction)
			{
				// no properties
			}
			else if (value is EaseToTargetAction)
			{
				propertyManager.registerProperty("targetPosition", this.pointPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("targetVelocity", this.pointPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("duration", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("easer", this.easerPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is KillZoneAction)
			{
				propertyManager.registerProperty("zone", this.distribution2DPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("invert", this.booleanPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is MoveAction)
			{
				// no properties
			}
		}

	}

}
