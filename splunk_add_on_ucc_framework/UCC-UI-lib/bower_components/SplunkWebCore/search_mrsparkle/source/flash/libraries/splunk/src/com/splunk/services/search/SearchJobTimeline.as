package com.splunk.services.search
{

	import com.splunk.services.SplunkRequest;
	import com.splunk.services.SplunkResponse;
	import com.splunk.services.events.ServiceErrorEvent;
	import com.splunk.services.events.ServiceErrorType;
	import com.splunk.services.events.ServiceEvent;
	import com.splunk.services.events.ServiceProgressEvent;
	import com.splunk.services.search.data.JobData;
	import com.splunk.services.search.data.TimelineData;
	import com.splunk.services.search.request.TimelineRequest;
	import flash.events.EventDispatcher;
	import flash.events.TimerEvent;
	import flash.utils.Timer;

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
	 * Dispatched after the load operation is complete and timeline information
	 * is available.
	 * 
	 * @eventType com.splunk.services.events.ServiceEvent.COMPLETE
	 * 
	 * @see #data
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
	 * The SearchJobTimeline class is used to retrieve timeline information of
	 * the untransformed events from an existing search job.
	 */
	public class SearchJobTimeline extends EventDispatcher
	{

		// Private Properties

		private var _job:SearchJob;
		private var _data:TimelineData;
		private var _refreshInterval:Number = 0;

		private var _loadRequest:SplunkRequest;
		private var _loadResponse:SplunkResponse;
		private var _refreshTimer:Timer;
		private var _isJobDone:Boolean = false;
		private var _isJobPaused:Boolean = false;
		private var _isOpen:Boolean = false;

		// Constructor

		/**
		 * Creates a new SearchJobTimeline object.
		 * 
		 * @param job The SearchJob instance from which to retrieve timeline
		 * information.
		 * 
		 * @throws TypeError The value of the job parameter is null.
		 * 
		 * @see SearchJob
		 */
		public function SearchJobTimeline(job:SearchJob)
		{
			if (!job)
				throw new TypeError("Parameter job must be non-null.");

			this._job = job;
			this._job.addEventListener(ServiceEvent.CLOSE, this._job_close, false, 0, true);
		}

		// Public Getters/Setters

		/**
		 * The SearchJob instance that this SearchJobTimeline object connects
		 * to. This value corresponds to the value of the job parameter
		 * specified in the constructor.
		 * 
		 * @see SearchJob
		 */
		public function get job() : SearchJob
		{
			return this._job;
		}

		/**
		 * The timeline information received from the load operation. This
		 * property is populated only when the load operation is complete.
		 * 
		 * @see com.splunk.services.search.data.TimelineData
		 */
		public function get data() : TimelineData
		{
			return this._data;
		}

		/**
		 * The length of time, in seconds, between automatic reloads of timeline
		 * information. If set to zero or less, automatic reloads are disabled.
		 * 
		 * @default 0
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

		// Public Methods

		/**
		 * Loads timeline information from the associated SearchJob instance. If
		 * timeline information is already loading, the load operation is
		 * closed.
		 * 
		 * @param request A TimelineRequest object specifying the options for
		 * loading timeline information.
		 * 
		 * @see com.splunk.services.search.request.TimelineRequest
		 */
		public function load(request:TimelineRequest = null) : void
		{
			if (!request)
				request = new TimelineRequest();

			this._loadRequest = request.toSplunkRequest();
			this._loadRequest.path = "search/jobs/" + this._job.id + "/" + this._loadRequest.path;

			this._load();
		}

		/**
		 * Reloads timeline information from the associated SearchJob instance.
		 * If timeline information is already loading, the load operation is
		 * closed.
		 * 
		 * @see #refreshInterval
		 */
		public function refresh() : void
		{
			if (!this._loadRequest)
				return;

			this._load();
		}

		/**
		 * Closes the load operation in progress.
		 */
		public function close() : void
		{
			this._data = null;
			this._loadRequest = null;

			this._close();
		}

		// Private Methods

		private function _load() : void
		{
			// close previous load operation
			this._close();

			// check that job is connected
			if (!this._job.isConnected)
			{
				this.dispatchEvent(new ServiceErrorEvent(ServiceErrorEvent.ERROR, false, false, "Job not connected.", ServiceErrorType.CONNECTION));
				return;
			}

			// note job state
			var jobProperties:JobData = this._job.properties;
			this._isJobDone = (jobProperties && jobProperties.isDone);
			this._isJobPaused = (jobProperties && jobProperties.isPaused);

			// create loadResponse
			this._loadResponse = new SplunkResponse(this._job.service);
			this._loadResponse.addEventListener(ServiceEvent.OPEN, this._load_open);
			this._loadResponse.addEventListener(ServiceProgressEvent.PROGRESS, this._load_progress);
			this._loadResponse.addEventListener(ServiceEvent.COMPLETE, this._load_complete);
			this._loadResponse.addEventListener(ServiceErrorEvent.ERROR, this._load_error);

			// load
			this._loadResponse.load(this._loadRequest);
		}

		private function _close() : void
		{
			// remove unpause listener
			this._job.removeEventListener(ServiceEvent.UNPAUSE, this._job_unpause);

			// stop refreshTimer
			if (this._refreshTimer)
			{
				this._refreshTimer.stop();
				this._refreshTimer = null;
			}

			// close loadResponse
			if (this._loadResponse)
			{
				this._loadResponse.close();
				this._loadResponse = null;
			}

			// notify close
			if (this._isOpen)
			{
				this._isOpen = false;
				this.dispatchEvent(new ServiceEvent(ServiceEvent.CLOSE));
			}
		}

		private function _tryRefresh() : void
		{
			if (this._isJobPaused)
			{
				var jobProperties:JobData = this._job.properties;
				if (jobProperties && jobProperties.isPaused)
				{
					this._job.addEventListener(ServiceEvent.UNPAUSE, this._job_unpause, false, 0, true);
					return;
				}
			}

			this.refresh();
		}

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
			if (response.status == 200)
			{
				try
				{
					var data:TimelineData = new TimelineData(response.data);

					this._isOpen = false;
					this._data = data;

					this.dispatchEvent(e);

					if (this._loadResponse == response)
					{
						this._loadResponse = null;

						if ((this._refreshInterval > 0) && !this._isJobDone)
						{
							this._refreshTimer = new Timer(this._refreshInterval * 1000);
							this._refreshTimer.addEventListener(TimerEvent.TIMER, this._refreshTimer_timer);
							this._refreshTimer.start();
						}
					}
				}
				catch (error:Error)
				{
					this._load_error(new ServiceErrorEvent(ServiceErrorEvent.ERROR, false, false, error.message, ServiceErrorType.DATA));
				}
			}
			else
			{
				this._load_error(new ServiceErrorEvent(ServiceErrorEvent.ERROR, false, false, "Invalid response status=" + response.status, ServiceErrorType.HTTP_STATUS));
			}
		}

		private function _load_error(e:ServiceErrorEvent) : void
		{
			this._isOpen = false;
			this._loadResponse = null;

			this.dispatchEvent(e);
		}

		private function _refreshTimer_timer(e:TimerEvent) : void
		{
			this._tryRefresh();
		}

		private function _job_unpause(e:ServiceEvent) : void
		{
			this._job.removeEventListener(ServiceEvent.UNPAUSE, this._job_unpause);
			this._tryRefresh();
		}

		private function _job_close(e:ServiceEvent) : void
		{
			this.close();
		}

	}

}
