package com.splunk.data
{

	import com.splunk.services.SplunkService;
	import com.splunk.services.events.ServiceEvent;
	import com.splunk.services.events.ServiceErrorEvent;
	import com.splunk.services.search.SearchJob;
	import com.splunk.services.search.SearchJobTimeline;
	import com.splunk.services.search.data.TimelineData;
	import com.splunk.services.search.request.TimelineRequest;
	import flash.events.ErrorEvent;
	import flash.events.Event;

	[Event(name="complete", type="flash.events.Event")]
	[Event(name="error", type="flash.events.ErrorEvent")]

	public class TimelineDataTable extends DataTable implements IDataLoadable
	{

		// Private Properties

		private var _hostPath:String;
		private var _basePath:String;
		private var _sessionKey:String;
		private var _jobID:String;
		private var _offset:int = 0;
		private var _count:int = 1000;

		private var _loadHostPath:String;
		private var _loadBasePath:String;
		private var _loadSessionKey:String;
		private var _loadJobID:String;
		private var _loadOffset:int;
		private var _loadCount:int;

		private var _service:SplunkService;
		private var _job:SearchJob;
		private var _timeline:SearchJobTimeline;
		private var _timelineData:TimelineData;

		// Constructor

		public function TimelineDataTable(hostPath:String = "http://localhost:8000", basePath:String = "/splunkd", sessionKey:String = null)
		{
			this._hostPath = hostPath;
			this._basePath = basePath;
			this._sessionKey = sessionKey;
		}

		// Public Getters/Setters

		public function get hostPath() : String
		{
			return this._hostPath;
		}
		public function set hostPath(value:String) : void
		{
			this._hostPath = value;
		}

		public function get basePath() : String
		{
			return this._basePath;
		}
		public function set basePath(value:String) : void
		{
			this._basePath = value;
		}

		public function get sessionKey() : String
		{
			return this._sessionKey;
		}
		public function set sessionKey(value:String) : void
		{
			this._sessionKey = value;
		}

		public function get jobID() : String
		{
			return this._jobID;
		}
		public function set jobID(value:String) : void
		{
			this._jobID = value;
		}

		public function get offset() : int
		{
			return this._offset;
		}
		public function set offset(value:int) : void
		{
			this._offset = value;
		}

		public function get count() : int
		{
			return this._count;
		}
		public function set count(value:int) : void
		{
			this._count = value;
		}

		public function get timelineData() : TimelineData
		{
			return this._timelineData;
		}

		// Public Methods

		public function load() : void
		{
			var timelineData:TimelineData = this._timelineData;

			this.close();

			if (!this._jobID)
			{
				this._updateData();
				this.dispatchEvent(new Event(Event.COMPLETE));
				return;
			}

			this._timelineData = timelineData;

			this._loadHostPath = this._hostPath;
			this._loadBasePath = this._basePath;
			this._loadSessionKey = this._sessionKey;
			this._loadJobID = this._jobID;
			this._loadOffset = this._offset;
			this._loadCount = this._count;

			this._service = new SplunkService(this._loadHostPath, this._loadBasePath);
			this._service.addEventListener(ServiceEvent.CONNECT, this._service_connect);
			this._service.addEventListener(ServiceErrorEvent.ERROR, this._service_error);

			this._job = new SearchJob(this._service);
			this._job.addEventListener(ServiceEvent.CONNECT, this._job_connect);
			this._job.addEventListener(ServiceErrorEvent.ERROR, this._job_error);

			this._timeline = new SearchJobTimeline(this._job);
			this._timeline.addEventListener(ServiceEvent.COMPLETE, this._timeline_complete);
			this._timeline.addEventListener(ServiceErrorEvent.ERROR, this._timeline_error);

			this._service.loadSession(this._loadSessionKey, false);
		}

		public function close() : void
		{
			if (!this._service)
				return;

			this._timelineData = null;

			this._timeline.close();
			this._timeline = null;

			this._job.close();
			this._job = null;

			this._service.close();
			this._service = null;
		}

		// Private Methods

		private function _updateData() : void
		{
			if (!this._timelineData)
			{
				if ((this.numRows != 0) && (this.numColumns != 0))
					this.setData(null, null);
				return;
			}

			var data:Array = this._timelineData.buckets;
			var fields:Array = [ "earliestTime", "latestTime", "eventCount" ];

			if (data.length > 0)
				this.setData(data, fields);
			else
				this.setData(null, null);
		}

		private function _service_connect(e:ServiceEvent) : void
		{
			this._job.loadJob(this._loadJobID, false);
		}

		private function _service_error(e:ServiceErrorEvent) : void
		{
			this._timelineData = null;
			this._updateData();
			this.dispatchEvent(new ErrorEvent(ErrorEvent.ERROR, false, false, e.text));
		}

		private function _job_connect(e:ServiceEvent) : void
		{
			this._timeline.load(new TimelineRequest(this._loadOffset, this._loadCount));
		}

		private function _job_error(e:ServiceErrorEvent) : void
		{
			this._timelineData = null;
			this._updateData();
			this.dispatchEvent(new ErrorEvent(ErrorEvent.ERROR, false, false, e.text));
		}

		private function _timeline_complete(e:ServiceEvent) : void
		{
			this._timelineData = this._timeline.data;
			this._updateData();
			this.dispatchEvent(new Event(Event.COMPLETE));
		}

		private function _timeline_error(e:ServiceErrorEvent) : void
		{
			this._timelineData = null;
			this._updateData();
			this.dispatchEvent(new ErrorEvent(ErrorEvent.ERROR, false, false, e.text));
		}

	}

}
