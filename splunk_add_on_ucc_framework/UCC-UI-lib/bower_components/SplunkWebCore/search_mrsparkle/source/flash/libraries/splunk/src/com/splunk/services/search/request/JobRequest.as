package com.splunk.services.search.request
{

	import com.splunk.services.SplunkRequest;
	import com.splunk.time.DateTime;
	import flash.net.URLRequestMethod;

	public class JobRequest
	{

		// Public Properties

		public var search:String;
		public var remoteServerList:Array;
		public var earliestTime:DateTime;
		public var latestTime:DateTime;
		public var now:DateTime;
		public var executionMode:String;
		public var id:String;
		public var statusBuckets:int;
		public var maxCount:int;
		public var maxTime:int;
		public var timeout:int;
		public var enableLookups:Boolean = true;
		public var reloadMacros:Boolean = true;
		public var reduceFrequency:int;
		public var spawnProcess:Boolean = true;
		public var requiredFieldList:Array;
		public var autoCancel:int;
		public var autoPause:int;
		public var namespace:String;

		// Constructor

		public function JobRequest(search:String = null)
		{
			this.search = search;
		}

		// Public Methods

		public function toSplunkRequest() : SplunkRequest
		{
			var variables:Object = new Object();
			if (this.search)
				variables.search = this.search;
			if (this.remoteServerList)
				variables.remote_server_list = this.remoteServerList.join(",");
			if (this.earliestTime)
				variables.earliest_time = this.earliestTime.time;
			if (this.latestTime)
				variables.latest_time = this.latestTime.time;
			if (this.now)
				variables.now = this.now.time;
			if (this.executionMode)
				variables.exec_mode = this.executionMode;
			if (this.id)
				variables.id = this.id;
			if (this.statusBuckets > 0)
				variables.status_buckets = this.statusBuckets;
			if (this.maxCount > 0)
				variables.max_count = this.maxCount;
			if (this.maxTime > 0)
				variables.max_time = this.maxTime;
			if (this.timeout > 0)
				variables.timeout = this.timeout;
			if (!this.enableLookups)
				variables.enable_lookups = 0;
			if (!this.reloadMacros)
				variables.reload_macros = 0;
			if (this.reduceFrequency > 0)
				variables.reduce_freq = this.reduceFrequency;
			if (!this.spawnProcess)
				variables.spawn_process = 0;
			if (this.requiredFieldList)
				variables.required_field_list = this.requiredFieldList.join(",");
			if (this.autoCancel > 0)
				variables.auto_cancel = this.autoCancel;
			if (this.autoPause > 0)
				variables.auto_pause = this.autoPause;
			if (this.namespace)
				variables.namespace = this.namespace;

			var request:SplunkRequest = new SplunkRequest("search/jobs");
			request.variables = variables;
			request.method = URLRequestMethod.POST;

			return request;
		}

	}

}
