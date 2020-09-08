package com.splunk.services.search.data
{

	import com.splunk.utils.CSVParser;

	/**
	 * The ResultsData class represents results information received from a
	 * search job.
	 */
	public class ResultsData
	{

		// Private Properties

		private var _offset:int;
		private var _count:int;
		private var _fields:Array;
		private var _results:Array;

		// Constructor

		/**
		 * Creates a new ResultsData object.
		 * 
		 * @param value Any object that can be parsed as CSV data.
		 * @param showOffset Whether to include "_offset" metadata in the
		 * results.
		 * 
		 * @throws TypeError The value parameter cannot be parsed.
		 */
		public function ResultsData(value:Object, showOffset:Boolean = false)
		{
			if (value == null)
				throw new TypeError("Data parse error: data is null.");

			var fields:Array = new Array();
			var results:Array = new Array();

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

					results.push(obj);
				}
			}

			this._offset = (offset < 0) ? 0 : offset;
			this._count = results.length;
			this._fields = fields;
			this._results = results;
		}

		// Public Getters/Setters

		/**
		 * The starting index of the results among all results in a search job.
		 */
		public function get offset() : int
		{
			return this._offset;
		}

		/**
		 * The total number of results received.
		 */
		public function get count() : int
		{
			return this._count;
		}

		/**
		 * The list of field names contained within the results.
		 */
		public function get fields() : Array
		{
			return this._fields;
		}

		/**
		 * The list of results. Each result is an Object of name/value pairs.
		 */
		public function get results() : Array
		{
			return this._results;
		}

	}

}
