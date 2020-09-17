Assume we have a feature that performs some asynchronous action:

package net {
    
    import flash.events.Event;
    import flash.events.EventDispatcher;
    import flash.utils.setTimeout;
    
    [Event(name="complete", type="flash.events.Event")]
    public class AsyncMethod extends EventDispatcher {
        
        public function doSomething():void {
            setTimeout(function():void {
                dispatchEvent(new Event(Event.COMPLETE));
            }, 100);
        }
    }
}

We can test this feature with the following test case:
package net {

    import asunit.framework.TestCase;
    import flash.events.Event;

    public class AsyncMethodTest extends TestCase {
        private var instance:AsyncMethod;

        public function AsyncMethodTest(methodName:String=null) {
            super(methodName)
        }

        override protected function setUp():void {
            super.setUp();
            instance = new AsyncMethod();
        }

        override protected function tearDown():void {
            super.tearDown();
            instance = null;
        }

        public function testInstantiated():void {
            assertTrue("instance is AsyncMethod", instance is AsyncMethod);
        }

        public function testDoSomething():void {
            instance.addEventListener(Event.COMPLETE, addAsync());
            instance.doSomething();
        }
    }
}