import sys
import random
import string
import os
import subprocess
import time
from datetime import datetime
import re

from ConfigParser import ConfigParser, RawConfigParser

# Used when reading config values
TRUE_VALUES = set(('true', '1', 'yes', 'on', 't', 'y'))


# NOTE(chmouel): Imported from swift without the modular directory feature.
def readconf(conf_path,
             section_name=None,
             log_name=None,
             defaults=None,
             raw=False):
    """
    Read config file(s) and return config items as a dict

    :param conf_path: path to config file, or a file-like object
                     (hasattr readline)
    :param section_name: config section to read (will return all sections if
                     not defined)
    :param log_name: name to be used with logging (will use section_name if
                     not defined)
    :param defaults: dict of default values to pre-populate the config with
    :returns: dict of config items
    """
    if defaults is None:
        defaults = {}
    if raw:
        c = RawConfigParser(defaults)
    else:
        c = ConfigParser(defaults)
    if hasattr(conf_path, 'readline'):
        c.readfp(conf_path)
    else:
        success = c.read(conf_path)
        if not success:
            print "Unable to read config from %s" % conf_path
            sys.exit(1)
    if section_name:
        if c.has_section(section_name):
            conf = dict(c.items(section_name))
        else:
            print "Unable to find %s config section in %s" % \
                (section_name, conf_path)
            sys.exit(1)
        if "log_name" not in conf:
            if log_name is not None:
                conf['log_name'] = log_name
            else:
                conf['log_name'] = section_name
    else:
        conf = {}
        for s in c.sections():
            conf.update({s: dict(c.items(s))})
        if 'log_name' not in conf:
            conf['log_name'] = log_name
    conf['__file__'] = conf_path
    return conf


def config_true_value(value):
    """
    Returns True if the value is either True or a string in TRUE_VALUES.
    Returns False otherwise.
    """
    return value is True or \
        (isinstance(value, basestring) and value.lower() in TRUE_VALUES)


def gen_random_string(number):
    return ''.join(random.choice(string.ascii_lowercase + string.digits)
                   for _ in range(number))


def to_bool(value):
    valid = {'true': True,
             't': True,
             '1': True,
             'false': False,
             'f': False,
             '0': False, }

    if isinstance(value, bool):
        return value

    if not isinstance(value, basestring):
        raise ValueError('invalid literal for boolean. Not a string.')

    lower_value = value.lower()
    if lower_value in valid:
        return valid[lower_value]
    else:
        raise ValueError('invalid literal for boolean: "%s"' % value)


def get_data_from_file(fhd, number=1, replace_ts=False, ts_pattern=None):
    out_data = ''
    if not fhd:
        raise Exception("Failed to open file")
    for i in xrange(number):
        cnt = fhd.readline()
        if cnt == '':
            fhd.seek(0, 0)
            cnt = fhd.readline()
        if replace_ts and ts_pattern:
            ts_str = datetime.now().isoformat("T")[:-3] + "Z"
            cnt = re.sub(ts_pattern, ts_str, cnt)
        out_data += cnt
    yield out_data.strip()


def get_data_from_eventgen(ebin, econf, esample, number=1):
    if not os.path.exists(ebin):
        raise Exception("Eventgen binary not found in path %s!", ebin)
    if not os.path.exists(econf):
        raise Exception("Eventgen config not found in path %s!", econf)
    args = ['python', ebin, econf, '-c', str(number), '-s', esample]
    p = subprocess.Popen(args, stdout=subprocess.PIPE)
    out, err = p.communicate()
    if err:
        raise Exception("Failed to run eventgen, error = %s", err)
    yield out.strip()


if __name__ == "__main__":
    ebin = '/Users/azhang/Workspace/projects/sa-eventgen/bin/eventgen.py'
    econf = '/tmp/eventgen.conf.aws_s3'
    esample = 'aws_s3'
    before = time.time()
    for i in xrange(10):
        out = next(get_data_from_eventgen(ebin, econf, esample, 100))
        print len(out.split("\n"))
    print("Time used is %d", time.time() - before)

    before = time.time()
    fh = open(
        '/Users/azhang/Workspace/projects/common/neptune/clouddatamakr/samples/aws_s3.sample')
    for i in xrange(100):
        out = next(get_data_from_file(fh,
                                      100,
                                      replace_ts=True,
                                      ts_pattern=
                                      "\d{2}/\w{3}/\d{4}:\d{2}:\d{2}:\d{2}"))
        print len(out.split("\n"))
    print("Time used is %d", time.time() - before)
