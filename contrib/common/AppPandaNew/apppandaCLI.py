#!/usr/bin/python

import os
import sys
import logging
from sys import version_info
from AppInstaller import AppInstaller
from AppInstaller.AppFetcher import ServerAppFetcher
from AppUninstaller import AppUninstaller
from Utils.AppPandaLogger import AppPandaLogger
from Utils.TestRunner import AppPandaTestRunner
from Utils.AppPandaArgParser import AppPandaParser
from SplunkInstaller.AppPandaSplunkInstaller import AppPandaSplunkInstaller
from Utils.StoreCommands import StoreCommands
from Genesis import GenesisManager

if __name__ == '__main__':
    """
    The main method where AppPandaCLI starts running.
    """
    
    minimum_python = (2,7)

    if version_info >= minimum_python:
        app_panda_logger = AppPandaLogger().get_logger()
        app_panda_logger.info("CLI : STARTING APP PANDA CLI")
        
        app_panda_args = AppPandaParser().parse_app_panda_args()
        app_panda_logger.info("CLI : THE APP PANDA COMMAND LINE ARGS ARE %s", app_panda_args)
        
        #-----------------------COMMAND HISTORY STUFF---------------------------------------------------
        #Handle to Store Command in History.
        store_commands = StoreCommands(app_panda_args, app_panda_logger)
        if not app_panda_args.command_list and not app_panda_args.command_number:
            store_commands.store_app_panda_commands()

        #Handle to Retrieve the command history.        
        if app_panda_args.command_list:
            string_commands =  store_commands.get_stringified_commands()
            print string_commands
            app_panda_logger.info("CLI : Command List is issued")
            app_panda_logger.info("CLI : The Commands are %s", string_commands)
            sys.exit(0)
        
        #Handle the Get Command from Command History
        if app_panda_args.command_number:
            max_value = len(store_commands.get_commands_list())
            if max_value == 0:
                print '''AppPandaNew has no Stored Commands. Probably you are using this AppPandaNew feature for the first time.
                        Run another command and try this again'''

            elif int(app_panda_args.command_number) < 0 or int(app_panda_args.command_number) > max_value-1:
                print "Illegal Value: Enter number between 0 and", max_value-1 
            
            else:
                #Now build the Command Line Arguments from History.
                app_panda_args = store_commands.get_new_arg_parser(app_panda_args, app_panda_args.command_number)
        #----------------------END OF COMMAND HISTORY STUFF-------------------------------------------------------
        
        #----------------------GENESIS STUFF----------------------------------------------------------------------

        if app_panda_args.genesis_path:
            print "--------------------IN GENESIS MODE!!!!------------------------------"
            genesis_manager = GenesisManager(app_panda_args.genesis_path)
            app_panda_args.testdirs = genesis_manager.get_tests_to_run()
            app_panda_args.ui_test = True

        #---------------------END OF GENESIS STUFF----------------------------------------------------------------   

        
        #-------------PUBLISH APPS TO 1SOT CLOUD SERVER-----------------------------------------------------------
        #The Case where we need to Publish apps to 1sot Cloud Server.
        if app_panda_args.one_sot_publish:
            from AppInstaller.CloudPublish import SplunkAppPublish
            
            #Start to Downlaod an App and publish it to 1sot.
            cloud_publish = SplunkAppPublish(app_panda_args, app_panda_logger)
            cloud_publish.publish_app()
        #-------------END OF PUBLISH APPS TO 1SOT CLOUD SERVER----------------------------------------------------

        #-------------BUILD AND PUBLISH  APPS TO SC-BUILD SERVER--------------------------------------------------
        #The case where we build an app using ant and publish it to server.
        if app_panda_args.appsbuildpaths:
            from Utils.AppBuilder import AppBuilder
            app_builder = AppBuilder(app_panda_args, app_panda_logger)
        #------------- END OF BUILD AND PUBLISH  APPS TO SC-BUILD SERVER------------------------------------------
        
        #------------- Install/Uninstall Splunk, APPS and RUN Tests.--------------------------------------------------------
        if app_panda_args.splunk_home and not app_panda_args.ui_test:
            #Start the Splunk installer.
            if not app_panda_args.uninstall_apps:
                os_installer = AppPandaSplunkInstaller(app_panda_args, app_panda_logger)

            #Install Apps/Run tests only if Splunk Home exists
            if os.path.exists(app_panda_args.splunk_home):
                app_uninstaller = AppUninstaller(app_panda_args, app_panda_logger)
                app_installer   = AppInstaller(app_panda_args, app_panda_logger)
                test_runner     = AppPandaTestRunner(app_panda_args, app_panda_logger)
                
        elif app_panda_args.ui_test:
            test_runner         = AppPandaTestRunner(app_panda_args, app_panda_logger)
            app_panda_logger.info("CLI : Running UI Tests ONLY so skipping SPLK Install.")
        #-------------END OF Install Splunk, APPS and RUN Tests.----------------------------------------------------

        elif app_panda_args.build_fetcher:
            print "------------- Fetching App Builds MODE------------------"
            app_fetcher = ServerAppFetcher(app_panda_args, app_panda_logger, artifactory=True)
            apps_downloaded = app_fetcher.get_remote_apps()
            print "Downloaded %s Apps" % (apps_downloaded)

        else:
            print "Looks like --splunk_home is not given so AppPanda won't install Splunk."
            app_panda_logger.info("SPLUNK_HOME is not given so NOT INSTALLING SPLUNK")

    else:
         raise "Must use python 2.7 or greater"