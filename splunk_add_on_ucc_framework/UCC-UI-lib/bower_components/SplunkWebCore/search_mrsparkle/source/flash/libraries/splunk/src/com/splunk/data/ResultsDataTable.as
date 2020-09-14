package com.splunk.data
{

	import com.splunk.services.SplunkService;
	import com.splunk.services.events.ServiceEvent;
	import com.splunk.services.events.ServiceErrorEvent;
	import com.splunk.services.search.SearchJob;
	import com.splunk.services.search.SearchJobResults;
	import com.splunk.services.search.data.ResultsData;
	import com.splunk.services.search.request.ResultsRequest;
	import flash.events.ErrorEvent;
	import flash.events.Event;

	[Event(name="complete", type="flash.events.Event")]
	[Event(name="error", type="flash.events.ErrorEvent")]

	public class ResultsDataTable extends DataTable implements IDataLoadable
	{

		// Private Properties

		private var _hostPath:String;
		private var _basePath:String;
		private var _sessionKey:String;
		private var _jobID:String;
		private var _offset:int = 0;
		private var _count:int = 1000;
		private var _search:String;
		private var _preview:Boolean = true;
		private var _fieldListMode:String = "hide_show";
		private var _fieldShowList:Array;
		private var _fieldHideList:Array;

		private var _loadHostPath:String;
		private var _loadBasePath:String;
		private var _loadSessionKey:String;
		private var _loadJobID:String;
		private var _loadOffset:int;
		private var _loadCount:int;
		private var _loadSearch:String;
		private var _loadPreview:Boolean;

		private var _service:SplunkService;
		private var _job:SearchJob;
		private var _results:SearchJobResults;
		private var _resultsData:ResultsData;

		// Constructor

		public function ResultsDataTable(hostPath:String = "http://localhost:8000", basePath:String = "/splunkd", sessionKey:String = null)
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

		public function get search() : String
		{
			return this._search;
		}
		public function set search(value:String) : void
		{
			this._search = value;
		}

		public function get preview() : Boolean
		{
			return this._preview;
		}
		public function set preview(value:Boolean) : void
		{
			this._preview = value;
		}

		public function get fieldListMode() : String
		{
			return this._fieldListMode;
		}
		public function set fieldListMode(value:String) : void
		{
			this._fieldListMode = value;
			this._updateData();
		}

		public function get fieldShowList() : Array
		{
			return this._fieldShowList;
		}
		public function set fieldShowList(value:Array) : void
		{
			this._fieldShowList = value;
			this._updateData();
		}

		public function get fieldHideList() : Array
		{
			return this._fieldHideList;
		}
		public function set fieldHideList(value:Array) : void
		{
			this._fieldHideList = value;
			this._updateData();
		}

		public function get resultsData() : ResultsData
		{
			return this._resultsData;
		}

		// Public Methods

		public function load() : void
		{
			var resultsData:ResultsData = this._resultsData;

			this.close();

			if (!this._jobID)
			{
				this._updateData();
				this.dispatchEvent(new Event(Event.COMPLETE));
				return;
			}

			this._resultsData = resultsData;

			this._loadHostPath = this._hostPath;
			this._loadBasePath = this._basePath;
			this._loadSessionKey = this._sessionKey;
			this._loadJobID = this._jobID;
			this._loadOffset = this._offset;
			this._loadCount = this._count;
			this._loadSearch = this._search;
			this._loadPreview = this._preview;

			this._service = new SplunkService(this._loadHostPath, this._loadBasePath);
			this._service.addEventListener(ServiceEvent.CONNECT, this._service_connect);
			this._service.addEventListener(ServiceErrorEvent.ERROR, this._service_error);

			this._job = new SearchJob(this._service);
			this._job.addEventListener(ServiceEvent.CONNECT, this._job_connect);
			this._job.addEventListener(ServiceErrorEvent.ERROR, this._job_error);

			this._results = new SearchJobResults(this._job);
			this._results.addEventListener(ServiceEvent.COMPLETE, this._results_complete);
			this._results.addEventListener(ServiceErrorEvent.ERROR, this._results_error);

			this._service.loadSession(this._loadSessionKey, false);
		}

		public function close() : void
		{
			if (!this._service)
				return;

			this._resultsData = null;

			this._results.close();
			this._results = null;

			this._job.close();
			this._job = null;

			this._service.close();
			this._service = null;
		}

		// Private Methods

		private function _updateData() : void
		{
			if (!this._resultsData)
			{
				if ((this.numRows != 0) && (this.numColumns != 0))
					this.setData(null, null);
				return;
			}

			var results:Array = this._resultsData.results;
			var fields:Array = this._resultsData.fields;

			var visibleFields:Array = new Array();

			var fieldListMode:String = this._fieldListMode;
			var fieldShowList:Array = this._fieldShowList;
			var fieldHideList:Array = this._fieldHideList;
			var showAll:Boolean = (fieldShowList && (fieldShowList.indexOf("*") >= 0));
			var hideAll:Boolean = (fieldHideList && (fieldHideList.indexOf("*") >= 0));
			var showField:Boolean;
			var field:String;

			if (fieldListMode == "show_hide")
			{
				for each (field in fields)
				{
					if (fieldShowList && (showAll || (fieldShowList.indexOf(field) >= 0)))
						showField = true;
					else if (fieldHideList && (hideAll || (fieldHideList.indexOf(field) >= 0)))
						showField = false;
					else if ((field.charAt(0) != "_") || (field == "_time"))
						showField = true;
					else
						showField = false;

					if (showField)
						visibleFields.push(field);
				}
			}
			else if (fieldListMode == "hide_show")
			{
				for each (field in fields)
				{
					if (fieldHideList && (hideAll || (fieldHideList.indexOf(field) >= 0)))
						showField = false;
					else if (fieldShowList && (showAll || (fieldShowList.indexOf(field) >= 0)))
						showField = true;
					else if ((field.charAt(0) != "_") || (field == "_time"))
						showField = true;
					else
						showField = false;

					if (showField)
						visibleFields.push(field);
				}
			}
			else
			{
				for each (field in fields)
				{
					if ((field.charAt(0) != "_") || (field == "_time"))
						visibleFields.push(field);
				}
			}

			if ((results.length > 0) && (visibleFields.length > 0))
				this.setData(results, visibleFields);
			else
				this.setData(null, null);
		}

		private function _service_connect(e:ServiceEvent) : void
		{
			this._job.loadJob(this._loadJobID, false);
		}

		private function _service_error(e:ServiceErrorEvent) : void
		{
			this._resultsData = null;
			this._updateData();
			this.dispatchEvent(new ErrorEvent(ErrorEvent.ERROR, false, false, e.text));
		}

		private function _job_connect(e:ServiceEvent) : void
		{
			var request:ResultsRequest = new ResultsRequest(this._loadOffset, this._loadCount);
			request.search = this._loadSearch;
			request.preview = this._loadPreview;
			this._results.load(request);
		}

		private function _job_error(e:ServiceErrorEvent) : void
		{
			this._resultsData = null;
			this._updateData();
			this.dispatchEvent(new ErrorEvent(ErrorEvent.ERROR, false, false, e.text));
		}

		private function _results_complete(e:ServiceEvent) : void
		{
			this._resultsData = this._results.data;
			this._updateData();
			this.dispatchEvent(new Event(Event.COMPLETE));
		}

		private function _results_error(e:ServiceErrorEvent) : void
		{
			this._resultsData = null;
			this._updateData();
			this.dispatchEvent(new ErrorEvent(ErrorEvent.ERROR, false, false, e.text));
		}

	}

}
