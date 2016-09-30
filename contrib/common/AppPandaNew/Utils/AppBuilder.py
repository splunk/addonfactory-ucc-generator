import os
from glob import glob
from helmut.ssh.connection import SSHConnection
from Utils import AppPandaUtils

class AppBuilder:
    
    def __init__(self, args_parser, logger):
        
        self.parser = args_parser
        self.logger = logger
        self.logger.info("Starting the App Builder.")
        self.utils = AppPandaUtils(self.logger)
        self.start_building()
     
    def initialize(self):
        
        if self.parser.appsbuildpaths is None or self.parser.appsbuildnames is None or self.parser.appsbuildtypes is None:
            print "Length of arguments of --apps_build_paths, --apps_build_names and --apps_build_types MUST be EQUAL. Exiting..."
            self.logger.info("Length of arguments of --apps_build_paths, --apps_build_names and --apps_build_types is NOT EQUAL. Exiting...")
            return False
        
        if not len(self.parser.appsbuildpaths) == len(self.parser.appsbuildnames) == len(self.parser.appsbuildtypes):
            print "Length of --apps_build_paths, --apps_build_names and --apps_build_types MUST be EQUAL. Exiting..."
            self.logger.info("Length of --apps_build_paths, --apps_build_names and --apps_build_types is NOT EQUAL. Exiting...")
            return False
        
        if self.parser.appsremoteservers is None:
            self.parser.appsremoteservers = []
        
        if self.parser.appsremotedestinations is None:
            self.parser.appsremotedestinations = []
            
        if self.parser.antoptions is None:
            self.parser.antoptions = []
        
        if self.parser.gruntoptions is None:
            self.parser.gruntoptions = []

        return True
        
    def start_building(self):
        
        if not self.initialize():
            return
                
        apps_build_mapping = map(None, self.parser.appsbuildpaths, self.parser.appsbuildnames, self.parser.appsbuildtypes, self.parser.appsremoteservers, 
                                 self.parser.appsremotedestinations, self.parser.antoptions, self.parser.gruntoptions)
        
        for (path, name, type, server, dest, antoption, gruntoption) in apps_build_mapping:
        
            assert os.path.exists(path) == True

            current_dir = os.getcwd()
            os.chdir(path)
            if not self.parser.skipbuilding:
                
                #Now find if the old build exists on this local server.
                if type is not None:
                    self.logger.info("Trying to delete the old app built.")
                    app_extension = '*' + type
                    app_to_delete = glob(app_extension)

                    if app_to_delete:
                        self.logger.info("Deleting old local app")
                        os.remove(app_to_delete[0])
        
                #Now build the app.
                self.logger.info("Trying to build the app %s.%s", name, type)
                
                if not self.parser.grunt:
                    if antoption is not None:
                        _cmd = "ant -l build.log " + antoption
                    else:
                        _cmd = "ant -l build.log"
                    self.logger.info("Building using %s Command", _cmd)
                    os.system(_cmd)
                else:
                    bower_command = ['cache clean']        
                    npm_cmd = ['cache clean', 'install']
                    
                    for c in bower_command:
                        _cmd = "bower " + c
                        self.logger.info("Runnng %s command", _cmd)
                        os.system(_cmd)
                    
                    for c in npm_cmd:
                        _cmd = "npm " + c
                        self.logger.info("Running %s Command", _cmd)
                        os.system(_cmd)
                    
                    
                    if gruntoption is not None:
                        grunt_command = gruntoption.split(",")
                        final_grunt_options = ''
                        for c in grunt_command:
                            final_grunt_options += ' --' + c + ' '
                        
                        _cmd = 'npm run build -- ' + final_grunt_options
                    else:
                        _cmd = "npm run build"
                    self.logger.info("Running %s command", _cmd)
                    os.system(_cmd)
            else:
                self.logger.info("Not building the app as we expect the app to be built already.")
                app_extension = '*' + type
    
            # grab file that we just built
            if name == 'SA-Eventgen':
                if os.path.exists(os.path.join(os.getcwd(), 'build', 'dist')):
                    os.chdir(os.path.join(os.getcwd(), 'build', 'dist'))
                else:
                    print "Could not find SA-Eventgen spl package!!"

            app_new = glob(app_extension)

            # check for package existence
            assert app_new is not None

            assert len(app_new) > 0

            self.logger.info("The new app that has been built is " + app_new[0])
            
            if self.parser.grunt and self.parser.upload:
                if gruntoption is not None:
                    grunt_command = gruntoption.split(",")
                    final_grunt_options = ''
                    for c in grunt_command:
                        final_grunt_options += ' --' + c + ' '
                    _cmd = "npm run upload -- " + final_grunt_options
                else:
                    _cmd = "npm run upload"
                
                self.logger.info("Running %s Command", _cmd)
                os.system(_cmd)
                return

            #Now put the file into the server at the builds directory.
            if (server is not None) and (dest is not None) and len(app_new) > 0:
                self.logger.info("Trying to send the file %s to %s server at path %s", app_new[0], server, dest)
                
                conn = SSHConnection(server, user='bamboo')
                ssh_file_utils = conn.file_utils
                
                #Check if the destination directory exists
                _cmd = "cd " + dest
                (code, stdout, stderr) = conn.execute(_cmd)
                
                if code == 0:
                    #Find all the files existing previously in this folder.
                    _cmd = "ls " + dest
                    (code_prev, stdout_prev, stderr_prev) = conn.execute(_cmd)
                    
                    self.logger.info("The files existing previously in this directory are %s", stdout_prev)
                    
                    #Send the App to the Server.
                    ssh_file_utils.send(os.path.join(os.getcwd(), app_new[0]), dest)
                    self.logger.info("Completed copying the build to the Server.")
                    print "Completed copying the build to the Server."
                
                    #Find all the files existing later in this folder.
                    (code_after, stdout_after, stderr_after) = conn.execute(_cmd)

                    #Now remove the old files that are existing on the server.
                    if stdout_prev != '' and stdout_prev != stdout_after:
                        files_to_remove = stdout_prev.split("\n")
                        for app in files_to_remove:
                            if app != '':
                                self.logger.info("Deleting the previous version %s", app)
                                _cmd = "rm " + app
                                cmd_output = conn.execute(_cmd)
                                self.logger.info("Result from deleting %s is %s", app, cmd_output)
                    else:
                        self.logger.info("Not deleting any app on server. %s, %s", stdout_prev, stderr_after)
                else:
                    print "Destination folder does not exist on server"
                    self.logger.info("Destination folder %s does not exist on server %s", dest, server)
                conn.close()
                os.chdir(current_dir)

            #If provided an option to upload a file built to artifactory.(For SA-Eventgen we build using ant but upload it using artifactorytool).
            if self.parser.artifactory_push:
                self.logger.info("Trying to push a file into Artifactory")

                build_num = app_new[0].split("-")[-1].split(".")[0]
                git_commit_cmd = "git rev-parse HEAD | cut -c1-10"
                git_commit =  self.utils.run_cmd(git_commit_cmd, required=False, cwd=None, is_shell=True)
                git_commit =  git_commit['STDOUT']

                if not self.parser.artifactory_tool_path:
                    self.logger.info("Artifactory tool path is required!")
                    print "Artifactory tool path is required!"
                    return
                else:
                    _cmd = "python " + os.path.join(self.parser.artifactory_tool_path, "artifacts.py") + " --push " + "--configpath " + path + " --file " + app_new[0] +  " --buildnumber " + build_num + " --commit " + git_commit
                    print _cmd
                    os.system(_cmd)