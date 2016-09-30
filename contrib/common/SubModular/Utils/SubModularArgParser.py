from argparse import ArgumentParser


class SubModularArgParser:
    '''
    Parse the command line arguments passed to the tool.
    '''
    def __init__(self):
        
        self.arg_options = ArgumentParser()
        
        #Options to update an existing submodule.
        self.arg_options.add_argument("--update", "-update", dest="update", action="store_true")
        
        #List of repos,branches to Add or Update.
        #A value of all with update will update all the sub-modules.
        self.arg_options.add_argument("--repos", "-repos", dest="repos", nargs="*")
        self.arg_options.add_argument("--submodules", "-submodules", dest="submodules", nargs="*")
        
        #Option to push the changes to the Repo.
        self.arg_options.add_argument("--push", "-push", dest="push", action="store_true")
        
    def parse_submodular_args(self):
        
        return self.arg_options.parse_args()