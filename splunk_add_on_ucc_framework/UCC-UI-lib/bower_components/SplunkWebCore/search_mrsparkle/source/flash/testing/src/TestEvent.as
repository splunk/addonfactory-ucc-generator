package
{

	import flash.events.Event;

	public class TestEvent extends Event
	{

		// Public Static Constants

		public static const TEST_START:String = "testStart";
		public static const TEST_END:String = "testEnd";
		public static const TEST_SUITE_START:String = "testSuiteStart";
		public static const TEST_SUITE_END:String = "testSuiteEnd";
		public static const TEST_CASE_START:String = "testCaseStart";
		public static const TEST_CASE_END:String = "testCaseEnd";
		public static const TEST_CASE_FAILURE:String = "testCaseFailure";
		public static const TEST_CASE_ERROR:String = "testCaseError";

		// Private Properties

		private var _testData:Object;

		// Constructor

		public function TestEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, testData:Object = null)
		{
			super(type, bubbles, cancelable);

			this._testData = testData;
		}

		// Public Getters/Setters

		public function get testData() : Object
		{
			return this._testData;
		}

		// Public Methods

		public override function clone() : Event
		{
			return new TestEvent(this.type, this.bubbles, this.cancelable, this.testData);
		}

		public override function toString() : String
		{
			return this.formatToString("TestEvent", "type", "bubbles", "cancelable", "eventPhase", "testData");
		}

	}

}
