from SplunkRole import SplunkRole


class LicenseMaster(SplunkRole):
    def __init__(self, instance, logger, exceptions):
        SplunkRole.__init__(self, instance, logger, exceptions)
        self.role = "license_master"

    def setup(self, license_paths):
        try:
            self.logger.info("Setting up license master on host: %s", self.host)
            for license_path in license_paths:
                self.utils.add_license(self.instance, license_path)
            self.splunk.restart()
        except Exception, e:
            self.exceptions.append(["Exception found in setup for host:" + self.host, 'Message: ' + e.message])