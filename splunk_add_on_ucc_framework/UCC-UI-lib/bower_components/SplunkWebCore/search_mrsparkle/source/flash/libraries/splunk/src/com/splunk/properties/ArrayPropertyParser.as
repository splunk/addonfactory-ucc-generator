package com.splunk.properties
{

	import flash.utils.Dictionary;

	public class ArrayPropertyParser extends AbstractPropertyParser
	{

		// Private Static Properties

		private static var _instances:Dictionary = new Dictionary();

		// Public Static Methods

		public static function getInstance(elementParser:IPropertyParser) : ArrayPropertyParser
		{
			var instance:ArrayPropertyParser = ArrayPropertyParser._instances[elementParser];
			if (!instance)
				instance = ArrayPropertyParser._instances[elementParser] = new ArrayPropertyParser(elementParser);
			return instance;
		}

		// Protected Properties

		protected var elementParser:IPropertyParser;

		// Constructor

		public function ArrayPropertyParser(elementParser:IPropertyParser)
		{
			if (!elementParser)
				throw new TypeError("Parameter elementParser must be non-null.");
			this.elementParser = elementParser;
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			var array:Array = ParseUtils.prepareArray(str);
			if (!array)
				return null;

			var elementParser:IPropertyParser = this.elementParser;
			var numElements:int = array.length;
			for (var i:int = 0; i < numElements; i++)
				array[i] = propertyManager.parseValue(array[i], elementParser);

			return array;
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			var array:Array = value as Array;
			if (!array)
				return null;

			var str:String = "";

			var elementParser:IPropertyParser = this.elementParser;
			for each (var elementValue:* in array)
			{
				if (str)
					str += ",";
				if (elementParser is StringPropertyParser)
					str += ParseUtils.escapeString(elementParser.valueToString(propertyManager, elementValue));
				else
					str += elementParser.valueToString(propertyManager, elementValue);
			}

			return "[" + str + "]";
		}

	}

}
