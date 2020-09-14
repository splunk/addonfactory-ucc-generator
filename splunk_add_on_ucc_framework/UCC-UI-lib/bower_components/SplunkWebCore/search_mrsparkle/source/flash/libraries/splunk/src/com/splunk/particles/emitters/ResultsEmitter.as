package com.splunk.particles.emitters
{

	import com.jasongatt.utils.LinkedList;
	import com.jasongatt.utils.NumberUtil;
	import com.splunk.particles.Particle2D;
	import com.splunk.particles.events.DropEvent;
	import com.splunk.particles.events.UpdateEvent;
	import com.splunk.services.SplunkService;
	import com.splunk.services.events.ServiceErrorEvent;
	import com.splunk.services.events.ServiceEvent;
	import com.splunk.services.search.SearchJob;
	import com.splunk.services.search.SearchJobResults;
	import com.splunk.services.search.request.ResultsRequest;
	import flash.events.ErrorEvent;
	import flash.utils.getTimer;

	[Event(name="dropped", type="com.splunk.particles.events.DropEvent")]
	[Event(name="error", type="flash.events.ErrorEvent")]

	public class ResultsEmitter extends Emitter
	{

		// Private Properties

		private var _hostPath:String;
		private var _basePath:String;
		private var _sessionKey:String;
		private var _jobID:String;
		private var _count:int = 100;
		private var _bufferSize:int = 1000;
		private var _bufferTime:Number = 3;
		private var _dropThreshold:int = 5000;

		private var _service:SplunkService;
		private var _job:SearchJob;
		private var _results:SearchJobResults;
		private var _loadedResultInfo:LinkedList;
		private var _loadedTime:Number = 0;
		private var _loadTime:Number = 0;
		private var _emitTime:Number = 0;
		private var _emitSerial:Number = NaN;
		private var _serial:Number = NaN;
		private var _dropRatio:int = 2;
		private var _pollInterval:Number = 0;
		private var _isOpened:Boolean = false;

		// Constructor

		public function ResultsEmitter(hostPath:String = "http://localhost:8000", basePath:String = "/splunkd", sessionKey:String = null)
		{
			this._hostPath = hostPath;
			this._basePath = basePath;
			this._sessionKey = sessionKey;

			this._loadedResultInfo = new LinkedList();

			this.addEventListener(UpdateEvent.EMITTER_UPDATED, this._self_emitterUpdated, false, int.MAX_VALUE);
		}

		// Public Getters/Setters

		public function get hostPath() : String
		{
			return this._hostPath;
		}
		public function set hostPath(value:String) : void
		{
			if (this._hostPath != value)
			{
				this._hostPath = value;
				this._close(true);
			}
		}

		public function get basePath() : String
		{
			return this._basePath;
		}
		public function set basePath(value:String) : void
		{
			if (this._basePath != value)
			{
				this._basePath = value;
				this._close(true);
			}
		}

		public function get sessionKey() : String
		{
			return this._sessionKey;
		}
		public function set sessionKey(value:String) : void
		{
			if (this._sessionKey != value)
			{
				this._sessionKey = value;
				this._close(true);
			}
		}

		public function get jobID() : String
		{
			return this._jobID;
		}
		public function set jobID(value:String) : void
		{
			if (this._jobID != value)
			{
				this._jobID = value;
				this._close(true);
			}
		}

		public function get count() : int
		{
			return this._count;
		}
		public function set count(value:int) : void
		{
			this._count = value;
		}

		public function get bufferSize() : int
		{
			return this._bufferSize;
		}
		public function set bufferSize(value:int) : void
		{
			this._bufferSize = value;
		}

		public function get bufferTime() : Number
		{
			return this._bufferTime;
		}
		public function set bufferTime(value:Number) : void
		{
			this._bufferTime = value;
		}

		public function get dropThreshold() : int
		{
			return this._dropThreshold;
		}
		public function set dropThreshold(value:int) : void
		{
			this._dropThreshold = value;
		}

		// Public Methods

		public function open() : void
		{
			if (this._isOpened)
				return;

			this._isOpened = true;
		}

		public function close() : void
		{
			if (!this._isOpened)
				return;

			this._isOpened = false;

			this._close(true);
		}

		// Private Methods

		private function _load() : void
		{
			if (!this._isOpened || this._service || !this._jobID)
				return;

			if ((this._bufferSize > 0) && (this._loadedResultInfo.length > this._bufferSize))
				return;

			var time:Number = getTimer() / 1000;
			if ((time - this._loadTime) < this._pollInterval)
				return;

			this._loadTime = time;

			this._service = new SplunkService(this._hostPath, this._basePath);
			this._service.addEventListener(ServiceEvent.CONNECT, this._service_connect);
			this._service.addEventListener(ServiceErrorEvent.ERROR, this._service_error);

			this._job = new SearchJob(this._service);
			this._job.addEventListener(ServiceEvent.CONNECT, this._job_connect);
			this._job.addEventListener(ServiceErrorEvent.ERROR, this._job_error);

			this._results = new SearchJobResults(this._job);
			this._results.addEventListener(ServiceEvent.COMPLETE, this._results_complete);
			this._results.addEventListener(ServiceErrorEvent.ERROR, this._results_error);

			this._service.loadSession(this._sessionKey, false);
		}

		private function _close(reset:Boolean = false) : void
		{
			if (reset)
			{
				this._loadedResultInfo = new LinkedList();
				this._emitSerial = NaN;
				this._serial = NaN;
				this._dropRatio = 2;
				this._pollInterval = 0;
			}

			if (!this._service)
				return;

			this._results.close();
			this._results = null;

			this._job.close();
			this._job = null;

			this._service.close();
			this._service = null;

			this._loadTime = getTimer() / 1000;
		}

		private function _self_emitterUpdated(e:UpdateEvent) : void
		{
			var time:Number = e.time;
			var emitTime:Number = this._emitTime + time;
			var emitSerial:Number = this._emitSerial;
			var loadedResultInfo:LinkedList = this._loadedResultInfo;
			var resultInfo:ResultInfo;
			var serial:Number;
			var dropCount:int;
			var particle:Particle2D;

			while (resultInfo = loadedResultInfo.getFirst())
			{
				if (resultInfo.time > emitTime)
					break;

				emitTime -= resultInfo.time;

				loadedResultInfo.removeFirst();

				serial = NumberUtil.parseNumber(resultInfo.data._serial);
				dropCount = serial - emitSerial - 1;
				emitSerial = serial;
				if (dropCount > 0)
					this.dispatchEvent(new DropEvent(DropEvent.DROPPED, false, false, dropCount));

				particle = new Particle2D();
				particle.metadata.data = resultInfo.data;

				this.emit(particle);
			}

			this._emitTime = resultInfo ? emitTime : 0;
			this._emitSerial = emitSerial;

			this._load();
		}

		private function _service_connect(e:ServiceEvent) : void
		{
			this._job.loadJob(this._jobID, false);
		}

		private function _service_error(e:ServiceErrorEvent) : void
		{
			this.close();
			this.dispatchEvent(new ErrorEvent(ErrorEvent.ERROR, false, false, e.text));
		}

		private function _job_connect(e:ServiceEvent) : void
		{
			var request:ResultsRequest;
			if (this._serial != this._serial)
			{
				request = new ResultsRequest(-1, 1);
			}
			else
			{
				request = new ResultsRequest(0, this._count);
				request.search = "where _serial > " + this._serial + " | eventstats max(_serial) as _maxserial";
			}

			this._results.load(request);
		}

		private function _job_error(e:ServiceErrorEvent) : void
		{
			this.close();
			this.dispatchEvent(new ErrorEvent(ErrorEvent.ERROR, false, false, e.text));
		}

		private function _results_complete(e:ServiceEvent) : void
		{
			var time:Number = getTimer() / 1000;

			var results:Array = this._results.data.results;
			var count:int = results.length;

			if (count > 0)
			{
				var isStreamRunning:Boolean = (this._serial == this._serial);

				var lastResult:Object = results[count - 1];
				var serial:Number = NumberUtil.parseNumber(lastResult._serial);
				var maxserial:Number = isStreamRunning ? NumberUtil.parseNumber(lastResult._maxserial) : serial;

				if ((serial != serial) || (maxserial != maxserial))
				{
					this.close();
					this.dispatchEvent(new ErrorEvent(ErrorEvent.ERROR, false, false, "The _serial and/or _maxserial fields are missing or corrupted. These fields are required for proper streaming."));
					return;
				}

				if (isStreamRunning)
				{
					var elapsedTime:Number = time - this._loadTime;
					elapsedTime += NumberUtil.maxMin(this._loadTime - this._loadedTime, this._bufferTime, 0);

					var resultTime:Number = elapsedTime / count;

					var loadedResultInfo:LinkedList = this._loadedResultInfo;
					for each (var data:Object in results)
						loadedResultInfo.addLast(new ResultInfo(data, resultTime));
				}

				this._loadedTime = time;

				var dropCount:int = maxserial - serial - this._dropThreshold;
				if (dropCount > 0)
				{
					serial = Math.min(serial + dropCount * this._dropRatio, maxserial);
					this._dropRatio++;
				}
				else if (this._dropRatio > 2)
				{
					this._dropRatio--;
				}

				this._serial = serial;

				if (count >= this._count)
					this._pollInterval /= 2;
			}
			else
			{
				this._pollInterval *= 2;
			}

			this._pollInterval = NumberUtil.maxMin(this._pollInterval, this._bufferTime, 0.001);

			this._close();
		}

		private function _results_error(e:ServiceErrorEvent) : void
		{
			this.close();
			this.dispatchEvent(new ErrorEvent(ErrorEvent.ERROR, false, false, e.text));
		}

	}

}

class ResultInfo
{

	// Public Properties

	public var data:Object;
	public var time:Number;

	// Constructor

	public function ResultInfo(data:Object, time:Number)
	{
		this.data = data;
		this.time = time;
	}

}
