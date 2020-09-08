package
{

	import com.splunk.particles.properties.ElementPropertyParser;
	import com.splunk.properties.ParseUtils;
	import com.splunk.properties.PropertyManager;

	public class MarioElementPropertyParser extends ElementPropertyParser
	{

		// Private Static Properties

		private static var _instance:MarioElementPropertyParser;

		// Public Static Methods

		public static function getInstance() : MarioElementPropertyParser
		{
			var instance:MarioElementPropertyParser = MarioElementPropertyParser._instance;
			if (!instance)
				instance = MarioElementPropertyParser._instance = new MarioElementPropertyParser();
			return instance;
		}

		// Constructor

		public function MarioElementPropertyParser()
		{
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			switch (ParseUtils.trimWhiteSpace(str))
			{
				case "eventsEmitter":
					return new MarioEventsEmitterControl();
				default:
					return super.stringToValue(propertyManager, str);
			}
		}

	}

}
