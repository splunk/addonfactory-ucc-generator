package asunit.util {
    import asunit.framework.TestCase;

    public class ArrayIteratorTest extends TestCase {
        private var itr:ArrayIterator;

        public function ArrayIteratorTest(testMethod:String = null) {
            super(testMethod);
        }

        protected override function setUp():void {
            itr = new ArrayIterator(getSimpleArray(5));
        }
        
        private function getSimpleArray(count:Number):Array {
            var arr:Array = new Array();
            for(var i:Number = 0; i < count; i++) {
                arr.push("item-" + i);
            }
            return arr;
        }

        protected override function tearDown():void {
            itr = null;
        }

        public function testInstantiated():void {
            assertTrue("ArrayIterator instantiated", itr is ArrayIterator);
        }

        public function testHasNext():void {
            assertTrue(itr.hasNext());
        }
        
        public function testNext():void {
            assertEquals("item-0", itr.next());
        }
        
        public function testNextTwice():void {
            assertEquals("item-0", itr.next());
            assertEquals("item-1", itr.next());
        }
        
        public function testLast():void {
            assertTrue(itr.hasNext());
            assertEquals("item-0", itr.next());
            assertTrue(itr.hasNext());
            assertEquals("item-1", itr.next());
            assertTrue(itr.hasNext());
            assertEquals("item-2", itr.next());
            assertTrue(itr.hasNext());
            assertEquals("item-3", itr.next());
            assertTrue(itr.hasNext());
            assertEquals("item-4", itr.next());
            assertFalse(itr.hasNext());
        }
        
        public function testReset():void {
            testLast();
            itr.reset();
            assertTrue(itr.hasNext());
            assertEquals("item-0", itr.next());
        }
    }
}
