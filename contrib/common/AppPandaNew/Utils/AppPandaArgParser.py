from argparse import ArgumentParser

class AppPandaParser(object):
    """
    This class defines the arguments that can be used with
     AppPandaCLI using the ArgumentParser.
    """
    def __init__(self):
        
        self.arg_options = ArgumentParser(description=AppPandaParserHelpText.Description)
        
        #Arguments required for Splunk options.
        self.arg_options.add_argument("--splunk_home", "-splunk_home", dest="splunk_home", help=AppPandaParserHelpText.SplunkHome)
        self.arg_options.add_argument("--preserve_splunk", "--keep_splunk", dest="keep_splunk", action="store_true", help=AppPandaParserHelpText.PreserveSplunk)
        self.arg_options.add_argument("--splunk_db", "-splunk_db", dest="splunkdb", help=AppPandaParserHelpText.SplunkDb)
        self.arg_options.add_argument("--clean_splunkdb", "-clean_splunkdb", dest="clean_splunkdb", action="store_true", help=AppPandaParserHelpText.CleanSplunkDb)
        self.arg_options.add_argument("--leave_not_running", "-leave_not_running", dest="leave_not_running", action="store_true", help=AppPandaParserHelpText.LeaveNotRunning)
        self.arg_options.add_argument("--stop_splunk", "-stop_splunk", dest="stop_splunk", action="store_true", help=AppPandaParserHelpText.StopSplunk)
        self.arg_options.add_argument("--start_splunk", "-start_splunk", dest="start_splunk", action="store_true", help=AppPandaParserHelpText.StartSplunk)
        self.arg_options.add_argument("--restart_splunk", "-restart_splunk", dest="restart_splunk", action="store_true", help=AppPandaParserHelpText.RestartSplunk)
        self.arg_options.add_argument("--uninstall_splunk", "-uninstall_splunk", dest="uninstall_splunk", action="store_true", help=AppPandaParserHelpText.UninstallSplunk)
        self.arg_options.add_argument("--disable_splunkweb", "-disable_splunkweb", dest="disable_splunkweb", action="store_true", help=AppPandaParserHelpText.DisableSplunkWeb)
        self.arg_options.add_argument("--splunkweb_port", "-splunkweb_port", dest="splunkweb_port", help=AppPandaParserHelpText.SplunkWebPort)
        self.arg_options.add_argument("--splunkd_port", "-splunkd_port", dest="splunkd_port", help=AppPandaParserHelpText.SplunkdPort)
        self.arg_options.add_argument("--enable_FIPS", "-enable_FIPS", dest="enable_FIPS", action="store_true", help=AppPandaParserHelpText.EnableFIPS)
        self.arg_options.add_argument("--auto_ports", "-auto_ports", dest="auto_ports", action="store_true", help=AppPandaParserHelpText.AutoPorts)
        self.arg_options.add_argument("--root_endpoint", "-root_endpoint", dest="rootendpoint", help=AppPandaParserHelpText.RootEndPoint)
        self.arg_options.add_argument("--enable_splunkweb_ssl", "-enable_splunkweb_ssl", dest="enablessl", action="store_true", help=AppPandaParserHelpText.EnableSplunkWebSSL)
        self.arg_options.add_argument("--search_disk_quota", "-search_disk_quota", dest="search_disk_quota", help=AppPandaParserHelpText.SearchDiskQuota)
        self.arg_options.add_argument("--install_license_path", "-install_license_path", dest="install_license", nargs='*', help=AppPandaParserHelpText.InstallLicensePath)
        self.arg_options.add_argument("--install_license", "-install_license", dest="install_default_license", action="store_true", help=AppPandaParserHelpText.InstallLicense)
        self.arg_options.add_argument("--ui_test", "-ui_test", dest="ui_test", action="store_true", help=AppPandaParserHelpText.UiTest)

        #Argument for installing Splunk from a local file or using URL to .tgz or .msi file.
        self.arg_options.add_argument("--local_splunk_installer", "-local_splunk_installer", dest="localsplunkinstaller", help=AppPandaParserHelpText.LocalSplunkInstaller)

        #Arguments for Installing Splunk from releases.splunk.com:
        self.arg_options.add_argument("--branch", "-branch", dest="branch", help=AppPandaParserHelpText.Branch)
        self.arg_options.add_argument("--plat_pkg", "-plat_pkg", dest="plat_pkg", help=AppPandaParserHelpText.PlatformPackage)
        self.arg_options.add_argument("--version", "-version", dest="version", help=AppPandaParserHelpText.Version)
        self.arg_options.add_argument("--PRODUCT", "-PRODUCT", dest="product", help=AppPandaParserHelpText.Product)
        
        #Arguments for Updating Splunk/Apps
        self.arg_options.add_argument("--update", "-update", dest="update", action="store_true", help=AppPandaParserHelpText.Update)
        
        #Add the arguments for Local App Installation.
        self.arg_options.add_argument("--local_app_installer", "-local_app_installer", dest="localappinstaller", nargs='*', help=AppPandaParserHelpText.LocalAppInstaller)
    
        #Add the arguments to install apps from sc-build.sv.splunk.com server.
        self.arg_options.add_argument("--app_names", "--apps", "-app_name", dest="appname", nargs='*', help=AppPandaParserHelpText.Soln)
        self.arg_options.add_argument("--app_versions", "-app_version", dest="appversion", nargs='*', help=AppPandaParserHelpText.AppVersion)
        self.arg_options.add_argument("--setup", "-setup", dest="setup", action="store_true", help=AppPandaParserHelpText.SetupApps)
        
        #Uninstall apps.
        self.arg_options.add_argument("--uninstall_apps", "-uninstall_apps", dest="uninstall_apps", nargs="*", help=AppPandaParserHelpText.UninstallApps)

        #Add the arguments to run a script/test using Pytest.
        self.arg_options.add_argument("--new_test_dir", "-new_test_dir", dest="newtestdir", help=AppPandaParserHelpText.PytestDir)
        self.arg_options.add_argument("--run_script", "-run_script", dest="runscript", help=AppPandaParserHelpText.RunScript)
        self.arg_options.add_argument("--tests", "--test_dirs", "--test", "-tests", dest="testdirs", nargs='*', help=AppPandaParserHelpText.TestDir)

        #Options to Build and Post apps using ANT.
        self.arg_options.add_argument("--apps_build_paths", "-apps_build_paths", dest="appsbuildpaths", nargs="*")
        self.arg_options.add_argument("--apps_build_names", "-apps_build_names", dest="appsbuildnames", nargs="*")
        self.arg_options.add_argument("--apps_build_types", "-apps_build_types", dest="appsbuildtypes", nargs="*")
        self.arg_options.add_argument("--apps_remote_servers", "-apps_remote_servers", dest="appsremoteservers", nargs="*")
        self.arg_options.add_argument("--apps_remote_destinations", "--apps_remote_destinations", dest="appsremotedestinations", nargs="*")
        self.arg_options.add_argument("--skip_building", dest="skipbuilding", action="store_true")
        self.arg_options.add_argument("--ant_options", dest="antoptions", nargs="*")
        self.arg_options.add_argument("--grunt", "-grunt", dest="grunt", action="store_true")
        self.arg_options.add_argument("--grunt_options", dest="gruntoptions", nargs="*")
        self.arg_options.add_argument("--upload", "-upload", dest="upload", action="store_true")
        self.arg_options.add_argument("--artifactory_push", "-artifactory_push", dest="artifactory_push", action="store_true")
        self.arg_options.add_argument("--artifactory_tool_path", "-artifactory_tool_path", dest="artifactory_tool_path")
        
        #Pull Artifacts from Artifactory Server.
        self.arg_options.add_argument("--artifactory", "-artifactory", dest="artifactorypull", action="store_true")
        self.arg_options.add_argument("--build_numbers", "-build_numbers", dest="build_numbers", nargs="*")
        self.arg_options.add_argument("--app_status", "-app_status", dest="app_status", nargs="*")

        #Options to Publish Apps to 1sot Cloud Repository using ost tool.
        self.arg_options.add_argument("--one_sot_publish", dest="one_sot_publish", action="store_true")
        self.arg_options.add_argument("--one_sot_repo", dest="one_sot_repo")
        self.arg_options.add_argument("--one_sot_destdir", dest="one_sot_destdir")
        self.arg_options.add_argument("--remove_existing", dest="remove_existing", action="store_true")
        
        #Special Casing for ITSI.
        self.arg_options.add_argument("--itsi_deploy_one_app", dest="itsi_deploy_one_app", action="store_true")
        
        #Options to save and run 5 previous AppPandaNew Commands.
        self.arg_options.add_argument("--cmd_list", dest="command_list", action="store_true")
        self.arg_options.add_argument("--cmd_num", dest="command_number")
        
        #Genesis Stuff for running selected tests.
        self.arg_options.add_argument("--genesis_path", "-genesis_path", dest="genesis_path")
        self.arg_options.add_argument("--print_tests", "-print_tests", dest="print_tests", action="store_true")
        
        #Apps Build fetcher. Just download it!
        self.arg_options.add_argument("--build_fetcher", "-build_fetcher", dest="build_fetcher", action="store_true")
        
    def parse_app_panda_args(self):
        
        return self.arg_options.parse_args()
        
class AppPandaParserHelpText:
    """
    Define constants used by AppPandaParser.
    """
    Description         = "App Panda command line arguments."
    SplunkHome          = "The location/path where Splunk will be installed."
    PreserveSplunk      = "Use an existing installation of Splunk to install apps. If Splunk does not exist, we bail."
    SplunkDb            = "The location/path where SplunkDb will be present."
    CleanSplunkDb       = "Deletes splunk_db before installing Splunk."
    LeaveNotRunning     = "Leaves Splunk Not Running after App Panda completes its run."
    StopSplunk          = "Stop Splunk."
    StartSplunk         = "Start Splunk."
    RestartSplunk       = "Restart Splunk"
    DisableSplunkWeb    = "Disable Splunk Web."
    SplunkWebPort       = "Re-assign the Splunkweb port."
    SplunkdPort         = "Re-assign the Splunkd port."
    EnableFIPS          = "Enable FIPS!"
    AutoPorts           = "Use the -auto-ports option to listen to new available ports."
    InstallLicensePath  = "Install Splunk License form the path specified."
    InstallLicense      = "Install Splunk 5TB license by default."
    LocalSplunkInstaller= "The location/path to a local Splunk installer that will be used to install Splunk."
    UninstallSplunk     = "Uninstall Splunk that is installed."
    LocalAppInstaller   = "Path to local app installation file."
    Branch              = "Branch of Splunk used to get Splunk build."
    PlatformPackage     = "The Platform and Package type for Splunk build."
    Version             = "The version of Splunk to install."
    Update              = "Update ES, Splunk, Apps"
    Product             = "The product of Splunk to install from releases.splunk.com."
    Soln                = "Install the App from build server."
    AppVersion          = "Install App Version."
    SpecificAppVersion  = "Install Specific Version of App."
    RunScript           = "Run a test script using Pytest."
    PytestDir           = "Path to current/new_test directory for Pytest"
    TestDir             = "Path to directory of tests to run using Pytest"
    RootEndPoint        = "Add a root end point."
    SetupApps           = "Setup apps so they are initialized."
    EnableSplunkWebSSL  = "Enable SSL in splunk Web settings."
    SearchDiskQuota     = "Specify the limit of the search disk space used by the admin user in MB"
    UiTest              = " Run UI tests using Pytest and do not install Splunk or it's apps."
    UninstallApps       = "Uninstall Splunk apps."
    ArtifactoryPush     = "Push a file app to artifactory."