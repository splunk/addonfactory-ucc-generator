package
{

	import com.splunk.external.JABridge;
	import flash.display.Loader;
	import flash.display.Sprite;
	import flash.events.ErrorEvent;
	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.net.URLRequest;
	import flash.system.Capabilities;

	public class TestRunner extends Sprite
	{

		// Private Properties

		private var _testRunner:DispatchingTestRunner;
		private var _resultXMLFormatter:ResultXMLFormatter;
		private var _fileLoader:Loader;
		private var _filePath:String;
		private var _suiteName:String;
		private var _caseName:String;

		// Constructor

		public function TestRunner()
		{
			this._testRunner = new DispatchingTestRunner();
			this._testRunner.addEventListener(TestEvent.TEST_START, this._testRunner_testStart);
			this._testRunner.addEventListener(TestEvent.TEST_END, this._testRunner_testEnd);
			this._testRunner.addEventListener(TestEvent.TEST_SUITE_START, this._testRunner_testSuiteStart);
			this._testRunner.addEventListener(TestEvent.TEST_SUITE_END, this._testRunner_testSuiteEnd);
			this._testRunner.addEventListener(TestEvent.TEST_CASE_START, this._testRunner_testCaseStart);
			this._testRunner.addEventListener(TestEvent.TEST_CASE_END, this._testRunner_testCaseEnd);
			this._testRunner.addEventListener(TestEvent.TEST_CASE_FAILURE, this._testRunner_testCaseFailure);
			this._testRunner.addEventListener(TestEvent.TEST_CASE_ERROR, this._testRunner_testCaseError);

			this._resultXMLFormatter = new ResultXMLFormatter(this._testRunner);
			this._resultXMLFormatter.addEventListener(Event.COMPLETE, this._resultXMLFormatter_complete);

			JABridge.addMethod("start", this.start, [ "filePath:String", "suiteName:String = null", "caseName:String = null" ], "void");

			JABridge.addEvent("loadError", [ "event:Object { message:String }" ]);
			JABridge.addEvent("testStart", [ "event:Object { flashPlayerVersion:String }" ]);
			JABridge.addEvent("testEnd", [ "event:Object { resultXML:String }" ]);
			JABridge.addEvent("testSuiteStart", [ "event:Object { suiteName:String }" ]);
			JABridge.addEvent("testSuiteEnd", [ "event:Object { suiteName:String, runTime:Number, testCount:Number, failureCount:Number, errorCount:Number }" ]);
			JABridge.addEvent("testCaseStart", [ "event:Object { suiteName:String, caseName:String }" ]);
			JABridge.addEvent("testCaseEnd", [ "event:Object { suiteName:String, caseName:String, runTime:Number, testCount:Number, failureCount:Number, errorCount:Number }" ]);
			JABridge.addEvent("testCaseFailure", [ "event:Object { suiteName:String, caseName:String, errorType:String, errorMessage:String, errorStackTrace:String }" ]);
			JABridge.addEvent("testCaseError", [ "event:Object { suiteName:String, caseName:String, errorType:String, errorMessage:String, errorStackTrace:String }" ]);

			try
			{
				JABridge.connect(this._JABridge_connect, this._JABridge_close);
			}
			catch (e:Error)
			{
			}
		}

		// Public Methods

		public function start(filePath:String, suiteName:String = null, caseName:String = null) : void
		{
			if (!filePath)
				throw new TypeError("Parameter filePath must be non-null.");

			if (!suiteName)
				suiteName = "AllTests";

			this._filePath = filePath;
			this._suiteName = suiteName;
			this._caseName = caseName;

			if (this._fileLoader)
			{
				this._fileLoader.contentLoaderInfo.removeEventListener(Event.COMPLETE, this._fileLoader_complete);
				this._fileLoader.contentLoaderInfo.removeEventListener(IOErrorEvent.IO_ERROR, this._fileLoader_error);
				this._fileLoader.unload();
			}

			this._fileLoader = new Loader();
			this._fileLoader.contentLoaderInfo.addEventListener(Event.COMPLETE, this._fileLoader_complete);
			this._fileLoader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR, this._fileLoader_error);
			this._fileLoader.load(new URLRequest(filePath));
		}

		// Private Methods

		private function _dispatchExternalEvent(eventName:String, eventObject:Object) : void
		{
			var properties:Array = [ "flashPlayerVersion", "filePath", "suiteName", "caseName", "runTime", "testCount", "failureCount", "errorCount", "errorType", "errorMessage", "errorStackTrace", "resultXML" ];
			var str:String = "";
			str += eventName + "\n";
			for each (var property:String in properties)
			{
				if (eventObject.hasOwnProperty(property))
					str += "    " + property + ": " + eventObject[property] + "\n";
			}
			trace(str);

			try
			{
				JABridge.dispatchEvent(eventName, eventObject);
			}
			catch (e:Error)
			{
			}
		}

		private function _JABridge_connect() : void
		{
		}

		private function _JABridge_close() : void
		{
		}

		private function _fileLoader_complete(e:Event) : void
		{
			try
			{
				var c:Class = Class(this._fileLoader.contentLoaderInfo.applicationDomain.getDefinition(this._suiteName));
				this._testRunner.start(c, this._caseName, this);
			}
			catch (e:Error)
			{
				this._fileLoader_error(new ErrorEvent(ErrorEvent.ERROR, false, false, e.message));
			}
		}

		private function _fileLoader_error(e:ErrorEvent) : void
		{
			var event:Object = new Object();
			event.message = e.text;

			this._dispatchExternalEvent("loadError", event);
		}

		private function _testRunner_testStart(e:TestEvent) : void
		{
			var event:Object = new Object();
			event.flashPlayerVersion = Capabilities.version;
			event.filePath = this._filePath;
			event.suiteName = this._suiteName;
			event.caseName = this._caseName;

			this._dispatchExternalEvent("testStart", event);
		}

		private function _testRunner_testEnd(e:TestEvent) : void
		{
		}

		private function _testRunner_testSuiteStart(e:TestEvent) : void
		{
			this._dispatchExternalEvent("testSuiteStart", e.testData);
		}

		private function _testRunner_testSuiteEnd(e:TestEvent) : void
		{
			this._dispatchExternalEvent("testSuiteEnd", e.testData);
		}

		private function _testRunner_testCaseStart(e:TestEvent) : void
		{
			this._dispatchExternalEvent("testCaseStart", e.testData);
		}

		private function _testRunner_testCaseEnd(e:TestEvent) : void
		{
			this._dispatchExternalEvent("testCaseEnd", e.testData);
		}

		private function _testRunner_testCaseFailure(e:TestEvent) : void
		{
			this._dispatchExternalEvent("testCaseFailure", e.testData);
		}

		private function _testRunner_testCaseError(e:TestEvent) : void
		{
			this._dispatchExternalEvent("testCaseError", e.testData);
		}

		private function _resultXMLFormatter_complete(e:Event) : void
		{
			var event:Object = new Object();
			event.resultXML = String(this._resultXMLFormatter.getResultXML());

			this._dispatchExternalEvent("testEnd", event);
		}

	}

}
