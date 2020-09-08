package com.splunk.time
{

	import com.jasongatt.utils.ArrayUtil;

	public class SplunkTimeZone implements ITimeZone
	{

		// Private Properties

		private var _standardOffset:Number = 0;
		private var _serializedTimeZone:String;

		private var _isConstant:Boolean = false;
		private var _offsetList:Array;
		private var _timeList:Array;
		private var _indexList:Array;

		// Constructor

		public function SplunkTimeZone(serializedTimeZone:String)
		{
			this._serializedTimeZone = serializedTimeZone;

			this._offsetList = new Array();
			this._timeList = new Array();
			this._indexList = new Array();

			this._parseSerializedTimeZone(serializedTimeZone);
		}

		// Public Getters/Setters

		public function get standardOffset() : Number
		{
			return this._standardOffset;
		}

		public function get serializedTimeZone() : String
		{
			return this._serializedTimeZone;
		}

		// Public Methods

		public function getOffset(time:Number) : Number
		{
			if (this._isConstant)
				return this._standardOffset;

			var offsetList:Array = this._offsetList;
			var numOffsets:int = offsetList.length;
			if (numOffsets == 0)
				return 0;

			if (numOffsets == 1)
				return offsetList[0];

			var timeList:Array = this._timeList;
			var numTimes:int = timeList.length;
			if (numTimes == 0)
				return 0;

			var timeIndex:int;
			if (numTimes == 1)
			{
				timeIndex = 0;
			}
			else
			{
				timeIndex = ArrayUtil.binarySearch(timeList, time);
				if (timeIndex < -1)
					timeIndex = -timeIndex - 2;
				else if (timeIndex == -1)
					timeIndex = 0;
			}

			var offsetIndex:int = this._indexList[timeIndex];
			return offsetList[offsetIndex];
		}

		// Private Methods

		private function _parseSerializedTimeZone(serializedTimeZone:String) : void
		{
			// ### SERIALIZED TIMEZONE FORMAT 1.0
			// Y-25200 YW 50 44 54
			// Y-28800 NW 50 53 54
			// Y-25200 YW 50 57 54
			// Y-25200 YG 50 50 54
			// @-1633269600 0
			// @-1615129200 1
			// @-1601820000 0
			// @-1583679600 1

			// ### SERIALIZED TIMEZONE FORMAT 1.0
			// C0
			// Y0 NW 47 4D 54

			if (!serializedTimeZone)
				return;

			var entries:Array = serializedTimeZone.split(";");
			for each (var entry:String in entries)
			{
				if (entry)
				{
					switch (entry.charAt(0))
					{
						case "C":
							if (this._parseC(entry.substring(1, entry.length)))
								return;
							break;
						case "Y":
							this._parseY(entry.substring(1, entry.length));
							break;
						case "@":
							this._parseAt(entry.substring(1, entry.length));
							break;
					}
				}
			}

			this._standardOffset = this.getOffset(0);
		}

		private function _parseC(entry:String) : Boolean
		{
			// 0

			if (!entry)
				return false;

			var time:Number = Number(entry);
			if (time != time)
				return false;

			this._standardOffset = time;
			this._isConstant = true;

			return true;
		}

		private function _parseY(entry:String) : void
		{
			// -25200 YW 50 44 54

			if (!entry)
				return;

			// must declare this here, otherwise Flash Player stack overflow bug occurs
			var offset:Number;

			var elements:Array = entry.split(" ");
			if (elements.length < 1)
				return;

			var element:String = elements[0];
			if (!element)
				return;

			offset = Number(element);
			if (offset != offset)
				return;

			this._offsetList.push(offset);
		}

		private function _parseAt(entry:String) : void
		{
			// -1633269600 0

			if (!entry)
				return;

			// must declare these here, otherwise Flash Player stack overflow bug occurs
			var time:Number;
			var index:Number;

			var elements:Array = entry.split(" ");
			if (elements.length < 2)
				return;

			var element:String = elements[0];
			if (!element)
				return;

			time = Number(element);
			if (time != time)
				return;

			element = elements[1];
			if (!element)
				return;

			index = Number(element);
			if (index != index)
				return;

			index = int(index);
			if ((index < 0) || (index >= this._offsetList.length))
				return;

			this._timeList.push(time);
			this._indexList.push(index);
		}

	}

}
