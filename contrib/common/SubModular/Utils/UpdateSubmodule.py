import os
from Utils import SubmodularUtils

class UpdateSubmodular:
    '''
    Add submodules to existing repository.
    '''
    def __init__(self, logger, parse_args):
        
        self.logger = logger
        self.args = parse_args
        
        self.logger.info("In Update Sub-Modular.....")
        
        self.submodule_utils = SubmodularUtils(self.logger, self.args)
        self.submodule_dict = self.submodule_utils.get_submodules_dict()
        self.update_submodule()
        
    def update_submodule(self):
                
        #Check if the Repositories exist locally.
        for repo_branch,submodules in self.submodule_dict.items():
            
            repo = repo_branch.split('#')[0]
            branch = repo_branch.split('#')[1]
            self.logger.info("Working on %s Repo  and %s Branch", repo, branch)
            repo_exists = self.submodule_utils.check_repo_exists(repo)
            self.logger.info("The Repo status is %s", repo_exists)
            assert repo_exists[1] == True
            
            #Repo exists on the machine. Now switch to that repo.
            old_dir = os.getcwd()
            repo_dir = repo_exists[0]
            os.chdir(repo_dir)
            
            #1. Checkout the branch.
            self.submodule_utils.run_git_cmd('checkout', [branch])
            
            #2. Pull the latest content.
            self.submodule_utils.run_git_cmd('pull')
            
            #3. Run submodule update to pull submodules if they are not yet in!
            self.submodule_utils.run_git_cmd("submodule",["update","--init"])
            
            #4. Now start looking at each submodule.
            self.logger.info("The submodules to Update are %s", submodules)
            
            for module in submodules:
                
                sub_repo = module.split('#')[0]
                sub_branch = module.split('#')[1]
                self.logger.info("Starting Submodule %s, Branch %s", sub_repo, sub_branch)
                
                #Check if the Repo has this sub-module.
                assert os.path.exists(os.path.join(os.getcwd(), 'contrib', sub_repo))
                
                #Change to the sub-module and update it.
                os.chdir(os.path.join(os.getcwd(), 'contrib', sub_repo))
                self.submodule_utils.run_git_cmd('checkout', [sub_branch])
                self.submodule_utils.run_git_cmd('pull')
                os.chdir(repo_dir)
            
                #5. Now check if there are any new Commits at all and then Add to Commit.
                result = self.submodule_utils.run_git_cmd('status', ["contrib/"+sub_repo])
                
                if "(new commits)" in result['STDOUT']:
                #Since there are new changes to submodules, Add them.
                    self.submodule_utils.run_git_cmd('add', ["contrib/"+sub_repo])

            #6. Now commit the changes.
            result = self.submodule_utils.run_git_cmd('status')
            
            if "Changes to be committed" in result['STDOUT']:
                self.submodule_utils.run_git_cmd('commit', ["-m", "Updating Sub-Modules."])
            else:
                print "No Changes were required to be commited to Submodules."

            #7. Now push the changes.
            result = self.submodule_utils.run_git_cmd('status')
            if "Your branch is ahead of" in result['STDOUT']:
                if self.args.push:
                    self.submodule_utils.run_git_cmd('push', ['origin', branch])
            else:
                print "No Changes were required to push." 
                
            os.chdir(old_dir)