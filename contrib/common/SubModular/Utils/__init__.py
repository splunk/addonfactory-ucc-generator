import os
import sys
from subprocess import Popen, PIPE

GIT_COMMANDS = {"pull" : "pull",
                "checkout" : "checkout",
                "submodule" : "submodule",
                'status' : 'status',
                'add' : 'add',
                'commit' : 'commit',
                'push' : 'push'
                }

class SubmodularUtils:
    '''
    A class with helper methods.
    '''
    
    def __init__(self, logger, parse_args):
        
        self.parse_args = parse_args
        self.logger = logger
    
    def get_submodules_dict(self):
        '''
        Returns a dictionary of repos and submodules.
        '''
        self.logger.info("Building a dictionary of repos and sub-modules")
        self.submodules_dict = {}
        self.repos = self.parse_args.repos
        self.submodules = self.parse_args.submodules
        
        assert len(self.repos) == len(self.submodules)

        for (repo, submodule) in zip(self.repos, self.submodules):
            
            self.submodules_dict[repo] = submodule.split(',')
        
        self.logger.info("The Repo-Submodules dict is %s", self.submodules_dict)
        
        return self.submodules_dict
    
    def check_repo_exists(self, repo):
        '''
        Verify if the repo exists or is cloned locally.
        '''
        if os.path.isabs(repo):
            #If the Repo is absolute path.
            if os.path.exists(repo):
                return (os.path.isabs(repo),True)
        
        elif os.path.exists(os.path.abspath(repo)):
                #Form the absolute path and check.
                return (os.path.abspath(repo),True)

        else:
            soln_root = os.environ.get("SOLN_ROOT")
            
            if soln_root is not None:
                if os.path.exists(os.path.abspath(os.path.join(soln_root, repo))):
                    return (os.path.abspath(os.path.join(soln_root, repo)), True)
        
        return False
            
    def run_git_cmd(self, command="", arguments=None):
        '''
        Run a git command cmd.
        '''
        cmd = ["git"] + [GIT_COMMANDS[command]]
        
        if arguments is not None:
            cmd += arguments
        
        self.logger.info("The command running is %s", cmd)
        
        _proc       = Popen(cmd, stderr=PIPE, stdout=PIPE, cwd=None, shell=False)
        (so, se)    = _proc.communicate()
        _ret = {'STDOUT' : so, 'STDERR' : se, 'RETURN_CODE' : _proc.returncode}
        self.logger.info("Run Command result is %s", _ret)

        if _ret['RETURN_CODE'] != 0:
            sys.exit('Error running cmd: "%s", returned: %s' % (cmd, _ret['RETURN_CODE']))

        return _ret