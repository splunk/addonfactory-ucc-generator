package com.splunk.properties
{

	import com.splunk.data.Slice;

	public class SlicePropertyParser extends AbstractPropertyParser
	{

		// Private Static Properties

		private static var _instance:SlicePropertyParser;

		// Public Static Methods

		public static function getInstance() : SlicePropertyParser
		{
			var instance:SlicePropertyParser = SlicePropertyParser._instance;
			if (!instance)
				instance = SlicePropertyParser._instance = new SlicePropertyParser();
			return instance;
		}

		// Protected Properties

		protected var numberPropertyParser:NumberPropertyParser;

		// Constructor

		public function SlicePropertyParser()
		{
			this.numberPropertyParser = NumberPropertyParser.getInstance();
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			str = ParseUtils.trimWhiteSpace(str);
			if (!str)
				return null;

			var slice:Slice = new Slice();

			var values:Array = str.split(":");
			var numValues:int = values.length;
			var value:String;
			if (numValues > 1)
			{
				value = ParseUtils.trimWhiteSpace(values[0]);
				slice.startIndex = propertyManager.parseValue(value, this.numberPropertyParser);
				value = ParseUtils.trimWhiteSpace(values[1]);
				if (value)
					slice.endIndex = propertyManager.parseValue(value, this.numberPropertyParser);
			}
			else if (numValues > 0)
			{
				value = ParseUtils.trimWhiteSpace(values[0]);
				slice.startIndex = propertyManager.parseValue(value, this.numberPropertyParser);
				slice.endIndex = slice.startIndex;
			}

			return slice;
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			var slice:Slice = value as Slice;
			if (!slice)
				return null;

			var str:String = "";
			str += this.numberPropertyParser.valueToString(propertyManager, slice.startIndex);
			if (slice.startIndex != slice.endIndex)
			{
				str += ":";
				if (slice.endIndex >= 0)
					str += this.numberPropertyParser.valueToString(propertyManager, slice.endIndex);
			}
			return str;
		}

	}

}
