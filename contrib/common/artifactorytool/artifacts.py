#!/usr/bin/env python

'''
Implements the main function.

Usage :

Pull operation - Downloads all build artifacts for an App from Artifactory.
./artifacts.py pull [--local_deps] [--refresh_deps] [--verbose]

Push operation - Uploads all generated build artifacts for current build to the App folder in artifactory
./artifacts.py push --buildnumber=<bamboo build number> [--verbose]
'''

import argparse
from configwrapper import _ConfigWrapper
import dependencyhandler

import command
import os
import sys
import logging
import inspect

from common_utils import dump_args
from common_utils import set_logger


def init_logger(file_name=None):
    """Init logging."""
    script_base, _ = os.path.splitext(
        inspect.getfile(inspect.currentframe()))
    log_file = script_base + '.log'

    if file_name:
        log_file = file_name

    set_logger(log_file)
    logging.debug('logging init complete.')


def get_optargs():
    parser = argparse.ArgumentParser()

    parser.add_argument("--pull", help="pull", action="store_true")

    parser.add_argument("--push", help="push", action="store_true")

    parser.add_argument(
        "--file",
        action='append',
        help="upload only select files",
        dest='filelist',
        default=[])

    parser.add_argument("--buildnumber", help="build number")

    parser.add_argument("--commit", help="commit hash value")

    parser.add_argument(
        "--local_deps",
        help='local_deps flag is ON',
        action="store_true")

    parser.add_argument(
        "--refresh_deps",
        help='refresh_deps flag is ON',
        action="store_true")

    parser.add_argument(
        "--depends",
        action='append',
        help='download only select dependencies',
        dest='dependlist',
        default=[])

    parser.add_argument('--configpath', help="set config file path")
    
    parser.add_argument('--branchpath', help="override repository path with artifact is published")

    parser.add_argument("--searchdir", help="search directory")

    parser.add_argument('--verbose', help="output detail information")

    return parser

if __name__ == '__main__':

    init_logger()

    parser = get_optargs()
    args = parser.parse_args()

    xstr = lambda s: s or "."
    args.configpath = xstr(args.configpath)

    try:
        config = _ConfigWrapper(args.configpath)
        try:
	    if (args.branchpath != None):
                config.set_value('artifactory','branchpath',args.branchpath)
            if (args.searchdir != None):
                config.set_value('artifactory','searchdir',args.searchdir)
        except AttributeError as err:
            pass
    except ValueError as err:
        print (err.args)
        exit(1)

    if args.push:

        if not args.buildnumber:
            parser.print_help()
            exit(1)

        if not args.commit:
	    args.commit = 'not implemented'

	  # Setting to optional to support builds running on 0.1.5 or older version of ext-grunt-basebuild
          #    parser.print_help()
          #    exit(1)

        pushcmd = command._PushArtifactoryCommand(
            args.buildnumber, args.commit, args.filelist)
        pushcmd.execute()

    elif args.pull:

        args.dependlist = ['dep:' + item for item in args.dependlist]
        deps = dependencyhandler._DependencyCollection(
            args.dependlist, args.local_deps, args.refresh_deps)
        handler = dependencyhandler._AppsDependencyHandler()
        deps.run(handler)

    else:
        parser.print_help()
