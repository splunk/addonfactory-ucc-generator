package asunit.framework
{
    import asunit.errors.AssertionFailedError;
    import asunit.framework.Assert;

    internal function assertAssertionFailed(assertFunction:Function, expected:Object, actual:Object):void {
        var succeeded:Boolean = false;
        try {
            assertFunction.apply(null, [expected, actual]);
            succeeded = true;
        }
        catch (e:AssertionFailedError) {
            // expected
        }
        if (succeeded) {
            Assert.fail("expected AssertionFailedError");
        }
    }
}