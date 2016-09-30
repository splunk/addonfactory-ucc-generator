'''
This module implements a wrapper class for the artifactory library : https://pypi.python.org/pypi/artifactory/0.1.11
The concrete classes implement Apps specific artifactory logic.
'''
import sys
from itertools import islice

from artifactory import ArtifactoryPath
from utility import *

from common_utils import dump_args


class _Artifactory:

    @dump_args
    def __init__(self, serverpath, repofolder):
        self.artifactorypath = ArtifactoryPath(serverpath + repofolder)

    @dump_args
    def upload(self, folder, file, buildnumber, commit):
        latestpath = self.artifactorypath.joinpath(folder)
        #if(file != None):
        #    latestpath.deploy_file(file)
        #    print 'Uploaded file : ' + file
        latestpath.deploy_file(file)
        print 'Uploaded file : ' + file
        properties = {
            "build.number": str(buildnumber),
            "commit": str(commit)
        }
        build_results_url = os.environ.get("BUILD_RESULTS_URL", "")
        if build_results_url:
            properties['build_commits_url'] = build_results_url + "/commit"

        latestpath.set_properties(properties);

    @dump_args
    def download(self, pathobj):
        if not pathobj.exists():
            print str(pathobj) + ' does not exist in Artifactory!'
            return

        fullpath = str(pathobj)
        filename = fullpath[fullpath.rfind('/') + 1:]

        if filename != "" and filename != "buildnote.txt":
            currentdir = os.getcwd();
	    delete_oldpkgs(currentdir,filename)
            filepath = ArtifactoryPath(pathobj)
            with filepath.open() as fd:
                with open(filename, "wb") as out:
                    out.write(fd.read())
                print 'Successfully downloaded ' + filename + ' from Artifactory into \'' + currentdir + '\''
                return filename

    @dump_args
    def readfile(self, folder, file):
        filepath = self.artifactorypath.joinpath(folder + '/' + file)
	if not filepath.is_file():
	    raise Exception("Path \'" +  str(filepath) + "\' is invalid")

        response = filepath.open().read().split("\n")

        if len(response) == 2:
            return response[0]
        else:
            return response[0].split("=")[1]

    @dump_args
    def backupfolder(self, bkupname):
        latestpath = self.artifactorypath.joinpath('latest')
        bkuppath = self.artifactorypath.joinpath(bkupname)
        latestpath.move(bkuppath)
	buildprops = bkuppath.properties
	if buildprops:
	   properties = {
              "build.number": buildprops['build.number'][0],
              "commit": buildprops['commit'][0]
           }
           bkuppath.set_properties(properties);
        print 'Backed up : ' + str(bkuppath)

    @dump_args
    def getcount(self):
        if not self.artifactorypath.exists():
            return -1
        return sum(1 for _ in self.artifactorypath.__iter__())

    @dump_args
    def purge(self):
        pathlist = list(str(item) for item in self.artifactorypath.__iter__())
        pathlist.sort(key=natural_keys)
        ArtifactoryPath(pathlist[0]).rmdir()


class _AppArtifactory(_Artifactory):

    def __init__(self, serverpath, repofolder):
        _Artifactory.__init__(self, serverpath, repofolder)

    @dump_args
    def getlastbuildnumber(self):
        latestartifact = self.artifactorypath.joinpath('latest')
        buildprops = latestartifact.properties;		
	if not buildprops:
	    print 'Build property not set in Artifactory.  Reading from buildnote.txt'
	    return _Artifactory.readfile(self, 'latest', 'buildnote.txt')
	else:
	    print 'Reading build property from Artifactory.'
            return buildprops['build.number'][0]

    @dump_args
    def backuplatest(self, bkupfoldername):
        _Artifactory.backupfolder(self, bkupfoldername)

    @dump_args
    def createlatestfolder(self, buildnumber, commit):
        if not self.artifactorypath.exists():
            self.artifactorypath.mkdir()
        newpath = self.artifactorypath.joinpath('latest')
        if not newpath.exists():
            newpath.mkdir()
        print 'Upload path : ' + str(newpath)

    @dump_args
    def download(self, downloadpath):
        downloaded = []
        pathlist = []

        pathlist = self.get_artifacts(); 

        # Switch to contrib folder before downloading
        if pathlist:
            downloadpath = downloadpath[0:downloadpath.rfind('/')]
            curdir = os.getcwd()
            prepare_path(downloadpath)
            os.chdir(downloadpath)
            for i in pathlist:
                downloaded.append(_Artifactory.download(self, i))
            # Switch back to last working directory
            os.chdir(curdir)

        return downloaded

    @dump_args
    def get_artifacts(self):
        pathlist = []

	if self.artifactorypath.is_dir():
            for i in self.artifactorypath.__iter__():
                pathlist.append(i)
        else:
            pathstr = str(self.artifactorypath)
            if "*." in pathstr:
                rslash = pathstr.rfind('/')
                name = pathstr[rslash + len('*.') - 1:]
                self.artifactorypath = ArtifactoryPath(pathstr[0:rslash])
                if list(self.artifactorypath.glob(name)):
                    for p in self.artifactorypath.glob(name):
                        pathlist.append(p)
            else:
                pathlist.append(self.artifactorypath)

	if len(pathlist) == 0:
	    raise Exception("Path \'" + str(self.artifactorypath) + "\' does not exist in artifactory")

	return pathlist
