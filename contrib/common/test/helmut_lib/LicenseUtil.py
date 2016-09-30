import os
import shutil
from helmut.splunk.local import LocalSplunk

class LicenseUtil(object):

    def __init__(self, logger):
        """
        Constructor of the LicenseUtil object.
        """
        self.logger = logger
	self.splunk_home = os.environ["SPLUNK_HOME"]
	if (self.splunk_home is None):
           self.logger.error("SPLUNK_HOME is not set") 
	self.splunk_cli = LocalSplunk(self.splunk_home)

  
    def add_license(self):
        license_file = os.path.join(os.environ["SOLN_ROOT"], 'common', 'test', 'data', 'licenses', '500MB-nodup-1.lic')
        command = 'add license {0} -auth admin:changeme'.format(license_file)
        (code, stdout, stderr) = self.splunk_cli.execute(command)
        print stdout
        if stdout != '':
            print "Restarting splunk"
            #code = nightlysplunk.restart()
        return(stdout, stderr)

        self.logger.debug("Added 500MB-nodup-1.lic license to local splunk server.")
        
    def add_5tb_license(self):
        """
        Add the 5TB license to local splunk instance.
        """
        license_file = os.path.join(os.environ["SOLN_ROOT"], 'common', 'test', 'data', 'licenses', '5TB-1.lic')
        command = 'add license {0} -auth admin:changeme'.format(license_file)
        (code, stdout, stderr) = self.splunk_cli.execute(command)
        print stdout
        if stdout != '':
            print "Restarting splunk"
            #code = nightlysplunk.restart()
        return(stdout, stderr)
        self.logger.debug("Added 5TB-1.lic license to local splunk server.")
        

