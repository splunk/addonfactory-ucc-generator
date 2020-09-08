package com.splunk.services.search.request
{

	import com.splunk.services.SplunkRequest;
	import com.splunk.time.DateTime;

	public class TimelineRequest
	{

		// Public Properties

		public var offset:int;
		public var count:int;

		// Constructor

		public function TimelineRequest(offset:int = 0, count:int = 1000)
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

			var request:SplunkRequest = new SplunkRequest("timeline");
			request.variables = variables;

			return request;
		}

	}

}
