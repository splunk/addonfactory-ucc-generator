package {
    import asunit.framework.TestSuite;
    import asunit.framework.AssertTest;
    import asunit.framework.AssertEqualsArraysIgnoringOrderTest;
    import asunit.framework.AssertEqualsArraysTest;
    import asunit.framework.AsyncMethodTest;
    import asunit.framework.TestCaseTest;
    import asunit.framework.TestFailureTest;
    import asunit.framework.VisualTestCaseTest;
    import asunit.textui.TestRunnerTest;
    import asunit.util.ArrayIteratorTest;

    public class AllTests extends TestSuite {

        public function AllTests() {
            addTest(new asunit.framework.AssertTest());
            addTest(new asunit.framework.AssertEqualsArraysTest());
            addTest(new asunit.framework.AssertEqualsArraysIgnoringOrderTest());
            addTest(new asunit.framework.AsyncMethodTest());
            addTest(new asunit.framework.TestCaseTest());
            addTest(new asunit.framework.TestFailureTest());
            addTest(new asunit.framework.VisualTestCaseTest());
            addTest(new asunit.textui.TestRunnerTest());
            addTest(new asunit.util.ArrayIteratorTest());
        }
    }
}
