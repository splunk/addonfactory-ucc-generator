package com.splunk.properties
{

	import flash.utils.Dictionary;

	public class MapPropertyParser extends AbstractPropertyParser
	{

		// Private Static Properties

		private static var _instances:Dictionary = new Dictionary();

		// Public Static Methods

		public static function getInstance(elementParser:IPropertyParser) : MapPropertyParser
		{
			var instance:MapPropertyParser = MapPropertyParser._instances[elementParser];
			if (!instance)
				instance = MapPropertyParser._instances[elementParser] = new MapPropertyParser(elementParser);
			return instance;
		}

		// Protected Properties

		protected var elementParser:IPropertyParser;

		// Constructor

		public function MapPropertyParser(elementParser:IPropertyParser)
		{
			if (!elementParser)
				throw new TypeError("Parameter elementParser must be non-null.");
			this.elementParser = elementParser;
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			var map:Object = ParseUtils.prepareObject(str);
			if (!map)
				return null;

			var elementParser:IPropertyParser = this.elementParser;
			for (var key:String in map)
				map[key] = propertyManager.parseValue(map[key], elementParser);

			return map;
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			var map:Object = value as Object;
			if (!map)
				return null;

			var str:String = "";

			var elementParser:IPropertyParser = this.elementParser;
			for (var key:String in map)
			{
				if (str)
					str += ",";
				str += ParseUtils.escapeString(key) + ":";
				if (elementParser is StringPropertyParser)
					str += ParseUtils.escapeString(elementParser.valueToString(propertyManager, map[key]));
				else
					str += elementParser.valueToString(propertyManager, map[key]);
			}

			return "{" + str + "}";
		}

	}

}
