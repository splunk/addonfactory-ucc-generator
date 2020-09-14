package asunit.textui {
    import asunit.framework.TestSuite;
    import asunit.textui.TestRunnerTest;

    public class AllTests extends TestSuite {

        public function AllTests() {
            addTest(new asunit.textui.TestRunnerTest());
        }
    }
}
