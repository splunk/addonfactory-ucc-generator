package
{

	import asunit.framework.Test;
	import flash.display.DisplayObjectContainer;
	import flash.events.Event;
	import flash.events.EventDispatcher;

	[Event(name="testStart", type="TestEvent")]
	[Event(name="testEnd", type="TestEvent")]
	[Event(name="testSuiteStart", type="TestEvent")]
	[Event(name="testSuiteEnd", type="TestEvent")]
	[Event(name="testCaseStart", type="TestEvent")]
	[Event(name="testCaseEnd", type="TestEvent")]
	[Event(name="testCaseFailure", type="TestEvent")]
	[Event(name="testCaseError", type="TestEvent")]

	public class DispatchingTestRunner extends EventDispatcher
	{

		// Private Methods

		private var _test:Test;
		private var _resultDispatcher:ResultDispatcher;

		// Constructor

		public function DispatchingTestRunner()
		{
		}

		// Public Methods

		public function start(testCase:Class, testMethod:String = null, context:DisplayObjectContainer = null) : void
		{
			if (!testCase)
				throw new TypeError("Parameter testCase must be non-null.");

			var test:Test = testMethod ? new testCase(testMethod) : new testCase();
			if (test.getIsComplete())
				return;

			var resultDispatcher:ResultDispatcher = new ResultDispatcher(this);

			test.setResult(resultDispatcher);
			if (context)
				test.setContext(context);
			test.addEventListener(Event.COMPLETE, this._test_complete);

			this._test = test;
			this._resultDispatcher = resultDispatcher;

			this.dispatchEvent(new TestEvent(TestEvent.TEST_START, false, false, {}));

			resultDispatcher.startTest(test);

			test.run();
		}

		// Private Methods

		private function _test_complete(e:Event) : void
		{
			var test:Test = this._test;
			if (!test)
				return;

			var resultDispatcher:ResultDispatcher = this._resultDispatcher;
			if (!resultDispatcher)
				return;

			resultDispatcher.endTest(test);

			this._test = null;
			this._resultDispatcher = null;

			if (!resultDispatcher.areResultsComplete())
				return;

			this.dispatchEvent(new TestEvent(TestEvent.TEST_END, false, false, {}));
		}

	}

}

import asunit.errors.AssertionFailedError;
import asunit.framework.Test;
import asunit.framework.TestListener;
import flash.utils.getQualifiedClassName;
import flash.utils.getTimer;

class ResultDispatcher implements TestListener
{

	// Private Properties

	private var _testRunner:DispatchingTestRunner;
	private var _testResult:TestResult;

	// Constructor

	public function ResultDispatcher(testRunner:DispatchingTestRunner)
	{
		this._testRunner = testRunner;
	}

	// Public Methods

	public function areResultsComplete() : Boolean
	{
		return (this._testResult == null);
	}

	public function run(test:Test) : void
	{
		this.startTest(test);
		test.runBare();
	}

	public function startTest(test:Test) : void
	{
		var testResult:TestResult = new TestResult(this._testResult);
		testResult.signature = test.getName();
		testResult.startTime = getTimer();

		this._testResult = testResult;

		var testData:Object = new Object();
		testData.suiteName = test.getName().split("::").join(".");

		this._testRunner.dispatchEvent(new TestEvent(TestEvent.TEST_SUITE_START, false, false, testData));
	}

	public function endTest(test:Test) : void
	{
		var testResult:TestResult = this._testResult;
		if (!testResult || (testResult.signature != test.getName()))
			return;

		var parentResult:TestResult = testResult.parent;
		if (parentResult)
		{
			parentResult.testCount += testResult.testCount;
			parentResult.failureCount += testResult.failureCount;
			parentResult.errorCount += testResult.errorCount;
		}

		this._testResult = parentResult;

		var testData:Object = new Object();
		testData.suiteName = test.getName().split("::").join(".");
		testData.runTime = (getTimer() - testResult.startTime) / 1000;
		testData.testCount = testResult.testCount;
		testData.failureCount = testResult.failureCount;
		testData.errorCount = testResult.errorCount;

		this._testRunner.dispatchEvent(new TestEvent(TestEvent.TEST_SUITE_END, false, false, testData));
	}

	public function startTestMethod(test:Test, methodName:String) : void
	{
		var testResult:TestResult = new TestResult(this._testResult);
		testResult.signature = test.getName() + ", " + methodName;
		testResult.startTime = getTimer();
		testResult.testCount = 1;

		this._testResult = testResult;

		var testData:Object = new Object();
		testData.suiteName = test.getName().split("::").join(".");
		testData.caseName = methodName;

		this._testRunner.dispatchEvent(new TestEvent(TestEvent.TEST_CASE_START, false, false, testData));
	}

	public function endTestMethod(test:Test, methodName:String) : void
	{
		var testResult:TestResult = this._testResult;
		if (!testResult || (testResult.signature != (test.getName() + ", " + methodName)))
			return;

		var parentResult:TestResult = testResult.parent;
		if (parentResult)
		{
			parentResult.testCount += testResult.testCount;
			parentResult.failureCount += testResult.failureCount;
			parentResult.errorCount += testResult.errorCount;
		}

		this._testResult = parentResult;

		var testData:Object = new Object();
		testData.suiteName = test.getName().split("::").join(".");
		testData.caseName = methodName;
		testData.runTime = (getTimer() - testResult.startTime) / 1000;
		testData.testCount = testResult.testCount;
		testData.failureCount = testResult.failureCount;
		testData.errorCount = testResult.errorCount;

		this._testRunner.dispatchEvent(new TestEvent(TestEvent.TEST_CASE_END, false, false, testData));
	}

	public function addFailure(test:Test, t:AssertionFailedError) : void
	{
		var testResult:TestResult = this._testResult;
		if (!testResult)
			return;

		testResult.failureCount++;

		var testData:Object = new Object();
		testData.suiteName = test.getName().split("::").join(".");
		testData.caseName = test.getCurrentMethod();
		testData.errorType = getQualifiedClassName(t).split("::").join(".");
		testData.errorMessage = t.message;
		testData.errorStackTrace = t.getStackTrace();

		this._testRunner.dispatchEvent(new TestEvent(TestEvent.TEST_CASE_FAILURE, false, false, testData));
	}

	public function addError(test:Test, t:Error) : void
	{
		var testResult:TestResult = this._testResult;
		if (!testResult)
			return;

		testResult.errorCount++;

		var testData:Object = new Object();
		testData.suiteName = test.getName().split("::").join(".");
		testData.caseName = test.getCurrentMethod();
		testData.errorType = getQualifiedClassName(t).split("::").join(".");
		testData.errorMessage = t.message;
		testData.errorStackTrace = t.getStackTrace();

		this._testRunner.dispatchEvent(new TestEvent(TestEvent.TEST_CASE_ERROR, false, false, testData));
	}

}

class TestResult
{

	// Public Properties

	public var parent:TestResult;
	public var signature:String;
	public var startTime:int = 0;
	public var testCount:int = 0;
	public var failureCount:int = 0;
	public var errorCount:int = 0;

	// Constructor

	public function TestResult(parent:TestResult = null)
	{
		this.parent = parent;
	}

}
