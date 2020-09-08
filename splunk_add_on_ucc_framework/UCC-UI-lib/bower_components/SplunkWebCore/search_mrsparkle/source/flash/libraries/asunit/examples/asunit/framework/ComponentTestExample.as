And finally, the test case that will validate the ViewComponent class and
it's goToHalfSize method.

package controls {

    import asunit.framework.TestCase;

    public class ViewComponentTest extends TestCase {
        private var instance:ViewComponent;

        public function ViewComponentTest(methodName:String=null) {
            super(methodName)
        }

        override protected function setUp():void {
            super.setUp();
            instance = new ViewComponent();
            addChild(instance);
        }

        override protected function tearDown():void {
            super.tearDown();
            removeChild(instance);
            instance = null;
        }

        public function testInstantiated():void {
            assertTrue("instance is ViewComponent", instance is ViewComponent);
        }

        public function testGoToHalfSize():void {
            instance.width = 400;
            instance.height = 200;
            instance.goToHalfSize();

            assertEquals('width', 200, instance.width);
            assertEquals('height', 100, instance.height);
        }
    }
}