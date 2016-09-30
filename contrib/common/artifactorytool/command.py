'''
This module implements  command classes for various pull & push commands options
'''

import os
from abc import ABCMeta, abstractmethod
from artifactorywrapper import _AppArtifactory
from configwrapper import _ConfigWrapper
from utility import *
from dependency import _Dependency
import shutil
import tarfile
import zipfile

from common_utils import dump_args


class _Command:

    __metaclass__ = ABCMeta

    @abstractmethod
    def __init__(self):
	return

    @abstractmethod
    def execute(self):
	return

class _PushArtifactoryCommand(_Command):

    @dump_args
    def __init__(self, buildnumber, commit, filelist):
        super(_PushArtifactoryCommand, self).__init__()

        url = _ConfigWrapper().get_value('artifactory', 'url')
        branchpath = _ConfigWrapper().get_value('artifactory', 'branchpath')
        self.artifactoryobj = _AppArtifactory(url, branchpath)

        demopath = _ConfigWrapper().get_value('artifactory', 'demopath')
        if demopath:
            self.artifactorydemoobj = _AppArtifactory(url, demopath)
        else:
            self.artifactorydemoobj = None

        self.buildnumber = buildnumber
        self.commit = commit
        self.filelist = filelist

    @dump_args
    def setup_upload_folder(self):

        if self.artifactoryobj.getcount() <= 0:
            self.artifactoryobj.createlatestfolder(
                self.buildnumber, self.commit)
        else:
            lastbuildnumber = self.artifactoryobj.getlastbuildnumber()

            # if it is the same build then continue to upload in latest
            if(self.buildnumber == lastbuildnumber):
                print 'Upload path : ' + str(self.artifactoryobj.artifactorypath) + '/latest'
                return

            # back up last build, by reading the last build number, create a
            # folder and moving contents of latest to it.
            self.artifactoryobj.backuplatest(lastbuildnumber)
            self.artifactoryobj.createlatestfolder(
                self.buildnumber, self.commit)

           # If number of builds is greater than MAXCOUNT, delete the oldest
           # build.
            maxcount = int(
                _ConfigWrapper().get_value(
                    'artifactory', 'maxcount'))
            if (self.artifactoryobj.getcount() > maxcount):
                self.artifactoryobj.purge()

        if self.artifactorydemoobj:
            if self.artifactorydemoobj.getcount() <= 0:
                self.artifactorydemoobj.createlatestfolder(
                    self.buildnumber, self.commit)
            else:
                self.artifactorydemoobj.purge()
                self.artifactorydemoobj.createlatestfolder(
                    self.buildnumber, self.commit)

    @dump_args
    def execute(self):
        super(_PushArtifactoryCommand, self).execute()

        searchpathval = _ConfigWrapper().get_value('artifactory', 'searchdir')
        configpathval = _ConfigWrapper().get_configpath()
	searchdir = os.path.relpath(searchpathval,configpathval)

        wildcardlist = [t for t in self.filelist if ('*' in t)]
        self.filelist = [t for t in self.filelist if ('*' not in t)]

        if wildcardlist or not self.filelist:
            self.filelist = self.filelist + \
                get_file_list(searchdir, wildcardlist)

        if (len(self.filelist) == 0):
            print 'No files to upload!'
            return

        exists = False
        for file in self.filelist:
            if os.path.exists(file):
                exists = True;
                break;

        if not exists:
            raise Exception('Cannot upload. File(s) ' + str(self.filelist) + ' does not exist.' )

        self.setup_upload_folder()

        for file in self.filelist:
            self.artifactoryobj.upload('latest', file, self.buildnumber, self.commit)

        if self.artifactorydemoobj:
            for file in self.filelist:
                print 'file : ' + file
                self.artifactorydemoobj.upload('latest', file, self.buildnumber, self.commit)


class _PullCommand(_Command):

    @dump_args
    def __init__(self, dependency):
        super(_PullCommand, self).__init__()

        self.dependency = dependency
        self.destpath = self.dependency.get_destpath()


class _PullArtifactoryCommand(_PullCommand):

    _extracted = {}

    @dump_args
    def __init__(self, dependency):
        super(
            _PullArtifactoryCommand,
            self).__init__(dependency)

        url = _ConfigWrapper().get_value('artifactory', 'url')
        self.artifactoryobj = _AppArtifactory(url, dependency.get_path())

    @dump_args
    def execute(self):
        super(_PullArtifactoryCommand, self).execute()

        wanted = self.artifactoryobj.download(self.destpath)

        if self.dependency.get_uncompress():
            # This is the destination of where files will be extracted to

            contrib_path = self.dependency.get_contribpath()
            all_files = os.listdir(contrib_path)
            my_str = ' '.join(all_files)

            for a_file in all_files:
                if a_file in self._extracted:
                    continue
                if a_file in wanted:
                    filename = os.path.basename(a_file)
                    dot = filename.rfind('.')
                    ext = filename[dot:]
                    if ext in _ConfigWrapper().get_extensions():
                        self.uncompress('%s/%s' % (contrib_path, a_file))
                        self._extracted[a_file] = True

    @dump_args
    def get_artifact_list(self):
       return self.artifactoryobj.get_artifacts()

    @dump_args
    def uncompress(self, destfile):
        contrib_path = self.dependency.get_contribpath()

        if (destfile.endswith('.tgz') or destfile.endswith(
                '.tar.gz') or destfile.endswith('.tar.bz2')
                or destfile.endswith('.spl')):
            tar = tarfile.open(destfile)
            tar.extractall(contrib_path)
            tar.close()
        elif destfile.endswith('.zip'):
            with zipfile.ZipFile(destfile, "r") as z:
                z.extractall(contrib_path)
        else:
            print 'ERROR: unable to uncompress ' + self.dependency.get_file()
            return

	print 'Extracted \'' + destfile + '\''

class _PullLocalCommand(_PullCommand):

    @dump_args
    def __init__(self, dependency):
        super(
            _PullLocalCommand,
            self).__init__(dependency)

    @dump_args
    def execute(self):
        super(_PullLocalCommand, self).execute()

	if os.path.isdir(self.destpath):
	    shutil.rmtree(self.destpath)
        copy_dir(self.dependency.get_localpath(), self.destpath)
	delete_oldpkgs(self.dependency.get_contribpath(),self.dependency.get_name())

        print 'Successfully copied \'' +  self.dependency.get_localpath() + '\' to \'' + self.destpath  + '\''
