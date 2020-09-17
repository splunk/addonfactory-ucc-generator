For the purpose of the following test example, we'll be using a Runner that
looks like this:

package {
    import asunit.textui.TestRunner;
    import controls.ViewComponentTest;
    
    public class SomeProjectRunner extends TestRunner {

        public function SomeProjectRunner() {
            // start(clazz:Class, methodName:String, showTrace:Boolean)
            // NOTE: sending a particular class and method name will
            // execute setUp(), the method and NOT tearDown.
            // This allows you to get visual confirmation while developing
            // visual entities
            start(ViewComponentTest, 'testGoToHalfSize', TestRunner.SHOW_TRACE);
        }
    }
}
