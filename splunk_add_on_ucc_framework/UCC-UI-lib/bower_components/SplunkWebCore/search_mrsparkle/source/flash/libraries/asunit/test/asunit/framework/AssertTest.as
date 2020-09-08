package asunit.framework {

    public class AssertTest extends TestCase {
        
        public function AssertTest(testMethod:String = null) {
            super(testMethod);
        }

        public function testAssertTrue():void {
            assertTrue(true);
        }
        
        public function testAssertFalse():void {
            assertFalse(false);
        }
        
        public function testAssertFalseWithMessage():void {
            assertFalse("message", false);
        }
        
        public function testAssertTrueWithMessage():void {
            assertTrue("message", true);
        }

        public function testAssertTrueFailure():void {
            try {
                assertTrue(false);
            }
            catch(e:Error) {
                return;
            }
            assertTrue("assertTrue(false) should have failed but didn't", false);
        }

        public function testAssertTrueMessage():void {
            assertTrue("asertTrue with message", true);
        }

        public function testAssertTrueMessageFailure():void {
            try {
                assertTrue("trueMessage", false);
            }
            catch(e:Error) {
                return;
            }
            assertTrue("assertTrue('message', false) should have failed but didn't", false);
        }

        public function testFail():void {
            try {
                Assert.fail("this shouldn't be caught");
            }
            catch(e:Error) {
                assertTrue("passed", true);
                return;
            }
            fail("failure should be thrown");
        }
        
        public function testAssertEqualsSimple():void {
            var obj1:Object = new Object();
            assertEquals(obj1, obj1);
        }
        
        public function testEqualsMethod():void {
            var obj1:Object = new Object();
            obj1.equals = function():Boolean {
                return true;
            };
            
            var obj2:Object = new Object();
            obj2.equals = function():Boolean {
                return true;
            };
            assertEquals(obj1, obj2);
        }
        
        public function testEqualsSimpleMessage():void {
            var obj1:Object = new Object();
            assertEquals("message", obj1, obj1);
        }
        
        public function testEqualsFailure():void {
            var obj1:Object = new Object();
            var obj2:Object = new Object();
            try {
                assertEquals(obj1, obj2);
            }
            catch(e:Error) {
                return;
            }
            fail("obj1 does not equal obj2");
        }

        public function testEqualsSimpleMessageFailure():void {
            try {
                var obj1:Object = new Object();
                var obj2:Object = new Object();
                assertEquals("message", obj1, obj2);
            }
            catch(e:Error) {
                return;
            }
            fail("obj1 does not equal obj2 with message");
        }
        
        public function testNull():void {
            assertNull(null);
        }
        
        public function testNullMessage():void {
            assertNull("message", null);
        }
        
        public function testNullFailure():void {
            var obj:Object = new Object();
            try {
                assertNull("message", obj);
            }
            catch(e:Error) {
                return;
            }
            fail("null failure");
        }
        
        public function testNotNull():void {
            var obj:Object = new Object();
            assertNotNull(obj);
        }
        
        public function testNotNullFailure():void {
            try {
                assertNotNull(null);
            }
            catch(e:Error) {
                return;
            }
            fail("not null failed");
        }
        
        public function testNotNullMessage():void {
            var obj:Object = new Object();
            assertNotNull("not null", obj);
        }
        
        public function testSame():void {
            var obj:Object = new Object();
            assertSame(obj, obj);
        }
        
        public function testSameFailure():void {
            try {
                assertSame(new Object(), new Object());
            }
            catch(e:Error) {
                return;
            }
            fail("same failure");
        }
        
        public function testNotSame():void {
            var obj1:Object = new Object();
            var obj2:Object = new Object();
            assertNotSame(obj1, obj2);
        }
        
        public function testNotSameFailure():void {
            var obj1:Object = new Object();
            try {
                assertNotSame(obj1, obj1);
            }
            catch(e:Error) {
                return;
            }
            fail("not same failure");
        }
        
        public function testNotSameMessage():void {
            var obj1:Object = new Object();
            var obj2:Object = new Object();
            assertNotSame("not same message", obj1, obj2);
        }
    }
}
