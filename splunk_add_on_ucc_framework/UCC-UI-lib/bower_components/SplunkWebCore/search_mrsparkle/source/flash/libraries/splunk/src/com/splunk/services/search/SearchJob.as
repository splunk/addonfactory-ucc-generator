package com.splunk.services.search
{

	import com.splunk.services.SplunkRequest;
	import com.splunk.services.SplunkResponse;
	import com.splunk.services.SplunkService;
	import com.splunk.services.events.ServiceErrorEvent;
	import com.splunk.services.events.ServiceErrorType;
	import com.splunk.services.events.ServiceEvent;
	import com.splunk.services.search.data.JobData;
	import com.splunk.services.search.request.JobRequest;
	import flash.events.EventDispatcher;
	import flash.events.TimerEvent;
	import flash.net.URLRequestMethod;
	import flash.utils.Dictionary;
	import flash.utils.Timer;

	/**
	 * Dispatched when a search job connection has been established.
	 * 
	 * @eventType com.splunk.services.events.ServiceEvent.CONNECT
	 * 
	 * @see #dispatch()
	 * @see #loadJob()
	 */
	[Event(name="connect", type="com.splunk.services.events.ServiceEvent")]

	/**
	 * Dispatched when the status of the search job has changed.
	 * 
	 * @eventType com.splunk.services.events.ServiceEvent.STATUS
	 * 
	 * @see #dispatch()
	 * @see #loadJob()
	 * @see #refresh()
	 */
	[Event(name="status", type="com.splunk.services.events.ServiceEvent")]

	/**
	 * Dispatched when the search job is done.
	 * 
	 * @eventType com.splunk.services.events.ServiceEvent.DONE
	 * 
	 * @see #dispatch()
	 * @see #loadJob()
	 */
	[Event(name="done", type="com.splunk.services.events.ServiceEvent")]

	/**
	 * Dispatched when the search job connection is closed.
	 * 
	 * @eventType com.splunk.services.events.ServiceEvent.CLOSE
	 * 
	 * @see #close()
	 */
	[Event(name="close", type="com.splunk.services.events.ServiceEvent")]

	/**
	 * Dispatched if an error occurs that terminates the search job connection.
	 * 
	 * @eventType com.splunk.services.events.ServiceErrorEvent.ERROR
	 * 
	 * @see #dispatch()
	 * @see #loadJob()
	 */
	[Event(name="error", type="com.splunk.services.events.ServiceErrorEvent")]

	/**
	 * Dispatched when a control action is executed.
	 * 
	 * @eventType com.splunk.services.events.ServiceEvent.CONTROL
	 * 
	 * @see #pause()
	 * @see #unpause()
	 * @see #finalize()
	 */
	[Event(name="control", type="com.splunk.services.events.ServiceEvent")]

	/**
	 * Dispatched if an error occurs during a control action.
	 * 
	 * @eventType com.splunk.services.events.ServiceErrorEvent.CONTROL_ERROR
	 * 
	 * @see #pause()
	 * @see #unpause()
	 * @see #finalize()
	 */
	[Event(name="controlError", type="com.splunk.services.events.ServiceErrorEvent")]

	/**
	 * Dispatched when the search job is paused.
	 * 
	 * @eventType com.splunk.services.events.ServiceEvent.PAUSE
	 * 
	 * @see #pause()
	 */
	[Event(name="pause", type="com.splunk.services.events.ServiceEvent")]

	/**
	 * Dispatched when the search job is unpaused.
	 * 
	 * @eventType com.splunk.services.events.ServiceEvent.UNPAUSE
	 * 
	 * @see #unpause()
	 */
	[Event(name="unpause", type="com.splunk.services.events.ServiceEvent")]

	/**
	 * Dispatched when the search job is finalized.
	 * 
	 * @eventType com.splunk.services.events.ServiceEvent.FINALIZE
	 * 
	 * @see #finalize()
	 */
	[Event(name="finalize", type="com.splunk.services.events.ServiceEvent")]

	/**
	 * The SearchJob class is used to dispatch a new search job or connect to an
	 * existing search job on a particular Splunk server.
	 */
	public class SearchJob extends EventDispatcher
	{

		// Private Properties

		private var _service:SplunkService;
		private var _id:String;
		private var _properties:JobData;
		private var _refreshInterval:Number = 0.25;
		private var _isConnected:Boolean = false;

		private var _loadJobID:String;
		private var _connectVerify:Object;
		private var _connectResponse:SplunkResponse;
		private var _statusResponse:SplunkResponse;
		private var _controlResponses:Dictionary;
		private var _controlActions:Dictionary;
		private var _refreshTimer:Timer;

		// Constructor

		/**
		 * Creates a new SearchJob object.
		 * 
		 * @param service The SplunkService instance on which to dispatch or
		 * connect to a search job.
		 * 
		 * @throws TypeError The value of the service parameter is null.
		 * 
		 * @see com.splunk.services.SplunkService
		 */
		public function SearchJob(service:SplunkService)
		{
			if (!service)
				throw new TypeError("Parameter service must be non-null.");

			this._service = service;
			this._service.addEventListener(ServiceEvent.CLOSE, this._service_close, false, 0, true);

			this._controlResponses = new Dictionary();
			this._controlActions = new Dictionary();
		}

		// Public Getters/Setters

		/**
		 * The SplunkService instance that this SearchJob object connects to.
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
		 * The identifier for the current job.
		 */
		public function get id() : String
		{
			return this._id;
		}

		/**
		 * The properties for the current job. This value is updated each time
		 * the <code>status</code> event is dispatched.
		 * 
		 * @see com.splunk.services.search.data.JobData
		 */
		public function get properties() : JobData
		{
			return this._properties;
		}

		/**
		 * The length of time, in seconds, between automatic refreshes of job
		 * properties. If set to zero or less, automatic refresh is disabled.
		 * 
		 * @default 0.25
		 * 
		 * @see #refresh()
		 */
		public function get refreshInterval() : Number
		{
			return this._refreshInterval;
		}
		public function set refreshInterval(value:Number) : void
		{
			this._refreshInterval = value;
		}

		/**
		 * Indicates whether this SearchJob object is currently connected.
		 */
		public function get isConnected() : Boolean
		{
			return this._isConnected;
		}

		// Public Methods

		/**
		 * Dispatches a new search job on the associated SplunkService instance.
		 * If a job is already connected, the connection is closed.
		 * 
		 * @param request A JobRequest object specifying the search string and
		 * other options for dispatching a search job.
		 * 
		 * @see com.splunk.services.search.request.JobRequest
		 * 
		 * @throws TypeError The value of the request parameter is null.
		 * @throws ArgumentError The value of the search property on the
		 * supplied request object is empty.
		 */
		public function dispatch(request:JobRequest) : void
		{
			// validate arguments
			if (!request)
				throw new TypeError("Parameter request must be non-null.");
			if (!request.search)
				throw new ArgumentError("Property search on the supplied request object must be non-empty.");

			// close previous connection
			this.close();

			// store properties for this request
			this._connectVerify = new Object();

			// create connectResponse
			this._connectResponse = new SplunkResponse(this._service);
			this._connectResponse.addEventListener(ServiceEvent.COMPLETE, this._dispatch_complete);
			this._connectResponse.addEventListener(ServiceErrorEvent.ERROR, this._dispatch_error);

			// load
			this._connectResponse.load(request.toSplunkRequest());
		}

		/**
		 * Connects to an existing search job from the associated SplunkService
		 * instance. If a job is already connected, the connection is closed.
		 * 
		 * @param jobID The ID of the job to connect to.
		 * @param validate Whether to validate the jobID by sending a request to
		 * the server.
		 * 
		 * @throws TypeError The value of the jobID parameter is empty.
		 */
		public function loadJob(jobID:String, validate:Boolean = true) : void
		{
			// validate arguments
			if (!jobID)
				throw new TypeError("Parameter jobID must be non-empty.");

			// close previous connection
			this.close();

			// store properties for this request
			this._connectVerify = new Object();
			this._loadJobID = jobID;

			if (validate)
			{
				// create request
				var request:SplunkRequest = new SplunkRequest("search/jobs/" + jobID);

				// create connectResponse
				this._connectResponse = new SplunkResponse(this._service);
				this._connectResponse.addEventListener(ServiceEvent.COMPLETE, this._loadJob_complete);
				this._connectResponse.addEventListener(ServiceErrorEvent.ERROR, this._loadJob_error);

				// load
				this._connectResponse.load(request);
			}
			else
			{
				// check that service is connected
				if (!this._service.isConnected)
				{
					this.dispatchEvent(new ServiceErrorEvent(ServiceErrorEvent.ERROR, false, false, "Service not connected.", ServiceErrorType.CONNECTION));
					return;
				}

				this._id = this._loadJobID;
				this._isConnected = true;

				this.dispatchEvent(new ServiceEvent(ServiceEvent.CONNECT));
			}
		}

		/**
		 * Updates the current job object with the current job properties on the
		 * Splunk server.
		 * 
		 * @see #refreshInterval
		 */
		public function refresh() : void
		{
			this._loadStatus();
		}

		/**
		 * Closes the job connection and optionally deletes the job from the
		 * server.
		 * 
		 * @param deleteJob Whether to delete the job from the server when
		 * closing.
		 */
		public function close(deleteJob:Boolean = false) : void
		{
			// close connectResponse
			if (this._connectResponse)
			{
				this._connectResponse.close();
				this._connectResponse = null;
			}

			// close status
			this._closeStatus();

			// close control
			this._closeControl();

			// delete job from server if requested
			if (deleteJob)
			{
				var variables:Object = new Object();
				variables.action = "cancel";

				var request:SplunkRequest = new SplunkRequest("search/jobs/" + this._id + "/control");
				request.variables = variables;
				request.method = URLRequestMethod.POST;

				var response:SplunkResponse = new SplunkResponse(this._service);
				response.load(request);
			}

			// reset properties
			this._id = null;
			this._properties = null;
			this._loadJobID = null;
			this._connectVerify = null;

			// notify close
			if (this._isConnected)
			{
				this._isConnected = false;
				this.dispatchEvent(new ServiceEvent(ServiceEvent.CLOSE));
			}
		}

		/**
		 * Suspends the execution of the search job.
		 */
		public function pause() : void
		{
			this._sendControl("pause");
		}

		/**
		 * Resumes the execution of the search job, if paused.
		 */
		public function unpause() : void
		{
			this._sendControl("unpause");
		}

		/**
		 * Stops the search, and provides intermediate results to SearchJobResults.
		 * 
		 * @see SearchJobResults
		 */
		public function finalize() : void
		{
			this._sendControl("finalize");
		}

		/**
		 * Extends the expiration time of the search job to now + ttl.
		 */
		public function touch() : void
		{
			this._sendControl("touch");
		}

		/**
		 * Change the ttl of the search job.
		 * 
		 * @param value The ttl, in seconds.
		 */
		public function setTTL(value:Number) : void
		{
			this._sendControl("ttl", { ttl: value });
		}

		/**
		 * Sets the priority of the search process.
		 * 
		 * @param value The priority, from 0 to 10.
		 */
		public function setPriority(value:Number) : void
		{
			this._sendControl("priority", { priority: value });
		}

		/**
		 * Enable preview generation for the job (may slow search considerably).
		 */
		public function enablePreview() : void
		{
			this._sendControl("enablepreview");
		}

		/**
		 * Disable preview generation for the job.
		 */
		public function disablePreview() : void
		{
			this._sendControl("disablepreview");
		}

		// Private Methods

		private function _loadStatus() : void
		{
			this._closeStatus();

			if (!this._isConnected)
				return;

			var request:SplunkRequest = new SplunkRequest("search/jobs/" + this._id);

			this._statusResponse = new SplunkResponse(this._service);
			this._statusResponse.addEventListener(ServiceEvent.COMPLETE, this._loadStatus_complete);
			this._statusResponse.addEventListener(ServiceErrorEvent.ERROR, this._loadStatus_error);

			this._statusResponse.load(request);
		}

		private function _closeStatus() : void
		{
			if (this._refreshTimer)
			{
				this._refreshTimer.stop();
				this._refreshTimer = null;
			}

			if (this._statusResponse)
			{
				this._statusResponse.close();
				this._statusResponse = null;
			}
		}

		private function _sendControl(action:String, parameters:Object = null) : void
		{
			this._closeControl(action);

			if (!this._isConnected)
				return;

			var variables:Object = new Object();
			variables.action = action;
			for (var p:String in parameters)
				variables[p] = parameters[p];

			var request:SplunkRequest = new SplunkRequest("search/jobs/" + this._id + "/control");
			request.variables = variables;
			request.method = URLRequestMethod.POST;

			var response:SplunkResponse = new SplunkResponse(this._service);
			response.addEventListener(ServiceEvent.COMPLETE, this._sendControl_complete);
			response.addEventListener(ServiceErrorEvent.ERROR, this._sendControl_error);

			this._controlResponses[action] = response;
			this._controlActions[response] = action;

			response.load(request);
		}

		private function _closeControl(action:String = null) : void
		{
			if (!action)
			{
				var actions:Array = new Array();
				for each (action in this._controlActions)
					actions.push(action);
				for each (action in actions)
					this._closeControl(action);
				return;
			}

			var response:SplunkResponse = this._controlResponses[action];
			if (!response)
				return;

			delete this._controlResponses[action];
			delete this._controlActions[response];

			response.close();
		}

		private function _dispatch_complete(e:ServiceEvent) : void
		{
			var response:SplunkResponse = this._connectResponse;
			this._connectResponse = null;
			if (response.status == 200)
			{
				var root:XML;
				try
				{
					root = new XML(response.data);
					var sid:String = root.sid.toString();
					if (!sid)
						throw new TypeError("Data parse error: jobID not found.");

					var connectVerify:Object = this._connectVerify;

					this._id = sid;
					this._isConnected = true;

					this.dispatchEvent(new ServiceEvent(ServiceEvent.CONNECT));

					if (this._connectVerify == connectVerify)
						this._loadStatus();
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
				this.dispatchEvent(new ServiceErrorEvent(ServiceErrorEvent.ERROR, false, false, "Invalid response status: status=" + response.status, ServiceErrorType.HTTP_STATUS));
			}
		}

		private function _dispatch_error(e:ServiceErrorEvent) : void
		{
			this._connectResponse = null;

			this.dispatchEvent(new ServiceErrorEvent(ServiceErrorEvent.ERROR, false, false, e.text, e.errorType, e.messages));
		}

		private function _loadJob_complete(e:ServiceEvent) : void
		{
			var response:SplunkResponse = this._connectResponse;
			this._connectResponse = null;
			if (response.status == 200)
			{
				try
				{
					var jobData:JobData = new JobData(response.data);

					var connectVerify:Object = this._connectVerify;

					this._id = this._loadJobID;
					this._isConnected = true;

					this.dispatchEvent(new ServiceEvent(ServiceEvent.CONNECT));

					if (this._connectVerify == connectVerify)
						this._loadStatus();
				}
				catch (error:Error)
				{
					this.dispatchEvent(new ServiceErrorEvent(ServiceErrorEvent.ERROR, false, false, error.message, ServiceErrorType.DATA));
				}
			}
			else
			{
				this.dispatchEvent(new ServiceErrorEvent(ServiceErrorEvent.ERROR, false, false, "Invalid response status: status=" + response.status, ServiceErrorType.HTTP_STATUS));
			}
		}

		private function _loadJob_error(e:ServiceErrorEvent) : void
		{
			this._connectResponse = null;

			this.dispatchEvent(new ServiceErrorEvent(ServiceErrorEvent.ERROR, false, false, e.text, e.errorType, e.messages));
		}

		private function _loadStatus_complete(e:ServiceEvent) : void
		{
			var response:SplunkResponse = this._statusResponse;
			this._statusResponse = null;
			if (response.status == 200)
			{
				try
				{
					var properties:JobData = new JobData(response.data);

					var connectVerify:Object = this._connectVerify;

					var notifyPause:Boolean;
					var notifyUnpause:Boolean;
					var notifyFinalize:Boolean;
					var notifyDone:Boolean;

					if (!this._properties)
					{
						notifyPause = properties.isPaused;
						notifyUnpause = false;
						notifyFinalize = properties.isFinalized;
						notifyDone = properties.isDone;
					}
					else
					{
						notifyPause = !this._properties.isPaused && properties.isPaused;
						notifyUnpause = this._properties.isPaused && !properties.isPaused;
						notifyFinalize = !this._properties.isFinalized && properties.isFinalized;
						notifyDone = !this._properties.isDone && properties.isDone;
					}

					this._properties = properties;

					this.dispatchEvent(new ServiceEvent(ServiceEvent.STATUS));

					if (notifyPause && (this._connectVerify == connectVerify))
						this.dispatchEvent(new ServiceEvent(ServiceEvent.PAUSE));
					if (notifyUnpause && (this._connectVerify == connectVerify))
						this.dispatchEvent(new ServiceEvent(ServiceEvent.UNPAUSE));
					if (notifyFinalize && (this._connectVerify == connectVerify))
						this.dispatchEvent(new ServiceEvent(ServiceEvent.FINALIZE));
					if (notifyDone && (this._connectVerify == connectVerify))
						this.dispatchEvent(new ServiceEvent(ServiceEvent.DONE));

					if ((this._refreshInterval > 0) && !properties.isPaused && !properties.isDone && (this._connectVerify == connectVerify))
					{
						this._refreshTimer = new Timer(this._refreshInterval * 1000);
						this._refreshTimer.addEventListener(TimerEvent.TIMER, this._refreshTimer_timer);
						this._refreshTimer.start();
					}
				}
				catch (error:Error)
				{
					this.dispatchEvent(new ServiceErrorEvent(ServiceErrorEvent.ERROR, false, false, error.message, ServiceErrorType.DATA));
				}
			}
			else
			{
				this.dispatchEvent(new ServiceErrorEvent(ServiceErrorEvent.ERROR, false, false, "Invalid response status: status=" + response.status, ServiceErrorType.HTTP_STATUS));
			}
		}

		private function _loadStatus_error(e:ServiceErrorEvent) : void
		{
			this._statusResponse = null;

			this.dispatchEvent(new ServiceErrorEvent(ServiceErrorEvent.ERROR, false, false, e.text, e.errorType, e.messages));
		}

		private function _sendControl_complete(e:ServiceEvent) : void
		{
			var response:SplunkResponse = e.target as SplunkResponse;
			var action:String = this._controlActions[response];
			delete this._controlResponses[action];
			delete this._controlActions[response];
			if (response.status == 200)
			{
				var connectVerify:Object = this._connectVerify;

				this.dispatchEvent(new ServiceEvent(ServiceEvent.CONTROL));

				if ((this._refreshInterval > 0) && (this._connectVerify == connectVerify))
					this.refresh();
			}
			else
			{
				this.dispatchEvent(new ServiceErrorEvent(ServiceErrorEvent.CONTROL_ERROR, false, false, "Invalid response status: status=" + response.status, ServiceErrorType.HTTP_STATUS));
			}
		}

		private function _sendControl_error(e:ServiceErrorEvent) : void
		{
			var response:SplunkResponse = e.target as SplunkResponse;
			var action:String = this._controlActions[response];
			delete this._controlResponses[action];
			delete this._controlActions[response];

			this.dispatchEvent(new ServiceErrorEvent(ServiceErrorEvent.CONTROL_ERROR, false, false, e.text, e.errorType, e.messages));
		}

		private function _refreshTimer_timer(e:TimerEvent) : void
		{
			this.refresh();
		}

		private function _service_close(e:ServiceEvent) : void
		{
			this.close();
		}

	}

}
