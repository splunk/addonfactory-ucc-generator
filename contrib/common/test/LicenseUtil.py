import os
import shutil

from LicenseTestUtil import LicenseTestUtil

import splunk

class LicenseUtil(object):

    def __init__(self, logger):
        """
        Constructor of the LicenseUtil object.
        """
        self.logger = logger

  
    def add_license(self):
        LicenseTestUtil.addlicense(splunk.getLocalServerInfo(), 
                                   os.path.join(os.environ["SOLN_ROOT"], 'common', 'test', 'data', 'licenses', '500MB-nodup-1.lic'), 
                                   password='changeme')
        self.logger.debug("Added 500MB-nodup-1.lic license to local splunk server.")
        
    def add_5tb_license(self):
        """
        Add the 5TB license to local splunk instance.
        """
        LicenseTestUtil.addlicense(splunk.getLocalServerInfo(), 
                                   os.path.join(os.environ["SOLN_ROOT"], 'common', 'test', 'data', 'licenses', '5TB-1.lic'), 
                                   password='changeme')
        self.logger.debug("Added 5TB-1.lic license to local splunk server.")

    def add_50tb_license(self):
        """
        Add the 5TB license to local splunk instance.
        """
        LicenseTestUtil.addlicense(splunk.getLocalServerInfo(), 
                                   os.path.join(os.environ["SOLN_ROOT"], 'common', 'test', 'data', 'licenses', '50TB-1.lic'), 
                                   password='changeme')
        self.logger.debug("Added 50TB-1.lic license to local splunk server.")

        

