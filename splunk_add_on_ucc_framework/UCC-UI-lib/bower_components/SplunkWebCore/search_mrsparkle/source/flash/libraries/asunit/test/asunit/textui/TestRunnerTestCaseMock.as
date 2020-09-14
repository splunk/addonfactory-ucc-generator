package asunit.textui {
    
    import asunit.framework.TestCase;
    
    public class TestRunnerTestCaseMock extends TestCase {
        public var testMethod1Run:Boolean;
        public var testMethod2Run:Boolean;
        public var testMethod3Run:Boolean;
        
        public function TestRunnerTestCaseMock(methodName:String = null) {
            super(methodName);
        }
        
        public function testMethod1():void {
            testMethod1Run = true;
        }
        
        public function testMethod1Completed():void {
            trace("testMethod1Handler called");
        }
        
        public function testMethod2():void {
            testMethod2Run = true;
        }
        
        public function testMethod3():void {
            testMethod3Run = true;
        }
    }
}