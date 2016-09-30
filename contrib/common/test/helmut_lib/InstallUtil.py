import os
import sys
import shutil
import glob
import tarfile
import logging
import urllib2
import re
from helmut.splunk.local import LocalSplunk

class InstallUtil:

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
        self.splunk_cli.start()

    def get_ta_solution(self, release=None, major_version=None, minor_version=None):

        self.soln_root = os.environ["SOLN_ROOT"]
        self.logger.info("SOLN_ROOT:" + self.soln_root)

        copyfrom_dir = None
        self.logger.debug("Running on this platform: " + sys.platform)

        if not sys.platform.startswith("win"):
            home_dir = os.environ['HOME']

        """ Install latest released build -- http://ta-build-sec:8081/releases/$app/latest/
            Install specific released build -- http://ta-build-sec:8081/releases/$app/releases/major_version/minor_version
            Install latest build -- http://ta-build-sec:8081/builds/"""
        if(release is "latest"):
            if sys.platform.startswith("win"):
                # If we are on Windows then copy from this UNC path
                copyfrom_dir = "\\\\ta-build-sec\bamboo\\releases\\TA\\" + self.soln + "\\latest\\"
            else:
                # If we are on Linux then copy from this local path
                copyfrom_dir = home_dir + "/releases/TA/" + self.soln + "/latest/"

        elif release is "releases":
            if sys.platform.startswith("win"):
                # If we are on Windows then copy from this UNC path
                copyfrom_dir = "\\\\ta-build-sec\\bamboo\\releases\\TA\\" + self.soln + "\\releases\\" + major_version + "\\" + minor_version + "\\"
            else:
                # If we are on Linux then copy from this local path
                copyfrom_dir = home_dir + "/releases/TA/" + self.soln + "/releases/" + major_version + "/" + minor_version + "/"

        else:
            if sys.platform.startswith("win"):
                # If we are on Windows then copy from this UNC path
                copyfrom_dir = "\\\\ta-build-sec\\bamboo\\builds\\TA\\" + self.soln
            else:
                # If we are on Linux then copy from this local path
                copyfrom_dir = home_dir + "/builds/TA/" + self.soln


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

    def get_solution(self, release=None, major_version=None, minor_version=None):

        self.soln_root = os.environ["SOLN_ROOT"]
        self.logger.info("SOLN_ROOT:" + self.soln_root)
        
        copyfrom_dir = None
        self.logger.debug("Running on this platform: " + sys.platform)
     
        if not sys.platform.startswith("win"):
            home_dir = os.environ['HOME']
 
        """ Install latest released build -- http://sc-build.sv.splunk.com:8081/releases/$app/latest/
            Install specific released build -- http://sc-build.sv.splunk.com:8081/releases/$app/releases/major_version/minor_version
            Install latest build -- http://sc-build.sv.splunk.com:8081/builds/"""
        if(release is "latest"): 
            if sys.platform.startswith("win"):
                # If we are on Windows then copy from this UNC path
                copyfrom_dir = "\\\\sc-build.sv.splunk.com\\bamboo\\releases\\" + self.soln + "\\latest\\"
            else:
                # If we are on Linux then copy from this local path
                copyfrom_dir = home_dir + "/releases/" + self.soln + "/latest/"

        elif release is "releases": 
            if sys.platform.startswith("win"):
                # If we are on Windows then copy from this UNC path
                copyfrom_dir = "\\\\sc-build.sv.splunk.com\\bamboo\\releases\\" + self.soln + "\\releases\\" + major_version + "\\" + minor_version + "\\" 
            else:
                # If we are on Linux then copy from this local path
                copyfrom_dir = home_dir + "/releases/" + self.soln + "/releases/" + major_version + "/" + minor_version + "/"

        else:
            if sys.platform.startswith("win"):
                # If we are on Windows then copy from this UNC path
                copyfrom_dir = "\\\\sc-build\\bamboo\\builds\\" + self.soln
                #copyfrom_dir="c:\\work"
            else:
                # If we are on Linux then copy from this local path
                copyfrom_dir = home_dir + "/builds/" + self.soln

        
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

    def get_solution_using_build_fetcher(self, version="latest"):

        self.soln_root = os.environ["SOLN_ROOT"]
	self.splunk_home = os.environ["SPLUNK_HOME"]
	copyto_dir = os.getcwd()
	self.splunk_pkg_url = None

        self.logger.info("SOLN_ROOT:" + self.soln_root)
        
        self.logger.debug("Running on this platform: " + sys.platform)

   	splunk_pkg_url1 = 'http://sc-build.sv.splunk.com:8081/cgi-bin/app_build_fetcher.py?SOLN=' 
	splunk_pkg_url4 = '&DELIVER_AS=file'

	if (version == "latest") :
   	    splunk_pkg_url2 = '&VERSION=latest' 
	    self.splunk_pkg_url = splunk_pkg_url1 + self.soln + splunk_pkg_url2 + splunk_pkg_url4 
	else:
	    splunk_pkg_url2 = '&VERSION=specific_version' 
   	    splunk_pkg_url3 = '&SPECIFIC_VERSION=' 
	    self.splunk_pkg_url = splunk_pkg_url1 + self.soln + splunk_pkg_url2 + splunk_pkg_url3 + version + splunk_pkg_url4 

	self.logger.info("Splunk package name: " + self.splunk_pkg_url)

	pkg = urllib2.urlopen(self.splunk_pkg_url)
	pkg_name = re.search('filename=(.+)$', pkg.info()['content-disposition']).group(1)
	fd = open(pkg_name, 'wb')
	fd.write(pkg.read())
	fd.close()

        return pkg_name

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
       
