# These steps are necessary to run/install the artifactorytool from pypi

1. Create a pip.conf file in ~/.pip directory

[global]
index-url = http://repo.splunk.com/artifactory/api/pypi/pypi-local/simple
trusted-host = repo.splunk.com
target = pypi_modules

2. To install the module
[ Do this in the same dir as the grunt package you are working on ]

$ pip install --pre artifactory_tool

3. To run from installed location

$ chmod 0755 pypi_modules/artifactory_tool/artifacts.py


[ OPTIONAL: Bamboo server configuration ]

# To package and push a new version of the artifactorytool to the local pypi

0. Configure your local ~/.pypirc to look like this 
(this config uses your Active Directory credentials)

$ cat ~/.pypirc
[distutils]
index-servers =
    local
    pypi
 
[pypi]
repository: https://pypi.python.org/pypi
 
[local]
repository: https://repo.splunk.com/artifactory/api/pypi/pypi-local
username: eblake
password: mys3cret

[ Automated method ]

1. Update the VERSION string in setup.py

2. Run the package and upload script with --upload to do the actual upload

$ python pkg_and_upload.py --upload

[ Manual method ]

1. cd to the directory where artifactorytool is cloned from git

$ cd /path/to/my/artifactorytool-repo

2. Create a temp directory 

$ mkdir -p /tmp/arti_staging/artifactory_tool

3. Copy all the python files to the staging dir

$ cp *py /tmp/arti_staging/artifactory_tool

4. Move the setup.py file up one dir

$ mv /tmp/arti_staging/artifactory_tool/setup.py /tmp/arti_staging

5. Build package and push the new version

$ cd /tmp/arti_staging

$ python setup.py sdist upload -r local


