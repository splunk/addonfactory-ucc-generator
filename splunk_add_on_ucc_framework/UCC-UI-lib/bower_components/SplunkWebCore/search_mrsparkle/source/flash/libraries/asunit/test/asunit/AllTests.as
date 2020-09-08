package asunit {
    import asunit.framework.TestSuite;
    import asunit.framework.AllTests;
    import asunit.textui.AllTests;
    import asunit.util.AllTests;

    public class AllTests extends TestSuite {

        public function AllTests() {
            addTest(new asunit.framework.AllTests());
            addTest(new asunit.textui.AllTests());
            addTest(new asunit.util.AllTests());
        }
    }
}
