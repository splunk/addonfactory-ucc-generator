import os
import sys
import shutil
import glob
import tarfile
import logging
from helmut.splunk.local import LocalSplunk

class InstallUtilNew:

    def __init__(self, soln, splunk_home, logger=logging.getLogger('InstallUtilNew')):
        """
        Constructor of the InstallUtil object.
        """
        self.logger = logger
        self.soln = soln
        self.splunk_home = splunk_home
        self.start_splunk = True
        self.deployment_target = False

    def toggle_splunk_start(self,toggle):
        self.start_splunk = toggle

    def toggle_deployment_target(self,toggle):
        self.deployment_target = toggle

    def launch_splunk(self):
        self.splunk_cli = LocalSplunk(self.splunk_home)
        self.splunk_cli.start("--accept-license")

    def get_solution(self, release=None, major_version=None, minor_version=None):

        self.soln_root = os.environ["SOLN_ROOT"]
        self.logger.info("SOLN_ROOT:" + self.soln_root)

        copyfrom_dir = None
        self.logger.debug("Running on this platform: " + sys.platform)

        """ Install latest released build -- http://sc-build.sv.splunk.com:8081/releases/$app/latest/
            Install specific released build -- http://sc-build.sv.splunk.com:8081/releases/$app/releases/major_version/minor_version
            Install latest build -- http://sc-build.sv.splunk.com:8081/builds/"""
        if(release is "latest"):
            copyfrom_dir = os.path.join(os.path.expanduser("~"), "releases", self.soln, "latest")
        elif release is "releases":
            copyfrom_dir = os.path.join(os.path.expanduser("~"), "releases", self.soln, "releases", major_version, minor_version)
        else:
            copyfrom_dir = os.path.join(os.path.expanduser("~"), "builds", self.soln)

        self.logger.info("Copying solution from this directory: " + copyfrom_dir)
        # grab the latest file from builds dir
        file_tocopy = glob.glob(os.path.join(copyfrom_dir, "*.*"))

        if file_tocopy == None:
            self.logger.info("glob.glob returned None for " + os.path.join(copyfrom_dir, "*.*"))
            return None
        else:
            self.logger.info("glob.glob returned " + str(file_tocopy))

        self.logger.info("Copying file: " + str(file_tocopy[0]))

        #shutil.copy(file_tocopy, local_file)

        separator = None

        if sys.platform.startswith("win"):
          separator = '\\'
        else:
          separator = '/'

        file_name = file_tocopy[0][file_tocopy[0].rfind(separator) + 1 : ]

        # get solution on local machine
        shutil.copy(file_tocopy[0], file_name)

        # return just the file name
        return file_name

    def install_solution(self, package):
        test_dir = os.getcwd()

        if self.deployment_target == True: destination = 'deployment-apps'
        else: destination = 'apps'

        splunk_etc_apps = os.path.join(self.splunk_home, 'etc', destination)
        self.logger.info("Installing app:" + splunk_etc_apps)
        shutil.copy(package, splunk_etc_apps)

        os.chdir(splunk_etc_apps)

        # assume that we work only with .tar.gz and .spl files
        tar = tarfile.open(package)
        tar.extractall()
        tar.close()

        os.remove(package)

        #By default we start splunk
        if self.start_splunk == True:
            self.logger.info("Starting splunk")
            self.launch_splunk()
        else:
            self.logger.info("Skipping splunk start")

        os.chdir(test_dir)

    def remove_old_solution(self,package):
        if self.deployment_target == True: destination = 'deployment-apps'
        else: destination = 'apps'

        splunk_etc_apps = os.path.join(self.splunk_home,'etc',destination)
        solution_dir = package.split(os.sep)[-1].split('.')[0]
        solution_deploy_dir = os.path.join(splunk_etc_apps,solution_dir)
        #print solution_deploy_dir
        self.logger.info("Removing Tree:" + solution_deploy_dir)
        shutil.rmtree(solution_deploy_dir)

