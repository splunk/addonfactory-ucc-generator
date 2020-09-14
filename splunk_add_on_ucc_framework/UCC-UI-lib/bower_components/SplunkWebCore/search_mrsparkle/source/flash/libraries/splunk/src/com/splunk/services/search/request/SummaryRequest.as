package com.splunk.services.search.request
{

	import com.splunk.services.SplunkRequest;
	import com.splunk.time.DateTime;

	public class SummaryRequest
	{

		// Public Properties

		public var earliestTime:DateTime;
		public var latestTime:DateTime;
		public var search:String;
		public var fieldList:Array;
		public var topCount:int;
		public var minFrequency:Number;

		// Constructor

		public function SummaryRequest()
		{
		}

		// Public Methods

		public function toSplunkRequest() : SplunkRequest
		{
			var variables:Object = new Object();
			if (this.earliestTime)
				variables.earliest_time = this.earliestTime.time;
			if (this.latestTime)
				variables.latest_time = this.latestTime.time;
			if (this.search)
				variables.search = this.search;
			if (this.fieldList)
				variables.field_list = this.fieldList.join(",");
			if (this.topCount > 0)
				variables.top_count = this.topCount;
			if (this.minFrequency > 0)
				variables.min_freq = this.minFrequency;

			var request:SplunkRequest = new SplunkRequest("summary");
			request.variables = variables;

			return request;
		}

	}

}
