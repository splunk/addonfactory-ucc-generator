#! /usr/bin/env python
"""Prepare artifactory_tool for packaging and upload to artifactory."""

import argparse
import glob
import inspect
import logging
import os
import shutil
import tempfile

import common_utils

SPECIAL=['setup.py', 'pkg_and_upload.py']

def init_logger(file_name=None):
    """Init logging."""
    script_base, _ = os.path.splitext(
        inspect.getfile(inspect.currentframe()))
    log_file = script_base + '.log'

    if file_name:
        log_file = file_name

    common_utils.set_logger(log_file)
    logging.debug('logging init complete.')
    
def main(upload=False):
    tmpdir = tempfile.mkdtemp()
    if not(tmpdir and os.path.exists(tmpdir)):
        print 'Failed to create temp directory.'
        sys.exit(1)
    else:
        print 'Created temp dir: %s' % tmpdir
        
    pkg_dir = 'artifactory_tool'
    dest_dir = os.path.join(tmpdir, pkg_dir)
    os.makedirs(dest_dir)
    src_dir = os.path.dirname(os.path.realpath(__file__))

    print '\nCopying python files to %s for packaging.' % dest_dir        
    src_files = os.path.join(src_dir, '*.py')
    py_files = glob.glob(src_files)
    for a_file in py_files:
        if os.path.basename(a_file) in SPECIAL:
            continue
        print a_file
        shutil.copy(a_file, dest_dir)
        
    shutil.copy('setup.py', tmpdir)
    
    os.chdir(tmpdir)

    cmd = ['touch', os.path.join(dest_dir, '__init__.py')]
    common_utils.run_cmd(cmd, verbose=True)
    
    cmd = ['python', 'setup.py', 'sdist']
    if upload:
        upload_args = ['upload', '-r', 'local']
        cmd = cmd + upload_args
        
    common_utils.run_cmd(cmd, dry_run=False, verbose=True, modifies=True,
                         redirect_stdout=True)
    
if __name__ == '__main__':
    init_logger()
    
    parser = argparse.ArgumentParser()

    parser.add_argument("--upload", help="Do the upload.", action="store_true",
                        default=False)
    
    args = parser.parse_args()
    
    main(args.upload)
    
    msg = ('\nIf you want to upload to artifactory, first update the VERSION in '
           'setup.py\nand then run this script with the --upload option.')
    print msg
        
