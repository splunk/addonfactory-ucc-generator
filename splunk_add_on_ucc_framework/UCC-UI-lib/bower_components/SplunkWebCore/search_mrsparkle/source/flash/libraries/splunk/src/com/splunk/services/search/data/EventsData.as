package com.splunk.services.search.data
{

	import com.splunk.utils.CSVParser;

	/**
	 * The EventsData class represents events information received from a search
	 * job.
	 */
	public class EventsData
	{

		// Private Properties

		private var _offset:int;
		private var _count:int;
		private var _fields:Array;
		private var _events:Array;

		// Constructor

		/**
		 * Creates a new EventsData object.
		 * 
		 * @param value Any object that can be parsed as CSV data.
		 * @param showOffset Whether to include "_offset" metadata in the
		 * events.
		 * 
		 * @throws TypeError The value parameter cannot be parsed.
		 */
		public function EventsData(value:Object, showOffset:Boolean = false)
		{
			if (value == null)
				throw new TypeError("Data parse error: data is null.");

			var fields:Array = new Array();
			var events:Array = new Array();

			var rows:Array = CSVParser.parse(String(value));
			var numRows:int = rows.length;
			var row:Array;
			var obj:Object;
			var fieldName:String;
			var fieldValue:String;
			var numFields:int;
			var numValues:int;
			var offset:int = -1;
			var i:int;
			var j:int;

			if (numRows > 0)
			{
				row = rows[0];
				for each (fieldName in row)
				{
					if (showOffset || (fieldName != "_offset"))
						fields.push(fieldName);
				}

				numFields = fields.length;

				for (i = 1; i < numRows; i++)
				{
					obj = new Object();

					row = rows[i];
					numValues = Math.min(row.length, numFields);
					for (j = 0; j < numValues; j++)
					{
						fieldName = fields[j];
						fieldValue = row[j];
						if (showOffset || (fieldName != "_offset"))
							obj[fieldName] = fieldValue;
						if ((offset < 0) && (fieldName == "_offset"))
							offset = int(fieldValue);
					}

					events.push(obj);
				}
			}

			this._offset = (offset < 0) ? 0 : offset;
			this._count = events.length;
			this._fields = fields;
			this._events = events;
		}

		// Public Getters/Setters

		/**
		 * The starting index of the events among all events in a search job.
		 */
		public function get offset() : int
		{
			return this._offset;
		}

		/**
		 * The total number of events received.
		 */
		public function get count() : int
		{
			return this._count;
		}

		/**
		 * The list of field names contained within the events.
		 */
		public function get fields() : Array
		{
			return this._fields;
		}

		/**
		 * The list of events. Each event is an Object of name/value pairs.
		 */
		public function get events() : Array
		{
			return this._events;
		}

	}

}
