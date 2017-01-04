import os

TOKEN = '{version}'
VERSION = '3.0.0'

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

try:
    git_number = os.environ['BUILDNUMBER']
    git_branch = os.environ['GITBRANCH']
except KeyError:
    print 'Could not get build number or git branch from bamboo env. Use default version.'
else:
    VERSION = VERSION + '-' + git_branch + '.' + git_number
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
