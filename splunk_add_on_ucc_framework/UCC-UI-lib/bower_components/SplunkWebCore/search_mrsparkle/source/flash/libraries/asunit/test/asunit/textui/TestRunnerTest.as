package asunit.textui {
    import asunit.framework.TestCase;

    public class TestRunnerTest extends TestCase {
        private var instance:TestRunner;

        public function TestRunnerTest(testMethod:String = null) {
            super(testMethod);
        }

        protected override function setUp():void {
            instance = new TestRunner();
            addChild(instance);
        }

        protected override function tearDown():void {
            removeChild(instance);
            instance = null;
        }

        public function testInstantiated():void {
            assertTrue("TestRunner instantiated with: " + instance, instance is TestRunner);
        }
    }
}
