package com.splunk.properties
{

	import flash.geom.Matrix;

	public class MatrixPropertyParser extends AbstractPropertyParser
	{

		// Private Static Properties

		private static var _instance:MatrixPropertyParser;

		// Public Static Methods

		public static function getInstance() : MatrixPropertyParser
		{
			var instance:MatrixPropertyParser = MatrixPropertyParser._instance;
			if (!instance)
				instance = MatrixPropertyParser._instance = new MatrixPropertyParser();
			return instance;
		}

		// Protected Properties

		protected var numberPropertyParser:NumberPropertyParser;

		// Constructor

		public function MatrixPropertyParser()
		{
			this.numberPropertyParser = NumberPropertyParser.getInstance();
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			var values:Array = ParseUtils.prepareTuple(str);
			if (!values)
				return null;

			var matrix:Matrix = new Matrix();

			var numValues:int = values.length;
			if (numValues > 0)
				matrix.a = propertyManager.parseValue(values[0], this.numberPropertyParser);
			if (numValues > 1)
				matrix.b = propertyManager.parseValue(values[1], this.numberPropertyParser);
			if (numValues > 2)
				matrix.c = propertyManager.parseValue(values[2], this.numberPropertyParser);
			if (numValues > 3)
				matrix.d = propertyManager.parseValue(values[3], this.numberPropertyParser);
			if (numValues > 4)
				matrix.tx = propertyManager.parseValue(values[4], this.numberPropertyParser);
			if (numValues > 5)
				matrix.ty = propertyManager.parseValue(values[5], this.numberPropertyParser);

			return matrix;
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			var matrix:Matrix = value as Matrix;
			if (!matrix)
				return null;

			var str:String = "";
			str += this.numberPropertyParser.valueToString(propertyManager, matrix.a) + ",";
			str += this.numberPropertyParser.valueToString(propertyManager, matrix.b) + ",";
			str += this.numberPropertyParser.valueToString(propertyManager, matrix.c) + ",";
			str += this.numberPropertyParser.valueToString(propertyManager, matrix.d) + ",";
			str += this.numberPropertyParser.valueToString(propertyManager, matrix.tx) + ",";
			str += this.numberPropertyParser.valueToString(propertyManager, matrix.ty);
			return "(" + str + ")";
		}

	}

}
