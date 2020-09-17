package com.splunk.properties
{

	import com.jasongatt.layout.Margin;

	public class MarginPropertyParser extends AbstractPropertyParser
	{

		// Private Static Properties

		private static var _instance:MarginPropertyParser;

		// Public Static Methods

		public static function getInstance() : MarginPropertyParser
		{
			var instance:MarginPropertyParser = MarginPropertyParser._instance;
			if (!instance)
				instance = MarginPropertyParser._instance = new MarginPropertyParser();
			return instance;
		}

		// Protected Properties

		protected var numberPropertyParser:NumberPropertyParser;

		// Constructor

		public function MarginPropertyParser()
		{
			this.numberPropertyParser = NumberPropertyParser.getInstance();
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			var values:Array = ParseUtils.prepareTuple(str);
			if (!values)
				return null;

			var margin:Margin = new Margin();

			var numValues:int = values.length;
			if (numValues > 0)
				margin.left = propertyManager.parseValue(values[0], this.numberPropertyParser);
			if (numValues > 1)
				margin.right = propertyManager.parseValue(values[1], this.numberPropertyParser);
			if (numValues > 2)
				margin.top = propertyManager.parseValue(values[2], this.numberPropertyParser);
			if (numValues > 3)
				margin.bottom = propertyManager.parseValue(values[3], this.numberPropertyParser);

			return margin;
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			var margin:Margin = value as Margin;
			if (!margin)
				return null;

			var str:String = "";
			str += this.numberPropertyParser.valueToString(propertyManager, margin.left) + ",";
			str += this.numberPropertyParser.valueToString(propertyManager, margin.right) + ",";
			str += this.numberPropertyParser.valueToString(propertyManager, margin.top) + ",";
			str += this.numberPropertyParser.valueToString(propertyManager, margin.bottom);
			return "(" + str + ")";
		}

	}

}
