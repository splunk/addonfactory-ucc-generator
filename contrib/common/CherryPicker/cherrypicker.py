import os
from sys import version_info

from Utils.CherryPickerArgParser import CherryPickerArgParser
from Utils.CherryPickerLogger import CherryPickerLogger
from Utils.CherryPicker import CherryPicker

if __name__ == '__main__':

    minimum_python = (2,7)
    
    if version_info >= minimum_python:
        cherry_picker_logger = CherryPickerLogger().get_logger()
        cherry_picker_logger.info("STARTING CHERRY PICKER")

        cherry_picker_args = CherryPickerArgParser().parse_cherry_picker_args()
        cherry_picker_logger.info("THE CHERRY PICKER COMMAND LINE ARGS ARE %s", cherry_picker_args)

        print "Starting Cherry-Pick in Repo %s....The Commits of Merge %s will be cherry-picked to....destination branch %s" %(cherry_picker_args.repo_path, cherry_picker_args.merge_hash, cherry_picker_args.dest_branch)
        
        cherry_picker = CherryPicker(cherry_picker_args, cherry_picker_logger)

    else:
         raise "Must use python 2.7 or greater"