A python interface to Artifactory.

This module provides the interface for uploading and downloading files from Artifactory.
The goal is to provide a configurable interface that can be used to configure the artifactory requirements
for various Apps projects using the metadata from configuration files.

Setup
-----

1. Download and install the 'artifactory' module.
https://pypi.python.org/pypi/artifactory/0.1.11

2. Install the 'artifactory' module using the 'pip install' command.
pip install artifactory-0.1.12.tar.gz
or
pip install artifactory

3. For uploading build artifacts only:

Create a global configuration file '.artifactory_python.cfg' in you home directory.
This file includes the connection related settings.  There can be multiple entries for different artifactory instances.
Add the below entry into the configuration file; substituting the username and password.

[http://artifactory01.sv.splunk.com/artifactory]
username = <username>
password = <password>

4. Update the config file 'artifacts.conf'. This file includes the configuration details specific to the project.
For now it includes two sections as shown below.

Example artifacts.conf file
---------------------------------------------------------------
[artifactory]
url=http://artifactory01.sv.splunk.com/artifactory/Solutions/
branchpath=Apps
maxcount=10
searchdir=/Users/sgeorge/Perforce/sgeorge_wsp_cm/splunk/cm/artifactory/apps

[dep:search_mrsparkle]
path=mrsparkle/search_mrsparkle_6.2.3.tgz
uncompress=true

[dep:python_dateutil]
path=Common/python_dateutil/1.4.1/python_dateutil-1.4.1-py2.7.egg
uncompress=false

[dep_paths]
contrib_path=./contrib
local_path=../
----------------------------------------------------------------------------------------

Notes:

1) Below are the details of various configuration parameters.

Artifactory:url - path of top level folder in artifactory. So for Soutions team it is the Artifactory path for Solutions.
Artifactory:branchpath - name of the branch in Artifactory. This will be the path directly under 'Solutions' in Artifactory.
Artifactory:maxcount - total number of builds to be retained. On exceeding maxcount the oldest build will be purged.
Artifactory:searchdir - The local path of the generated build artifacts that are to be uploaded to Artifactory.

[dep:*] - List of all dependencies required for the build. Replace '*' with a unique identifier
for each dependency. Note that if uncompress=true this MUST match the name of the directory
created when the file is uncompressed.

dep:path - path to dependency file on artifactory (this is appended to artifactory:url)
dep:uncompress - true if the dependency should be uncompressed (tarballs and zips only)

dep_path:contrib_path - Path of contrib directory on the build machine.  Default is ./contrib
dep_path:dependency_path - Local path of dependencies on the build machine. Default is ../

2) Sometimes when running the tool locally, based on the version of 'requests' you may see the below warning.

'InsecurePlatformWarning: A true SSLContext object is not available. This prevents urllib3 from configuring SSL appropriately
and may cause certain SSL connections to fail.
For more information, see https://urllib3.readthedocs.org/en/latest/security.html#insecureplatformwarning.'

To overcome the warning, you need to install additional security packages.
Run the below command to install the additional packages.

pip install pyopenssl ndg-httpsclient pyasn1

Usage
-----

usage: artifacts.py [-h] [--configpath] [--pull] [--push] [--file] [--buildnumber BUILDNUMBER]
                    [--local_deps] [--refresh_deps] [--verbose]

optional arguments:
  -h, --help            show this help message and exit
  --configpath          path of configuration file
  --branchpath          overrides the path the artifact is published in Artifactory. 
  --pull                copy from local path or download from Artifactory.
  --push                push to Artifactory.
  --file                Upload only select files. It stores as a list and files can be appended to the list
  --buildnumber         bamboo build number
  --commit              git commit hash value
  --local_deps          local_deps flag is ON. First check if the dependent artifacts exists in the local path.
  --refresh_deps        refresh_deps flag is ON.  Forces an update even if a copy exists locally.
  --depends             download only select dependencies. It stores as a list and the dependencies can be appended to the list
  --verbose             output detail information

Examples:

1) Pull - Downloads all build dependencies for specific build from Artifactory and update contrib.

artifacts.py --configpath conf_file_path --pull --refresh_deps

2) Pull - Downloads all build dependencies for specific build from local dependency path and update contrib.

artifacts.py --pull --refresh_deps --local_deps

3) Pull - Downloads select build dependencies only.

artifacts.py -pull --depends *.rpm --depends test.tgz

4) Push - Uploads all generated build artifacts for current build to Artifactory

artifacts.py push --buildnumber 101 --commit 59682370

5) Push - Upload specific files to Artifactory

artifacts.py push --file test.tgz --file *.rpm --buildnumber 101 --commit 59682370
