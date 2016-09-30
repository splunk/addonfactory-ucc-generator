"""
Author: Gideon Chia
Contributors: Caleb Cheung
main idea:
python butler.py [dir] ([dir] is a the TA-directory)
-> results in the test folder being populated/generated in dir
"""
from optparse import OptionParser
from pprint import pformat
import re
import os
import sys
import logging
import ConfigParser
import shutil
from test_template import TestTemplate

KEYNOTFOUND = '<KEYNOTFOUND>'       # KeyNotFound for dictDiff


def dict_diff(first, second):
    """ Return a dict of keys that differ with another config object.  If a value is
        not found in one fo the configs, it will be represented by KEYNOTFOUND.
        @param first:   Fist dictionary to diff.
        @param second:  Second dicationary to diff.
        @return diff:   Dict of Key => (first.val, second.val)
    """
    diff = {}
    # Check all keys in first dict
    for key in first.keys():
        if (not second.has_key(key)):
            diff[key] = (first[key], KEYNOTFOUND)
        elif (first[key] != second[key]):
            diff[key] = (first[key], second[key])
    # Check all keys in second dict to find missing
    for key in second.keys():
        if (not first.has_key(key)):
            diff[key] = (KEYNOTFOUND, second[key])
    return diff

""" Logging Setup """
logger = logging.getLogger('butler log')
filehandler = logging.FileHandler('butler.log', 'w')
logger.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(levelname)s: %(message)s')
filehandler.setFormatter(formatter)
logger.addHandler(filehandler)


class C():
    """contains the constants referenced by Butler"""
    FIELDALIAS = 'FIELDALIAS'
    REPORT = 'REPORT'
    FIELDS = 'FIELDS'
    SOURCETYPE = 'sourcetype'
    EVAL= 'EVAL'
    LOOKUP= 'LOOKUP'
    EXTRACT= 'EXTRACT'


class R():
    """contains the regex strings referenced by Butler"""
    PROTOCOL = 'UDP|udp|TCP|tcp'
    METHOD = '.*T'
    IP = '^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$'
    STATUS = '200|404'
    URL = '.*/.*'
    FLOAT = "^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$"
    INTEGER = "^\d+$"
    FIELD_VALUES = {
        'protocol': PROTOCOL,
        'proto': PROTOCOL,
        'dest': IP,
        'src': IP,
        'method': METHOD,
        'status': STATUS,
        'url': URL,
        'uri': URL,
        'ts': FLOAT,
        'dest_port': INTEGER,
        'src_port': INTEGER
    }


def query_yes_no(question, default="yes"):
    """Ask a yes/no question via raw_input() and return their answer.

    "question" is a string that is presented to the user.
    "default" is the presumed answer if the user just hits <Enter>.
        It must be "yes" (the default), "no" or None (meaning
        an answer is required of the user).

    The "answer" return value is one of "yes" or "no".
    """
    valid = {"yes":True,   "y":True,  "ye":True,
             "no":False,     "n":False}
    if default == None:
        prompt = " [y/n] "
    elif default == "yes":
        prompt = " [Y/n] "
    elif default == "no":
        prompt = " [y/N] "
    else:
        raise ValueError("invalid default answer: '%s'" % default)

    while True:
        sys.stdout.write(question + prompt)
        choice = raw_input().lower()
        if default is not None and choice == '':
            return valid[default]
        elif choice in valid:
            return valid[choice]
        else:
            sys.stdout.write("Please respond with 'yes' or 'no' "\
                             "(or 'y' or 'n').\n")


def count_calls(fn):
    """Decorates a function with purpose of counting the calls made to the decorated function"""
    def _counting(*args, **kwargs):
        _counting.calls += 1
        return fn(*args, **kwargs)
    _counting.calls = 0
    return _counting


def supress_duplicates(fn):
    """Decorates a function with purpose of suppressing duplicate calls made to the decorated function"""
    def _function(*args, **kwargs):
        if args in _function.arg_set:
            return ""
        else:
            _function.arg_set.add(args)
            return fn(*args, **kwargs)
    _function.arg_set = set([])
    return _function


logger.error = count_calls(logger.error)
logger.debug = count_calls(logger.debug)
logger.warning = count_calls(logger.warning)

class Paths():
    """Keeps track of the paths important to the specified TA"""
    def __init__(self, ta_directory, codeline):
        if not os.path.isdir(ta_directory):
            logger.error("%s is not a valid directory")
        self.ta_directory = ta_directory if ta_directory[-1] == '/' else ta_directory + '/'
        self.mainline_path = self.ta_directory
        if codeline is not None:
            self.mainline_path += codeline + '/'
        self.package_path = self.mainline_path + 'package/'
        self.default_path = self.find_default_dir()
        self.transforms_path = self.default_path + 'transforms.conf'
        self.props_path = self.default_path + 'props.conf'
        self.commands_path = self.default_path + 'commands.conf'
        self.searchbnf_path = self.default_path + 'searchbnf.conf'
        self.eventtypes_path = self.default_path + 'eventtypes.conf'
        self.tags_path = self.default_path + 'tags.conf'
        self.test_path = self.mainline_path + 'test/'
        self.common_path = self.test_path + 'common/'
        self.functional_path = self.test_path + 'functional/'
        ta_str = self.get_ta_name_underscore()
        self.testfile_path = self.functional_path + 'test_splunk_ta_%s_gen.py' %(ta_str)
        self.app_path = self.default_path + 'app.conf'

    def find_default_dir(paths):
        """traverses the p4 directory to find the "default" directory for the specified TA"""
        for dirname, dirnames, filenames in os.walk(paths.package_path):
            for subdirname in dirnames:
                if 'default' in subdirname:
                    return os.path.join(dirname, subdirname) + '/'
        logger.error("No default folder!")
        return None

    def get_ta_name_capitalized(paths):
        """gerenates TA name Capitalized Case"""
        dirname = os.path.basename(os.path.dirname(paths.ta_directory))
        name = DirectoryManager.ta_regex.match(dirname).group(2).replace('-', '_')
        sp = name.split('_')
        sp = [part.capitalize() for part in sp]
        return ''.join(sp)

    def get_ta_name_underscore(paths, onlylower = False):
        """generates TA name seperated by underscores"""
        dirname = os.path.basename(os.path.dirname(paths.ta_directory))
        if onlylower:
            return DirectoryManager.ta_regex.match(dirname).group(2)
        name = DirectoryManager.ta_regex.match(dirname).group(2).replace('-', '_')
        sp = name.split('_')
        sp = [part.lower() for part in sp]
        return '_'.join(sp)

    def get_ta_package_id(paths):
        """get package id in app.conf"""
        app_path = paths.app_path
        app_id = ''
        if os.path.isfile(app_path):
            f = open(app_path)

            lines = f.readlines()
            find_stanza = False
            for line in lines:
                if line.find('[package]') > -1:
                    find_stanza = True
                    continue
                if find_stanza:
                    squeezed_line = line.replace(' ','')\
                        .replace('\n','').replace('\r', '')
                    split_line = squeezed_line.split('=')
                    if len(split_line) > 0 and split_line[0] == 'id':
                        app_id = split_line[1]
                        break
            f.close()
        return app_id


class TAUtil():
    def __init__(self, filename, utilname, get_and_install):
        """Keeps track of a TA's Util constants"""
        self.filename = filename
        self.utilname = utilname
        self.get_and_install = get_and_install


class DirectoryManager():
    #group1 - Util name
    utilregex = re.compile('([a-zA-Z0-9][a-zA-Z_0-9]*Util).py$')
    #group1 - get_and_instal...
    install_regex = re.compile('\s*def\s*([_a-zA-Z0-9]*install[_a-zA-Z0-9]*)\(self\)')
    #group1 - ta, group2 name
    ta_regex = re.compile('([tTsS][aA][_\-])([a-zA-Z_0-9\-]*)') #TODO change the sta_regex
    @staticmethod
    def get_ta_util(paths):
        """Returns a TAUtil of the TA specified by it's Path signature"""
        if not os.path.isdir(paths.common_path):
            logger.warning("%s folder does not exist", paths.common_path)
            DirectoryManager.create_ta_util(paths)
            logger.debug("TA Util created")
        filenames = os.listdir(paths.common_path)
        for filename in filenames:
            if DirectoryManager.utilregex.match(filename):
                utilname = DirectoryManager.utilregex.match(filename).group(1)
                with open(paths.common_path + filename, 'r') as f:
                    for line in f:
                        if DirectoryManager.install_regex.match(line):
                            install = DirectoryManager.install_regex.match(line).group(1)
                            return TAUtil(filename, utilname, install)
        logger.error("could not find util!")
        return None

    @staticmethod
    def create_ta_util(paths):
        """Creates a Util for the TA, if there is none present"""
        DirectoryManager.ensure_dir(paths.common_path)
        DirectoryManager.touch(paths.common_path + '__init__.py')
        c = CodeGenerator.gen_ta_util(paths)
        TACapitalized = "TA" + paths.get_ta_name_capitalized()
        DirectoryManager.write_to_file(c, paths.common_path + TACapitalized + "Util.py")

    @staticmethod
    def touch(fname, times=None):
        """Creates a file named "fname" if it doesn't currently exist"""
        with file(fname, 'a'):
            os.utime(fname, times)

    @staticmethod
    def ensure_dir(filename):
        """Creates all the intermediate directories for a given path"""
        d = os.path.dirname(filename)
        if not os.path.exists(d):
            os.makedirs(d)

    @staticmethod
    def write_to_file(data, filename):
        """Writes data to file, but politely asks first"""
        if os.path.isfile(filename):
            if not query_yes_no('Sir/Madam would you like me to replace the file: %s' %(filename), 'no'):
                return
        DirectoryManager.ensure_dir(filename)
        with open(filename, 'w') as f:
            f.write(data)
            print "%s: %d functional tests generated" %(filename, count_tests())

    @staticmethod
    def initialize_package_test_structure(paths):
        """Creates a package directory, and a test directory, and places
        appropriate files in the package directory"""
        source = os.listdir(paths.mainline_path)
        if 'test' not in source and 'package' not in source:
            logger.error("Need to create build directory")
            DirectoryManager.ensure_dir(paths.package_path)
            DirectoryManager.ensure_dir(paths.test_path)
            for files in source:
                shutil.move(paths.mainline_path + files, paths.package_path)


class ConfParser():
    """turns a .conf file into a dictionary!!!"""
    comment = re.compile('^#')
    #group1 - header
    header = re.compile('\[(.*)\]')
    eq_header = re.compile('\[([a-zA-Z_]*)=([a-zA-Z-_:%0-9]*)\]')
    #group1 - source::, group2 - file rule
    src_header = re.compile('\[(source::)(.*)\]')
    #group1 - k, group2 - v
    rule = re.compile('([0-z]*)\s*\=\s*(.*)\s*')
    #group1 - v
    report_rule = re.compile('^REPORT-.*\s*=\s*(.*)\s*')
    #group1 - k, group2 - orig, group3 - alias
    fieldalias_rule = re.compile('^(FIELDALIAS-.*)\s*=\s*(.*)')
    fieldalias_as_rule = re.compile(r'\s+AS\s+', flags=re.I)
    #group1 - FIELDS, group2 - list
    fields_rule = re.compile('^(FIELDS)\s*=\s*(.*)\s*')
    #usage lists.findall(string)
    lists = re.compile('"?([a-zA-Z_]+)"?')
    #group1 - extracted field name
    format_rule = re.compile('^FORMAT\s*=\s*(.*::.*)')
    format_fields = re.compile('(\S*)::')
    #group1- field name
    eval_rule=re.compile('^EVAL-(.*?)\s*=\s*')

    lookup_output_header = re.compile('^LOOKUP-.*\s*=\s*.*OUTPUT\s+(.*)')
    lookup_outputnew_header = re.compile('^LOOKUP-.*\s*=\s*.*OUTPUTNEW\s+(.*)')
    #group1- field name
    lookup_rule = re.compile(r'\s*.*AS\s(.*)', flags=re.I)

    extract_header = re.compile('^EXTRACT-\s*.*')
    #group1- field name
    extract_fields = re.compile('\?P?\<(.*?)\>')

    @staticmethod
    def parse(file_path):
        """given a .conf file, will parse it into a dictionary"""
        d = {}
        if os.path.isfile(file_path):
            with open(file_path, 'r') as f:
                current_header = None
                for lineno, line in enumerate(f):
                    lineno += 1
                    if ConfParser.comment.match(line):
                        continue
                    elif ConfParser.eq_header.match(line):
                        current_header = ConfParser.eq_header.match(line).group(2)
                        header_key = ConfParser.eq_header.match(line).group(1)
                        d[current_header] = {'header_key': header_key}
                    elif ConfParser.src_header.match(line):
                        current_header = ConfParser.src_header.match(line).group(0)
                        d[current_header] = {}
                    elif ConfParser.header.match(line):
                        current_header = ConfParser.header.match(line).group(1)
                        d[current_header] = {}
                    elif ConfParser.report_rule.match(line):
                        if current_header:
                            v = ConfParser.report_rule.match(line).group(1)
                            if C.REPORT not in d[current_header]:
                                d[current_header][C.REPORT] = []
                            d[current_header][C.REPORT].extend([link.strip() for link in v.split(',')])
                        else:
                            logger.error("{conf_file} {lineno}: Report with no header!".format(conf_file=os.path.basename(file_path), lineno=lineno))
                    elif ConfParser.fieldalias_rule.match(line):
                        if current_header:
                            field, alias_exprs = ConfParser.fieldalias_rule.match(line).groups()
                            alias_exprs = alias_exprs.split(',')
                            for expr in alias_exprs:
                                fieldalias_combos = re.findall('\w+\s+[Aa][Ss]\s+\w+',expr)
                                for discrete_expr in fieldalias_combos:
                                    orig, alias = ConfParser.fieldalias_as_rule.split(discrete_expr)
                                    if C.FIELDALIAS not in d[current_header]:
                                        d[current_header][C.FIELDALIAS] = {}
                                    if orig not in d[current_header][C.FIELDALIAS]:
                                        d[current_header][C.FIELDALIAS][orig] = []
                                    d[current_header][C.FIELDALIAS][orig].append(alias)
                        else:
                            logger.error("{conf_file} {lineno}: Alias with no header!".format(conf_file=os.path.basename(file_path), lineno=lineno))
                    elif ConfParser.fields_rule.match(line):
                        if current_header:
                            ls = ConfParser.fields_rule.match(line).group(2)
                            d[current_header][C.FIELDS] = ConfParser.lists.findall(ls)
                        else:
                            logger.error("{conf_file} {lineno}: Fields with no header!".format(conf_file=os.path.basename(file_path), lineno=lineno))
                    elif ConfParser.format_rule.match(line):
                        if current_header:
                            cut_line = ConfParser.format_rule.match(line).group(1)
                            fields = ConfParser.format_fields.findall(cut_line)
                            d[current_header][C.FIELDS] = fields
                        else:
                            logger.error("{conf_file} {lineno}: Format with no header!".format(conf_file=os.path.basename(file_path), lineno=lineno))
                    #Add for LOOKUP OUTPUT
                    elif ConfParser.lookup_output_header.match(line):
                        if current_header:
                            outputfields=ConfParser.lookup_output_header.match(line).group(1)
                            if C.LOOKUP not in d[current_header]:
                                d[current_header][C.LOOKUP]=[]
                            fields=outputfields.split(',')
                            for field in fields:
                                if ConfParser.lookup_rule.match(field):
                                    field=ConfParser.lookup_rule.match(field).group(1)
                                field=field.strip()
                                d[current_header][C.LOOKUP].append(field)
                        else:
                            logger.error("{conf_file} {lineno}: LOOKUP with no header!".format(conf_file=os.path.basename(file_path), lineno=lineno))
                    #Add for LOOKUP OUTPUTNEW
                    elif ConfParser.lookup_outputnew_header.match(line):
                        if current_header:
                            outputfields=ConfParser.lookup_outputnew_header.match(line).group(1)
                            if C.LOOKUP not in d[current_header]:
                                d[current_header][C.LOOKUP]=[]
                            fields=outputfields.split(',')
                            for field in fields:
                                if ConfParser.lookup_rule.match(field):
                                    field=ConfParser.lookup_rule.match(field).group(1)
                                field=field.strip()
                                d[current_header][C.LOOKUP].append(field)
                        else:
                            logger.error("{conf_file} {lineno}: LOOKUP with no header!".format(conf_file=os.path.basename(file_path), lineno=lineno))

                    #Add for EXTRACT
                    elif ConfParser.extract_header.match(line):
                        if current_header:
                            if C.EXTRACT not in d[current_header]:
                                d[current_header][C.EXTRACT]=[]
                            fields=ConfParser.extract_fields.findall(line)
                            for field in fields:
                                field = field.strip()
                                if field not in d[current_header][C.EXTRACT]:
                                    d[current_header][C.EXTRACT].append(field)
                        else:
                            logger.error("{conf_file} {lineno}: EXTRACT with no header!".format(conf_file=os.path.basename(file_path), lineno=lineno))
                    #Add for EVAL
                    elif ConfParser.eval_rule.match(line):
                        if current_header:
                            fields=ConfParser.eval_rule.match(line).group(1).strip()
                            if C.EVAL not in d[current_header]:
                                d[current_header][C.EVAL] = []
                            d[current_header][C.EVAL].append(fields)
                        else:
                            logger.error("{conf_file} {lineno}: EVAL with no header!".format(conf_file=os.path.basename(file_path), lineno=lineno))

                    elif ConfParser.rule.match(line):
                        if current_header:
                            k, v = ConfParser.rule.match(line).groups()
                            d[current_header][k] = v
                        else:
                            logger.error("{conf_file} {lineno}: Rule with no header!".format(conf_file=os.path.basename(file_path), lineno=lineno))
        #TODO replace this with the native Splunk Conf Parser
        d2 = {}
        config_parser = ConfigParser.ConfigParser()
        config_parser.read([file_path, ])
        for section in config_parser.sections():
            d2[section] = {}
            for k,v in config_parser.items(section):
                d2[section][k] = v
        #print d2
        #print 60 * "="
        #print d
        #print 60 * "="
        #print 60 * "="

        return d


class StaticValidator():
    @staticmethod
    def validate_commands_searchbnf(paths):
        """

        """
        print "puahahaha"
        if os.path.isfile(paths.commands_path):
            if os.path.isfile(paths.searchbnf_path):
                commands = ConfParser.parse(paths.commands_path)
                searchbnf = ConfParser.parse(paths.searchbnf_path)
                for command_key in commands.keys():
                    found = False
                    for searchbnf_key in searchbnf.keys():
                        if command_key in searchbnf_key:
                            found = True
                    if not found:
                        logger.error('Typo: %s-command was not found in %s', command_key, paths.searchbnf_path)
            else:
                logger.warning('There is a commands.conf, but no searchbnf.conf')


class CodeGenerator():
    @staticmethod
    def gen_test(paths):
        """generate the tests and write to file"""
        c = ''
        p = paths
        c += CodeGenerator.gen_test_prelude(p)
        c += CodeGenerator.gen_eventtype_test(p)
        c += CodeGenerator.gen_eventtype_tag_test(p)
        c += CodeGenerator.gen_props_test(p)
        c += CodeGenerator.gen_tear_down()
        DirectoryManager.write_to_file(c, p.testfile_path)

    @staticmethod
    def gen_ta_util_stanza(TACapitalized, TALower, TALowerUnderscore, TAPackageId):
        """generate ta util stanza"""
        return TestTemplate.TA_UTIL_TEMPLATE % locals()

    @staticmethod
    def gen_test_prelude_stanza(TA_UTIL, TA, TEST_NAME, GET_AND_INSTALL, TA_PACKAGE_ID):
        """generate test prelude stanza"""
        return TestTemplate.TEST_PRELUDE % locals()

    @staticmethod
    @count_calls
    def gen_eventtype_test_stanza(EVENTTYPE):
        """generate eventtype test stanza"""
        EVENTTYPE_FORMATTED = EVENTTYPE.replace('-','_').replace(':','__').replace('=','_eq_')
        return TestTemplate.EVENTTYPE_TEMPLATE % locals()

    @staticmethod
    @count_calls
    def gen_sourcetype_test_stanza(SOURCETYPE):
        """generate sourcetype test stanza"""
        SOURCETYPE_FORMATTED = SOURCETYPE.replace('-', '_')\
            .replace(':', '__')\
            .replace('=', '_eq_')\
            .replace('.', '_')\
            .replace('*', '_').replace(' ', '_')
        return TestTemplate.SOURCETYPE_TEMPLATE % locals()

    @staticmethod
    @count_calls
    def gen_eventtype_tag_test_stanza(EVENTTYPE, TAG, FIELD='eventtype'):
        """generate eventtype and tag test stanza"""
        EVENTTYPE_FORMATTED = EVENTTYPE.replace('-', '_').replace(':', '__').replace('=', '_eq_').replace('.', '_').replace('*', '_')
        return TestTemplate.EVENTTYPE_TAG_TEMPLATE % locals()

    @staticmethod
    @count_calls
    def gen_props_test_stanza(SOURCETYPE, FIELD):
        """generate props test stanza"""
        SOURCETYPE_FORMATTED = SOURCETYPE.replace('-', '_')\
            .replace(':', '__')\
            .replace('=', '_eq_')\
            .replace('.', '_')\
            .replace('*', '_').replace(' ', '_')
        return TestTemplate.PROPS_TEMPLATE % locals()

    @staticmethod
    @count_calls
    def gen_field_test_stanza(FIELD):
        """generate field presence test stanza"""
        return TestTemplate.FIELD_TEMPLATE % locals()

    @staticmethod
    @count_calls
    def gen_props_regex_test_stanza(SOURCETYPE, FIELD, REGEX):
        """generate a regex test for props and field"""
        SOURCETYPE_FORMATTED = SOURCETYPE.replace('-', '_')\
            .replace(':', '__')\
            .replace('=', '_eq_')\
            .replace('.', '_')\
            .replace('*', '_').replace(' ', '_')
        return TestTemplate.PROPS_REGEX_TEMPLATE % locals()

    @staticmethod
    @count_calls
    def gen_field_regex_test_stanza(FIELD, REGEX):
        """generate a regex test for field"""
        return TestTemplate.FIELD_REGEX_TEMPLATE % locals()

    @staticmethod
    def gen_ta_util(paths):
        """generate code for TA Util"""
        TACapitalized = paths.get_ta_name_capitalized()
        TALower = paths.get_ta_name_underscore(onlylower = True)
        TALowerUnderscore = paths.get_ta_name_underscore()
        TAPackageId = paths.get_ta_package_id()
        return CodeGenerator.gen_ta_util_stanza(TACapitalized, TALower, TALowerUnderscore, TAPackageId)

    @staticmethod
    def gen_test_prelude(paths):
        """generate code for functional test prelude"""
        dirname = os.path.basename(os.path.dirname(paths.ta_directory))
        ta_str = dirname.lower().replace('-','_')
        test_name = CodeGenerator.test_name(dirname)
        ta_util = DirectoryManager.get_ta_util(paths)
        ta_util_name = ta_util.utilname
        get_and_install = ta_util.get_and_install
        package_id = paths.get_ta_package_id()
        return CodeGenerator.gen_test_prelude_stanza(ta_util_name, ta_str, test_name, get_and_install, package_id)

    @staticmethod
    def gen_tear_down():
        """generate tear down function to tear down testing"""
        return TestTemplate.TEAR_DOWN_TEMPLATE

    @staticmethod
    def test_name(dirname):
        """generate test name"""
        parts = dirname.split('-')
        return "%s%s" % (parts[0], ''.join([part.capitalize() for part in parts[1:]]))

    @staticmethod
    def gen_eventtype_test(paths):
        """generate code for eventtype test"""
        c = ''
        eventtypes = ConfParser.parse(paths.eventtypes_path)
        for key in eventtypes.keys():
            c += CodeGenerator.gen_eventtype_test_stanza(key)
        return c

    @staticmethod
    def gen_eventtype_tag_test(paths):
        """generate code for eventtype and tags test"""
        c = ''
        d = ConfParser.parse(paths.tags_path)
        for eventtype, tags in d.items():
            if 'header_key' in tags:
                field = tags['header_key']
            else:
                field = ''
                logger.error('tags.conf: No field defined in stanza header.')
            for tag, enabled in tags.items():
                if enabled.replace('\r', '').replace('\n', '') == "enabled":
                    c += CodeGenerator.gen_eventtype_tag_test_stanza(eventtype, tag, field)
        return c

    @staticmethod
    def find_aliases(field, parsed_props):
        """find all the aliases for a .conf file"""
        all_aliases = [field]
        if C.FIELDALIAS in parsed_props:
            for orig, aliases in parsed_props[C.FIELDALIAS].items():
                if field == orig:
                    all_aliases.extend(aliases)
        else:
            logger.debug("%s field doesn't have alias", field)
        return all_aliases

    @staticmethod
    def find_alias_value(aliases):
        """find the default value for aliases"""
        alias_with_value = set(aliases).intersection(set(R.FIELD_VALUES.keys()))
        if alias_with_value:
            return R.FIELD_VALUES[alias_with_value.pop()]
        else:
            return None

    @staticmethod
    def gen_field_alias_test(sourcetype, aliases):
        """generate regex tests for all the aliases"""
        wildcard_regex = re.compile("\*")
        c = ''
        v = CodeGenerator.find_alias_value(aliases)
        if wildcard_regex.findall(sourcetype):
            for alias in aliases:
                c += CodeGenerator.gen_field_test_stanza(alias)
                if v:
                    c += CodeGenerator.gen_field_regex_test_stanza(alias, v)
        else:
            for alias in aliases:
                c += CodeGenerator.gen_props_test_stanza(sourcetype, alias)
                if v:
                    c += CodeGenerator.gen_props_regex_test_stanza(sourcetype, alias, v)
        return c

    @staticmethod
    def gen_EVAL_test(sourcetype, fields):
        c = ''
        c += CodeGenerator.gen_props_test_stanza(sourcetype, fields)
        return c

    @staticmethod
    def gen_EXTRACT_test(sourcetype, fields):
        c = ''
        c += CodeGenerator.gen_props_test_stanza(sourcetype, fields)
        return c

    @staticmethod
    def gen_LOOKUP_test(sourcetype, fields):
        c = ''
        c += CodeGenerator.gen_props_test_stanza(sourcetype, fields)
        return c

    @staticmethod
    def gen_props_test(paths):
        """generate test for props"""
        c = ''
        transforms = ConfParser.parse(paths.transforms_path)
        props = ConfParser.parse(paths.props_path)
        logger.debug("####### parsed transforms #########\n %s", pformat(transforms))
        logger.debug("####### parsed props ##############\n %s", pformat(props))
        for header, rules in props.items():
            sourcetype = header

            # Temp solution for handle different stanza format in props.conf (APPEST-57)
            # src_header is not pre-processed (correctly) in ConfParser.parser() so whole line is returned
            if sourcetype.find('[source::') == 0:
                sourcetype = "source=" + sourcetype[9:-1]
                sourcetype = sourcetype.replace("...", "*")
            else:
                sourcetype = "sourcetype=" + sourcetype

            if C.REPORT in rules:
                links = rules[C.REPORT]
                for link in links:
                    if link not in transforms:
                        logger.error('Typo: %s was not found in %s', link, paths.transforms_path)
                        continue                    
                    if C.FIELDS not in transforms.get(link):
                        '''
                          no FORMAT containing field definitions in transforms.conf,
                          so they are (hopefully) defined via capture groups in REGEX,
                          we'll search for those and use them if found
                        '''
                        logger.info('transforms.conf: [{transforms_stanza}] does not perform a field extraction'.format(transforms_stanza=link))               
                        capture_group_fields = re.findall('\<([^\>]+)\>', str(transforms.get(link)))
                        fields = []
                        for cg_field in capture_group_fields:
                            fields.append(cg_field) 
                    else:
                        fields = transforms.get(link).get(C.FIELDS)
                    for field in fields:
                        aliases = CodeGenerator.find_aliases(field, rules)
                        c += CodeGenerator.gen_field_alias_test(sourcetype, aliases)
                        if field.find("$") != -1:
                            logger.warning(''.join(['Bad field "', str(field), '". Genearting the bad test. You fix!']))
                        
            if C.FIELDALIAS in rules:
                for field, aliases in rules[C.FIELDALIAS].items():
                    c += CodeGenerator.gen_field_alias_test(sourcetype, aliases)

            #if ConfParser.src_header.match(header):
            if C.SOURCETYPE in rules:
                sourcetype = sourcetype + " sourcetype=" + rules[C.SOURCETYPE]
                c += CodeGenerator.gen_sourcetype_test_stanza(sourcetype)

            if C.EVAL in rules:
                for fields in rules[C.EVAL]:
                    c += CodeGenerator.gen_EVAL_test(sourcetype, fields)

            if C.LOOKUP in rules:
                for fields in rules[C.LOOKUP]:
                    for field in fields:
                        field=field.strip()
                    c += CodeGenerator.gen_LOOKUP_test(sourcetype,fields)

            if C.EXTRACT in rules:
                for fields in rules[C.EXTRACT]:
                    for field in fields:
                        field = fields.strip()
                    c += CodeGenerator.gen_EXTRACT_test(sourcetype, fields)

        return c


def count_tests():
    count = 0
    count += CodeGenerator.gen_eventtype_test_stanza.calls
    count += CodeGenerator.gen_eventtype_tag_test_stanza.calls
    count += CodeGenerator.gen_props_test_stanza.calls
    count += CodeGenerator.gen_props_regex_test_stanza.calls
    count += CodeGenerator.gen_field_test_stanza.calls
    count += CodeGenerator.gen_field_regex_test_stanza.calls
    return count


def count_logger():
    print "number of errors: %d" % logger.error.calls
    print "number of warnings: %d" % logger.warning.calls


def run(directory, codeline):
    p = Paths(directory, codeline)
    print "Butler at your service!"
    DirectoryManager.initialize_package_test_structure(p)
    CodeGenerator.gen_test(p)
    StaticValidator.validate_commands_searchbnf(p)
    generatePrebuiltPanelCases(p.package_path, p.functional_path, logger)
    count_logger()


def generatePrebuiltPanelCases(package_path, functional_path, logger):
    try:
        sys.path.append('../chamberlain')
        from CaseGenerator import CaseGenerator as PrebuiltPanelSearchCaseGenerator
        from PrebuiltPanelSearch import PrebuiltPanelSearch

        panel_search = PrebuiltPanelSearch(package_path)
        searches = panel_search.parse()
        print panel_search.get_TA_name()
        caseGenerator = PrebuiltPanelSearchCaseGenerator(panel_search.get_TA_name())
        code = caseGenerator.gen_prebuilt_panel_search_test_suite(searches)
        caseGenerator.write_to_file(code,
        os.path.join(functional_path,
                     "test_" + caseGenerator.get_TA_name().lower().replace('-', '_') + "_prebuilt_panel_search.py"))
        logger.info("Prebuilt panel search cases generation done.")
    except:
        logger.exception("Failed to generate prebuilt panel search cases.")


def main():
    parser = OptionParser(usage="usage: python %prog [DIRECTORY]", version="%prog 1.0")
    parser.add_option("-d", "--directory", default=None, help="the directory of the TA")
    parser.add_option("-c", "--codeline", default=None, help="(P4 only) the codeline")
    (options, args) = parser.parse_args()
    directory = args[0] if len(args) > 0 else options.directory
    if directory is None:
        logger.error('No DIRECTORY given!')
        return
    run(directory, options.codeline)

if __name__ == "__main__":
    main()
