from __future__ import print_function
import os
import json

TOKEN = '{version}'
VERSION = ''


def replace_version(file_path, token, version):
    lines = []
    with open(file_path, 'r') as infile:
        for line in infile:
            if token in line:
                line = line.replace(token, version)
            lines.append(line)
    with open(file_path, 'w') as outfile:
        for line in lines:
            outfile.write(line)

# read version from package.json
with open('package.json', 'r') as package:
    data = json.load(package)
    VERSION = data['version']

try:
    build_number = os.environ['BUILDNUMBER']
    git_branch = os.environ['GITBRANCH']
except KeyError:
    print('Warning: Could not get build number or git branch from bamboo env. Use default version.')
else:
    if git_branch and git_branch == 'develop':
        VERSION = VERSION + '-' + git_branch + '.' + build_number
finally:
    file_list =[
        'UCC-REST-lib/setup.py',
        'UCC-REST-lib/splunktaucclib/__init__.py',
        'UCC-REST-builder/setup.py',
        'UCC-REST-builder/uccrestbuilder/__init__.py',
        'UCC-UI-lib/package.json'
    ]
    for f in file_list:
        replace_version(f, TOKEN, VERSION)
