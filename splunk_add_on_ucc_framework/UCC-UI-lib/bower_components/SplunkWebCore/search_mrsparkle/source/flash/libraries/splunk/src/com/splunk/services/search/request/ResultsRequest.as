package com.splunk.services.search.request
{

	import com.splunk.services.SplunkRequest;

	public class ResultsRequest
	{

		// Public Properties

		public var offset:int;
		public var count:int;
		public var search:String;
		public var fieldList:Array;
		public var preview:Boolean;

		// Constructor

		public function ResultsRequest(offset:int = 0, count:int = 100)
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
			if (this.search)
				variables.search = this.search;
			if (this.fieldList)
				variables.field_list = this.fieldList.join(",");
			variables.output_mode = "csv";
			variables.segmentation = "raw";
			variables.show_offset = 1;

			var request:SplunkRequest = new SplunkRequest();
			request.path = this.preview ? "results_preview" : "results";
			request.variables = variables;

			return request;
		}

	}

}
