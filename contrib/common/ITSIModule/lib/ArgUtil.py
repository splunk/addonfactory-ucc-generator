'''
Arg util library
'''
import argparse
import re

def check_arg(args=None):
    parser = argparse.ArgumentParser(description='Script to learn basic argparse')
    parser.add_argument('-V', '--version',
                        help='version number, eg 2.2.0',
                        required=False,
                        default='2.3.0')

    results = parser.parse_args(args)
    return (results.version)

'''
 Return value: 0 means the same version
 >0: version1 > version2
 <0: version1 < version2
'''
def compare_version(version1, version2):
    def normalize(v):
        return [int(x) for x in re.sub(r'(\.0+)*$','', v).split(".")]
    return cmp(normalize(version1), normalize(version2))