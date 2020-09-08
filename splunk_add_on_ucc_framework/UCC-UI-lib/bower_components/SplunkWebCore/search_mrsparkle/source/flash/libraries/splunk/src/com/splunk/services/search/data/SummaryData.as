package com.splunk.services.search.data
{

	import com.splunk.time.DateTime;

	/**
	 * The SummaryData class represents summary information received from a
	 * search job.
	 */
	public class SummaryData
	{

		// Private Properties

		private var _earliestTime:DateTime;
		private var _latestTime:DateTime;
		private var _duration:Number;
		private var _fieldNames:Array;
		private var _fields:Object;

		// Constructor

		/**
		 * Creates a new SummaryData object.
		 * 
		 * @param value Any object that can be converted to an XML object.
		 * 
		 * @throws TypeError The value parameter cannot be parsed.
		 */
		public function SummaryData(value:Object)
		{
			var root:XML;
			try
			{
				if (value == null)
					throw new TypeError("Data parse error: data is null.");

				root = new XML(value);

				var earliestTime:DateTime = DataUtils.parseISOTime(root.@earliest_time);
				var latestTime:DateTime = DataUtils.parseISOTime(root.@latest_time);
				var duration:Number = DataUtils.parseNumber(root.@duration);
				var fieldNames:Array = new Array();
				var fields:Object = new Object();

				var fieldNode:XML;
				var fieldName:String;
				var fieldObject:Object;
				var attrNode:XML;
				var attrName:String;
				var attrValue:*;
				var valueNode:XML;
				var valueArray:Array;
				var valueObject:Object;

				for each (fieldNode in root.field)
				{
					fieldName = DataUtils.parseString(fieldNode.@k);
					if (fieldName)
					{
						fieldObject = new Object();
						fieldObject.count = DataUtils.parseInt(fieldNode.@c);
						fieldObject.distinctCount = DataUtils.parseInt(fieldNode.@dc);
						fieldObject.isExact = DataUtils.parseBoolean(fieldNode.@exact);

						for each (attrNode in fieldNode)
						{
							attrName = attrNode.name();
							if (attrName)
							{
								if (attrName == "modes")
								{
									valueArray = new Array();
									for each (valueNode in attrNode)
									{
										valueObject = new Object();
										valueObject.count = DataUtils.parseInt(valueNode.@c);
										valueObject.value = DataUtils.parseString(valueNode.text);
										valueObject.isExact = DataUtils.parseBoolean(valueNode.@exact);
										valueArray.push(valueObject);
									}
									attrValue = valueArray;
								}
								else
								{
									attrValue = DataUtils.parseString(attrNode);
								}
								fieldObject[attrName] = attrValue;
							}
						}

						fieldNames.push(fieldName);
						fields[fieldName] = fieldObject;
					}
				}

				this._earliestTime = earliestTime;
				this._latestTime = latestTime;
				this._duration = duration;
				this._fieldNames = fieldNames;
				this._fields = fields;
			}
			catch (e:Error)
			{
				throw e;
			}
			finally
			{
				// workaround for XML memory leak
				if (root)
					root.replace("*", null);
			}
		}

		// Public Getters/Setters

		/**
		 * The time of the earliest event in a search job.
		 * 
		 * @see com.splunk.time.DateTime
		 */
		public function get earliestTime() : DateTime
		{
			return this._earliestTime;
		}

		/**
		 * The time of the latest event in a search job.
		 * 
		 * @see com.splunk.time.DateTime
		 */
		public function get latestTime() : DateTime
		{
			return this._latestTime;
		}

		/**
		 * The duration between the earliest and latest events in a search job.
		 */
		public function get duration() : Number
		{
			return this._duration;
		}

		/**
		 * The list of field names present in a search job.
		 */
		public function get fieldNames() : Array
		{
			return this._fieldNames;
		}

		/**
		 * The list of fields. Each field is an Object of attribute name/value
		 * pairs. The value for the <code>"modes"</code> attribute is an Array
		 * of Objects of name/value pairs.
		 */
		public function get fields() : Object
		{
			return this._fields;
		}

	}

}
