package asunit.framework {
    import flash.display.Sprite;
    import flash.utils.setTimeout;
    import flash.utils.Timer;
    import flash.events.TimerEvent;

    public class AsyncFailureTest extends TestCase {
        public function AsyncFailureTest(testMethod:String = null) {
            super(testMethod);
        }

        protected override function setUp():void {
        }

        protected override function tearDown():void {
        }

        public function testSuccess():void{
            var wasCalled:Boolean;
            function onAsync():void {
                wasCalled = true;
            }
            function onDone(event:TimerEvent):void {
                assertTrue(wasCalled);
            }
    
            var handler:Function = addAsync(onAsync, 1000);
            var timer:Timer = new Timer(3000, 1);
            timer.addEventListener(TimerEvent.TIMER, onDone);
            timer.start();
            handler();
        }

        public function testAsyncFailed():void{
            var wasCalled:Boolean;
            var failed:Boolean;
            function onAsync():void {
                wasCalled = true;
                fail("Shouldn't have been called");
            }
            function onDone(event:TimerEvent):void {
                assertFalse(wasCalled);
                assertTrue(failed);
            }
            function onFailure():void {
                failed = true;
            }
    
            var handler:Function = addAsync(onAsync, 1000, onFailure);
            var timer:Timer = new Timer(1500, 1);
            timer.addEventListener(TimerEvent.TIMER, onDone);
            timer.start();
        }
    }
}