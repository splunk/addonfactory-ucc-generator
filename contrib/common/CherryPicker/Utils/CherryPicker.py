import os
import re
import sys
from subprocess import Popen,PIPE

try:
    from git import Repo
except ImportError:
    raise ImportError('gitpython is missing. Install it using : pip install gitpython')

class CherryPicker:
    '''
    The main class that executes cherry picking.
    '''
    
    def __init__(self, parser, logger):
        
        self.parser = parser
        self.logger = logger
        
        self.logger.info("In Cherry Picker Main Class.")
        
        self.verify_args()
        self.perform_cherry_pick()
        
    def verify_args(self):
        '''
        Verify the command line arguments.
        '''
        self.logger.info("Verifying the command line arguments.")
                
        assert self.parser.repo_path is not None, "The repo name cannot be None, add --repo_path <repo_path> (--repo_path /Users/user1/git/app-ess)"
        
        assert os.path.exists(self.parser.repo_path) == True, "Looks like the path to repo does not exist on your local machine."
        
        assert self.parser.merge_hash is not None, "The Merge Hash cannot be None, add --merge_hash <merge_hash_string>"

        assert self.parser.dest_branch is not None, "The Destination branch cannot be None, add --dest_branch <dest_branch_name>"        
    
        self.logger.info("Completed verifying the command line arguments.")
    
    def get_latest_commits(self):
        '''
        Get the latest commits in the Source and the destination branches.
        '''
        self.logger.info("In Get Latest Commits")
        
        curr_branch = str(self.repo.active_branch)
        self.logger.info("The Current Active branch is %s", curr_branch)
        
        git = self.repo.git
        
        try:
            self.switch_git_branch(branch='develop')
        except:
            self.switch_git_branch(branch='master')

        git.pull()
  
        #Switch the repository to Destination and pull latest commits.
        self.switch_git_branch(branch=self.parser.dest_branch)
        git.pull()
        
        #Switch to develop/master/(the branch where the merge went into) and pull latest commits.
        self.switch_git_branch(branch=self.parser.merged_into_branch)
        git.pull()
        
        #Switch back to the original branch.
        self.switch_git_branch(branch=curr_branch)
    
    def switch_git_branch(self, branch):
        '''
        Switch a git repo branch.
        '''
        self.logger.info("Switching to branch %s", branch)
        
        assert branch is not None
        git = self.repo.git
        git.checkout(branch)
    
    def get_commits_and_messages(self):
        '''
        Get a List of Commits and Messages of the branch where merge is performed originally.
        '''
        self.logger.info("Getting Commits and Messages.")
        self.messages   = [commit.message for commit in self.repo.iter_commits(self.parser.merged_into_branch, max_count=500)]
        self.commits    = [commit.hexsha for commit in self.repo.iter_commits(self.parser.merged_into_branch, max_count=500)]
        
        self.logger.info("The Messages are %s", self.messages)
        self.logger.info("The Commits are %s", self.commits)
        
    def find_merge_hash_index(self, merge_hash):
        '''
        Find the index of the merge_hash in self.commits.
        '''
        self.logger.info("Finding the Index of Merge Hash %s", merge_hash)
        assert merge_hash is not None

        for i, c in enumerate(self.commits):
            
            if c.startswith(merge_hash):
                return i
        
        return None
            
        
    def perform_cherry_pick(self):

        self.repo = Repo(self.parser.repo_path)
        
        self.get_latest_commits()
        
        self.get_commits_and_messages()
        
        self.logger.info("Performing Cherry Picking.")

        idx = self.find_merge_hash_index(self.parser.merge_hash)
        
        if idx is None:
            print "Could not find the merge hash %s in commits.Check the merge hash again. Cherry-Pick Failed." %(self.parser.merge_hash)
            return
        
        msg = self.messages[idx]
        
        self.logger.info("The Merge Message is %s", msg)
        
        #Make Sure we are dealing with a Merge Commit.
        assert msg.startswith('Merge pull request')
        
        messages_commits = self.split_merge_message(msg)
        
        print "\n The following COMMITS will be cherry picked to BRANCH %s \n"%(self.parser.dest_branch)
        
        for i,(m,c) in enumerate(messages_commits):
            print "%s. %s --- %s"%(i,m,c)
        
        ans = raw_input("Press y or Y to continue.")
        
        if ans.lower() == 'y':
            #Perform the final Cherry Pick Operation.
            curr_branch = str(self.repo.active_branch)
            self.switch_git_branch(self.parser.dest_branch)
            
            for (m,c) in messages_commits:
                cmd = "git cherry-pick " + c
                self.execute_command(cmd)
            
            cmd = "git push origin " + self.parser.dest_branch
            self.execute_command(cmd)

            self.switch_git_branch(branch=curr_branch)
            
            print "Cherry-Picking Successfully Completed!!!"
        else:
            print "Cherry Pick is Cancelled. Exiting."
            return
    
    def split_merge_message(self, msg):
        '''
        Split a merge message into individual messages and get the commits.
        '''
        
        self.logger.info("Splitting the Message %s", msg)
        
        commit_messages = msg.split(":")[1]

        self.logger.info(commit_messages)
        commit_messages = [m.strip() for m in commit_messages.split("\n") if m!='']
        
        self.logger.info("The Commit Messages are %s", commit_messages)        
        commits = []
        for cm in commit_messages:
            for i, m in enumerate(self.messages):
                if m.startswith(cm) and (self.commits[i] not in commits):
                    commits.append(self.commits[i])
                    break
    
        assert len(commits) > 0
        
        self.logger.info("The Commits are %s", commits)
        
        self.logger.info("The following commits will be cherry-picked %s", zip(commit_messages, commits))
        
        return list(reversed(zip(commit_messages, commits)))
        
    def execute_command(self, cmd, required=False, cwd=None, is_shell=True):
        '''
        Run the command.
        '''
        curr_dir  = os.getcwd()
        repo_dir  = self.parser.repo_path
        os.chdir(repo_dir)
        self.logger.info("Executing the following command %s", cmd)
        
        _proc       = Popen(cmd, stderr=PIPE, stdout=PIPE, cwd=None, shell=is_shell)
        (so, se)    = _proc.communicate()
        _ret = {'STDOUT' : so, 'STDERR' : se, 'RETURN_CODE' : _proc.returncode}
        self.logger.info("Run Command result is %s", _ret)

        os.chdir(curr_dir)

        if required:
            if _ret['RETURN_CODE'] != 0:
                sys.exit('Error running cmd: "%s", returned: %s' % (cmd, _ret['RETURN_CODE']))
        
        self.logger.info("The return from running the command is %s", _ret)

        assert _ret['RETURN_CODE'] == 0, "Error is %s"%(_ret)
        
        self.logger.info("Return %s", _ret)
        return _ret