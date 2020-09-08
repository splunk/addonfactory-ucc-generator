package asunit.framework {
    import asunit.framework.TestSuite;
    import asunit.framework.AssertTest;
    import asunit.framework.AssertEqualsArraysIgnoringOrderTest;
    import asunit.framework.AssertEqualsArraysTest;
    import asunit.framework.AsyncMethodTest;
    import asunit.framework.TestCaseTest;
    import asunit.framework.TestFailureTest;
    import asunit.framework.VisualTestCaseTest;

    public class AllTests extends TestSuite {

        public function AllTests() {
            addTest(new asunit.framework.AssertTest());
            addTest(new asunit.framework.AssertEqualsArraysTest());
            addTest(new asunit.framework.AssertEqualsArraysIgnoringOrderTest());
            addTest(new asunit.framework.AsyncFailureTest());
            addTest(new asunit.framework.AsyncMethodTest());
            addTest(new asunit.framework.TestCaseTest());
            addTest(new asunit.framework.TestFailureTest());
            addTest(new asunit.framework.VisualTestCaseTest());
        }
    }
}
