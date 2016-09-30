import os
import pickle

class StoreCommands:
    '''
    This class is used to Pickle and 
    Unpickle AppPandaNew commands.
    '''
    
    def __init__(self, parse_args, logger):
        
        self.parse_args = parse_args
        self.logger = logger
        
        self.dest_to_argument = {'splunk_home'          : 'splunk_home',
                                 'keep_splunk'          : 'preserve_splunk',
                                 'splunkdb'             : 'splunk_db',
                                 'clean_splunkdb'       : 'clean_splunkdb',
                                 'leave_not_running'    : 'leave_not_running',
                                 'stop_splunk'          : 'stop_splunk',
                                 'start_splunk'         : 'start_splunk',
                                 'restart_splunk'       : 'restart_splunk',
                                 'uninstall_splunk'     : 'uninstall_splunk',
                                 'disable_splunkweb'    : 'disable_splunkweb',
                                 'splunkweb_port'       : 'splunkweb_port',
                                 'splunkd_port'         : 'splunkd_port',
                                 'enable_FIPS'          : 'enable_FIPS',
                                 'auto_ports'           : 'auto_ports',
                                 'rootendpoint'         : 'root_endpoint',
                                 'enablessl'            : 'enable_splunkweb_ssl',
                                 'install_license'      : 'install_license_path',
                                 'install_default_license' : 'install_license',
                                 'localsplunkinstaller' : 'local_splunk_installer',
                                 'branch'               : 'branch',
                                 'plat_pkg'             : 'plat_pkg',
                                 'version'              : 'version',
                                 'product'              : 'PRODUCT',
                                 'localappinstaller'    : 'local_app_installer',
                                 'appname'              : 'apps',
                                 'appversion'           : 'app_versions',
                                 'setup'                : 'setup',
                                 'newtestdir'           : 'new_test_dir',
                                 'runscript'            : 'run_script',
                                 'testdirs'             : 'tests',
                                 'appsbuildpaths'       : 'apps_build_paths',
                                 'appsbuildnames'       : 'apps_build_names',
                                 'appsbuildtypes'       : 'apps_build_types',
                                 'appsremoteservers'    : 'apps_remote_servers',
                                 'appsremotedestinations' : 'apps_remote_destinations',
                                 'skipbuilding'         : 'skip_building',
                                 'antoptions'           : 'ant_options',
                                 'artifactorypull'      : 'artifactory',
                                 'build_numbers'        : 'build_numbers',
                                 'app_status'           : 'app_status',
                                 'one_sot_publish'      : 'one_sot_publish',
                                 'one_sot_repo'         : 'one_sot_repo',
                                 'one_sot_destdir'      : 'one_sot_destdir',
                                 'remove_existing'      : 'remove_existing',
                                 'itsi_deploy_one_app'  : 'itsi_deploy_one_app',
                                 'update'               : 'update',
                                 'grunt'                : 'grunt',
                                 'gruntoptions'         : 'grunt_options',
                                 'uninstall_apps'       : 'uninstall_apps',
                                 'build_fetcher'        : 'build_fetcher',
                                 'artifactory_push'     : 'artifactory_push',
                                 'artifactory_tool_path': 'artifactory_tool_path'
                                 }

    def store_app_panda_commands(self):
        '''
        Stores 5 most recent AppPandaNew
        Commands by pickling them.
        '''
        self.logger.info("CLI : Pickling the AppPandaNew Command")

        app_panda_data_dir = os.path.expanduser(os.path.join('~','apppandacommands'))
        if not os.path.exists(app_panda_data_dir):
            os.mkdir(app_panda_data_dir)
        
        command_files = os.listdir(os.path.expanduser(os.path.join('~','apppandacommands')))
        self.logger.info("CLI : The Pickled files are %s", command_files)
        
        files_count = len(command_files)
        
        if files_count < 5:
            #The Case where history has less than 5 Commands, create a new one.
            app_panda_data_file = open(os.path.join(app_panda_data_dir,"command"+str(files_count)+".pkl"), "wb")
            pickle.dump(self.parse_args, app_panda_data_file)
            app_panda_data_file.close()
        else:
            #If there are 5 commands, remove the last one and add the new one like in a queue.
            os.remove(os.path.join(app_panda_data_dir,"command4.pkl"))
            for i in range(3,-1,-1):
                os.rename(os.path.join(app_panda_data_dir,"command"+str(i%5)+".pkl"), os.path.join(app_panda_data_dir,"command"+str((i+1)%5)+".pkl"))
                
            app_panda_data_file = open(os.path.join(app_panda_data_dir,"command0.pkl"), "wb")
            pickle.dump(self.parse_args, app_panda_data_file)
            app_panda_data_file.close()
            
    def get_commands_list(self):
        '''
        Get a list of all the Commands stored in history.
        '''

        app_panda_data_dir = os.path.expanduser(os.path.join('~','apppandacommands'))
        app_panda_command_list = []
        if not os.path.exists(app_panda_data_dir):
            return app_panda_command_list
        else:
            command_files = os.listdir(os.path.expanduser(os.path.join('~','apppandacommands')))
            
            for file in command_files:
                app_panda_data_file = open(os.path.join(app_panda_data_dir,file), "rb")
                app_panda_options = pickle.load(app_panda_data_file)
                options_dict = {k:v for k,v in vars(app_panda_options).items() if (v is not None and v is not False)}
                app_panda_command_list.append(options_dict)
                app_panda_data_file.close()
            return app_panda_command_list
    
    def get_stringified_commands(self):
        '''
        Return the commands in the string format.
        '''
        commands_list = self.get_commands_list()
        
        if len(commands_list) == 0:
            return ""

        string_commands = []
        curr_cmd_prefix = "\n Your Previous AppPandaNew Commands(Previous 5 are stored) are: \n\n"

        for count,command in enumerate(commands_list):
            curr_cmd_str = str(count) + ". python apppandaCLI.py "
            for k,v in command.items():
                curr_cmd_str += "--" + self.dest_to_argument[k] + " "
                
                if isinstance(v, list):
                    curr_cmd_str += " ".join(v) + " "
                elif isinstance(v, bool):
                    pass
                else:
                    curr_cmd_str += str(v) + " "
                                        
            string_commands.append(curr_cmd_str)
            
        curr_cmd_postfix = "\n \n You can select above using --cmd_num. For Example : python apppandaCLI.py --cmd_num 2 \n "
        
        return curr_cmd_prefix + "\n".join(string_commands) + curr_cmd_postfix
    
    def get_new_arg_parser(self, old_arg_parser, cmd_num):
        '''
        Return the new ArgParser with the Command selected by User.
        '''
        
        commands_list = self.get_commands_list()
        command_to_add = commands_list[int(cmd_num)]
        new_arg_parser = old_arg_parser
        for k,v in command_to_add.items():
            setattr(new_arg_parser, k, v)
        
        self.logger.info("CLI : The new built ArgParser is %s", new_arg_parser)
        return new_arg_parser