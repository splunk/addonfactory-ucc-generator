package com.splunk.services.search.data
{

	import com.splunk.services.namespaces.atom;
	import com.splunk.services.namespaces.splunk;
	import com.splunk.time.DateTime;

	/**
	 * The JobData class represents job summary information received from a
	 * search job.
	 */
	public class JobData
	{

		// Private Properties

		private var _id:String;
		private var _searchString:String;
		private var _username:String;
		private var _createTime:DateTime;
		private var _modifiedTime:DateTime;
		private var _cursorTime:DateTime;
		private var _earliestTime:DateTime;
		private var _latestTime:DateTime;
		private var _eventCount:int;
		private var _eventAvailableCount:int;
		private var _eventSearch:String;
		private var _eventSorting:String;
		private var _eventIsStreaming:Boolean;
		private var _eventIsTruncated:Boolean;
		private var _resultCount:int;
		private var _resultPreviewCount:int;
		private var _resultIsStreaming:Boolean;
		private var _scanCount:int;
		private var _statusBuckets:int;
		private var _runDuration:Number;
		private var _doneProgress:Number;
		private var _ttl:Number;
		private var _remoteSearch:String;
		private var _reportSearch:String;
		//private var _keywords:???;
		private var _label:String;
		//private var _searchProviders:???;
		private var _delegate:String;
		private var _request:Object;
		private var _error:String;
		private var _isPaused:Boolean;
		private var _isFinalized:Boolean;
		private var _isDone:Boolean;
		private var _isSaved:Boolean;
		private var _isSavedSearch:Boolean;
		private var _isZombie:Boolean;
		private var _isFailed:Boolean;

		// Constructor

		/**
		 * Creates a new JobData object.
		 * 
		 * @param value Any object that can be converted to an XML object.
		 * 
		 * @throws TypeError The value parameter cannot be parsed.
		 */
		public function JobData(value:Object)
		{
			var root:XML;
			try
			{
				if (value == null)
					throw new TypeError("Data parse error: data is null.");

				root = new XML(value);

				var contentKeys:XMLList = root.atom::content.splunk::dict.splunk::key;

				this._id = DataUtils.parseString(contentKeys.(@name == "sid"));
				this._searchString = DataUtils.parseString(root.atom::title);
				this._username = DataUtils.parseString(root.atom::author.atom::name);
				this._createTime = DataUtils.parseISOTime(root.atom::published);
				this._modifiedTime = DataUtils.parseISOTime(root.atom::updated);
				this._cursorTime = DataUtils.parseISOTime(contentKeys.(@name == "cursorTime"));
				this._earliestTime = DataUtils.parseISOTime(contentKeys.(@name == "earliestTime"));
				this._latestTime = DataUtils.parseISOTime(contentKeys.(@name == "latestTime"));
				this._eventCount = DataUtils.parseInt(contentKeys.(@name == "eventCount"));
				this._eventAvailableCount = DataUtils.parseInt(contentKeys.(@name == "eventAvailableCount"));
				this._eventSearch = DataUtils.parseString(contentKeys.(@name == "eventSearch"));
				this._eventSorting = DataUtils.parseString(contentKeys.(@name == "eventSorting"));
				this._eventIsStreaming = DataUtils.parseBoolean(contentKeys.(@name == "eventIsStreaming"));
				this._eventIsTruncated = DataUtils.parseBoolean(contentKeys.(@name == "eventIsTruncated"));
				this._resultCount = DataUtils.parseInt(contentKeys.(@name == "resultCount"));
				this._resultPreviewCount = DataUtils.parseInt(contentKeys.(@name == "resultPreviewCount"));
				this._resultIsStreaming = DataUtils.parseBoolean(contentKeys.(@name == "resultIsStreaming"));
				this._scanCount = DataUtils.parseInt(contentKeys.(@name == "scanCount"));
				this._statusBuckets = DataUtils.parseInt(contentKeys.(@name == "statusBuckets"));
				this._runDuration = DataUtils.parseNumber(contentKeys.(@name == "runDuration"));
				this._doneProgress = DataUtils.parseNumber(contentKeys.(@name == "doneProgress"));
				this._ttl = DataUtils.parseNumber(contentKeys.(@name == "ttl"));
				this._remoteSearch = DataUtils.parseString(contentKeys.(@name == "remoteSearch"));
				this._reportSearch = DataUtils.parseString(contentKeys.(@name == "reportSearch"));
				//this._keywords = ???;
				this._label = DataUtils.parseString(contentKeys.(@name == "label"));
				//this._searchProviders = ???;
				this._delegate = DataUtils.parseString(contentKeys.(@name == "delegate"));
				this._request = DataUtils.parseDictionary(contentKeys.(@name == "request"));
				this._error = DataUtils.parseString(contentKeys.(@name == "error"));
				this._isPaused = DataUtils.parseBoolean(contentKeys.(@name == "isPaused"));
				this._isFinalized = DataUtils.parseBoolean(contentKeys.(@name == "isFinalized"));
				this._isDone = DataUtils.parseBoolean(contentKeys.(@name == "isDone"));
				this._isSaved = DataUtils.parseBoolean(contentKeys.(@name == "isSaved"));
				this._isSavedSearch = DataUtils.parseBoolean(contentKeys.(@name == "isSavedSearch"));
				this._isZombie = DataUtils.parseBoolean(contentKeys.(@name == "isZombie"));
				this._isFailed = DataUtils.parseBoolean(contentKeys.(@name == "isFailed"));
			}
			catch (e:Error)
			{
				throw e;
			}
			finally
			{
				// workaround for XML memory leak
				if (root)
					root.replace("*", null);
			}
		}

		// Public Getters/Setters

		/**
		 * The identifier for the search job.
		 */
		public function get id() : String
		{
			return this._id;
		}

		/**
		 * The search string that was used to dispatch the search job.
		 */
		public function get searchString() : String
		{
			return this._searchString;
		}

		/**
		 * The username of the Splunk user who dispatched the search job.
		 */
		public function get username() : String
		{
			return this._username;
		}

		/**
		 * The time that the search job was created.
		 * 
		 * @see com.splunk.time.DateTime
		 */
		public function get createTime() : DateTime
		{
			return this._createTime;
		}

		/**
		 * The time that the search job was last modified.
		 * 
		 * @see com.splunk.time.DateTime
		 */
		public function get modifiedTime() : DateTime
		{
			return this._modifiedTime;
		}

		/**
		 * The earliest time from which no later events will be scanned for the
		 * search job.
		 * 
		 * @see com.splunk.time.DateTime
		 */
		public function get cursorTime() : DateTime
		{
			return this._cursorTime;
		}

		/**
		 * The lower time bound (inclusive) for the search job.
		 * 
		 * @see com.splunk.time.DateTime
		 */
		public function get earliestTime() : DateTime
		{
			return this._earliestTime;
		}

		/**
		 * The upper time bound (exclusive) for the search job.
		 * 
		 * @see com.splunk.time.DateTime
		 */
		public function get latestTime() : DateTime
		{
			return this._latestTime;
		}

		/**
		 * The number of events generated by the search job.
		 */
		public function get eventCount() : int
		{
			return this._eventCount;
		}

		/**
		 * The number of events available to be retrieved from the search job.
		 */
		public function get eventAvailableCount() : int
		{
			return this._eventAvailableCount;
		}

		/**
		 * The subset of the entire search that is before any transforming
		 * commands.
		 */
		public function get eventSearch() : String
		{
			return this._eventSearch;
		}

		/**
		 * The time order of events for the search job.
		 */
		public function get eventSorting() : String
		{
			return this._eventSorting;
		}

		/**
		 * Indicates whether the events for the search job are available in a
		 * streaming manner.
		 */
		public function get eventIsStreaming() : Boolean
		{
			return this._eventIsStreaming;
		}

		/**
		 * Indicates whether any events are not available to be retrieved from
		 * the search job.
		 */
		public function get eventIsTruncated() : Boolean
		{
			return this._eventIsTruncated;
		}

		/**
		 * The number of final results generated by the search job.
		 */
		public function get resultCount() : int
		{
			return this._resultCount;
		}

		/**
		 * The number of preview results available to be retrieved from the search
		 * job.
		 */
		public function get resultPreviewCount() : int
		{
			return this._resultPreviewCount;
		}

		/**
		 * Indicates whether the results for the search job are available in a
		 * streaming manner.
		 */
		public function get resultIsStreaming() : Boolean
		{
			return this._resultIsStreaming;
		}

		/**
		 * The number of events scanned to satisfy the search job.
		 */
		public function get scanCount() : int
		{
			return this._scanCount;
		}

		/**
		 * The maximum number of timeline buckets for the search job.
		 */
		public function get statusBuckets() : int
		{
			return this._statusBuckets;
		}

		/**
		 * The length of time, in seconds, the search job has been running.
		 */
		public function get runDuration() : Number
		{
			return this._runDuration;
		}

		/**
		 * The approximate progress (0 to 1) of the search job.
		 */
		public function get doneProgress() : Number
		{
			return this._doneProgress;
		}

		/**
		 * The minimum number of seconds from now that the search job will still
		 * be available.
		 */
		public function get ttl() : Number
		{
			return this._ttl;
		}

		/**
		 * The streaming part of the search that is sent to remote providers.
		 */
		public function get remoteSearch() : String
		{
			return this._remoteSearch;
		}

		/**
		 * The reporting subset of the search. The original search should be
		 * equal to <code>eventSearch + reportSearch</code>
		 */
		public function get reportSearch() : String
		{
			return this._reportSearch;
		}

		///**
		// * The keywords for the search job.
		// */
		//public function get keywords() : ???
		//{
		//	return this._keywords;
		//}

		/**
		 * The custom user specified label for the search job.
		 */
		public function get label() : String
		{
			return this._label;
		}

		///**
		// * The list of remote search providers that events are being retrieving from.
		// */
		//public function get searchProviders() : ???
		//{
		//	return this._searchProviders;
		//}

		/**
		 * The delegate for the search job.
		 */
		public function get delegate() : String
		{
			return this._delegate;
		}

		/**
		 * The request parameters used to dispatch the search job.
		 */
		public function get request() : Object
		{
			return this._request;
		}

		/**
		 * A fatal search parsing or execution error message for the search job.
		 */
		public function get error() : String
		{
			return this._error;
		}

		/**
		 * Indicates whether the search job is paused.
		 */
		public function get isPaused() : Boolean
		{
			return this._isPaused;
		}

		/**
		 * Indicates whether the search job is finalized (forced to finish).
		 */
		public function get isFinalized() : Boolean
		{
			return this._isFinalized;
		}

		/**
		 * Indicates whether the search job is done.
		 */
		public function get isDone() : Boolean
		{
			return this._isDone;
		}

		/**
		 * Indicates whether the search job is saved indefinitely.
		 */
		public function get isSaved() : Boolean
		{
			return this._isSaved;
		}

		/**
		 * Indicates whether the search job was run as a saved search.
		 */
		public function get isSavedSearch() : Boolean
		{
			return this._isSavedSearch;
		}

		/**
		 * Indicates whether the process running the search is dead with the
		 * search not finished.
		 */
		public function get isZombie() : Boolean
		{
			return this._isZombie;
		}

		/**
		 * Indicates whether the search job failed.
		 */
		public function get isFailed() : Boolean
		{
			return this._isFailed;
		}

	}

}
