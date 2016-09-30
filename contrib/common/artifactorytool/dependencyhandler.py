'''
This module implements classes to download dependencies required by the build.
'''

from abc import ABCMeta, abstractmethod
import command
from specification import _LocalPullSpec, _RemotePullSpec
from dependency import _Dependency
from configwrapper import _ConfigWrapper
from utility import *

from common_utils import dump_args


class _DependencyHandler:

    __metaclass__ = ABCMeta

    @dump_args
    def __init__(self):
        print 'Preparing to update dependencies...'

    @abstractmethod
    def handle(self, dependency):
	print 'Checking for dependency \'' + dependency.get_name() + '\''
        return

class _AppsDependencyHandler(_DependencyHandler):

    @dump_args
    def __init__(self):
        super(_AppsDependencyHandler, self).__init__()

    @dump_args
    def handle(self, dependency):
        super(_AppsDependencyHandler, self).handle(dependency)

        localpullpec = _LocalPullSpec(dependency)
        remotepullspec = _RemotePullSpec(dependency)

	try:
            if localpullpec.IsSatisfied():
                print 'Copying \'' + dependency.get_name() + '\' from local folder'
                command._PullLocalCommand(dependency).execute()
            elif remotepullspec.IsSatisfied():
                print 'Pulling \'' + dependency.get_name() + '\' from artifactory'
                command._PullArtifactoryCommand(dependency).execute()
        except LocalCopyExists as e:
            print 'The requested dependency  \'' + e.filename + '\' already exists in ' + '\'' + dependency.get_contribpath() + '\'. Skipping...'
            pass
        except Exception as e:
            print e
            pass

class _DependencyCollection():

    @dump_args
    def __init__(self, dependlist, localdeps=False, refreshdeps=False):
        config = _ConfigWrapper()
        local_path = config.get_value('dep_paths', 'local_path')
        contrib_path = config.get_value('dep_paths', 'contrib_path')

        self.dependencies = []

        if not dependlist:
            dependlist = ['dep:']

        for s in config.get_sections(dependlist):
            options = config.get_section_map(s)
            dependency = _Dependency(s[4:],
                                     options['path'],
                                     options['uncompress'].lower() == 'true',
                                     localdeps,
                                     refreshdeps,
                                     contrib_path,
                                     local_path)
            self.dependencies.append(dependency)

    @dump_args
    def run(self, dependencyhandler):

        for elem in self.dependencies:
            elem.run(dependencyhandler)

    def get_dependencies(self):
        return self.dependencies
