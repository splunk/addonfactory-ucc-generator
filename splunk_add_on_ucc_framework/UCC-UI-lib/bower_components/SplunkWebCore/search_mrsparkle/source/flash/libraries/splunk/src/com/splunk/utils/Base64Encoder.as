package com.splunk.utils
{

	import flash.utils.ByteArray;

	public final class Base64Encoder
	{

		// Private Static Constants

		private static const _CHARS_64:Array = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","0","1","2","3","4","5","6","7","8","9","+","/"];

		// Public Static Methods

		public static function encode(bytes:ByteArray, lineBreaks:Boolean = false) : String
		{
			if (!bytes)
				throw new TypeError("Parameter bytes must be non-null.");

			bytes.position = 0;

			var encodedString:String = "";

			var chars64:Array = Base64Encoder._CHARS_64;
			var lineLength:int = 0;
			var bytesAvailable:uint;
			var byte1:uint;
			var byte2:uint;
			var byte3:uint;

			while (true)
			{
				bytesAvailable = bytes.bytesAvailable;

				if (bytesAvailable > 2)
				{
					byte1 = bytes.readUnsignedByte();
					byte2 = bytes.readUnsignedByte();
					byte3 = bytes.readUnsignedByte();

					encodedString += chars64[byte1 >> 2];
					encodedString += chars64[(byte1 << 4) & 0x3F | byte2 >> 4];
					encodedString += chars64[(byte2 << 2) & 0x3F | byte3 >> 6];
					encodedString += chars64[byte3 & 0x3F];
				}
				else if (bytesAvailable > 1)
				{
					byte1 = bytes.readUnsignedByte();
					byte2 = bytes.readUnsignedByte();

					encodedString += chars64[byte1 >> 2];
					encodedString += chars64[(byte1 << 4) & 0x3F | byte2 >> 4];
					encodedString += chars64[(byte2 << 2) & 0x3F];
					encodedString += "=";
				}
				else if (bytesAvailable > 0)
				{
					byte1 = bytes.readUnsignedByte();

					encodedString += chars64[byte1 >> 2];
					encodedString += chars64[(byte1 << 4) & 0x3F];
					encodedString += "=";
					encodedString += "=";
				}
				else
				{
					break;
				}

				if (lineBreaks)
				{
					lineLength += 4;
					if (lineLength == 76)
					{
						encodedString += "\n";
						lineLength = 0;
					}
				}
			}

			return encodedString;
		}

	}

}
