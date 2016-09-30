'''
This module implements classes to keep track of dependency config
'''

from common_utils import dump_args
from configwrapper import _ConfigWrapper


class _Dependency:

    name = ''
    path = ''
    uncompress = ''
    localdeps = ''
    refreshdeps = ''
    contribpath = ''
    localpath = ''
    destpath = ''
    destfile = ''

    @dump_args
    def __init__(
            self,
            name,
            path,
            uncompress,
            localdeps,
            refreshdeps,
            contrib_path,
            local_path):

        self.name = name
        self.path = path
        self.uncompress = uncompress
        self.localdeps = localdeps
        self.refreshdeps = refreshdeps
	self.file = ''

	dot = path.rfind('.')
    	ext = path[dot:]
    	if ext in _ConfigWrapper().get_extensions():
            last_slash = path.rfind('/')
            if (last_slash == -1):
                self.file = path
            else:
                self.file = path[last_slash + 1:]

        self.contribpath = contrib_path
        self.localpath = local_path + '/' + self.name
        self.destpath = contrib_path + '/' + self.name
        self.destfile = contrib_path + '/' + self.file

    def get_localdeps(self):
        return self.localdeps

    def get_refreshdeps(self):
        return self.refreshdeps

    def get_name(self):
        return self.name

    def get_path(self):
        return self.path

    def get_file(self):
        return self.file

    def get_uncompress(self):
        return self.uncompress

    def get_contribpath(self):
        return self.contribpath

    def get_localpath(self):
        return self.localpath

    def get_destpath(self):
        return self.destpath

    def get_destfile(self):
        if self.destfile.endswith('/'):
            self.destfile = self.destfile[:-1]
        return self.destfile

    def keep_localcopy(self):
	if self.refresh_deps == True:
	    return False
	
        if self.localdeps == True:
	    if os.path.isdir(self.contribpath + '/' + self.name):
	        return True
         
        dot = self.file.rfind('.')
        ext = self.file[dot:]
        if ext in _ConfigWrapper().get_extensions():
            version = re.search('[-]\d+[.]\d+[.]\d+[-]\d+', self.file).group()
            pos = self.file.rfind(version + ext)
            name = self.file[:pos]

        filelist.extend(glob.glob(dir + '/' + name + '*' + ext))
	if (self.contribpath + '/' + self.file) in filelist:
	    return True
	 	

    #@dump_args
    def run(self, dependencyhandler):
        dependencyhandler.handle(self)

    def __str__(self):
        return (
            "name: %s, path: %s, uncompress: %s, localdeps: %s, refreshdeps: %s, "
            "contribpath: %s, localpath: %s, destpath: %s, destfile: %s" %
            (self.name,
             self.path,
             self.uncompress,
             self.localdeps,
             self.refreshdeps,
             self.contribpath,
             self.localpath,
             self.destpath,
             self.destfile))

    def __repr__(self):
        return self.__str__()
