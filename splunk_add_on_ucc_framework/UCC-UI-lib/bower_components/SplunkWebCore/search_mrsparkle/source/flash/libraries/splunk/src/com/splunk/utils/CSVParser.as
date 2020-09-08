package com.splunk.utils
{

	public final class CSVParser
	{

		// Private Static Properties

		private static var _data:String;
		private static var _numChars:int;
		private static var _index:int;

		// Public Static Methods

		public static function parse(data:String) : Array
		{
			if (data == null)
				throw new TypeError("Parameter data must be non-null.");

			CSVParser._data = data;
			CSVParser._numChars = data.length;
			CSVParser._index = 0;

			var lines:Array = new Array();

			while (CSVParser._hasChars())
				lines.push(CSVParser._eatLine());

			CSVParser._data = null;
			CSVParser._numChars = 0;
			CSVParser._index = 0;

			return lines;
		}

		// Private Static Methods

		private static function _eatLine() : Array
		{
			var line:Array = new Array();

			while (CSVParser._hasChars())
			{
				line.push(CSVParser._eatField());
				if (CSVParser._isLineDelimiter(CSVParser._eatChar()))
				{
					while (CSVParser._isLineDelimiter(CSVParser._tasteChar()))
						CSVParser._nextChar();
					break;
				}
			}

			return line;
		}

		private static function _eatField() : String
		{
			var field:String = "";

			var char:String = CSVParser._tasteChar();
			if (char == "\"")
			{
				CSVParser._nextChar();
				var wasQuote:Boolean = false;
				while (CSVParser._hasChars())
				{
					char = CSVParser._tasteChar();
					if (char == "\"")
					{
						if (!wasQuote)
						{
							wasQuote = true;
						}
						else
						{
							wasQuote = false;
							field += "\"";
						}
						CSVParser._nextChar();
					}
					else if (wasQuote)
					{
						break;
					}
					else
					{
						field += char;
						CSVParser._nextChar();
					}
				}
			}
			else
			{
				while (CSVParser._hasChars())
				{
					char = CSVParser._tasteChar();
					if (CSVParser._isFieldDelimiter(char) || CSVParser._isLineDelimiter(char))
						break;
					field += char;
					CSVParser._nextChar();
				}
				if (!field)
					field = null;
			}

			return field;
		}

		private static function _eatChar() : String
		{
			var char:String = CSVParser._data.charAt(CSVParser._index);
			CSVParser._index++;
			return char;
		}

		private static function _tasteChar(lookAhead:int = 0) : String
		{
			return CSVParser._data.charAt(CSVParser._index + lookAhead);
		}

		private static function _nextChar() : void
		{
			CSVParser._index++;
		}

		private static function _isFieldDelimiter(char:String) : Boolean
		{
			return (char == ",");
		}

		private static function _isLineDelimiter(char:String) : Boolean
		{
			return ((char == "\n") || (char == "\r"));
		}

		private static function _hasChars() : Boolean
		{
			return (CSVParser._index < CSVParser._numChars);
		}

	}

}
