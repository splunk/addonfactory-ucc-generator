import os
import osot
import osot.client
from AppFetcher import ServerAppFetcher

class SplunkAppPublish:
    
    def __init__(self, parse_args, logger):
        
        self.args = parse_args
        self.logger = logger

        self.logger.info("CLOUD: Start to Publish App to 1sot Cloud Server")
        self.app_fetcher = ServerAppFetcher(parse_args, logger)

        self.splunk_publish = osot.SplunkPublish(username="stackmakrdeploy", password="yJ6^9XHh2e&^0A",
                            baseurl="https://1sot.splunkcloud.com/artifactory/", repo=self.args.one_sot_repo, subdir=self.args.one_sot_destdir)
        self.artifactory = osot.client.Artifactory(baseurl="https://1sot.splunkcloud.com/artifactory/", username="stackmakrdeploy", password="yJ6^9XHh2e&^0A")
    
    def download_app_package(self):
        
        self.downloaded_app = self.app_fetcher.get_remote_apps()
        self.logger.info("CLOUD: The apps downloaded are %s", self.downloaded_app)
        assert len(self.downloaded_app) == 1
        
        return self.downloaded_app
        
    def publish_app(self):
        
        app=None
        app_downloaded = self.download_app_package()
        app = app_downloaded[0]
        
        #If remove existing is provided, remove all the existing apps
        #push the build
        if self.args.remove_existing:
            apps_list = self.get_apps_list()
            self.delete_app_sot(apps_list)
            
        return_text = self.splunk_publish.publish_package(package_path=app, name="", package_name=app)
        self.logger.info("CLOUD: Result is %s", return_text)

        #Now Remove the App after the publish is Completed.
        if len(app_downloaded) > 0:
            for item in app_downloaded:
                os.remove(item)

    def get_apps_list(self):
        
        all_info = self.artifactory.get_file_info(repo=self.args.one_sot_repo, path=self.args.one_sot_destdir)
        children = all_info.get("children", None)

        apps_present = []
        if children is not None:
            for child in children:
                app = child.get('uri', None)
                if app is not None:
                    apps_present.append(app)
        
        return apps_present

    def delete_app_sot(self, apps):
        
        for app in apps:
            path_to_app = self.args.one_sot_destdir + app
            self.artifactory.delete_artifact(repo=self.args.one_sot_repo, path=path_to_app)
            
            
            
        
        