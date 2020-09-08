package {
    import asunit.framework.TestSuite;
    import errors.CustomErrorTest;
    import net.CustomRequestTest;
    import net.CustomServiceTest;

    public class AllTests extends TestSuite {

        public function AllTests() {
            addTest(new errors.CustomErrorTest());
            addTest(new net.CustomRequestTest());
            addTest(new net.CustomServiceTest());
        }
    }
}
