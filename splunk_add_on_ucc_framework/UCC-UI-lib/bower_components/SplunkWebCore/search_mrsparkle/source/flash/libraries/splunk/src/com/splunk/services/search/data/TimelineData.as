package com.splunk.services.search.data
{

	import com.splunk.time.DateTime;
	import com.splunk.time.SimpleTimeZone;

	/**
	 * The TimelineData class represents timeline information received from a
	 * search job.
	 */
	public class TimelineData
	{

		// Private Properties

		private var _earliestTime:DateTime;
		private var _latestTime:DateTime;
		private var _cursorTime:DateTime;
		private var _duration:Number;
		private var _eventCount:int;
		private var _eventAvailableCount:int;
		private var _isComplete:Boolean;
		private var _buckets:Array;

		// Constructor

		/**
		 * Creates a new TimelineData object.
		 * 
		 * @param value Any object that can be converted to an XML object.
		 * 
		 * @throws TypeError The value parameter cannot be parsed.
		 */
		public function TimelineData(value:Object)
		{
			var root:XML;
			try
			{
				if (value == null)
					throw new TypeError("Data parse error: data is null.");

				root = new XML(value);

				var earliestTime:DateTime = DataUtils.parseUTCTime(root.@t);
				var latestTime:DateTime;
				var cursorTime:DateTime = DataUtils.parseUTCTime(root.@cursor);
				var duration:Number = DataUtils.parseNumber(root.@d);
				var earliestTimeZone:Number = DataUtils.parseNumber(root.@etz);
				var latestTimeZone:Number = DataUtils.parseNumber(root.@ltz);
				var eventCount:int = DataUtils.parseInt(root.@c);
				var eventAvailableCount:int = DataUtils.parseInt(root.@a);
				var isComplete:Boolean = DataUtils.parseBoolean(root.@f);
				var isTimeCursored:Boolean = (DataUtils.parseNumber(root.@is_time_cursored) != 0);
				var buckets:Array = new Array();

				var bucketEventCount:int = 0;
				var bucket:TimelineData;
				for each (var bucketNode:XML in root.bucket)
				{
					bucket = new TimelineData(bucketNode);
					bucketEventCount += bucket.eventCount;
					buckets.push(bucket);
				}
				eventCount = Math.max(eventCount, bucketEventCount);

				if (duration != duration)
					duration = 0;
				if (earliestTimeZone != earliestTimeZone)
					earliestTimeZone = 0;
				if (latestTimeZone != latestTimeZone)
					latestTimeZone = 0;

				if (earliestTime)
					latestTime = new DateTime(earliestTime.time + duration);

				if (buckets.length > 0)
				{
					var earliestBucketTime:DateTime = buckets[0].earliestTime;
					if (earliestBucketTime && (!earliestTime || (earliestBucketTime.time < earliestTime.time)))
						earliestTime = earliestBucketTime.clone();

					var latestBucketTime:DateTime = buckets[buckets.length - 1].latestTime;
					if (latestBucketTime && (!latestTime || (latestBucketTime.time > latestTime.time)))
						latestTime = latestBucketTime.clone();

					if (earliestTime && latestTime)
						duration = latestTime.time - earliestTime.time;
				}

				if (earliestTime)
					earliestTime = earliestTime.toTimeZone(new SimpleTimeZone(earliestTimeZone));
				if (latestTime)
					latestTime = latestTime.toTimeZone(new SimpleTimeZone(latestTimeZone));
				if (cursorTime)
					cursorTime = cursorTime.toTimeZone(new SimpleTimeZone(earliestTimeZone));

				this._earliestTime = earliestTime;
				this._latestTime = latestTime;
				this._cursorTime = isTimeCursored ? cursorTime : null;
				this._duration = duration;
				this._eventCount = eventCount;
				this._eventAvailableCount = eventAvailableCount;
				this._isComplete = isComplete;
				this._buckets = buckets;
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
		 * The earliest time in the span of this TimelineData object.
		 * 
		 * @see com.splunk.time.DateTime
		 */
		public function get earliestTime() : DateTime
		{
			return this._earliestTime;
		}

		/**
		 * The latest time in the span of this TimelineData object.
		 * 
		 * @see com.splunk.time.DateTime
		 */
		public function get latestTime() : DateTime
		{
			return this._latestTime;
		}

		/**
		 * The cursor time within the span of this TimelineData object.
		 * 
		 * @see com.splunk.time.DateTime
		 */
		public function get cursorTime() : DateTime
		{
			return this._cursorTime;
		}

		/**
		 * The duration of the span of this TimelineData object.
		 */
		public function get duration() : Number
		{
			return this._duration;
		}

		/**
		 * The number of events within the span of this TimelineData object.
		 */
		public function get eventCount() : int
		{
			return this._eventCount;
		}

		/**
		 * The number of events available within the span of this TimelineData object.
		 */
		public function get eventAvailableCount() : int
		{
			return this._eventAvailableCount;
		}

		/**
		 * Indicates whether the span of this TimelineData object is complete.
		 */
		public function get isComplete() : Boolean
		{
			return this._isComplete;
		}

		/**
		 * The buckets of time within the span of this TimelineData object. Each
		 * bucket is itself a TimelineData object.
		 */
		public function get buckets() : Array
		{
			return this._buckets;
		}

	}

}
