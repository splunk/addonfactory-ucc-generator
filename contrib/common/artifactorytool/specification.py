'''
This module implements the conditional logic to decide if the artifacts are to be pulled from a local path or from Artifactory
'''

from abc import ABCMeta, abstractmethod
from utility import *
from configwrapper import _ConfigWrapper
from dependency import _Dependency
import command

from common_utils import dump_args


class _PullSpec:

    __metaclass__ = ABCMeta

    @dump_args
    def __init__(self, dependency):
        self.dependency = dependency

    @dump_args
    @abstractmethod
    def IsSatisfied(self):

        bPull = False

        if '*' in self.dependency.get_file():
            # Limitation - In case of wildcard force a refresh. The files may
            # exist locally but there is no easy and quick way to determine if
            # all exist.
            bPull = True
        elif self.dependency.get_refreshdeps():
            # force update
            bPull = True

        return bPull


class _LocalPullSpec(_PullSpec):

    @dump_args
    def __init__(self, dependency):
        super(_LocalPullSpec, self).__init__(dependency)

    @dump_args
    def IsSatisfied(self):

        bPull = super(_LocalPullSpec, self).IsSatisfied()

	if self.dependency.get_localdeps() and self.dependency.get_uncompress() and os.path.isdir(self.dependency.get_localpath()):
	    if bPull:
	        return True
	    else:
	        if os.path.isdir(self.dependency.get_destpath()):
		   raise LocalCopyExists(True,self.dependency.get_destpath()) 
		else:
		    bPull = True
	else:
	    bPull = False
		
        return bPull 

class _RemotePullSpec(_PullSpec):

    @dump_args
    def __init__(self, dependency):
        super(_RemotePullSpec, self).__init__(dependency)

    @dump_args
    def IsSatisfied(self):

        bPull = super(_RemotePullSpec, self).IsSatisfied()

        file = self.dependency.get_file();

        if bool(file):
           dot = file.rfind('.')
           ext = file[dot:]
           if ext in _ConfigWrapper().get_extensions():
               if not os.path.exists(self.dependency.get_contribpath() + '/' + file):
                   if bPull == False:
                       bPull = True
               else:
                   if bPull == False:
                       raise LocalCopyExists(file)
                   else:
                       print '\'' + file + '\' already  exists in \'' + self.dependency.get_contribpath() + '\'. Will be overwritten...'
           else:
               raise Exception("\'" + ext + "\' is not supported")
        else:
            try:
                artifacts = command._PullArtifactoryCommand(self.dependency).get_artifact_list()
		if len(artifacts) > 1:
		    bPull = True;
		else:
		    fullpath = str(artifacts[0])
                    filename = fullpath[fullpath.rfind('/') + 1:]
                    if os.path.exists(self.dependency.get_contribpath() + '/' + filename):
                        if bPull == True:
                            print 'Artifactory version \'' + filename + '\' already  exists in \'' + self.dependency.get_contribpath() + \
                              '\'. Will be overwritten...'
                        else:
                            raise LocalCopyExists(filename);
                    else:
                        if bPull == False:
                            bPull = True;
            except:
                raise

        return bPull
