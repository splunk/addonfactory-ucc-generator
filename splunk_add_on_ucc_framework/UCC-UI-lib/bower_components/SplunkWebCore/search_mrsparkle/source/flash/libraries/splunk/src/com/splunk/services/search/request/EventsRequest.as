package com.splunk.services.search.request
{

	import com.splunk.services.SplunkRequest;
	import com.splunk.time.DateTime;

	public class EventsRequest
	{

		// Public Properties

		public var offset:int;
		public var count:int;
		public var earliestTime:DateTime;
		public var latestTime:DateTime;
		public var search:String;
		public var fieldList:Array;
		public var maxLines:int;
		public var truncationMode:String;

		// Constructor

		public function EventsRequest(offset:int = 0, count:int = 100)
		{
			this.offset = offset;
			this.count = count;
		}

		// Public Methods

		public function toSplunkRequest() : SplunkRequest
		{
			var variables:Object = new Object();
			variables.offset = this.offset;
			variables.count = this.count;
			if (this.earliestTime)
				variables.earliest_time = this.earliestTime.time;
			if (this.latestTime)
				variables.latest_time = this.latestTime.time;
			if (this.search)
				variables.search = this.search;
			if (this.fieldList)
				variables.field_list = this.fieldList.join(",");
			if (this.maxLines > 0)
				variables.max_lines = this.maxLines;
			if (this.truncationMode)
				variables.truncation_mode = this.truncationMode;
			variables.output_mode = "csv";
			variables.segmentation = "raw";
			variables.show_offset = 1;

			var request:SplunkRequest = new SplunkRequest("events");
			request.variables = variables;

			return request;
		}

	}

}
