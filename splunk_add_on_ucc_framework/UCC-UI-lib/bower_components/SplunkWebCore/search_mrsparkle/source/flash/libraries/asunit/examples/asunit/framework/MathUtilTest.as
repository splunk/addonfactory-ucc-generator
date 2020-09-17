// Assume we are testing a class that looks like this:
package utils {
    
    public class MathUtil {
        
        // Add one to the number provided:
        public function addOne(num:Number):Number {
            return num + 1;
        }
    }
}


// This is a test case for the class above:
package utils {

    import asunit.framework.TestCase;

    public class MathUtilTest extends TestCase {
        private var mathUtil:MathUtil;

        public function MathUtilTest(methodName:String=null) {
            super(methodName)
        }

        override protected function setUp():void {
            super.setUp();
            mathUtil = new MathUtil();
        }

        override protected function tearDown():void {
            super.tearDown();
            mathUtil = null;
        }

        public function testInstantiated():void {
            assertTrue("mathUtil is MathUtil", mathUtil is MathUtil);
        }

        public function testAddOne():void {
            assertEquals(5, mathUtil.addOne(4));
        }
    }
}
