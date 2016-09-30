'''
The ConfigWrapper classes implements methods to read/write the configuration data from the app_artifactory.ini file.
'''
import os
import ConfigParser

from common_utils import dump_args


class SingletonMetaClass(type):

    @dump_args
    def __init__(cls, name, bases, dict):
        super(SingletonMetaClass, cls)\
            .__init__(name, bases, dict)
        original_new = cls.__new__

        def my_new(cls, *args, **kwds):
            if cls.instance is None:
                cls.instance = \
                    original_new(cls, *args, **kwds)
            return cls.instance
        cls.instance = None
        cls.__new__ = staticmethod(my_new)


class _ConfigWrapper:

    __metaclass__ = SingletonMetaClass
    bFirst = True

    @dump_args
    def __init__(self, configpath=''):
        if self.bFirst:
            self.Config = ConfigParser.ConfigParser()
            if not os.path.exists(configpath + '/artifacts.conf'):
                raise ValueError(
                    'Configuration file is not found!',
                    configpath + 'artifacts.conf')
            print 'Config File Path : ' + configpath + '/artifacts.conf'
            self.Config.read(configpath + '/artifacts.conf')
            self.bFirst = False
            self.configpath = configpath

    @dump_args
    def get_value(self, section, key, boolval=False):
        try:
            if boolval:
                value = self.Config.getboolean(section, key)
            else:
                value = self.Config.get(section, key)
            if value == -1:
                print("skip: %s" % key)
        except:
            print("exception: %s not set!" % key)
            value = None
        return value

    @dump_args
    def get_sections(self, taglist):
        sections = []
        for s in self.Config.sections():
            if not taglist or any(s.startswith(i) for i in taglist):
                sections.append(s)
        return sections

    @dump_args
    def get_section_map(self, section):
        dict1 = {}
        options = self.Config.options(section)
        for option in options:
            try:
                dict1[option] = self.Config.get(section, option)
                if dict1[option] == -1:
                    DebugPrint("skip: %s" % option)
            except:
                print(
                    "exception: %s not found in configuration file!" %
                    option)
                dict1[option] = None
        return dict1

    @dump_args
    def get_configpath(self):
        return str(self.configpath)

    @dump_args
    def get_extensions(self):
        return ['.tgz', '.zip', '.tar.bz2', '.tar.gz', '.spl']

    @dump_args
    def set_value(self,section,key,value):
        self.Config.set(section,key,value)
