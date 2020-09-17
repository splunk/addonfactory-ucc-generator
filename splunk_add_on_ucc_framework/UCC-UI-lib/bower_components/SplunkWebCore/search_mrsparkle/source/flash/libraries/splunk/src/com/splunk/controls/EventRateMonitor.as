package com.splunk.controls
{

	import com.jasongatt.controls.TextBlock;
	import com.splunk.services.events.ServiceEvent;
	import com.splunk.services.events.ServiceErrorEvent;
	import com.splunk.services.search.SearchJob;
	import com.splunk.services.search.SearchJobEvents;
	import com.splunk.services.search.data.EventsData;
	import com.splunk.services.search.request.EventsRequest;
	import flash.display.Shape;
	import flash.events.Event;
	import flash.text.TextField;
	import flash.text.TextFieldAutoSize;
	import flash.text.TextFormat;
	import flash.utils.getTimer;

	public class EventRateMonitor extends TextBlock
	{

		// Private Properties

		private var _job:SearchJob;
		private var _refreshInterval:Number = 0.25;
		private var _numSamples:int = 100;
		private var _eventRate:Number = 0;

		private var _eventCount:int = 0;
		private var _times:Array;
		private var _counts:Array;
		private var _events:SearchJobEvents;
		private var _beacon:Shape;

		// Constructor

		public function EventRateMonitor(job:SearchJob = null)
		{
			this.defaultTextFormat = new TextFormat("_sans", 12);
			this.selectable = false;
			this.mouseEnabled = false;

			this._setEventRate(0);
			this._setJob(job);
		}

		// Public Getters/Setters

		public function get job() : SearchJob
		{
			return this._job;
		}
		public function set job(value:SearchJob) : void
		{
			this._setJob(value);
		}

		public function get refreshInterval() : Number
		{
			return this._refreshInterval;
		}
		public function set refreshInterval(value:Number) : void
		{
			this._refreshInterval = value;
			if (this._events)
			{
				this._events.refreshInterval = value;
				this._events.refresh();
			}
		}

		public function get numSamples() : int
		{
			return this._numSamples;
		}
		public function set numSamples(value:int) : void
		{
			this._numSamples = (value > 2) ? value : 2;
		}

		public function get eventRate() : Number
		{
			return this._eventRate;
		}

		// Private Methods

		private function _setEventRate(eventRate:Number) : void
		{
			this._eventRate = eventRate;

			var str:String = eventRate.toFixed(2);
			var i:int = str.indexOf(".") - 3;
			for (i; i > 0; i -= 3)
				str = str.substring(0, i) + "," + str.substring(i);

			this.text = str + " eps";
		}

		private function _setJob(job:SearchJob) : void
		{
			if (job == this._job)
				return;

			this._clearJob();

			if (!job)
				return;

			this._job = job;
			this._job.addEventListener(ServiceEvent.CONNECT, this._job_connect, false, 0, true);
			this._job.addEventListener(ServiceEvent.CLOSE, this._job_close, false, 0, true);

			if (this._job.isConnected)
				this._startMonitor();
		}

		private function _clearJob() : void
		{
			if (!this._job)
				return;

			this._stopMonitor();

			this._job.removeEventListener(ServiceEvent.CONNECT, this._job_connect);
			this._job.removeEventListener(ServiceEvent.CLOSE, this._job_close);
			this._job = null;
		}

		private function _startMonitor() : void
		{
			if (!this._job)
				return;

			this._stopMonitor();

			this._times = new Array();
			this._times.push(getTimer() / 1000);

			this._counts = new Array();
			this._counts.push(0);

			this._events = new SearchJobEvents(this._job);
			this._events.refreshInterval = this._refreshInterval;
			this._events.addEventListener(ServiceEvent.COMPLETE, this._events_complete);
			this._events.addEventListener(ServiceErrorEvent.ERROR, this._events_error);

			this._beacon = new Shape();
			this._beacon.addEventListener(Event.ENTER_FRAME, this._beacon_enterFrame);

			this._events.load(new EventsRequest(-1, 1));
		}

		private function _stopMonitor() : void
		{
			if (!this._beacon)
				return;

			this._beacon.removeEventListener(Event.ENTER_FRAME, this._beacon_enterFrame);
			this._beacon = null;

			this._events.close();
			this._events = null;

			this._counts = null;
			this._times = null;
			this._eventCount = 0;

			this._setEventRate(0);
		}

		private function _job_connect(e:ServiceEvent) : void
		{
			this._startMonitor();
		}

		private function _job_close(e:ServiceEvent) : void
		{
			this._stopMonitor();
		}

		private function _events_complete(e:ServiceEvent) : void
		{
			var eventsData:EventsData = this._events.data;
			if (eventsData.count > 0)
				this._eventCount = eventsData.offset;
		}

		private function _events_error(e:ServiceErrorEvent) : void
		{
			this._eventCount = 0;
		}

		private function _beacon_enterFrame(e:Event) : void
		{
			var times:Array = this._times;
			times.push(getTimer() / 1000);

			var counts:Array = this._counts;
			counts.push(this._eventCount);

			var numSamples:int = times.length;
			var trimCount:int = numSamples - this._numSamples;
			if (trimCount > 0)
			{
				times.splice(0, trimCount);
				counts.splice(0, trimCount);
				numSamples -= trimCount;
			}

			var earliestTime:Number = times[0];
			var latestTime:Number = times[numSamples - 1];
			var earliestCount:int = counts[0];
			var latestCount:int = counts[numSamples - 1];
			var eventRate:Number = Math.max(latestCount - earliestCount, 0) / (latestTime - earliestTime);

			this._setEventRate(eventRate);
		}

	}

}
