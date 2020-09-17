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

	public class ResultsDataGraph extends DataGraph implements IDataLoadable
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

		// Constructor

		public function ResultsDataGraph(hostPath:String = "http://localhost:8000", basePath:String = "/splunkd", sessionKey:String = null)
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

		// Public Methods

		public function load() : void
		{
			this.close();

			if (this._jobID != this._loadJobID)
			{
				for each (var node:* in this.getNodes())
					this.removeNode(node);
			}

			if (!this._jobID)
			{
				this.dispatchEvent(new Event(Event.COMPLETE));
				return;
			}

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

			this._results.close();
			this._results = null;

			this._job.close();
			this._job = null;

			this._service.close();
			this._service = null;
		}

		// Private Methods

		private function _processResults(resultsData:ResultsData) : void
		{
			if (!resultsData)
				return;

			for each (var event:Object in resultsData.results)
			{
				switch (event.action)
				{
					case "SET":
						this._processActionSet(event);
						break;
					case "UNSET":
						this._processActionUnset(event);
						break;
				}
			}
		}

		private function _processActionSet(event:Object) : void
		{
			var sourceNode:String = event.start;
			if (!sourceNode)
				return;

			var dataMap:IDataMap;
			var key:String;

			var targetNode:String = event.end;
			if (!targetNode)
			{
				if (!this.containsNode(sourceNode))
					this.addNode(sourceNode);

				dataMap = this.nodeData;
				key = sourceNode;
			}
			else
			{
				var edge:String = sourceNode + "." + targetNode;
				if (!this.containsEdge(edge))
					this.addEdge(edge, sourceNode, targetNode);

				dataMap = this.edgeData;
				key = edge;
			}

			for (var propertyName:String in event)
			{
				switch (propertyName)
				{
					case "action":
					case "start":
					case "end":
						break;
					default:
						if ((propertyName.charAt(0) != "_") || (propertyName == "_time"))
						{
							if (!dataMap.containsField(propertyName))
								dataMap.addField(propertyName);
							dataMap.setValue(key, propertyName, event[propertyName]);
						}
						break;
				}
			}
		}

		private function _processActionUnset(event:Object) : void
		{
			var sourceNode:String = event.start;
			if (!sourceNode)
				return;

			var targetNode:String = event.end;
			if (!targetNode)
			{
				if (this.containsNode(sourceNode))
					this.removeNode(sourceNode);
			}
			else
			{
				var edge:String = sourceNode + "." + targetNode;
				if (this.containsEdge(edge))
					this.removeEdge(edge);
			}
		}

		private function _service_connect(e:ServiceEvent) : void
		{
			this._job.loadJob(this._loadJobID, false);
		}

		private function _service_error(e:ServiceErrorEvent) : void
		{
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
			this.dispatchEvent(new ErrorEvent(ErrorEvent.ERROR, false, false, e.text));
		}

		private function _results_complete(e:ServiceEvent) : void
		{
			this._processResults(this._results.data);
			this.dispatchEvent(new Event(Event.COMPLETE));
		}

		private function _results_error(e:ServiceErrorEvent) : void
		{
			this.dispatchEvent(new ErrorEvent(ErrorEvent.ERROR, false, false, e.text));
		}

	}

}
