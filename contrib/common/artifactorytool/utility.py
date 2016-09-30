'''
This module implements various utility functions
'''

import fnmatch
import os
import re
import glob
import shutil
from configwrapper import _ConfigWrapper

def atoi(text):
    return int(text) if text.isdigit() else text

def natural_keys(text):
    return [ atoi(c) for c in re.split('(\d+)',text) ]

def get_file_list(dir,filelist):
    results = []

    if not filelist:
        matchedlist = [f for f in os.listdir(dir) if re.search('.*([DST]A-|(s|S)plunk).*\.(gz|tgz|bz2|spl|zip|rpm|deb|msi\.unsigned|unsigned)$', f, re.IGNORECASE)]
        results.extend(os.path.join(dir, f) for f in matchedlist)
    else:
        for item in filelist:
	    files = os.listdir(dir)
            for filename in fnmatch.filter(files,item):
                results.append(os.path.join(dir, filename))

    return results

def create_buildnote(buildnumber, commit):
    # Create a note file and save the build number to it.
    build_results_url = os.environ.get("BUILD_RESULTS_URL", "")
    with open("buildnote.txt", "w") as bld_note:
        bld_note.write("buildnumber=" + buildnumber + "\n")
        bld_note.write("commit=" + commit + "\n")
        if build_results_url:
            bld_note.write("build_commits_url=" + build_results_url + "/commit\n")
    return "buildnote.txt"

def prepare_path(path):
    if path in ['.','..']:
        return
    sub_path = os.path.dirname(path)
    if not os.path.exists(sub_path):
        prepare_path(sub_path)
    if not os.path.exists(path):
        os.mkdir(path)

def copy_dir(src,dst):
    if not os.path.isdir(src):
        print 'Cannot copy. Source directory does not exist : ' + src
        return

    if os.path.isdir(dst):
        shutil.rmtree(dst)

    shutil.copytree(src,dst)

def delete_oldpkgs(dir, excludefile):
    filelist = []

    dot = excludefile.rfind('.')
    ext = excludefile[dot:]
    if ext in _ConfigWrapper().get_extensions():
        try:
            version = re.search('[-|_]\d+[.]\d+[.]\d+([-]\d+)?', excludefile).group()
            pos = excludefile.rfind(version + ext)
            name = excludefile[:pos]
        except:
            name = excludefile
            ext = ''
    else:
	name = excludefile
	ext = ''

    filelist.extend(glob.glob(dir + '/' + name + '*'))
    filelist = [s for s in filelist if (s != dir + '/' + excludefile)]

    for entry in filelist:
	print 'Deleting old version \'' + entry + '\''
	if os.path.isfile(entry):
            os.remove(entry)
        elif os.path.isdir(entry):
            shutil.rmtree(entry)

class LocalCopyExists(Exception):
    def __init__(self,filename):
	self.filename = filename
    def __str__(self):
        return repr(self.filename)
