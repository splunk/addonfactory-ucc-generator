from argparse import ArgumentParser


class AppKoalaParser(object):
    """
    This class defines the arguments that can be used with
     AppKoalaCLI using the ArgumentParser.
    """
    def __init__(self):
        self.arg_options = ArgumentParser(description=AppKoalaParserHelpText.Description)
        
        # General options
        self.arg_options.add_argument("--csv_file", "-csv_file", required=True, dest="csvfile", help=AppKoalaParserHelpText.CSVFile)
        self.arg_options.add_argument("--preserve_splunk", "--keep_splunk", dest="keep_splunk", action="store_true", help=AppKoalaParserHelpText.PreserveSplunk)
        self.arg_options.add_argument("--stop_splunk", "-stop_splunk", dest="stop_splunk", action="store_true", help=AppKoalaParserHelpText.StopSplunk)
        self.arg_options.add_argument("--uninstall_splunk", "-uninstall_splunk", dest="uninstall_splunk", action="store_true", help=AppKoalaParserHelpText.UninstallSplunk)
        self.arg_options.add_argument("--install_splunk_only", "-install_splunk_only", dest="install_splunk_only", action="store_true", help=AppKoalaParserHelpText.InstallSplunkOnly)
        self.arg_options.add_argument("--enable_fips", "-enable_fips", dest="enable_fips", action="store_true", help=AppKoalaParserHelpText.EnableFips)
        self.arg_options.add_argument("--install_license_paths", "--install_license_path", "-install_license_paths", "-install_license_path", dest="install_license_paths", nargs='*', help=AppKoalaParserHelpText.InstallLicense)
        self.arg_options.add_argument("--kvstore_pass", "-kvstore_pass", dest="kvstore_password", default="password", help=AppKoalaParserHelpText.KVStorePassword)
        self.arg_options.add_argument("--test_connections", "-test_connections", dest="test_connections", action="store_true", help=AppKoalaParserHelpText.TestConnections)
        # self.arg_options.add_argument("--splunk_user", "-splunk_user", dest="splunk_username", default="admin", help=AppKoalaParserHelpText.SplunkUsername)
        # self.arg_options.add_argument("--splunk_pass", "-splunk_pass", dest="splunk_password", default="changeme", help=AppKoalaParserHelpText.SplunkPassword)

        # Splunk package
        self.arg_options.add_argument("--version", "-version", dest="version", help=AppKoalaParserHelpText.Version)
        self.arg_options.add_argument("--branch", "-branch", dest="branch", help=AppKoalaParserHelpText.Branch)
        self.arg_options.add_argument("--local_splunk_installer", "-local_splunk_installer", dest="local_splunk_installer", help=AppKoalaParserHelpText.LocalSplunkInstall)

        # App-related options
        self.arg_options.add_argument("--setup", "-setup", dest="setup", action="store_true", help=AppKoalaParserHelpText.Setup)
        self.arg_options.add_argument("--apps", "-apps", dest="appname", nargs='*', help=AppKoalaParserHelpText.SHApps)
        self.arg_options.add_argument("--sh_app_versions", "-sh_app_versions", "--app_versions", "-app_versions", dest="appversion", nargs='*', help=AppKoalaParserHelpText.SHAppVersions)
        self.arg_options.add_argument("--local_app_install", "-local_app_install", "--local_app_installer", "-local_app_installer", dest="localappinstaller", nargs='*', help=AppKoalaParserHelpText.LocalAppInstall)
        self.arg_options.add_argument("--indexer_apps", "-indexer_apps", dest="indexer_apps", nargs='*',  help=AppKoalaParserHelpText.IndexerApps)
        self.arg_options.add_argument("--forwarder_apps", "-forwarder_apps", dest="forwarder_apps", nargs='*', help=AppKoalaParserHelpText.ForwarderApps)
        #Pull Artifacts from Artifactory Server.
        self.arg_options.add_argument("--artifactory", "-artifactory", dest="artifactorypull", action="store_true")
        self.arg_options.add_argument("--build_numbers", "-build_numbers", dest="build_numbers", nargs="*")
        self.arg_options.add_argument("--app_status", "-app_status", dest="app_status", nargs="*")

        # Indexer cluster options
        self.arg_options.add_argument("--indexer_replication_port", "-indexer_replication_port", dest="indexer_rep_port", default='9887', help=AppKoalaParserHelpText.IndexerReplicationPort)
        self.arg_options.add_argument("--indexer_secret", "-indexer_secret", dest="indexer_secret", default='secret12', help=AppKoalaParserHelpText.IndexerSecret)
        self.arg_options.add_argument("--indexer_receiving_port", "-indexer_receiving_port", dest="indexer_receiving_port", default='9997', help=AppKoalaParserHelpText.IndexerReceivingPort)
        self.arg_options.add_argument("--indexer_replication_factor", "-indexer_replication_factor", dest="indexer_rep_factor", default='2', help=AppKoalaParserHelpText.IndexerReplicationFactor)
        self.arg_options.add_argument("--indexer_search_factor", "-indexer_search_factor", dest="indexer_search_factor", default='1', help=AppKoalaParserHelpText.IndexerSearchFactor)
        # Multisite options
        self.arg_options.add_argument("--multisite", "-multisite", dest="sites", help=AppKoalaParserHelpText.Multisite)
        self.arg_options.add_argument("--multisite_replication_factor", "-multisite_replication_factor", dest="multisite_rep_factor", default='origin:2,total:3', help=AppKoalaParserHelpText.MultisiteReplicationFactor)
        self.arg_options.add_argument("--multisite_search_factor", "-multisite_search_factor", dest="multisite_search_factor", default='origin:1,total:2', help=AppKoalaParserHelpText.MultisiteSearchFactor)

        # SHC options
        self.arg_options.add_argument("--sh_replication_port", "-sh_replication_port", dest="sh_rep_port", default='9997', help=AppKoalaParserHelpText.SHReplicationPort)
        self.arg_options.add_argument("--sh_secret", "-sh_secret", dest="sh_secret", default='secret12', help=AppKoalaParserHelpText.SHSecret)
        self.arg_options.add_argument("--sh_replication_factor", "-sh_replication_factor", dest="sh_rep_factor", default='3', help=AppKoalaParserHelpText.SHReplicationFactor)
        self.arg_options.add_argument("--do_not_deploy_sh_apps", "-do_not_deploy_sh_apps", dest="do_not_deploy_sh_apps", action="store_true", help=AppKoalaParserHelpText.DoNotDeploySHApps)
        self.arg_options.add_argument("--resync_shc", "-resync_shc", dest="resync_shc", action="store_true", help=AppKoalaParserHelpText.ResyncSHC)
        
        #Special Casing for ITSI.
        self.arg_options.add_argument("--itsi_deploy_one_app", dest="itsi_deploy_one_app", action="store_true")
        
    def parse_app_koala_args(self):
        return self.arg_options.parse_args()


class AppKoalaParserHelpText:
    """
    Define constants used by AppKoalaParser.
    """
    Description                = "App Koala command line arguments."
    CSVFile                    = "CSV file containing information about hosts."
    PreserveSplunk             = "Use an existing installation of Splunk to install apps. If Splunk does not exist, we bail."
    StopSplunk                 = "Stop all splunk instances specified in the csv. Does not set up splunk"
    UninstallSplunk            = "Uninstall all splunk instances specified in the csv. Does not set up splunk"
    InstallSplunkOnly          = "Only install base splunk on the instances specified in the csv. Does not set up splunk"
    InstallLicense             = "Installs license from the specified path"
    EnableFips                 = "Enable FIPS on all splunk installations"
    Branch                     = "Branch of Splunk used to get Splunk build."
    PlatformPackage            = "The Platform and Package type for Splunk build."
    Version                    = "The version of Splunk to install."
    LocalSplunkInstall         = "The URL or local path to a specific version of Splunk"
    Product                    = "The product of Splunk to install from releases.splunk.com."
    IndexerReplicationPort     = "The port used for indexer replication"
    IndexerSecret              = "The secret key for the index cluster"
    SHReplicationPort          = "The replication port for the search head cluster"
    SHSecret                   = "The secret key for SHC"
    SHReplicationFactor        = "Replication factor for the search head cluster"
    IndexerReceivingPort       = "The port for forwarding data to indexers"
    Setup                      = "Choose whether or not apps are set up"
    SHApps                     = "The space-separated list of apps that will be downloaded and installed. All TAs will be installed on the indexers"
    SHAppVersions              = "List of versions corresponding to the downloaded apps"
    IndexerApps                = "Space-separated list of non-TA apps that will be installed on the indexers. List the apps exactly as they would appear after extraction. The app must be present within the --apps downloads"
    ForwarderApps              = "Space-separated list of non-TA apps that will be installed on the forwarders. List the apps exactly as they would appear after extraction. The app must be present within the --apps downloads"
    LocalAppInstall            = "Paths to local app installation files"
    IndexerReplicationFactor   = "Replication factor for the indexer cluster"
    IndexerSearchFactor        = "Search factor for the indexer cluster"
    KVStorePassword            = "Password for distributed KVStore"
    Multisite                  = "A comma-separated list of site names that the indexer cluster will use"
    MultisiteReplicationFactor = "Origin and total replication factor for a multisite cluster"
    MultisiteSearchFactor      = "Origin and total search factor for a multisite cluster"
    DoNotDeploySHApps          = "App Koala won't apply the conf-deployer bundle to search heads after installing apps"
    ResyncSHC                  = "Performs a resync after pushing SHC bundle"
    TestConnections            = "Only test the connections of the remote machines specified in the CSV file, does not install Splunk"

    # May or may not want to keep these options
    SplunkUsername = "Specify a username for all splunk instances in this environment"
    SplunkPassword = "Specify a password for all splunk instances in this environment"