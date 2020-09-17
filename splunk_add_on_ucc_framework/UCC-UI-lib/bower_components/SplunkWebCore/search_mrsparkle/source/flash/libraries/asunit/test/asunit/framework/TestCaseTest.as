package asunit.framework {
    import flash.events.EventDispatcher;
    import flash.events.Event;
    import flash.utils.setTimeout;
    
    public class TestCaseTest extends TestCase {
        
        public function TestCaseTest(testMethod:String = null) {
            super(testMethod);
        }
        
        public function testInstantiated():void {
            assertTrue(this is TestCase);
        }
        
        public function testCustomConstructor():void {
            var mock:TestCaseMock = new TestCaseMock("testMethod1");
            var handler:Function = addAsync(getCustomConstructorCompleteHandler(mock));
            mock.addEventListener(Event.COMPLETE, handler);
            mock.run();
        }
        
        private function getCustomConstructorCompleteHandler(mock:TestCaseMock):Function {
            return function():* {
                assertTrue("testMethod1Run", mock.testMethod1Run);
                assertFalse("testMethod2Run", mock.testMethod2Run);
                assertFalse("testMethod3Run", mock.testMethod3Run);
                return;
            };
        }
        
        public function testCustomConstructor2():void {
            var mock:TestCaseMock = new TestCaseMock("testMethod1, testMethod3");
            var handler:Function = addAsync(getCustomConstructor2CompleteHandler(mock));
            mock.addEventListener(Event.COMPLETE, handler);
            mock.run();
        }
        
        private function getCustomConstructor2CompleteHandler(mock:TestCaseMock):Function {
            return function():* {
                assertTrue("testMethod1Run", mock.testMethod1Run);
                assertFalse("testMethod2Run", mock.testMethod2Run);
                assertTrue("testMethod3Run", mock.testMethod3Run);
                return;
            };
        }

        public function testCustomConstructor3():void {
            var mock:TestCaseMock = new TestCaseMock("testMethod1,testMethod3");
            var handler:Function = addAsync(getCustomConstructor3CompleteHandler(mock));
            mock.addEventListener(Event.COMPLETE, handler);
            mock.run();
        }
        
        private function getCustomConstructor3CompleteHandler(mock:TestCaseMock):Function {
            return function():* {
                assertTrue("testMethod1Run", mock.testMethod1Run);
                assertFalse("testMethod2Run", mock.testMethod2Run);
                assertTrue("testMethod3Run", mock.testMethod3Run);
                return;
            };
        }

        public function testCustomConstructor4():void {
            var mock:TestCaseMock = new TestCaseMock("testMethod1, testMethod2,testMethod3");
            var handler:Function = addAsync(getCustomConstructor4CompleteHandler(mock));
            mock.addEventListener(Event.COMPLETE, handler);
            mock.run();
        }

        private function getCustomConstructor4CompleteHandler(mock:TestCaseMock):Function {
            return function():* {
                assertTrue("testMethod1Run", mock.testMethod1Run);
                assertTrue("testMethod2Run", mock.testMethod2Run);
                assertTrue("testMethod3Run", mock.testMethod3Run);
                return;
            };
        }

        public function testAsync():void {
            var dispatcher:EventDispatcher = new EventDispatcher();
            var handler:Function = addAsync(asyncHandler, 400);
            dispatcher.addEventListener(Event.COMPLETE, handler);
            setTimeout(dispatcher.dispatchEvent, 200, new Event(Event.COMPLETE));
        }
        
        private function asyncHandler(event:Event):void {
            assertEquals(event.type, Event.COMPLETE);
        }
    }
}
