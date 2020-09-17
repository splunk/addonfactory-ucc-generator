package com.splunk.properties
{

	public final class ParseUtils
	{

		// Private Static Constants

		private static const _UNESCAPE_PATTERN:RegExp = /\\(.?)/gs;
		private static const _ESCAPE_SLASH_PATTERN:RegExp = /\\/g;
		private static const _ESCAPE_QUOTE_PATTERN:RegExp = /"/g;

		// Public Static Methods

		public static function prepareArray(str:String) : Array
		{
			if (!str)
				return null;

			str = ParseUtils.trimWhiteSpace(str);
			if (!str)
				return null;

			var length:int = str.length;
			if (length < 2)
				return null;

			if (str.charAt(0) != "[")
				return null;

			if (str.charAt(length - 1) != "]")
				return null;

			str = str.substring(1, length - 1);
			length = str.length;

			var arr:Array = new Array();
			var index:int = -1;
			var value:String;

			while (index < length)
			{
				index++;
				value = ParseUtils._readUntil(str, index, ",");
				index += value.length;

				value = ParseUtils.trimWhiteSpace(value);
				if (value || (index < length) || (arr.length > 0))
					arr.push(ParseUtils.unescapeString(value));
			}

			return arr;
		}

		public static function prepareObject(str:String) : Object
		{
			if (!str)
				return null;

			str = ParseUtils.trimWhiteSpace(str);
			if (!str)
				return null;

			var length:int = str.length;
			if (length < 2)
				return null;

			if (str.charAt(0) != "{")
				return null;

			if (str.charAt(length - 1) != "}")
				return null;

			str = str.substring(1, length - 1);
			length = str.length;

			var obj:Object = new Object();
			var index:int = 0;
			var key:String;
			var value:String;

			while (index < length)
			{
				key = ParseUtils._readUntil(str, index, ":");
				index += key.length + 1;

				if (index > length)
					break;

				value = ParseUtils._readUntil(str, index, ",");
				index += value.length + 1;

				key = ParseUtils.unescapeString(key);
				if (key)
					obj[key] = ParseUtils.unescapeString(value);
			}

			return obj;
		}

		public static function prepareTuple(str:String) : Array
		{
			if (!str)
				return null;

			str = ParseUtils.trimWhiteSpace(str);
			if (!str)
				return null;

			var length:int = str.length;
			if (length < 2)
				return null;

			if (str.charAt(0) != "(")
				return null;

			if (str.charAt(length - 1) != ")")
				return null;

			str = str.substring(1, length - 1);
			length = str.length;

			var arr:Array = new Array();
			var index:int = -1;
			var value:String;

			while (index < length)
			{
				index++;
				value = ParseUtils._readUntil(str, index, ",");
				index += value.length;

				value = ParseUtils.trimWhiteSpace(value);
				if (value || (index < length) || (arr.length > 0))
					arr.push(ParseUtils.unescapeString(value));
			}

			return arr;
		}

		public static function unescapeString(str:String) : String
		{
			if (!str)
				return str;

			str = ParseUtils.trimWhiteSpace(str);
			if (!str)
				return str;

			var length:int = str.length;
			if (length < 2)
				return str;

			if (str.charAt(0) != "\"")
				return str;

			if (str.charAt(length - 1) != "\"")
				return str;

			str = str.substring(1, length - 1);
			if (!str)
				return str;

			str = str.replace(ParseUtils._UNESCAPE_PATTERN, "$1");

			return str;
		}

		public static function escapeString(str:String) : String
		{
			if (str == null)
				return null;

			// two simple replace calls are faster than str.replace(/([\\"])/g, "\\$1")
			str = str.replace(ParseUtils._ESCAPE_SLASH_PATTERN, "\\\\");
			str = str.replace(ParseUtils._ESCAPE_QUOTE_PATTERN, "\\\"");

			return "\"" + str + "\"";
		}

		public static function trimWhiteSpace(str:String) : String
		{
			if (!str)
				return str;

			var startIndex:int = 0;
			var endIndex:int = str.length - 1;

			for (startIndex; startIndex <= endIndex; startIndex++)
			{
				if (!ParseUtils.isWhiteSpace(str.charAt(startIndex)))
					break;
			}

			for (endIndex; endIndex >= startIndex; endIndex--)
			{
				if (!ParseUtils.isWhiteSpace(str.charAt(endIndex)))
					break;
			}

			return str.substring(startIndex, endIndex + 1);
		}

		public static function isWhiteSpace(char:String) : Boolean
		{
			return ((char == " ") || (char == "\t") || (char == "\n") || (char == "\r"));
		}

		// Private Static Methods

		private static function _readUntil(str:String, startIndex:int, endChar:String) : String
		{
			var substr:String = "";

			var index:int = startIndex;
			var length:int = str.length;
			var char:String;
			var isQuote:Boolean = false;
			var nestLevel:int = 0;
			var nestBeginChar:String;
			var nestEndChar:String;

			while (index < length)
			{
				char = str.charAt(index);
				if (isQuote)
				{
					if (char == "\"")
					{
						isQuote = false;
					}
					else if (char == "\\")
					{
						substr += char;
						index++;
						char = str.charAt(index);
					}
				}
				else if (nestLevel > 0)
				{
					if (char == nestEndChar)
						nestLevel--;
					else if (char == nestBeginChar)
						nestLevel++;
					else if (char == "\"")
						isQuote = true;
				}
				else if (char != endChar)
				{
					if (char == "[")
					{
						nestLevel = 1;
						nestBeginChar = "[";
						nestEndChar = "]";
					}
					else if (char == "{")
					{
						nestLevel = 1;
						nestBeginChar = "{";
						nestEndChar = "}";
					}
					else if (char == "(")
					{
						nestLevel = 1;
						nestBeginChar = "(";
						nestEndChar = ")";
					}
					else if (char == "\"")
					{
						isQuote = true;
					}
				}
				else
				{
					break;
				}

				substr += char;
				index++;
			}

			return substr;
		}

	}

}
