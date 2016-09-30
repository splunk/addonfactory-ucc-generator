import sys
from Parser import CSVParser
sys.path.append("../AppCommon")
from SplunkInstaller import SplunkInstaller
from SplunkSetup import SplunkSetup
from Utils.AppKoalaLogger import AppKoalaLogger
from Utils.AppKoalaArgParser import AppKoalaParser


if __name__ == '__main__':
    """
    The main method where AppPandaCLI starts running.
    """
    minimum_python = (2,7)
    
    if sys.version_info >= minimum_python:
        app_koala_logger = AppKoalaLogger().get_logger()
        app_koala_logger.info("CLI : STARTING APP KOALA CLI")
        
        app_koala_args = AppKoalaParser().parse_app_koala_args()
        app_koala_logger.info("CLI : THE APP KOALA COMMAND LINE ARGS ARE %s", app_koala_args)
        
        csv_koala_parser = CSVParser(app_koala_args.csvfile, app_koala_logger, app_koala_args)
        splunk_installer = SplunkInstaller(app_koala_args, csv_koala_parser, app_koala_logger)

        skip_setup = bool(app_koala_args.stop_splunk or app_koala_args.uninstall_splunk or
                          app_koala_args.install_splunk_only or app_koala_args.test_connections)
        if not skip_setup:
            splunk_setup = SplunkSetup(app_koala_args, csv_koala_parser, app_koala_logger)

    else:
         raise "Must use python 2.7 or greater"