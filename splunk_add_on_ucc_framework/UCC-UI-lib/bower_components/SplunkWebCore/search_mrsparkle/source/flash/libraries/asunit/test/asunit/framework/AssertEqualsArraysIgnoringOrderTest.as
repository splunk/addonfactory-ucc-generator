package asunit.framework
{
    import asunit.errors.AssertionFailedError;
    import asunit.framework.TestCase;
    import asunit.framework.Assert;
    
    /**
     * Tests assertEqualsArraysIgnoringOrder
     * 
     * @author Bastian Krol
     */
    public class AssertEqualsArraysIgnoringOrderTest extends TestCase {
        
        public function AssertEqualsArraysIgnoringOrderTest(testMethod:String = null) {
            super(testMethod);
        }
        
        public function testNullEqualsNull():void {
            assertEqualsArraysIgnoringOrder(Assert.assertEqualsArraysIgnoringOrder, null, null);
        }

        public function testNullDoesNotEqualNotNull():void {
            assertAssertionFailed(Assert.assertEqualsArraysIgnoringOrder, null, []);
        }

        public function testNotNullDoesNotEqualNull():void {
            assertAssertionFailed(Assert.assertEqualsArraysIgnoringOrder, [], null);
        }
    
        public function testEmptyArrayEqualsEmptyArray():void {
            assertEqualsArraysIgnoringOrder([], []);
        }

        public function testArrayWithOneStringEquals():void {
            assertEqualsArraysIgnoringOrder(["abcdefg"], ["abcdefg"]);
        }
        
        public function testArrayWithOneStringNotEquals():void {
            assertAssertionFailed(Assert.assertEqualsArraysIgnoringOrder, ["abcdefg"], ["12345"]);
        }

        public function testArrayWithOneFunctionEquals():void {
            assertEqualsArraysIgnoringOrder([tearDown], [tearDown]);
        }
        
        public function testArrayWithOneFunctionNotEquals():void {
            assertAssertionFailed(Assert.assertEqualsArraysIgnoringOrder, [setUp], [tearDown]);
        }
        
        public function testArrayWithOneNullMemberEquals():void {
            assertEqualsArraysIgnoringOrder([null], [null]);
        }

        public function testArrayWithOneNullMemberNotEquals1():void {
            assertAssertionFailed(Assert.assertEqualsArraysIgnoringOrder, ["..."], [null]);
        }

        public function testArrayWithOneNullMemberNotEquals2():void {
            assertAssertionFailed(Assert.assertEqualsArraysIgnoringOrder, [null], ["..."]);
        }

        public function testArrayEqualsSameOrder():void {
            assertEqualsArraysIgnoringOrder(["abc", "def", "ghi"], ["abc", "def", "ghi"]);
        }

        public function testArrayNotEquals():void {
            assertAssertionFailed(Assert.assertEqualsArraysIgnoringOrder, ["abc", "def", "ghi"], ["abc", "xyz", "ghi"]);
        }
        
        public function testArrayEqualsDifferentOrder1():void {
            assertEqualsArraysIgnoringOrder(["abc", "def", "ghi"], ["def", "abc", "ghi"]);
        }

        public function testArrayEqualsDifferentOrder2():void {
            assertEqualsArraysIgnoringOrder([setUp, tearDown, cleanUp], [cleanUp, tearDown, setUp]);
        }

        public function testArrayEqualsDifferentTypes():void {
            assertAssertionFailed(Assert.assertEqualsArraysIgnoringOrder,
                ["abc", "def", "ghi"], 
                ["abc", setUp, "ghi"]);
        }

        public function testArrayDifferentLength1():void {
            assertAssertionFailed(Assert.assertEqualsArraysIgnoringOrder, ["abc", "def", "ghi"], ["abc", "def"]);
        }

        public function testArrayDifferentLength2():void {
            assertAssertionFailed(Assert.assertEqualsArraysIgnoringOrder, ["abc", "def"], ["abc", "def", "ghi"]);
        }
    }
}