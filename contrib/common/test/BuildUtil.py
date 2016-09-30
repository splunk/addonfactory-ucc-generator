import os
import shutil
import glob
import logging
import string
import os.path as os_path

class BuildUtil:

    def __init__(self, app, build_type, logger):
        """
        Constructor of the BuildUtil object.
        """
        self.logger = logger
        self.app = app
        self.build_type = build_type

    def build_app(self):

        self.apps_root = os.environ["APPS_ROOT"]

        self.logger.info("cd to build directory")

        # chdir where app is, we will build there, memorize curr dir first
        current_dir = os.getcwd()
        app_dir = os.path.join(self.apps_root, self.app)
        os.chdir(app_dir)

        self.logger.info("removing old file")

        package = '*.' + self.build_type

        # grab old file
        file_old = glob.glob(package)
        if file_old:
            # remove old file
            os.remove(file_old[0])

        self.logger.info("building app in the directory:" + os.getcwd())
        os.popen("ant -l build.log")

        self.logger.info("Getting app file")

        # grab file that we just built
        file_new = glob.glob(package)

        # check for package existence
        assert file_new is not None
        self.logger.info("file_new is not None")

        assert len(file_new) > 0
        self.logger.info("len(file_new) is > 0")

        self.logger.info("file_new:" + file_new[0])
