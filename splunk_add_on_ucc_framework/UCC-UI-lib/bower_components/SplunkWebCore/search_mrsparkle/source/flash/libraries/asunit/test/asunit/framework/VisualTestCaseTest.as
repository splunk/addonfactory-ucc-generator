package asunit.framework {
    import flash.display.Sprite;
    
    public class VisualTestCaseTest extends TestCase {
        private var instance:Sprite;

        public function VisualTestCaseTest(testMethod:String = null) {
            super(testMethod);
        }

        protected override function setUp():void {
            instance = new Sprite();
            addChild(instance);
        }

        protected override function tearDown():void {
            removeChild(instance);
        }
        
        public function testInstance():void {
            assertTrue(instance is Sprite);
        }
        
        public function testSize():void {
            assertTrue(instance.width == 0);
            assertTrue(instance.height == 0);
        }

        public function testDrawnSize():void {
            instance.graphics.beginFill(0xFF0000);
            instance.graphics.drawRect(0, 0, 10, 20);
            
            assertTrue(instance.width == 10);
            assertTrue(instance.height == 20);
        }

        public function testSecondSize():void {
            assertTrue(instance.width == 0);
            assertTrue(instance.height == 0);
        }

    }
}