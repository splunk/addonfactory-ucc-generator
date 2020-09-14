package com.splunk.services.search
{

	import com.splunk.services.SplunkRequest;
	import com.splunk.services.SplunkResponse;
	import com.splunk.services.SplunkService;
	import com.splunk.services.events.ServiceErrorEvent;
	import com.splunk.services.events.ServiceErrorType;
	import com.splunk.services.events.ServiceEvent;
	import com.splunk.services.events.ServiceProgressEvent;
	import com.splunk.services.namespaces.atom;
	import com.splunk.services.namespaces.splunk;
	import flash.events.EventDispatcher;

	/**
	 * Dispatched when a load operation starts.
	 * 
	 * @eventType com.splunk.services.events.ServiceEvent.OPEN
	 * 
	 * @see #load()
	 */
	[Event(name="open", type="com.splunk.services.events.ServiceEvent")]

	/**
	 * Dispatched as the load operation progresses.
	 * 
	 * @eventType com.splunk.services.events.ServiceProgressEvent.PROGRESS
	 * 
	 * @see #load()
	 */
	[Event(name="progress", type="com.splunk.services.events.ServiceProgressEvent")]

	/**
	 * Dispatched after the load operation is complete and a list of job IDs is
	 * available.
	 * 
	 * @eventType com.splunk.services.events.ServiceEvent.COMPLETE
	 * 
	 * @see #jobs
	 * @see #load()
	 */
	[Event(name="complete", type="com.splunk.services.events.ServiceEvent")]

	/**
	 * Dispatched if the connection is closed before the load operation is
	 * complete.
	 * 
	 * @eventType com.splunk.services.events.ServiceEvent.CLOSE
	 * 
	 * @see #close()
	 */
	[Event(name="close", type="com.splunk.services.events.ServiceEvent")]

	/**
	 * Dispatched if an error occurs that terminates the load operation.
	 * 
	 * @eventType com.splunk.services.events.ServiceErrorEvent.ERROR
	 * 
	 * @see #load()
	 */
	[Event(name="error", type="com.splunk.services.events.ServiceErrorEvent")]

	/**
	 * The SearchJobs class is used to retrieve a list of all existing search
	 * jobs on a particular Splunk server.
	 */
	public class SearchJobs extends EventDispatcher
	{

		// Private Properties

		private var _service:SplunkService;
		private var _jobs:Array;

		private var _isOpen:Boolean = false;
		private var _loadResponse:SplunkResponse;

		// Constructor

		/**
		 * Creates a new SearchJobs object.
		 * 
		 * @param service The SplunkService instance from which to retrieve
		 * search jobs.
		 * 
		 * @throws TypeError The value of the service parameter is null.
		 * 
		 * @see com.splunk.services.SplunkService
		 */
		public function SearchJobs(service:SplunkService)
		{
			if (!service)
				throw new TypeError("Parameter service must be non-null.");

			this._service = service;
			this._service.addEventListener(ServiceEvent.CLOSE, this._service_close, false, 0, true);
		}

		// Public Getters/Setters

		/**
		 * The SplunkService instance that this SearchJobs object connects to.
		 * This value corresponds to the value of the service parameter
		 * specified in the constructor.
		 * 
		 * @see com.splunk.services.SplunkService
		 */
		public function get service() : SplunkService
		{
			return this._service;
		}

		/**
		 * The list of search job IDs received from the load operation. The IDs
		 * are of type <code>String</code>. This property is populated only when
		 * the load operation is complete.
		 */
		public function get jobs() : Array
		{
			return this._jobs;
		}

		// Public Methods

		/**
		 * Loads a list of all search job IDs from the associated SplunkService
		 * instance. If a list is already loading, the load operation is closed.
		 */
		public function load() : void
		{
			// close previous load operation
			this.close();

			// create request
			var request:SplunkRequest = new SplunkRequest("search/jobs");

			// create loadResponse
			this._loadResponse = new SplunkResponse(this._service);
			this._loadResponse.addEventListener(ServiceEvent.OPEN, this._load_open);
			this._loadResponse.addEventListener(ServiceProgressEvent.PROGRESS, this._load_progress);
			this._loadResponse.addEventListener(ServiceEvent.COMPLETE, this._load_complete);
			this._loadResponse.addEventListener(ServiceErrorEvent.ERROR, this._load_error);

			// load
			this._loadResponse.load(request);
		}

		/**
		 * Closes the load operation in progress.
		 */
		public function close() : void
		{
			// close loadResponse
			if (this._loadResponse)
			{
				this._loadResponse.close();
				this._loadResponse = null;
			}

			// reset properties
			this._jobs = null;

			// notify close
			if (this._isOpen)
			{
				this._isOpen = false;
				this.dispatchEvent(new ServiceEvent(ServiceEvent.CLOSE));
			}
		}

		// Private Methods

		private function _load_open(e:ServiceEvent) : void
		{
			this._isOpen = true;
			this.dispatchEvent(e);
		}

		private function _load_progress(e:ServiceProgressEvent) : void
		{
			this.dispatchEvent(e);
		}

		private function _load_complete(e:ServiceEvent) : void
		{
			var response:SplunkResponse = this._loadResponse;
			this._isOpen = false;
			this._loadResponse = null;
			if (response.status == 200)
			{
				var root:XML;
				try
				{
					root = new XML(response.data);

					var jobs:Array = new Array();

					var idNodes:XMLList = root.atom::entry.atom::content.splunk::dict.splunk::key.(@name == "sid");
					for each (var idNode:XML in idNodes)
						jobs.push(idNode.toString());

					this._jobs = jobs;

					this.dispatchEvent(e);
				}
				catch (error:Error)
				{
					this.dispatchEvent(new ServiceErrorEvent(ServiceErrorEvent.ERROR, false, false, error.message, ServiceErrorType.DATA));
				}
				finally
				{
					// workaround for XML memory leak
					if (root)
						root.replace("*", null);
				}
			}
			else
			{
				this.dispatchEvent(new ServiceErrorEvent(ServiceErrorEvent.ERROR, false, false, "Invalid response status=" + response.status, ServiceErrorType.HTTP_STATUS));
			}
		}

		private function _load_error(e:ServiceErrorEvent) : void
		{
			this._isOpen = false;
			this._loadResponse = null;
			this.dispatchEvent(e);
		}

		private function _service_close(e:ServiceEvent) : void
		{
			this.close();
		}

	}

}
