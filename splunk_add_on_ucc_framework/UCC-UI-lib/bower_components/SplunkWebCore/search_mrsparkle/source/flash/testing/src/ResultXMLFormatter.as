package
{

	import flash.events.Event;
	import flash.events.EventDispatcher;

	[Event(name="complete", type="flash.events.Event")]

	public class ResultXMLFormatter extends EventDispatcher
	{

		// Private Properties

		private var _testRunner:DispatchingTestRunner;
		private var _results:Array;
		private var _result:XMLResult;
		private var _resultString:String;

		// Constructor

		public function ResultXMLFormatter(testRunner:DispatchingTestRunner)
		{
			if (!testRunner)
				throw new TypeError("Parameter testRunner must be non-null.");

			this._testRunner = testRunner;
			this._testRunner.addEventListener(TestEvent.TEST_START, this._testRunner_testStart);
			this._testRunner.addEventListener(TestEvent.TEST_END, this._testRunner_testEnd);
			this._testRunner.addEventListener(TestEvent.TEST_SUITE_START, this._testRunner_testSuiteStart);
			this._testRunner.addEventListener(TestEvent.TEST_SUITE_END, this._testRunner_testSuiteEnd);
			this._testRunner.addEventListener(TestEvent.TEST_CASE_START, this._testRunner_testCaseStart);
			this._testRunner.addEventListener(TestEvent.TEST_CASE_END, this._testRunner_testCaseEnd);
			this._testRunner.addEventListener(TestEvent.TEST_CASE_FAILURE, this._testRunner_testCaseFailure);
			this._testRunner.addEventListener(TestEvent.TEST_CASE_ERROR, this._testRunner_testCaseError);
		}

		// Public Methods

		public function getResultXML() : XML
		{
			return new XML(this._resultString);
		}

		// Private Methods

		private function _testRunner_testStart(e:TestEvent) : void
		{
			this._results = new Array();
		}

		private function _testRunner_testEnd(e:TestEvent) : void
		{
			var str:String = "";
			str += "<testsuites>\n";
			for each (var result:XMLResult in this._results)
				str += result.toString();
			str += "</testsuites>\n";

			this._results = null;
			this._result = null;
			this._resultString = str;

			this.dispatchEvent(new Event(Event.COMPLETE));
		}

		private function _testRunner_testSuiteStart(e:TestEvent) : void
		{
			var testData:Object = e.testData;
			if (!testData)
				return;

			var suiteResult:XMLSuiteResult = new XMLSuiteResult(this._result);
			suiteResult.suiteName = testData.suiteName;

			this._result = suiteResult;
		}

		private function _testRunner_testSuiteEnd(e:TestEvent) : void
		{
			var testData:Object = e.testData;
			if (!testData)
				return;

			var suiteResult:XMLSuiteResult = this._result as XMLSuiteResult;
			if (!suiteResult)
				return;

			suiteResult.runTime = testData.runTime;
			suiteResult.testCount = testData.testCount;
			suiteResult.failureCount = testData.failureCount;
			suiteResult.errorCount = testData.errorCount;

			this._result = suiteResult.parent;

			if (this._result)
				return;

			this._results.push(suiteResult);
		}

		private function _testRunner_testCaseStart(e:TestEvent) : void
		{
			var testData:Object = e.testData;
			if (!testData)
				return;

			var result:XMLResult = this._result;
			if (!result)
				return;

			var caseResult:XMLCaseResult = new XMLCaseResult(result);
			caseResult.suiteName = testData.suiteName;
			caseResult.caseName = testData.caseName;

			this._result = caseResult;
		}

		private function _testRunner_testCaseEnd(e:TestEvent) : void
		{
			var testData:Object = e.testData;
			if (!testData)
				return;

			var caseResult:XMLCaseResult = this._result as XMLCaseResult;
			if (!caseResult)
				return;

			caseResult.runTime = testData.runTime;
			caseResult.testCount = testData.testCount;
			caseResult.failureCount = testData.failureCount;
			caseResult.errorCount = testData.errorCount;

			this._result = caseResult.parent;
		}

		private function _testRunner_testCaseFailure(e:TestEvent) : void
		{
			var testData:Object = e.testData;
			if (!testData)
				return;

			var result:XMLResult = this._result;
			if (!result)
				return;

			var failureResult:XMLFailureResult = new XMLFailureResult(result);
			failureResult.suiteName = testData.suiteName;
			failureResult.caseName = testData.caseName;
			failureResult.errorType = testData.errorType;
			failureResult.errorMessage = testData.errorMessage;
			failureResult.errorStackTrace = testData.errorStackTrace;
		}

		private function _testRunner_testCaseError(e:TestEvent) : void
		{
			var testData:Object = e.testData;
			if (!testData)
				return;

			var result:XMLResult = this._result;
			if (!result)
				return;

			var errorResult:XMLErrorResult = new XMLErrorResult(result);
			errorResult.suiteName = testData.suiteName;
			errorResult.caseName = testData.caseName;
			errorResult.errorType = testData.errorType;
			errorResult.errorMessage = testData.errorMessage;
			errorResult.errorStackTrace = testData.errorStackTrace;
		}

	}

}

class XMLResult
{

	// Public Properties

	public var parent:XMLResult;
	public var children:Array;

	// Constructor

	public function XMLResult(parent:XMLResult = null)
	{
		this.parent = parent;
		this.children = new Array();

		if (parent)
			parent.children.push(this);
	}

	// Public Methods

	public function toString() : String
	{
		return "";
	}

}

class XMLSuiteResult extends XMLResult
{

	// Public Properties

	public var suiteName:String;
	public var runTime:Number;
	public var testCount:int;
	public var failureCount:int;
	public var errorCount:int;

	// Constructor

	public function XMLSuiteResult(parent:XMLResult = null)
	{
		super(parent);
	}

	// Public Methods

	public override function toString() : String
	{
		var str:String = "";
		str += "<testsuite name=\"" + this.suiteName + "\" errors=\"" + this.errorCount + "\" failures=\"" + this.failureCount + "\" tests=\"" + this.testCount + "\" time=\"" + this.runTime + "\">\n";
		for each (var childResult:XMLResult in this.children)
			str += childResult.toString();
		str += "</testsuite>\n";
		return str;
	}

}

class XMLCaseResult extends XMLResult
{

	// Public Properties

	public var suiteName:String;
	public var caseName:String;
	public var runTime:Number;
	public var testCount:int;
	public var failureCount:int;
	public var errorCount:int;

	// Constructor

	public function XMLCaseResult(parent:XMLResult = null)
	{
		super(parent);
	}

	// Public Methods

	public override function toString() : String
	{
		var str:String = "";
		str += "<testcase classname=\"" + this.suiteName + "\" name=\"" + this.caseName + "\" time=\"" + this.runTime + "\">\n";
		for each (var childResult:XMLResult in this.children)
			str += childResult.toString();
		str += "</testcase>\n";
		return str;
	}

}

class XMLFailureResult extends XMLResult
{

	// Public Properties

	public var suiteName:String;
	public var caseName:String;
	public var errorType:String;
	public var errorMessage:String;
	public var errorStackTrace:String;

	// Constructor

	public function XMLFailureResult(parent:XMLResult = null)
	{
		super(parent);
	}

	// Public Methods

	public override function toString() : String
	{
		var str:String = "";
		str += "<failure type=\"" + this.errorType + "\"><![CDATA[\n" + this.errorStackTrace + "\n]]></failure>\n";
		return str;
	}

}

class XMLErrorResult extends XMLResult
{

	// Public Properties

	public var suiteName:String;
	public var caseName:String;
	public var errorType:String;
	public var errorMessage:String;
	public var errorStackTrace:String;

	// Constructor

	public function XMLErrorResult(parent:XMLResult = null)
	{
		super(parent);
	}

	// Public Methods

	public override function toString() : String
	{
		var str:String = "";
		str += "<error type=\"" + this.errorType + "\"><![CDATA[\n" + this.errorStackTrace + "\n]]></error>\n";
		return str;
	}

}
