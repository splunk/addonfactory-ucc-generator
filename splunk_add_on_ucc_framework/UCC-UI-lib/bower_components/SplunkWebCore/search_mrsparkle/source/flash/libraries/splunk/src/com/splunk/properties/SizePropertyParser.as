package com.splunk.properties
{

	import com.jasongatt.layout.Size;

	public class SizePropertyParser extends AbstractPropertyParser
	{

		// Private Static Properties

		private static var _instance:SizePropertyParser;

		// Public Static Methods

		public static function getInstance() : SizePropertyParser
		{
			var instance:SizePropertyParser = SizePropertyParser._instance;
			if (!instance)
				instance = SizePropertyParser._instance = new SizePropertyParser();
			return instance;
		}

		// Protected Properties

		protected var numberPropertyParser:NumberPropertyParser;

		// Constructor

		public function SizePropertyParser()
		{
			this.numberPropertyParser = NumberPropertyParser.getInstance();
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			var values:Array = ParseUtils.prepareTuple(str);
			if (!values)
				return null;

			var size:Size = new Size();

			var numValues:int = values.length;
			if (numValues > 0)
				size.width = propertyManager.parseValue(values[0], this.numberPropertyParser);
			if (numValues > 1)
				size.height = propertyManager.parseValue(values[1], this.numberPropertyParser);

			return size;
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			var size:Size = value as Size;
			if (!size)
				return null;

			var str:String = "";
			str += this.numberPropertyParser.valueToString(propertyManager, size.width) + ",";
			str += this.numberPropertyParser.valueToString(propertyManager, size.height);
			return "(" + str + ")";
		}

	}

}
