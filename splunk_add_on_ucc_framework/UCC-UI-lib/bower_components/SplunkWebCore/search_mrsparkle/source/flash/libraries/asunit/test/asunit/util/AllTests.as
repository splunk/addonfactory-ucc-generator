package asunit.util {
    import asunit.framework.TestSuite;
    import asunit.util.ArrayIteratorTest;

    public class AllTests extends TestSuite {

        public function AllTests() {
            addTest(new asunit.util.ArrayIteratorTest());
        }
    }
}
