package asunit.framework 
{
    import asunit.errors.AssertionFailedError;
    import asunit.framework.TestCase;
    import asunit.framework.Assert;
    
    /**
     * Tests assertEqualsArrays
     * 
     * @author Bastian Krol
     */
    public class AssertEqualsArraysTest extends TestCase {
        
        public function AssertEqualsArraysTest(testMethod:String = null) {
            super(testMethod);
        }
        
        public function testNullEqualsNull():void {
            assertEqualsArrays(null, null);
        }

        public function testNullDoesNotEqualNotNull():void {
            assertAssertionFailed(Assert.assertEqualsArrays, null, []);
        }

        public function testNotNullDoesNotEqualNull():void {
            assertAssertionFailed(Assert.assertEqualsArrays, [], null);
        }
    
        public function testEmptyArrayEqualsEmptyArray():void {
            assertEqualsArrays([], []);
        }

        public function testArrayWithOneStringEquals():void {
            assertEqualsArrays(["abcdefg"], ["abcdefg"]);
        }
        
        public function testArrayWithOneStringNotEquals():void {
            assertAssertionFailed(Assert.assertEqualsArrays, ["abcdefg"], ["12345"]);
        }

        public function testArrayWithOneFunctionEquals():void {
            assertEqualsArrays([tearDown], [tearDown]);
        }
        
        public function testArrayWithOneFunctionNotEquals():void {
            assertAssertionFailed(Assert.assertEqualsArrays, [setUp], [tearDown]);
        }
        
        public function testArrayWithOneNullMemberEquals():void {
            assertEqualsArrays([null], [null]);
        }

        public function testArrayWithOneNullMemberNotEquals1():void {
            assertAssertionFailed(Assert.assertEqualsArrays, ["..."], [null]);
        }

        public function testArrayWithOneNullMemberNotEquals2():void {
            assertAssertionFailed(Assert.assertEqualsArrays, [null], ["..."]);
        }

        public function testArrayEquals():void {
            assertEqualsArrays(["abc", "def", "ghi"], ["abc", "def", "ghi"]);
        }

        public function testArrayNotEquals():void {
            assertAssertionFailed(Assert.assertEqualsArrays, ["abc", "def", "ghi"], ["abc", "xyz", "ghi"]);
        }
        
        public function testArrayDifferentLength1():void {
            assertAssertionFailed(Assert.assertEqualsArrays, ["abc", "def", "ghi"], ["abc", "def"]);
        }

        public function testArrayDifferentLength2():void {
            assertAssertionFailed(Assert.assertEqualsArrays, ["abc", "def"], ["abc", "def", "ghi"]);
        }

        public function testArrayEqualsWhatever():void {
            assertAssertionFailed(Assert.assertEqualsArrays, ["abc", "def", "", "jkl"], ["abc", "def", null, "jkl"]);
        }
    }
}