package com.splunk.properties
{

	import com.jasongatt.utils.AlphabeticComparator;
	import com.jasongatt.utils.NaturalComparator;
	import com.jasongatt.utils.NumericComparator;
	import com.jasongatt.utils.SequentialNumericComparator;

	public class ComparatorPropertyParser extends AbstractPropertyParser
	{

		// Private Static Properties

		private static var _instance:ComparatorPropertyParser;

		// Public Static Methods

		public static function getInstance() : ComparatorPropertyParser
		{
			var instance:ComparatorPropertyParser = ComparatorPropertyParser._instance;
			if (!instance)
				instance = ComparatorPropertyParser._instance = new ComparatorPropertyParser();
			return instance;
		}

		// Constructor

		public function ComparatorPropertyParser()
		{
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			switch (ParseUtils.trimWhiteSpace(str))
			{
				case "alphabetic":
					return new AlphabeticComparator();
				case "natural":
					return new NaturalComparator();
				case "numeric":
					return new NumericComparator();
				case "sequentialNumeric":
					return new SequentialNumericComparator();
				default:
					return null;
			}
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			if (value is AlphabeticComparator)
				return "alphabetic";
			if (value is NaturalComparator)
				return "natural";
			if (value is NumericComparator)
				return "numeric";
			if (value is SequentialNumericComparator)
				return "sequentialNumeric";
			return null;
		}

	}

}
