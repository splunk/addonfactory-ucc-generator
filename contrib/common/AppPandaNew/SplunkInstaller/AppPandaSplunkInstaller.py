import os
import sys
from DarwinLinuxSplunkInstaller import DarwinLinuxSplunkInstaller
from WindowsSplunkInstaller import WindowsSplunkInstaller

class AppPandaSplunkInstaller:
    '''
    The class responsible for parsing the command line args 
    and installing Splunk based on the options provided.
    '''
    
    def __init__(self, parse_args, logger):

        self.logger = logger        
        self.parse_args = parse_args

        self.logger.info("CLI : In AppPandaSplunkInstaller:")
        
        #Splunk web settings holds the changes to be made 
        #to web.conf 
        self.splunk_web_settings = {}
        
        self.splunk_installers = {"darwin"  : DarwinLinuxSplunkInstaller,
                                  "win32"   : WindowsSplunkInstaller,
                                  "linux2"  : DarwinLinuxSplunkInstaller}
                
        self.platform = sys.platform
        self.remove_splunk  = True
        self.first_run      = False
        self.update         = False
        self.restart_splunk = False
        self.logger.info("CLI : Your current platform is %s", self.platform)
        
        #Get the Installer based on the current Platform where AppPanda is running.
        #splunk_installer is an object of DarwinLinuxSplunkInstaller or WindowsSplunkInstaller
        self.splunk_installer = self.splunk_installers.get(self.platform, DarwinLinuxSplunkInstaller)(parse_args, self.logger)
        
        #If AppPanda was used before, get information about Splunk installation.
        self.previous_splunk_args = self.splunk_installer.get_app_panda_data()
        self.logger.info("CLI : Your previous Installation data is %s", self.previous_splunk_args)
                
        #Stop Splunk.
        if parse_args.stop_splunk:
            self.logger.info("CLI : STOP SPLUNK COMMAND ISSUED.")
            self.splunk_installer.app_panda_utils.stop_splunk(self.parse_args.splunk_home)
            self.remove_splunk = False
    
        #Start Splunk.
        if parse_args.start_splunk:
            self.logger.info("CLI : START SPLUNK COMMAND ISSUED.")
            self.splunk_installer.app_panda_utils.start_splunk(self.parse_args.splunk_home)
            self.remove_splunk = False

        #Restart Splunk.
        if parse_args.restart_splunk:
            self.logger.info("CLI : RE-START SPLUNK COMMAND ISSUED.")
            self.splunk_installer.app_panda_utils.restart_splunk(self.parse_args.splunk_home)
            self.remove_splunk = False
    
        #Uninstall Splunk
        if parse_args.uninstall_splunk:
            self.logger.info("CLI : UNINSTALL SPLUNK COMMAND ISSUED.")
            self.splunk_installer.uninstall_splunk()
            self.remove_splunk = False
            
        if  parse_args.keep_splunk == False and self.remove_splunk == True:
            #If keep_splunk is false, un-install Splunk and re-install it.
            #The install and uninstall methods are called based on the current platform.
            #Darwin/Linux  : class DarwinLinuxSplunkInstaller's uninstall and install are called.
            #Windows : class WindowsSplunkInstaller's uninstall and install are called.
            self.logger.info("CLI : Keep Splunk option is false so starting to re-install")
            
            if not parse_args.update:
                self.logger.info("NOT AN UPDATE!!")
                self.splunk_installer.uninstall_splunk()
                self.first_run = True
            else:
                print "Updating Splunk..."
                if not os.path.exists(parse_args.splunk_home):
                    self.logger.info("CLI : Splunk is not installed to update on your machine!! Exiting! Try using without --update.")
                    print "Splunk is not installed to update on your machine!! Exiting! Try using without --update."
                    return

                self.splunk_installer.app_panda_utils.stop_splunk(self.parse_args.splunk_home)
                self.update = True

            self.splunk_installer.install_splunk(parse_args.update, parse_args.branch, parse_args.version)
            
            if self.first_run or self.update:
                self.splunk_installer.app_panda_utils.start_splunk(self.parse_args.splunk_home, first_run=self.first_run, update_splunk=self.update ,auto_ports=self.parse_args.auto_ports)

            self.splunk_installer.app_panda_utils.enable_allowRemoteLogin(self.parse_args.splunk_home)

        #Splunkd is provided.
        if parse_args.splunkdb:
            self.logger.info("CLI : New SplunkDB is provided, so changing it to %s .", self.parse_args.splunkdb)
            self.splunk_installer.app_panda_utils.update_splunkdb_path(self.parse_args.splunk_home, self.parse_args.splunkdb)
            self.restart_splunk = True

        #Enable FIPS.
        if parse_args.enable_FIPS:
            if self.splunk_installer.get_platform() != 'darwin':
                self.logger.info("CLI : Enable FIPS is provided, so setting it.")
                self.splunk_installer.app_panda_utils.enable_fips(self.parse_args.splunk_home)
                self.restart_splunk = True
            else:
                self.logger.info("CLI : Skipping ENABLE_FIPS on Darwin.")

        #Clean Splunkdb.
        if parse_args.clean_splunkdb:
            if self.previous_splunk_args.splunkdb:
                self.logger.info("CLI : Clean Splunkdb is provided so cleaning Splunk_db folder.")
                self.splunk_installer.app_panda_utils.clean_splunkdb(self.previous_splunk_args.splunkdb)
                self.restart_splunk = True

        #Disable Splunk Web.
        if parse_args.disable_splunkweb:
            self.logger.info("CLI : Splunk web disable is provided so disabling it.")
            self.splunk_web_settings["startwebserver"] = "0"
        
        #Set the Splunk Web Port.
        if parse_args.splunkweb_port:
            self.logger.info("CLI : A splunkweb port %s is provided so setting it", parse_args.splunkweb_port)
            self.splunk_web_settings["httpport"] = parse_args.splunkweb_port
        
        #Set the Splunkd Port.
        if parse_args.splunkd_port:
            self.logger.info("CLI : A splunkd port %s is provided so setting it", parse_args.splunkd_port)
            self.splunk_web_settings["mgmtHostPort"] = parse_args.splunkd_port
        
        if parse_args.rootendpoint:
            self.logger.info("The root end point is provided %s", parse_args.rootendpoint)
            self.splunk_web_settings["root_endpoint"] = parse_args.rootendpoint
            self.splunk_web_settings["enableSplunkWebSSL"] = 0
        
        #Enable or disable SSL
        if parse_args.enablessl:
            self.splunk_web_settings["enableSplunkWebSSL"] = 1

        if parse_args.search_disk_quota:
            self.logger.info("CLI : Search disk quota %s is provided, so setting it", parse_args.search_disk_quota)            
            settings = {"srchDiskQuota":parse_args.search_disk_quota}
            self.splunk_installer.app_panda_utils.create_stanza(user='nobody', app='system', conf='authorize', stanza='role_admin')
            self.splunk_installer.app_panda_utils.add_stanza_data(user='nobody', app='system', conf='authorize', stanza='role_admin', **settings)
            self.restart_splunk = True

        if len(self.splunk_web_settings) > 0:
           #Update the web.conf file.
            self.logger.info("CLI : web.conf is being updated to %s.", self.splunk_web_settings)

            self.splunk_installer.app_panda_utils.create_stanza(user='nobody', app='system', conf='web', stanza='settings')
            self.splunk_installer.app_panda_utils.add_stanza_data(user='nobody', app='system', conf='web', stanza='settings', **(self.splunk_web_settings))
            self.restart_splunk = True

        #Install License if Provided.
        if parse_args.install_license:
            self.splunk_installer.install_splunk_license(False)
            self.restart_splunk = True
        
        if parse_args.install_default_license:
            self.splunk_installer.install_splunk_license()
            self.restart_splunk = True

        if self.restart_splunk:
            self.splunk_installer.app_panda_utils.restart_splunk(self.parse_args.splunk_home)

        #if Splunk is updated then store data.
        if not parse_args.keep_splunk:
            self.logger.info("CLI : Storing the Current Installation data.")
            self.splunk_installer.store_app_panda_data()

        #Leave Splunk not running after installation.
        if parse_args.leave_not_running:
            self.logger.info("CLI : Leave Not Running is provided so Splunk will be stopped after install")
            self.splunk_installer.app_panda_utils.stop_splunk(self.parse_args.splunk_home)
